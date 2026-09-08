"use client";

import { useCallback, useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { formatPrice } from "@/lib/format";

export type CarouselSlide = {
  id: string;
  title: string;
  price: number;
  size: string;
  condition: string;
  category: string;
  imageUrl: string;
};

const AUTOPLAY_MS = 5000;

export function WelcomeCarousel({ slides }: { slides: CarouselSlide[] }) {
  const [index, setIndex] = useState(0);
  const [paused, setPaused] = useState(false);
  const count = slides.length;

  const go = useCallback(
    (next: number) => setIndex(() => (next + count) % count),
    [count],
  );

  // Autoplay — skipped when paused, when the tab is hidden, or for users who
  // prefer reduced motion.
  useEffect(() => {
    if (count < 2 || paused) return;
    const reduced = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    ).matches;
    if (reduced) return;

    const timer = window.setInterval(() => {
      if (!document.hidden) setIndex((c) => (c + 1) % count);
    }, AUTOPLAY_MS);
    return () => window.clearInterval(timer);
  }, [count, paused]);

  if (count === 0) return null;

  return (
    <div
      className="relative overflow-hidden rounded-lg bg-surface-2"
      role="region"
      aria-roledescription="carousel"
      aria-label="Featured pieces"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      onFocusCapture={() => setPaused(true)}
      onBlurCapture={() => setPaused(false)}
      onKeyDown={(e) => {
        if (e.key === "ArrowLeft") go(index - 1);
        if (e.key === "ArrowRight") go(index + 1);
      }}
    >
      <div className="relative aspect-[16/10] w-full sm:aspect-[2/1]">
        {slides.map((slide, i) => (
          <Link
            key={slide.id}
            href={`/items/${slide.id}`}
            aria-hidden={i !== index}
            tabIndex={i === index ? 0 : -1}
            className={`absolute inset-0 transition-opacity duration-700 ease-out ${
              i === index
                ? "z-10 opacity-100"
                : "pointer-events-none z-0 opacity-0"
            }`}
          >
            <Image
              src={slide.imageUrl}
              alt={slide.title}
              fill
              priority={i === 0}
              sizes="(max-width: 1024px) 100vw, 1024px"
              className={`object-cover ${i === index ? "vt-ken-burns" : ""}`}
            />
            <div className="absolute inset-0 bg-gradient-to-t from-ink via-ink/20 to-transparent" />
            <div className="absolute inset-x-0 bottom-0 p-5 sm:p-8">
              <p className="font-display text-xs font-bold uppercase tracking-[0.16em] text-purple">
                {slide.category}
              </p>
              <h3 className="mt-1 font-display text-2xl font-extrabold uppercase tracking-wide text-cream sm:text-3xl">
                {slide.title}
              </h3>
              <p className="mt-1 text-sm text-cream/75">
                {formatPrice(slide.price)} · Size {slide.size} · {slide.condition}
              </p>
            </div>
          </Link>
        ))}
      </div>

      {count > 1 && (
        <>
          <button
            type="button"
            onClick={() => go(index - 1)}
            aria-label="Previous piece"
            className="absolute left-3 top-1/2 z-20 -translate-y-1/2 rounded-full bg-ink/70 p-2 text-cream ring-1 ring-line backdrop-blur transition hover:bg-purple"
          >
            <Chevron dir="left" />
          </button>
          <button
            type="button"
            onClick={() => go(index + 1)}
            aria-label="Next piece"
            className="absolute right-3 top-1/2 z-20 -translate-y-1/2 rounded-full bg-ink/70 p-2 text-cream ring-1 ring-line backdrop-blur transition hover:bg-purple"
          >
            <Chevron dir="right" />
          </button>

          <div className="absolute inset-x-0 bottom-3 z-20 flex justify-center gap-2">
            {slides.map((slide, i) => (
              <button
                key={slide.id}
                type="button"
                onClick={() => go(i)}
                aria-label={`Go to piece ${i + 1}`}
                aria-current={i === index}
                className={`h-2 rounded-full transition-all ${
                  i === index
                    ? "w-6 bg-purple"
                    : "w-2 bg-cream/40 hover:bg-cream/70"
                }`}
              />
            ))}
          </div>
        </>
      )}
    </div>
  );
}

function Chevron({ dir }: { dir: "left" | "right" }) {
  return (
    <svg
      width="18"
      height="18"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      {dir === "left" ? (
        <polyline points="15 18 9 12 15 6" />
      ) : (
        <polyline points="9 18 15 12 9 6" />
      )}
    </svg>
  );
}
