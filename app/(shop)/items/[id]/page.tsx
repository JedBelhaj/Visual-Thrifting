import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/db";
import { getSession } from "@/lib/auth";
import { formatPrice } from "@/lib/format";
import { Gallery } from "@/components/Gallery";
import { ReserveButton } from "@/components/ReserveButton";
import { StatusBadge } from "@/components/StatusBadge";

export const dynamic = "force-dynamic";

export default async function ItemPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const [item, session] = await Promise.all([
    prisma.item.findUnique({
      where: { id },
      include: { images: { orderBy: { order: "asc" } } },
    }),
    getSession(),
  ]);

  if (!item) notFound();

  const available = item.status === "AVAILABLE";

  return (
    <div className="space-y-6">
      <Link
        href="/shop"
        className="font-display text-sm font-bold uppercase tracking-wide text-cream/50 transition-colors hover:text-purple"
      >
        ← Back to the rail
      </Link>

      <div className="grid gap-10 lg:grid-cols-[1fr_360px]">
        <Gallery images={item.images} title={item.title} />

        <div className="space-y-5">
          <div>
            <div className="mb-2">
              <StatusBadge status={item.status} />
            </div>
            <h1 className="font-display text-[clamp(1.9rem,4vw,2.75rem)] font-extrabold uppercase leading-[0.95]">
              {item.title}
            </h1>
            <p className="mt-2 font-display text-2xl font-extrabold text-purple">
              {formatPrice(item.price)}
            </p>
          </div>

          <dl className="grid grid-cols-2 gap-3 border-y border-line py-4 text-sm">
            <div>
              <dt className="font-display text-xs font-bold uppercase tracking-wide text-cream/45">
                Category
              </dt>
              <dd className="mt-0.5">{item.category}</dd>
            </div>
            <div>
              <dt className="font-display text-xs font-bold uppercase tracking-wide text-cream/45">
                Size
              </dt>
              <dd className="mt-0.5">{item.size}</dd>
            </div>
            <div>
              <dt className="font-display text-xs font-bold uppercase tracking-wide text-cream/45">
                Condition
              </dt>
              <dd className="mt-0.5">{item.condition}</dd>
            </div>
          </dl>

          <p className="whitespace-pre-line text-sm leading-relaxed text-cream/80">
            {item.description}
          </p>

          <ReserveButton
            itemId={item.id}
            disabled={!available}
            loggedIn={Boolean(session)}
          />
        </div>
      </div>
    </div>
  );
}
