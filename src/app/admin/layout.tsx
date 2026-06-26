import Link from "next/link";

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <span className="font-bold text-gray-900">MLIT Kickstart</span>
          <nav className="flex gap-4 text-sm">
            <Link href="/admin/kickstart" className="text-gray-600 hover:text-gray-900">
              Prosjekter
            </Link>
          </nav>
        </div>
        <LogoutButton />
      </header>
      <main className="p-6">{children}</main>
    </div>
  );
}

function LogoutButton() {
  return (
    <form
      action={async () => {
        "use server";
        const { cookies } = await import("next/headers");
        (await cookies()).delete("admin_session");
      }}
    >
      <button
        type="submit"
        className="text-sm text-gray-500 hover:text-gray-900"
      >
        Logg ut
      </button>
    </form>
  );
}
