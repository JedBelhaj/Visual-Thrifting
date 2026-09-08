import Link from "next/link";
import Image from "next/image";
import { CATEGORIES } from "@/lib/constants";
import badge from "@/public/vt.jpg";

export function SiteFooter() {
  return (
    <footer className="relative z-10 mt-auto border-t border-line">
      <div className="mx-auto grid max-w-6xl gap-10 px-5 py-12 sm:grid-cols-2 lg:grid-cols-[2fr_1fr_1fr]">
        <div>
          <div className="flex items-center gap-3">
            <Image
              src={badge}
              alt="Visual Thrifting"
              sizes="44px"
              className="h-11 w-11 rounded-full object-cover"
            />
            <span className="font-display text-lg font-extrabold uppercase leading-none tracking-wide">
              Visual
              <br />
              <span className="text-purple">Thrifting</span>
            </span>
          </div>
          <p className="mt-4 max-w-xs text-sm leading-relaxed text-cream/50">
            Curated secondhand clothing. Every piece is one of one — reserve
            online, try it on and pay in person at pickup. No shipping, no
            checkout.
          </p>
        </div>

        <div>
          <p className="font-display text-xs font-extrabold uppercase tracking-[0.18em] text-purple">
            Shop
          </p>
          <ul className="mt-4 space-y-2.5 text-sm">
            <li>
              <Link href="/shop" className="text-cream/55 transition-colors hover:text-cream">
                The rail
              </Link>
            </li>
            {CATEGORIES.slice(0, 5).map((c) => (
              <li key={c}>
                <Link
                  href={`/shop?category=${encodeURIComponent(c)}`}
                  className="text-cream/55 transition-colors hover:text-cream"
                >
                  {c}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        <div>
          <p className="font-display text-xs font-extrabold uppercase tracking-[0.18em] text-purple">
            Account
          </p>
          <ul className="mt-4 space-y-2.5 text-sm">
            <li>
              <Link href="/account" className="text-cream/55 transition-colors hover:text-cream">
                My reservations
              </Link>
            </li>
            <li>
              <Link href="/login" className="text-cream/55 transition-colors hover:text-cream">
                Log in
              </Link>
            </li>
            <li>
              <Link href="/signup" className="text-cream/55 transition-colors hover:text-cream">
                Create an account
              </Link>
            </li>
          </ul>
        </div>
      </div>

      <div className="border-t border-line">
        <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-2 px-5 py-5 text-xs text-cream/35">
          <p>© {new Date().getFullYear()} Visual Thrifting.</p>
          <p>
            Made with <span className="text-purple">✦</span> for the second-life
            generation.
          </p>
        </div>
      </div>
    </footer>
  );
}
