import { describe, expect, it } from "vitest";
import { renderMarkdown } from "@/lib/markdown";

describe("renderMarkdown", () => {
  it("escaper HTML fra modellgenerert innhold", () => {
    const { html } = renderMarkdown('Tekst med <img src=x onerror="alert(1)"> i seg');
    expect(html).not.toContain("<img");
    expect(html).toContain("&lt;img");
  });

  it("lager ikke lenke av javascript:-URL-er", () => {
    // Teksten blir stående som ufarlig tekst — men aldri som en <a href>.
    const { html } = renderMarkdown("[klikk](javascript:alert(1))");
    expect(html).not.toContain("<a ");
    expect(html).toContain("[klikk]");
  });

  it("lager lenke av vanlige https-URL-er", () => {
    const { html } = renderMarkdown("[docs](https://example.com)");
    expect(html).toContain('<a href="https://example.com"');
    expect(html).toContain('rel="noopener noreferrer"');
  });

  it("lager unike ID-er for overskrifter med samme navn", () => {
    const { headings } = renderMarkdown("# Sprint 1\n\n## Sprint 1\n");
    expect(headings.map((h) => h.id)).toEqual(["sprint-1", "sprint-1-2"]);
  });

  it("rendrer lister, tabeller og kodeblokker", () => {
    const { html } = renderMarkdown(
      ["- ett", "- to", "", "| a | b |", "| --- | --- |", "| 1 | 2 |", "", "```sql", "select 1;", "```"].join("\n"),
    );
    expect(html).toContain("<ul");
    expect(html).toContain("<table");
    expect(html).toContain("<pre");
    expect(html).toContain("select 1;");
  });

  it("tar med norske tegn i overskrifts-ID-er", () => {
    const { headings } = renderMarkdown("## Spørsmål til kunden\n");
    expect(headings[0].id).toBe("spørsmål-til-kunden");
  });
});
