import { beforeEach, describe, expect, it, vi } from "vitest";

// `after()` kjører normalt etter at responsen er sendt. I testen kjører vi
// callbacken med en gang, slik at vi kan se hva den faktisk gjør.
const afterTasks: Promise<unknown>[] = [];
vi.mock("next/server", async () => {
  const actual = await vi.importActual<typeof import("next/server")>("next/server");
  return {
    ...actual,
    after: (task: () => Promise<unknown>) => {
      afterTasks.push(task());
    },
  };
});

const runNextPart = vi.fn<(jobId: string) => Promise<unknown>>(async () => ({ outcome: "skipped" }));
vi.mock("@/lib/kickstart/worker", () => ({
  runNextPart: (jobId: string) => runNextPart(jobId),
  productionDeps: () => ({}),
}));

const triggerWorker = vi.fn<(jobId: string) => Promise<boolean>>(async () => true);
vi.mock("@/lib/kickstart/dispatch", () => ({
  triggerWorker: (jobId: string) => triggerWorker(jobId),
}));

const listQueuedJobs = vi.fn(async () => []);
vi.mock("@/lib/kickstart/jobs", () => ({
  listQueuedJobs: () => listQueuedJobs(),
}));

process.env.GENERATION_WORKER_SECRET = "worker-hemmelighet";

const { POST } = await import("@/app/api/kickstart/worker/route");

function kall(body: object, secret = "worker-hemmelighet") {
  return new Request("http://localhost/api/kickstart/worker", {
    method: "POST",
    headers: { Authorization: `Bearer ${secret}`, "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
}

async function ventPåBakgrunnsarbeid() {
  await Promise.all(afterTasks);
  afterTasks.length = 0;
}

describe("worker-endepunktet", () => {
  beforeEach(() => {
    runNextPart.mockReset();
    triggerWorker.mockClear();
    afterTasks.length = 0;
  });

  it("avviser kall uten riktig hemmelighet", async () => {
    runNextPart.mockResolvedValue({ outcome: "skipped", reason: "x" });
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const res = await POST(kall({ job_id: "job-1" }, "feil-hemmelighet") as any);
    expect(res.status).toBe(401);
    expect(runNextPart).not.toHaveBeenCalled();
  });

  it("svarer med en gang og gjør arbeidet etterpå", async () => {
    let ferdig = false;
    runNextPart.mockImplementation(async () => {
      await new Promise((r) => setTimeout(r, 20));
      ferdig = true;
      return { outcome: "completed", jobId: "job-1", part: 12 };
    });

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const res = await POST(kall({ job_id: "job-1" }) as any);

    // Dette er hele poenget: responsen kommer før genereringen er ferdig, så
    // den som kalte oss slipper å holde forbindelsen åpen i minutter.
    expect(res.status).toBe(202);
    expect(ferdig).toBe(false);

    await ventPåBakgrunnsarbeid();
    expect(ferdig).toBe(true);
  });

  it("kjeder seg videre til neste del", async () => {
    runNextPart.mockResolvedValue({ outcome: "part_done", jobId: "job-1", part: 3, nextPart: 4 });
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    await POST(kall({ job_id: "job-1" }) as any);
    await ventPåBakgrunnsarbeid();
    expect(triggerWorker).toHaveBeenCalledWith("job-1");
  });

  it("kjeder ikke videre når jobben er ferdig", async () => {
    runNextPart.mockResolvedValue({ outcome: "completed", jobId: "job-1", part: 12 });
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    await POST(kall({ job_id: "job-1" }) as any);
    await ventPåBakgrunnsarbeid();
    expect(triggerWorker).not.toHaveBeenCalled();
  });

  it("kjeder ikke videre når jobben har gitt opp", async () => {
    runNextPart.mockResolvedValue({ outcome: "failed", jobId: "job-1", message: "feil" });
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    await POST(kall({ job_id: "job-1" }) as any);
    await ventPåBakgrunnsarbeid();
    expect(triggerWorker).not.toHaveBeenCalled();
  });
});
