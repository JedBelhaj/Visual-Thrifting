import Link from "next/link";
import { requireAdmin } from "@/lib/auth";
import { logout } from "@/lib/actions/auth";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await requireAdmin();

  return (
    <div className="flex min-h-screen flex-col">
      <header className="border-b border-line bg-ink text-cream">
        <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-3 px-5 py-3">
          <div className="flex items-center gap-6">
            <Link href="/admin" className="font-display text-lg">
              Visual Thrift · Admin
            </Link>
            <nav className="flex gap-1 text-sm">
              <Link href="/admin" className="rounded-full px-3 py-1.5 hover:bg-white/10">
                Dashboard
              </Link>
              <Link
                href="/admin/items"
                className="rounded-full px-3 py-1.5 hover:bg-white/10"
              >
                Items
              </Link>
              <Link
                href="/admin/reservations"
                className="rounded-full px-3 py-1.5 hover:bg-white/10"
              >
                Reservations
              </Link>
            </nav>
          </div>
          <div className="flex items-center gap-3 text-sm">
            <Link href="/" className="text-cream/70 hover:text-cream">
              View shop ↗
            </Link>
            <span className="text-cream/40">|</span>
            <span className="text-cream/70">{session.name}</span>
            <form action={logout}>
              <button type="submit" className="text-cream/70 hover:text-cream">
                Sign out
              </button>
            </form>
          </div>
        </div>
      </header>
      <main className="mx-auto w-full max-w-6xl flex-1 px-5 py-8">{children}</main>
    </div>
  );
}
