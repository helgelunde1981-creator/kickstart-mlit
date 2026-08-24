"use client";
import { useEffect } from "react";
import Link from "next/link";

export default function AdminError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("[admin] Uventet feil:", error);
  }, [error]);

  return (
    <div className="card mx-auto max-w-lg p-6">
      <h1 className="mb-2 text-lg font-semibold">Noe gikk galt</h1>
      <p className="mb-1 text-sm text-muted">{error.message || "Ukjent feil."}</p>
      {error.digest && (
        <p className="mb-4 font-mono text-xs text-faint">Referanse: {error.digest}</p>
      )}
      <div className="mt-4 flex gap-2">
        <button onClick={reset} className="btn btn-primary">
          Prøv igjen
        </button>
        <Link href="/admin/kickstart" className="btn btn-secondary">
          Til prosjektlisten
        </Link>
      </div>
    </div>
  );
}
