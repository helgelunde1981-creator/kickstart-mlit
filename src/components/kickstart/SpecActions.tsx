"use client";
import { useState } from "react";

export default function SpecActions({ markdown, fileName }: { markdown: string; fileName: string }) {
  const [copied, setCopied] = useState(false);

  async function copy() {
    try {
      await navigator.clipboard.writeText(markdown);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      setCopied(false);
    }
  }

  function download() {
    // Specen skal kunne havne rett i kundeprosjektets repo som PROJECT.md.
    const blob = new Blob([markdown], { type: "text/markdown;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = fileName.replace(/[^\w.\-æøåÆØÅ ]/g, "_");
    a.click();
    URL.revokeObjectURL(url);
  }

  return (
    <div className="flex gap-2">
      <button onClick={copy} className="btn btn-secondary">
        {copied ? "Kopiert ✓" : "Kopier"}
      </button>
      <button onClick={download} className="btn btn-secondary">
        Last ned .md
      </button>
    </div>
  );
}
