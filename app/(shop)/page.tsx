import Link from "next/link";
import Image from "next/image";
import { prisma } from "@/lib/db";
import { ItemCard } from "@/components/ItemCard";
import { WelcomeCarousel, type CarouselSlide } from "@/components/WelcomeCarousel";
import { CATEGORIES } from "@/lib/constants";
import badge from "@/public/vt.jpg";
import heroPhoto from "@/public/hero.jpg";

export const dynamic = "force-dynamic";

const TICKER = [
  "NEW PIECES WEEKLY",
  "ONE OF ONE",
  "RESERVE ONLINE",
  "PAY AT PICKUP",
  "NO FAST FASHION",
  "100% HAND-PICKED",
  "CURATED IN TUNIS",
];

const STEPS = [
  {
    n: "01",
    t: "Browse the rail",
    d: "Filter by size, category, condition and price. Every listing is a single piece.",
  },
  {
    n: "02",
    t: "Reserve it",
    d: "Claim an item with one tap. It's held for you — no payment online.",
  },
  {
    n: "03",
    t: "Try it on, pay in person",
    d: "Come by, try it, and pay at pickup. Change your mind? Just cancel the hold.",
  },
];

export default async function WelcomePage() {
  const featured = await prisma.item.findMany({
    where: { status: "AVAILABLE", images: { some: {} } },
    orderBy: { createdAt: "desc" },
    take: 6,
    include: { images: { orderBy: { order: "asc" }, take: 1 } },
  });

  const slides: CarouselSlide[] = featured.map((item) => ({
    id: item.id,
    title: item.title,
    price: item.price,
    size: item.size,
    condition: item.condition,
    category: item.category,
    imageUrl: item.images[0]!.url,
  }));

  const latest = await prisma.item.findMany({
    where: { status: "AVAILABLE" },
    orderBy: { createdAt: "desc" },
    take: 4,
    include: { images: { orderBy: { order: "asc" }, take: 1 } },
  });

  return (
    <div className="space-y-24 pb-12">
      {/* ---- HERO ---- full-bleed, breaks out of <main> on both axes ---- */}
      <section className="relative -mt-28 mx-[calc(50%_-_50vw)] flex min-h-svh w-screen items-end overflow-hidden bg-ink">
        <Image
          src={heroPhoto}
          alt=""
          fill
          priority
          placeholder="blur"
          sizes="100vw"
          className="object-cover object-center opacity-55"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-ink via-ink/75 to-ink/35" />
        <div className="pointer-events-none absolute inset-0 [background:radial-gradient(ellipse_60%_70%_at_80%_15%,rgba(139,53,200,0.22),transparent_70%)]" />

        <div className="relative mx-auto w-full max-w-6xl px-5 pb-20 pt-28">
          <div className="max-w-3xl vt-fade-up">
            <p className="flex items-center gap-2 font-display text-xs font-extrabold uppercase tracking-[0.22em] text-cream/80">
              <span className="text-purple">✦</span>
              Curated secondhand · Tunis
              <span className="text-purple">✦</span>
            </p>

            <h1 className="mt-5 font-display text-[clamp(3.25rem,11vw,7.5rem)] font-extrabold uppercase leading-[0.88] [text-shadow:4px_4px_0_rgba(0,0,0,0.6)]">
              Find your
              <br />
              <span className="text-purple [text-shadow:4px_4px_0_#1e003a]">
                vibe.
              </span>
              <br />
              <span className="[-webkit-text-stroke:2px_var(--color-cream)] [text-shadow:none] text-transparent">
                Thrift it.
              </span>
            </h1>

            <p className="mt-6 max-w-md text-base leading-relaxed text-cream/70">
              One-of-a-kind pieces, zero fast fashion. Reserve what you love
              online and come try it on — payment happens in person at pickup.
            </p>

            <div className="mt-9 flex flex-wrap gap-3">
              <Link
                href="/shop"
                className="rounded-md bg-purple px-8 py-4 font-display text-base font-extrabold uppercase tracking-wider text-cream transition-colors hover:bg-purple-dark"
              >
                Browse the rail
              </Link>
              <Link
                href="/signup"
                className="rounded-md border-[1.5px] border-cream/80 px-8 py-4 font-display text-base font-extrabold uppercase tracking-wider text-cream transition-colors hover:bg-cream hover:text-ink"
              >
                Create an account
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* ---- TICKER ---- */}
      <section className="-mt-24 mx-[calc(50%_-_50vw)] w-screen overflow-hidden border-y border-purple-deep/60 bg-purple py-2.5">
        <div className="vt-marquee flex w-max">
          {[0, 1].map((dup) => (
            <span
              key={dup}
              aria-hidden={dup === 1}
              className="flex items-center whitespace-nowrap font-display text-sm font-extrabold uppercase tracking-[0.12em] text-cream"
            >
              {TICKER.map((t) => (
                <span key={t} className="px-6">
                  <span className="text-cream/60">✦</span> {t}
                </span>
              ))}
            </span>
          ))}
        </div>
      </section>

      {/* ---- FEATURED CAROUSEL ---- */}
      {slides.length > 0 && (
        <section className="mx-auto max-w-6xl space-y-6 px-5 vt-fade-in">
          <SectionHead eyebrow="On the rail now" title="Featured" />
          <div className="rounded-xl border border-line bg-surface p-2">
            <WelcomeCarousel slides={slides} />
          </div>
        </section>
      )}

      {/* ---- LATEST ARRIVALS ---- */}
      {latest.length > 0 && (
        <section className="mx-auto max-w-6xl space-y-8 px-5 vt-fade-in">
          <div className="flex flex-wrap items-end justify-between gap-4">
            <SectionHead eyebrow="This week" title="New arrivals" />
            <Link
              href="/shop"
              className="border-b border-purple pb-0.5 font-display text-sm font-bold uppercase tracking-wider text-purple transition-colors hover:text-cream"
            >
              View all →
            </Link>
          </div>
          <div className="grid grid-cols-2 gap-x-5 gap-y-10 sm:grid-cols-3 lg:grid-cols-4">
            {latest.map((item) => (
              <ItemCard key={item.id} item={item} />
            ))}
          </div>
        </section>
      )}

      {/* ---- HOW IT WORKS ---- */}
      <section className="mx-auto max-w-6xl px-5 vt-fade-in">
        <div className="grid gap-8 rounded-xl border border-line bg-surface px-6 py-10 sm:grid-cols-3 sm:px-10">
          {STEPS.map((step) => (
            <div key={step.n}>
              <p className="font-display text-3xl font-extrabold text-purple">
                {step.n}
              </p>
              <h3 className="mt-2 font-display text-lg font-bold uppercase tracking-wide">
                {step.t}
              </h3>
              <p className="mt-1.5 text-sm text-cream/55">{step.d}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ---- CATEGORIES ---- typographic tiles, no stock imagery ---- */}
      <section className="mx-auto max-w-6xl space-y-8 px-5 vt-fade-in">
        <div className="text-center">
          <SectionHead eyebrow="Browse by" title="Categories" centered />
        </div>
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          {CATEGORIES.map((c, i) => (
            <Link
              key={c}
              href={`/shop?category=${encodeURIComponent(c)}`}
              className={`group flex aspect-square flex-col justify-between rounded-lg border border-line p-4 transition-colors hover:border-purple ${
                i % 3 === 0 ? "bg-purple/10" : "bg-surface"
              }`}
            >
              <span className="font-display text-xs font-bold uppercase tracking-[0.16em] text-purple">
                ✦
              </span>
              <span className="font-display text-xl font-extrabold uppercase leading-none tracking-wide transition-colors group-hover:text-purple">
                {c}
                <span className="block text-cream/40 group-hover:text-purple">
                  →
                </span>
              </span>
            </Link>
          ))}
        </div>
      </section>

      {/* ---- MANIFESTO ---- */}
      <section className="mx-[calc(50%_-_50vw)] w-screen border-y border-purple-deep/40 bg-purple/[0.06]">
        <div className="mx-auto grid max-w-6xl items-center gap-12 px-5 py-20 lg:grid-cols-2 lg:gap-20">
          <div className="flex justify-center">
            <Image
              src={badge}
              alt="Visual Thrifting"
              sizes="(max-width: 1024px) 70vw, 340px"
              className="w-[min(340px,70vw)] rounded-full [filter:drop-shadow(0_0_48px_rgba(139,53,200,0.35))]"
            />
          </div>
          <div>
            <p className="font-display text-xs font-extrabold uppercase tracking-[0.2em] text-purple">
              ✦ Our manifesto
            </p>
            <h2 className="mt-4 font-display text-[clamp(2rem,4vw,3.25rem)] font-extrabold uppercase leading-[0.95]">
              Wear stories,
              <br />
              <span className="text-purple">not seasons.</span>
            </h2>
            <p className="mt-6 text-cream/70">
              Every garment has a past life. We hunt it down — in estate sales,
              warehouse hauls and back-corner racks — so you can give it a next
              chapter.
            </p>
            <p className="mt-3 text-cream/70">
              No duplicates. No restocks. No algorithm. Just instinct, texture
              and the hunt for something genuinely worth wearing.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Link
                href="/shop"
                className="rounded-md bg-purple px-7 py-3.5 font-display text-sm font-extrabold uppercase tracking-wider text-cream transition-colors hover:bg-purple-dark"
              >
                Shop the rail
              </Link>
              <Link
                href="/signup"
                className="rounded-md border-[1.5px] border-cream/70 px-7 py-3.5 font-display text-sm font-extrabold uppercase tracking-wider text-cream transition-colors hover:bg-cream hover:text-ink"
              >
                Join the crew
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}

function SectionHead({
  eyebrow,
  title,
  centered = false,
}: {
  eyebrow: string;
  title: string;
  centered?: boolean;
}) {
  return (
    <div className={centered ? "inline-block" : undefined}>
      <p className="font-display text-xs font-extrabold uppercase tracking-[0.18em] text-purple">
        ✦ {eyebrow}
      </p>
      <h2 className="mt-2 font-display text-[clamp(2.25rem,5vw,3.75rem)] font-extrabold uppercase leading-[0.9]">
        {title}
      </h2>
    </div>
  );
}
