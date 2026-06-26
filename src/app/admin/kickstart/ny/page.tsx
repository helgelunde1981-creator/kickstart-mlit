import KickstartWizard from "@/components/kickstart/KickstartWizard";

export default function NyProsjektPage() {
  return (
    <div className="max-w-2xl mx-auto">
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Nytt kickstart-prosjekt</h1>
      <KickstartWizard />
    </div>
  );
}
