import type { Metadata } from "next";
import Link from "next/link";
import KickstartWizard from "@/components/kickstart/KickstartWizard";

export const metadata: Metadata = { title: "Nytt prosjekt" };

export default function NyProsjektPage() {
  return (
    <div className="mx-auto max-w-3xl">
      <Link href="/admin/kickstart" className="mb-4 inline-block text-sm text-muted hover:text-fg">
        ← Prosjekter
      </Link>
      <h1 className="mb-1 text-2xl font-semibold">Nytt kickstart-prosjekt</h1>
      <p className="mb-6 text-sm text-muted">
        Ni steg med kundeinfo og valg. Til slutt genererer Claude en komplett PROJECT.md i 12 deler.
      </p>
      <KickstartWizard />
    </div>
  );
}
