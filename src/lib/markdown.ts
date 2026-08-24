/**
 * Liten markdown-renderer for PROJECT.md-visningen.
 *
 * Hvorfor ikke et bibliotek: specen er 100 000+ tegn og vises kun internt.
 * Dette dekker det Claude faktisk produserer (overskrifter, lister, tabeller,
 * kodeblokker) uten å dra inn en ny avhengighet i en app som ellers har fem.
 *
 * Sikkerhet: ALL tekst escapes først, og bare taggene denne filen selv setter
 * inn slipper gjennom. Innholdet er modellgenerert, så det behandles som
 * utrygt selv om det havner bak innlogging.
 */

export interface Heading {
  id: string;
  text: string;
  level: number;
}

export interface RenderedMarkdown {
  html: string;
  headings: Heading[];
}

function escapeHtml(text: string): string {
  return text
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function slugify(text: string, taken: Set<string>): string {
  const base =
    text
      .toLowerCase()
      .replace(/[^\p{Letter}\p{Number}\s-]/gu, "")
      .trim()
      .replace(/\s+/g, "-")
      .slice(0, 60) || "seksjon";
  let slug = base;
  let n = 2;
  while (taken.has(slug)) slug = `${base}-${n++}`;
  taken.add(slug);
  return slug;
}

/** Inline-formatering. Kjøres på tekst som allerede er escapet. */
function inline(text: string): string {
  return text
    .replace(/`([^`]+)`/g, '<code class="md-code">$1</code>')
    .replace(/\*\*([^*]+)\*\*/g, "<strong>$1</strong>")
    .replace(/(^|[\s(])\*([^*\n]+)\*/g, "$1<em>$2</em>")
    .replace(/\[([^\]]+)\]\(([^)\s]+)\)/g, (match, label: string, href: string) => {
      // Kun trygge protokoller — javascript:-lenker slipper ikke gjennom.
      if (!/^(https?:\/\/|mailto:|#|\/)/i.test(href)) return match;
      const external = /^https?:/i.test(href);
      return `<a href="${href}"${external ? ' target="_blank" rel="noopener noreferrer"' : ""}>${label}</a>`;
    });
}

export function renderMarkdown(markdown: string): RenderedMarkdown {
  const lines = markdown.replace(/\r\n/g, "\n").split("\n");
  const out: string[] = [];
  const headings: Heading[] = [];
  const taken = new Set<string>();

  let i = 0;
  let paragraph: string[] = [];

  const flushParagraph = () => {
    if (paragraph.length) {
      out.push(`<p>${inline(escapeHtml(paragraph.join(" ")))}</p>`);
      paragraph = [];
    }
  };

  while (i < lines.length) {
    const line = lines[i];

    // Kodeblokk
    const fence = line.match(/^```(\w*)/);
    if (fence) {
      flushParagraph();
      const lang = fence[1];
      const body: string[] = [];
      i++;
      while (i < lines.length && !lines[i].startsWith("```")) {
        body.push(lines[i]);
        i++;
      }
      i++; // hopp over avsluttende ```
      out.push(
        `<pre class="md-pre"${lang ? ` data-lang="${escapeHtml(lang)}"` : ""}><code>${escapeHtml(
          body.join("\n"),
        )}</code></pre>`,
      );
      continue;
    }

    // Overskrift
    const heading = line.match(/^(#{1,6})\s+(.*)$/);
    if (heading) {
      flushParagraph();
      const level = heading[1].length;
      const text = heading[2].replace(/\s*#+\s*$/, "").trim();
      const id = slugify(text, taken);
      if (level <= 3) headings.push({ id, text, level });
      out.push(`<h${level} id="${id}" class="md-h md-h${level}">${inline(escapeHtml(text))}</h${level}>`);
      i++;
      continue;
    }

    // Horisontal linje (også delskillet mellom de 12 delene)
    if (/^\s*(---|\*\*\*|___)\s*$/.test(line)) {
      flushParagraph();
      out.push('<hr class="md-hr" />');
      i++;
      continue;
    }

    // Tabell
    if (line.includes("|") && /^\s*\|?[^|]*\|/.test(line) && /^\s*\|?[\s:-]+\|[\s:|-]*$/.test(lines[i + 1] ?? "")) {
      flushParagraph();
      const parseRow = (row: string) =>
        row.trim().replace(/^\|/, "").replace(/\|$/, "").split("|").map((c) => c.trim());
      const header = parseRow(line);
      i += 2;
      const body: string[][] = [];
      while (i < lines.length && lines[i].includes("|") && lines[i].trim() !== "") {
        body.push(parseRow(lines[i]));
        i++;
      }
      out.push(
        `<div class="md-table-wrap"><table class="md-table"><thead><tr>${header
          .map((c) => `<th>${inline(escapeHtml(c))}</th>`)
          .join("")}</tr></thead><tbody>${body
          .map((row) => `<tr>${row.map((c) => `<td>${inline(escapeHtml(c))}</td>`).join("")}</tr>`)
          .join("")}</tbody></table></div>`,
      );
      continue;
    }

    // Lister (inkludert sjekklister)
    const bullet = line.match(/^\s*[-*+]\s+(.*)$/);
    const numbered = line.match(/^\s*\d+[.)]\s+(.*)$/);
    if (bullet || numbered) {
      flushParagraph();
      const ordered = Boolean(numbered);
      const items: string[] = [];
      while (i < lines.length) {
        const m = ordered ? lines[i].match(/^\s*\d+[.)]\s+(.*)$/) : lines[i].match(/^\s*[-*+]\s+(.*)$/);
        if (!m) break;
        const checkbox = m[1].match(/^\[([ xX])\]\s+(.*)$/);
        if (checkbox) {
          items.push(
            `<li class="md-task"><input type="checkbox" disabled ${
              checkbox[1].toLowerCase() === "x" ? "checked" : ""
            } /> ${inline(escapeHtml(checkbox[2]))}</li>`,
          );
        } else {
          items.push(`<li>${inline(escapeHtml(m[1]))}</li>`);
        }
        i++;
      }
      out.push(`<${ordered ? "ol" : "ul"} class="md-list">${items.join("")}</${ordered ? "ol" : "ul"}>`);
      continue;
    }

    // Sitat
    if (line.startsWith(">")) {
      flushParagraph();
      const quote: string[] = [];
      while (i < lines.length && lines[i].startsWith(">")) {
        quote.push(lines[i].replace(/^>\s?/, ""));
        i++;
      }
      out.push(`<blockquote class="md-quote">${inline(escapeHtml(quote.join(" ")))}</blockquote>`);
      continue;
    }

    if (line.trim() === "") {
      flushParagraph();
      i++;
      continue;
    }

    paragraph.push(line.trim());
    i++;
  }
  flushParagraph();

  return { html: out.join("\n"), headings };
}
