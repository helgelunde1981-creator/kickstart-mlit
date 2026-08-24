import type { Metadata } from "next";
import LoginForm from "@/components/auth/LoginForm";

export const metadata: Metadata = { title: "Logg inn" };

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ neste?: string }>;
}) {
  const { neste } = await searchParams;
  // Kun interne stier — en åpen redirect her ville vært et gratis phishing-verktøy.
  const target = neste && neste.startsWith("/") && !neste.startsWith("//") ? neste : "/admin/kickstart";

  return (
    <div className="flex min-h-screen items-center justify-center px-4 py-10">
      <div className="w-full max-w-sm">
        <div className="mb-6 flex items-center gap-3">
          <span
            aria-hidden
            className="grid h-9 w-9 place-items-center rounded-xl bg-accent text-xs font-bold text-on-accent"
          >
            ML
          </span>
          <div>
            <h1 className="text-lg font-semibold leading-tight">Myrvoll-Lunde IT Drift</h1>
            <p className="text-sm text-muted">Kickstart-admin</p>
          </div>
        </div>
        <LoginForm redirectTo={target} />
      </div>
    </div>
  );
}
