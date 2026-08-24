import Link from "next/link";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { SESSION_COOKIE } from "@/lib/auth/session";

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen flex flex-col">
      <a href="#innhold" className="skip-link">
        Hopp til innhold
      </a>

      <header className="sticky top-0 z-30 border-b border-line bg-surface/85 backdrop-blur supports-[backdrop-filter]:bg-surface/70">
        <div className="mx-auto flex max-w-5xl items-center justify-between gap-4 px-4 py-3 sm:px-6">
          <div className="flex items-center gap-3 sm:gap-5">
            <Link href="/admin/kickstart" className="flex items-center gap-2">
              <span
                aria-hidden
                className="grid h-7 w-7 place-items-center rounded-lg bg-accent text-[11px] font-bold text-on-accent"
              >
                ML
              </span>
              <span className="text-sm font-semibold">Kickstart</span>
            </Link>
            <nav aria-label="Hovedmeny" className="flex gap-4 text-sm">
              <Link href="/admin/kickstart" className="whitespace-nowrap text-muted hover:text-fg">
                Prosjekter
              </Link>
              {/* Skjules på små skjermer — «Nytt prosjekt»-knappen står øverst i lista. */}
              <Link href="/admin/kickstart/ny" className="hidden whitespace-nowrap text-muted hover:text-fg sm:inline">
                Nytt prosjekt
              </Link>
            </nav>
          </div>
          <LogoutButton />
        </div>
      </header>

      <main id="innhold" className="mx-auto w-full max-w-5xl flex-1 px-4 py-6 sm:px-6 sm:py-8">
        {children}
      </main>

      <footer className="border-t border-line px-4 py-4 text-xs text-faint sm:px-6">
        <div className="mx-auto max-w-5xl">
          Myrvoll-Lunde IT Drift · internt verktøy — kundedata, ikke del skjermbilder ukritisk.
        </div>
      </footer>
    </div>
  );
}

function LogoutButton() {
  return (
    <form
      action={async () => {
        "use server";
        (await cookies()).delete(SESSION_COOKIE);
        redirect("/login");
      }}
    >
      <button type="submit" className="btn btn-ghost whitespace-nowrap">
        Logg ut
      </button>
    </form>
  );
}
