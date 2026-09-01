import Link from "next/link";
import { prisma } from "@/lib/db";
import { formatPrice, formatDateTime } from "@/lib/format";
import { STATUS_LABELS } from "@/lib/constants";
import { StatusBadge } from "@/components/StatusBadge";

export const dynamic = "force-dynamic";

export default async function AdminDashboard() {
  const [
    totalItems,
    byStatus,
    byCategory,
    recentItems,
    recentReservations,
    mostReserved,
    pendingCount,
  ] = await Promise.all([
    prisma.item.count(),
    prisma.item.groupBy({ by: ["status"], _count: { _all: true } }),
    prisma.item.groupBy({ by: ["category"], _count: { _all: true } }),
    prisma.item.findMany({
      orderBy: { createdAt: "desc" },
      take: 5,
      include: { images: { take: 1, orderBy: { order: "asc" } } },
    }),
    prisma.reservation.findMany({
      orderBy: { createdAt: "desc" },
      take: 6,
      include: { item: true, user: true },
    }),
    prisma.reservation.groupBy({
      by: ["itemId"],
      _count: { _all: true },
      orderBy: { _count: { itemId: "desc" } },
      take: 5,
    }),
    prisma.reservation.count({ where: { status: "PENDING" } }),
  ]);

  const statusCount = (s: string) =>
    byStatus.find((r) => r.status === s)?._count._all ?? 0;

  const mostReservedItems = await prisma.item.findMany({
    where: { id: { in: mostReserved.map((m) => m.itemId) } },
  });
  const mostReservedRows = mostReserved
    .map((m) => ({
      item: mostReservedItems.find((i) => i.id === m.itemId),
      count: m._count._all,
    }))
    .filter((r) => r.item);

  return (
    <div className="space-y-8">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="font-display text-2xl">Dashboard</h1>
        <Link
          href="/admin/items/new"
          className="rounded-full bg-clay px-5 py-2.5 text-sm font-medium text-cream hover:bg-clay-dark"
        >
          + Add item
        </Link>
      </div>

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        <Stat label="Total items" value={totalItems} />
        <Stat label={STATUS_LABELS.AVAILABLE} value={statusCount("AVAILABLE")} />
        <Stat label={STATUS_LABELS.RESERVED} value={statusCount("RESERVED")} />
        <Stat label={STATUS_LABELS.SOLD} value={statusCount("SOLD")} />
      </div>

      {pendingCount > 0 && (
        <div className="rounded-lg border border-clay/30 bg-clay/10 px-4 py-3 text-sm">
          <strong>{pendingCount}</strong> reservation
          {pendingCount === 1 ? "" : "s"} awaiting pickup.{" "}
          <Link href="/admin/reservations" className="underline">
            Review
          </Link>
        </div>
      )}

      <div className="grid gap-6 lg:grid-cols-2">
        <section className="rounded-lg border border-line bg-white/50 p-5">
          <h2 className="font-display text-lg">Items by category</h2>
          {byCategory.length === 0 ? (
            <p className="mt-3 text-sm text-muted">No items yet.</p>
          ) : (
            <ul className="mt-3 space-y-2 text-sm">
              {byCategory
                .slice()
                .sort((a, b) => b._count._all - a._count._all)
                .map((row) => (
                  <li key={row.category} className="flex items-center gap-3">
                    <span className="w-28 shrink-0 text-muted">
                      {row.category}
                    </span>
                    <span className="h-2 flex-1 overflow-hidden rounded-full bg-sand">
                      <span
                        className="block h-full bg-clay"
                        style={{
                          width: `${Math.max(
                            6,
                            (row._count._all / totalItems) * 100,
                          )}%`,
                        }}
                      />
                    </span>
                    <span className="w-6 text-right">{row._count._all}</span>
                  </li>
                ))}
            </ul>
          )}
        </section>

        <section className="rounded-lg border border-line bg-white/50 p-5">
          <h2 className="font-display text-lg">Most reserved</h2>
          {mostReservedRows.length === 0 ? (
            <p className="mt-3 text-sm text-muted">No reservations yet.</p>
          ) : (
            <ul className="mt-3 space-y-2 text-sm">
              {mostReservedRows.map(({ item, count }) => (
                <li
                  key={item!.id}
                  className="flex items-center justify-between gap-3"
                >
                  <Link
                    href={`/admin/items/${item!.id}/edit`}
                    className="truncate hover:text-clay-dark"
                  >
                    {item!.title}
                  </Link>
                  <span className="shrink-0 text-muted">
                    {count} {count === 1 ? "time" : "times"}
                  </span>
                </li>
              ))}
            </ul>
          )}
        </section>
      </div>

      <section className="rounded-lg border border-line bg-white/50 p-5">
        <h2 className="font-display text-lg">Recent reservations</h2>
        {recentReservations.length === 0 ? (
          <p className="mt-3 text-sm text-muted">Nothing yet.</p>
        ) : (
          <ul className="mt-3 divide-y divide-line text-sm">
            {recentReservations.map((r) => (
              <li key={r.id} className="flex flex-wrap items-center gap-2 py-2">
                <span className="text-muted">{formatDateTime(r.createdAt)}</span>
                <span className="font-medium">{r.user.name}</span>
                <span className="text-muted">reserved</span>
                <Link
                  href={`/admin/items/${r.itemId}/edit`}
                  className="hover:text-clay-dark"
                >
                  {r.item.title}
                </Link>
                <span className="ml-auto">
                  <StatusBadge status={r.status} />
                </span>
              </li>
            ))}
          </ul>
        )}
      </section>

      <section className="rounded-lg border border-line bg-white/50 p-5">
        <h2 className="font-display text-lg">Recently added</h2>
        {recentItems.length === 0 ? (
          <p className="mt-3 text-sm text-muted">No items yet.</p>
        ) : (
          <ul className="mt-3 divide-y divide-line text-sm">
            {recentItems.map((i) => (
              <li key={i.id} className="flex items-center gap-3 py-2">
                <Link
                  href={`/admin/items/${i.id}/edit`}
                  className="flex-1 truncate hover:text-clay-dark"
                >
                  {i.title}
                </Link>
                <span className="text-muted">{formatPrice(i.price)}</span>
                <StatusBadge status={i.status} />
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}

function Stat({ label, value }: { label: string; value: number }) {
  return (
    <div className="rounded-lg border border-line bg-white/50 p-4">
      <p className="text-2xl font-semibold">{value}</p>
      <p className="text-xs text-muted">{label}</p>
    </div>
  );
}
