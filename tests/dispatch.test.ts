import { afterEach, describe, expect, it, vi } from "vitest";
import { triggerWorker } from "@/lib/kickstart/dispatch";

process.env.ADMIN_PASSWORD = "test-passord";
process.env.NEXT_PUBLIC_SITE_URL = "https://kickstart.mlit.no";

const originalFetch = global.fetch;
afterEach(() => {
  global.fetch = originalFetch;
  vi.restoreAllMocks();
});

describe("triggerWorker", () => {
  it("kaller worker-endepunktet med bearer-hemmeligheten", async () => {
    const fetchMock = vi.fn(async () => new Response("{}", { status: 202 }));
    global.fetch = fetchMock as unknown as typeof fetch;

    expect(await triggerWorker("job-1")).toBe(true);

    const [url, init] = fetchMock.mock.calls[0] as unknown as [string, RequestInit];
    expect(url).toBe("https://kickstart.mlit.no/api/kickstart/worker");
    expect((init.headers as Record<string, string>).Authorization).toBe("Bearer test-passord");
  });

  it("sier tydelig fra når Vercels deployment protection blokkerer selvkallet", async () => {
    // Dette er feilen som ellers ser ut som ingenting: jobben ligger i kø,
    // ingen starter den, og loggen viser bare en 401.
    global.fetch = (async () => new Response("", { status: 401 })) as unknown as typeof fetch;
    const logg = vi.spyOn(console, "error").mockImplementation(() => {});

    expect(await triggerWorker("job-1")).toBe(false);
    expect(logg.mock.calls[0][0]).toContain("Deployment Protection");
  });

  it("returnerer false — ikke kaster — når nettverket svikter", async () => {
    global.fetch = (async () => {
      throw new Error("ECONNREFUSED");
    }) as unknown as typeof fetch;
    vi.spyOn(console, "error").mockImplementation(() => {});

    expect(await triggerWorker("job-1")).toBe(false);
  });

  it("sender bypass-header når Vercel har gitt oss en", async () => {
    process.env.VERCEL_AUTOMATION_BYPASS_SECRET = "bypass-nokkel";
    const fetchMock = vi.fn(async () => new Response("{}", { status: 202 }));
    global.fetch = fetchMock as unknown as typeof fetch;

    await triggerWorker("job-1");

    const [, init] = fetchMock.mock.calls[0] as unknown as [string, RequestInit];
    expect((init.headers as Record<string, string>)["x-vercel-protection-bypass"]).toBe("bypass-nokkel");
    delete process.env.VERCEL_AUTOMATION_BYPASS_SECRET;
  });
});
