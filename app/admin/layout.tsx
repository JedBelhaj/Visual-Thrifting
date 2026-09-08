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
      <header className="sticky top-0 z-30 border-b border-line bg-surface/90 text-cream backdrop-blur">
        <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-3 px-5 py-3">
          <div className="flex items-center gap-6">
            <Link
              href="/admin"
              className="font-display text-lg font-extrabold uppercase tracking-wide"
            >
              Visual Thrifting <span className="text-purple">· Admin</span>
            </Link>
            <nav className="flex gap-1 font-display text-sm font-bold uppercase tracking-wide">
              <Link href="/admin" className="rounded-full px-3 py-1.5 text-cream/70 hover:bg-surface-2 hover:text-cream">
                Dashboard
              </Link>
              <Link
                href="/admin/items"
                className="rounded-full px-3 py-1.5 text-cream/70 hover:bg-surface-2 hover:text-cream"
              >
                Items
              </Link>
              <Link
                href="/admin/reservations"
                className="rounded-full px-3 py-1.5 text-cream/70 hover:bg-surface-2 hover:text-cream"
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
