import Link from "next/link";
import Image from "next/image";
import { getSession } from "@/lib/auth";
import { logout } from "@/lib/actions/auth";
import { SiteHeaderChrome } from "@/components/SiteHeaderChrome";
import badge from "@/public/vt.jpg";

const navLink =
  "relative rounded-full px-3 py-2 text-cream/70 transition-colors hover:text-purple";

export async function SiteHeader() {
  const session = await getSession();

  return (
    <SiteHeaderChrome>
      <Link
        href="/"
        aria-label="Visual Thrifting — home"
        className="flex shrink-0 items-center gap-3"
      >
        <Image
          src={badge}
          alt="Visual Thrifting"
          priority
          sizes="56px"
          className="h-14 w-14 rounded-full object-cover [filter:drop-shadow(0_0_12px_rgba(139,53,200,0.4))]"
        />
        <span className="hidden font-display text-lg font-extrabold uppercase leading-none tracking-wide sm:block">
          Visual
          <br />
          <span className="text-purple">Thrifting</span>
        </span>
      </Link>

      <nav className="flex items-center gap-1 text-sm font-medium tracking-wide">
        <Link href="/shop" className={navLink}>
          Browse
        </Link>

        {session ? (
          <>
            <Link href="/account" className={navLink}>
              Reservations
            </Link>
            {session.role === "ADMIN" && (
              <Link href="/admin" className={navLink}>
                Admin
              </Link>
            )}
            <form action={logout}>
              <button type="submit" className={navLink}>
                Sign out
              </button>
            </form>
          </>
        ) : (
          <Link
            href="/login"
            className="ml-1 rounded-full bg-purple px-4 py-2 font-display font-extrabold uppercase tracking-wider text-cream transition-colors hover:bg-purple-dark"
          >
            Log in
          </Link>
        )}
      </nav>
    </SiteHeaderChrome>
  );
}
