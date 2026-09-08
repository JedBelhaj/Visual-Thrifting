import type { Prisma } from "@prisma/client";
import { prisma } from "@/lib/db";
import { ItemCard } from "@/components/ItemCard";
import { FilterBar } from "@/components/FilterBar";

export const dynamic = "force-dynamic";

type SearchParams = Promise<Record<string, string | string[] | undefined>>;

function first(v: string | string[] | undefined): string | undefined {
  const s = Array.isArray(v) ? v[0] : v;
  return s && s.trim() ? s.trim() : undefined;
}

export default async function HomePage({
  searchParams,
}: {
  searchParams: SearchParams;
}) {
  const sp = await searchParams;
  const params = {
    q: first(sp.q),
    category: first(sp.category),
    size: first(sp.size),
    condition: first(sp.condition),
    minPrice: first(sp.minPrice),
    maxPrice: first(sp.maxPrice),
  };

  const where: Prisma.ItemWhereInput = {};
  if (params.q) {
    where.OR = [
      { title: { contains: params.q } },
      { description: { contains: params.q } },
    ];
  }
  if (params.category) where.category = params.category;
  if (params.size) where.size = params.size;
  if (params.condition) where.condition = params.condition;

  const min = params.minPrice ? Math.round(Number(params.minPrice) * 100) : null;
  const max = params.maxPrice ? Math.round(Number(params.maxPrice) * 100) : null;
  const priceFilter: Prisma.IntFilter = {};
  if (min != null && !Number.isNaN(min)) priceFilter.gte = min;
  if (max != null && !Number.isNaN(max)) priceFilter.lte = max;
  if (priceFilter.gte != null || priceFilter.lte != null) where.price = priceFilter;

  const items = await prisma.item.findMany({
    where,
    orderBy: [{ status: "asc" }, { createdAt: "desc" }],
    include: { images: { orderBy: { order: "asc" }, take: 1 } },
  });

  return (
    <div className="space-y-8">
      <section className="border-b border-line pb-6">
        <p className="font-display text-xs font-extrabold uppercase tracking-[0.2em] text-purple">
          ✦ The rail
        </p>
        <h1 className="mt-2 font-display text-[clamp(2.25rem,5vw,3.5rem)] font-extrabold uppercase leading-[0.9]">
          Browse every piece
        </h1>
        <p className="mt-3 max-w-xl text-cream/60">
          Each one is one of a kind. Reserve what you love and try it on at
          pickup — no payment online.
        </p>
      </section>

      <FilterBar params={params} />

      {items.length === 0 ? (
        <p className="py-16 text-center text-cream/50">
          Nothing matches those filters yet. Try widening your search.
        </p>
      ) : (
        <div className="grid grid-cols-2 gap-x-5 gap-y-10 sm:grid-cols-3 lg:grid-cols-4">
          {items.map((item) => (
            <ItemCard key={item.id} item={item} />
          ))}
        </div>
      )}
    </div>
  );
}
