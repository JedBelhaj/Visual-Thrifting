import Link from "next/link";
import Image from "next/image";
import { getSession } from "@/lib/auth";
import { logout } from "@/lib/actions/auth";
import { SiteHeaderChrome } from "@/components/SiteHeaderChrome";
import logo from "@/public/logo.png";

export async function SiteHeader() {
  const session = await getSession();

  return (
    <SiteHeaderChrome>
      <Link href="/" aria-label="Visual Thrift — home" className="shrink-0">
        <Image
          src={logo}
          alt="Visual Thrift"
          priority
          sizes="56px"
          className="h-12 w-auto"
        />
      </Link>

      <nav className="flex items-center gap-1 text-sm">
        <Link
          href="/shop"
          className="rounded-full px-3 py-2 text-muted transition hover:bg-sand hover:text-ink"
        >
          Browse
        </Link>

        {session ? (
          <>
            <Link
              href="/account"
              className="rounded-full px-3 py-2 text-muted transition hover:bg-sand hover:text-ink"
            >
              My reservations
            </Link>
            {session.role === "ADMIN" && (
              <Link
                href="/admin"
                className="rounded-full px-3 py-2 text-muted transition hover:bg-sand hover:text-ink"
              >
                Admin
              </Link>
            )}
            <form action={logout}>
              <button
                type="submit"
                className="rounded-full px-3 py-2 text-muted transition hover:bg-sand hover:text-ink"
              >
                Sign out
              </button>
            </form>
          </>
        ) : (
          <Link
            href="/login"
            className="rounded-full bg-ink px-4 py-2 text-white transition hover:bg-clay-dark hover:text-cream"
          >
            Log in
          </Link>
        )}
      </nav>
    </SiteHeaderChrome>
  );
}
