import { describe, expect, it, vi } from "vitest";
import { runNextPart, WorkerDeps, PART_SEPARATOR } from "@/lib/kickstart/worker";
import { GenerationJob } from "@/lib/kickstart/jobs";
import { KickstartProject } from "@/lib/kickstart/types";

function lagJobb(overrides: Partial<GenerationJob> = {}): GenerationJob {
  return {
    id: "job-1",
    project_id: "prosjekt-1",
    status: "queued",
    next_part: 1,
    total_parts: 3,
    attempts: 0,
    last_error: null,
    created_at: "2026-08-24T10:00:00Z",
    updated_at: "2026-08-24T10:00:00Z",
    heartbeat_at: null,
    completed_at: null,
    ...overrides,
  };
}

function lagProsjekt(overrides: Partial<KickstartProject> = {}): KickstartProject {
  return {
    id: "prosjekt-1",
    created_at: "2026-08-24T10:00:00Z",
    updated_at: "2026-08-24T10:00:00Z",
    client_name: "Acme AS",
    project_name: "Acme Portal",
    project_type: "webApp",
    tech_stack: ["nextjs"],
    integrations: [],
    primary_color: "#3B82F6",
    secondary_color: null,
    contact_person: null,
    new_domain: null,
    existing_url: null,
    design_direction: "03-swiss-minimal-refined",
    motion_preference: "subtil",
    auth_type: "supabase-auth",
    sprint_estimate: 6,
    requires_scrape: false,
    features: null,
    extra_notes: null,
    short_description: "Portal",
    long_description: "Lang beskrivelse",
    status: "draft",
    project_md: null,
    price_estimate: null,
    github_repo_url: null,
    supabase_project_ref: null,
    vercel_project_id: null,
    step_completed: 9,
    mockup_images: [],
    generated_parts: 0,
    ...overrides,
  };
}

function lagDeps(job: GenerationJob, project: KickstartProject, overrides: Partial<WorkerDeps> = {}) {
  const deps: WorkerDeps = {
    claimJob: vi.fn(async () => ({ ...job, status: "running" as const })),
    getProject: vi.fn(async () => project),
    generatePart: vi.fn(async () => `Innhold for del ${job.next_part}`),
    savePartial: vi.fn(async () => {}),
    saveFinal: vi.fn(async () => {}),
    releaseForNextPart: vi.fn(async () => {}),
    completeJob: vi.fn(async () => {}),
    registerFailure: vi.fn(async () => "queued" as const),
    heartbeat: vi.fn(async () => {}),
    pushToGitHub: vi.fn(async () => {}),
    ...overrides,
  };
  return deps;
}

describe("runNextPart", () => {
  it("genererer én del og setter jobben klar til neste", async () => {
    const job = lagJobb();
    const deps = lagDeps(job, lagProsjekt());

    const result = await runNextPart("job-1", deps);

    expect(result).toEqual({ outcome: "part_done", jobId: "job-1", part: 1, nextPart: 2 });
    expect(deps.savePartial).toHaveBeenCalledWith("prosjekt-1", "Innhold for del 1", 1);
    expect(deps.releaseForNextPart).toHaveBeenCalledWith("job-1", 2);
    expect(deps.completeJob).not.toHaveBeenCalled();
  });

  it("skjøter ny del på det som allerede er lagret", async () => {
    const job = lagJobb({ next_part: 2 });
    const deps = lagDeps(job, lagProsjekt({ project_md: "Del 1", generated_parts: 1 }), {
      generatePart: vi.fn(async () => "Del 2"),
    });

    await runNextPart("job-1", deps);

    expect(deps.savePartial).toHaveBeenCalledWith("prosjekt-1", `Del 1${PART_SEPARATOR}Del 2`, 2);
  });

  it("fullfører jobben på siste del og pusher til GitHub", async () => {
    const job = lagJobb({ next_part: 3 });
    const deps = lagDeps(
      job,
      lagProsjekt({ project_md: "Alt før", generated_parts: 2, github_repo_url: "https://github.com/a/b" }),
      { generatePart: vi.fn(async () => "Siste del") },
    );

    const result = await runNextPart("job-1", deps);

    expect(result.outcome).toBe("completed");
    expect(deps.saveFinal).toHaveBeenCalledWith("prosjekt-1", `Alt før${PART_SEPARATOR}Siste del`, 3);
    expect(deps.completeJob).toHaveBeenCalledWith("job-1", 3);
    expect(deps.pushToGitHub).toHaveBeenCalled();
  });

  it("fullfører selv om GitHub-pushen feiler — specen er lagret", async () => {
    const job = lagJobb({ next_part: 3 });
    const deps = lagDeps(job, lagProsjekt({ project_md: "Alt før", github_repo_url: "https://github.com/a/b" }), {
      pushToGitHub: vi.fn(async () => {
        throw new Error("403 fra GitHub");
      }),
    });

    const result = await runNextPart("job-1", deps);

    expect(result.outcome).toBe("completed");
    expect(deps.completeJob).toHaveBeenCalled();
  });

  it("lar en annen worker som allerede har tatt jobben være i fred", async () => {
    const deps = lagDeps(lagJobb(), lagProsjekt(), { claimJob: vi.fn(async () => null) });

    const result = await runNextPart("job-1", deps);

    expect(result.outcome).toBe("skipped");
    expect(deps.generatePart).not.toHaveBeenCalled();
  });

  it("ber om nytt forsøk når modellen feiler", async () => {
    const job = lagJobb();
    const deps = lagDeps(job, lagProsjekt(), {
      generatePart: vi.fn(async () => {
        throw new Error("529 overloaded");
      }),
    });

    const result = await runNextPart("job-1", deps);

    expect(result.outcome).toBe("retry");
    expect(deps.registerFailure).toHaveBeenCalledWith(expect.objectContaining({ id: "job-1" }), "529 overloaded");
    expect(deps.savePartial).not.toHaveBeenCalled();
  });

  it("gir opp når forsøkene er brukt opp", async () => {
    const job = lagJobb({ attempts: 2 });
    const deps = lagDeps(job, lagProsjekt(), {
      generatePart: vi.fn(async () => {
        throw new Error("529 overloaded");
      }),
      registerFailure: vi.fn(async () => "failed" as const),
    });

    const result = await runNextPart("job-1", deps);

    expect(result.outcome).toBe("failed");
  });

  it("nekter å fortsette på del 2 når det ikke finnes lagret tekst", async () => {
    const job = lagJobb({ next_part: 2 });
    const deps = lagDeps(job, lagProsjekt({ project_md: null }));

    const result = await runNextPart("job-1", deps);

    expect(result.outcome).toBe("retry");
    expect(deps.generatePart).not.toHaveBeenCalled();
  });

  it("behandler tom tekst fra modellen som en feil", async () => {
    const deps = lagDeps(lagJobb(), lagProsjekt(), { generatePart: vi.fn(async () => "   ") });

    const result = await runNextPart("job-1", deps);

    expect(result.outcome).toBe("retry");
    expect(deps.savePartial).not.toHaveBeenCalled();
  });
});

describe("tidsbudsjett", () => {
  it("holder fristen per del innenfor plattformens grense", async () => {
    // Ryker denne, blir delen drept av Vercel midt i skrivingen og hele
    // arbeidet er tapt — slik det skjedde i produksjon 2026-08-24.
    const { PART_DEADLINE_MS, FUNCTION_MAX_DURATION_SECONDS } = await import("@/lib/kickstart/model");

    expect(PART_DEADLINE_MS).toBeLessThan(FUNCTION_MAX_DURATION_SECONDS * 1000);
    // Minst 30 sekunders margin til å lagre og rapportere.
    expect(FUNCTION_MAX_DURATION_SECONDS * 1000 - PART_DEADLINE_MS).toBeGreaterThanOrEqual(30_000);
  });
});
