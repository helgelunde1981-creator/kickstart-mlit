import Link from "next/link";

export default function NotFound() {
  return (
    <div className="flex min-h-screen items-center justify-center px-4">
      <div className="card max-w-md p-8 text-center">
        <p className="mb-1 font-mono text-sm text-faint">404</p>
        <h1 className="mb-2 text-lg font-semibold">Fant ikke siden</h1>
        <p className="mb-6 text-sm text-muted">
          Lenken kan være gammel, eller prosjektet kan være slettet.
        </p>
        <Link href="/admin/kickstart" className="btn btn-primary">
          Til prosjektlisten
        </Link>
      </div>
    </div>
  );
}
