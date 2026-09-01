"use client";

import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";

/**
 * Fixed site header. On the welcome page (`/`) it sits transparently on top of
 * the hero while the page is scrolled to the very top, then fades in a frosted
 * background once the user scrolls. On every other route it stays frosted.
 */
export function SiteHeaderChrome({ children }: { children: React.ReactNode }) {
  const overHero = usePathname() === "/";
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    if (!overHero) return;
    const onScroll = () => setScrolled(window.scrollY > 8);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, [overHero]);

  const transparent = overHero && !scrolled;

  return (
    <header
      className={`fixed inset-x-0 top-0 z-30 border-b transition-colors duration-300 ${
        transparent
          ? "border-transparent bg-transparent"
          : "border-line bg-cream/80 backdrop-blur"
      }`}
    >
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between gap-4 px-5">
        {children}
      </div>
    </header>
  );
}
