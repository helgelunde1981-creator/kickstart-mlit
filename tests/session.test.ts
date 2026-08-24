import { describe, expect, it } from "vitest";
import { createSessionToken, safeEqual, verifySessionToken, SESSION_MAX_AGE_SECONDS } from "@/lib/auth/session";

process.env.ADMIN_SESSION_SECRET = "test-hemmelighet";

describe("admin-sesjon", () => {
  it("godtar en token vi selv har signert", async () => {
    expect(await verifySessionToken(await createSessionToken())).toBe(true);
  });

  it("avviser den gamle faste strengen", async () => {
    // Regresjonstest: verdien «authenticated» ga tidligere full admin-tilgang.
    expect(await verifySessionToken("authenticated")).toBe(false);
  });

  it("avviser tuklet signatur og manglende token", async () => {
    const token = await createSessionToken();
    // Bytt siste tegn til noe det garantert ikke var — «alltid 0» ga en token
    // som var uendret hver 16. kjøring, og dermed en test som blinket.
    const tuklet = token.slice(0, -1) + (token.endsWith("0") ? "1" : "0");
    expect(await verifySessionToken(tuklet)).toBe(false);
    expect(await verifySessionToken(undefined)).toBe(false);
    expect(await verifySessionToken("123456.deadbeef")).toBe(false);
  });

  it("avviser utløpte og fremtidige tokens", async () => {
    const gammel = await createSessionToken(Date.now() - (SESSION_MAX_AGE_SECONDS + 60) * 1000);
    expect(await verifySessionToken(gammel)).toBe(false);
    const fremtidig = await createSessionToken(Date.now() + 60_000);
    expect(await verifySessionToken(fremtidig)).toBe(false);
  });

  it("sammenligner likt uansett lengde", () => {
    expect(safeEqual("abc", "abc")).toBe(true);
    expect(safeEqual("abc", "abcd")).toBe(false);
    expect(safeEqual("", "")).toBe(true);
  });
});
