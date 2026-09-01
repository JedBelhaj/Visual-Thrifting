import Link from "next/link";
import { prisma } from "@/lib/db";
import { ItemCard } from "@/components/ItemCard";
import { WelcomeCarousel, type CarouselSlide } from "@/components/WelcomeCarousel";

export const dynamic = "force-dynamic";

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
    <div className="space-y-16 pb-8">
      {/* Full-bleed hero — breaks out of <main> on both axes and fills the
          viewport; the fixed site header sits transparently on top of it. */}
      <section className="relative -mt-20 mx-[calc(50%_-_50vw)] flex min-h-svh w-screen items-center overflow-hidden bg-gradient-to-br from-[#f7d9b8] via-cream to-[#dfe7d4] pt-16">
        {/* Colour accents */}
        <div className="pointer-events-none absolute -left-24 -top-24 h-80 w-80 rounded-full bg-clay/25 blur-3xl" />
        <div className="pointer-events-none absolute -bottom-32 right-[-6rem] h-96 w-96 rounded-full bg-sage/25 blur-3xl" />
        <div className="pointer-events-none absolute left-1/3 top-1/4 h-64 w-64 rounded-full bg-[#9c6b8e]/20 blur-3xl" />

        <div className="relative mx-auto grid w-full max-w-6xl items-center gap-10 px-5 py-12 lg:grid-cols-2 lg:gap-14">
          <div className="vt-fade-up">
            <p className="inline-flex rounded-full bg-clay/15 px-3 py-1 text-xs font-medium uppercase tracking-[0.2em] text-clay-dark">
              Curated secondhand · Tunis
            </p>
            <h1 className="mt-4 font-display text-4xl leading-[1.08] sm:text-5xl lg:text-6xl">
              Pre-loved pieces,
              <br />
              <span className="italic text-clay-dark">chosen one at a time.</span>
            </h1>
            <p className="mt-5 max-w-md text-base text-ink/70">
              Everything on the rail is one of one. Reserve what you love online
              and come try it on — payment happens in person at pickup.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Link
                href="/shop"
                className="rounded-full bg-ink px-6 py-3 text-sm font-medium text-cream shadow-sm transition hover:bg-clay-dark"
              >
                Browse the rail
              </Link>
              <Link
                href="/signup"
                className="rounded-full border border-ink/15 bg-cream/60 px-6 py-3 text-sm font-medium backdrop-blur transition hover:bg-cream"
              >
                Create an account
              </Link>
            </div>
          </div>

          <div className="vt-fade-up" style={{ animationDelay: "120ms" }}>
            {slides.length > 0 ? (
              <div className="rounded-xl bg-cream/40 p-2 shadow-xl shadow-clay/10 ring-1 ring-ink/5 backdrop-blur">
                <WelcomeCarousel slides={slides} />
              </div>
            ) : (
              <div className="flex aspect-[2/1] items-center justify-center rounded-lg bg-sand text-sm text-muted">
                New pieces landing soon.
              </div>
            )}
          </div>
        </div>
      </section>

      {/* How it works */}
      <section className="vt-fade-in grid gap-6 rounded-lg border border-line bg-white/50 px-6 py-10 sm:grid-cols-3 sm:px-10">
        {[
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
        ].map((step) => (
          <div key={step.n}>
            <p className="font-display text-2xl text-clay">{step.n}</p>
            <h2 className="mt-2 font-display text-lg">{step.t}</h2>
            <p className="mt-1 text-sm text-muted">{step.d}</p>
          </div>
        ))}
      </section>

      {/* Latest arrivals */}
      {latest.length > 0 && (
        <section className="vt-fade-in space-y-6">
          <div className="flex items-baseline justify-between">
            <h2 className="font-display text-2xl">Latest arrivals</h2>
            <Link
              href="/shop"
              className="text-sm text-muted underline-offset-4 hover:text-ink hover:underline"
            >
              See everything
            </Link>
          </div>
          <div className="grid grid-cols-2 gap-x-5 gap-y-9 sm:grid-cols-3 lg:grid-cols-4">
            {latest.map((item) => (
              <ItemCard key={item.id} item={item} />
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
