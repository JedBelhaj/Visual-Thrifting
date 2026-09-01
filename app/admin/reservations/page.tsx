import Link from "next/link";
import Image from "next/image";
import { prisma } from "@/lib/db";
import { formatPrice, formatDateTime } from "@/lib/format";
import { RESERVATION_STATUSES, STATUS_LABELS } from "@/lib/constants";
import { ReservationStatusSelect } from "@/components/admin/ReservationStatusSelect";

export const dynamic = "force-dynamic";

type SearchParams = Promise<{ status?: string }>;

export default async function AdminReservationsPage({
  searchParams,
}: {
  searchParams: SearchParams;
}) {
  const { status } = await searchParams;
  const filter =
    status && RESERVATION_STATUSES.includes(status as (typeof RESERVATION_STATUSES)[number])
      ? (status as (typeof RESERVATION_STATUSES)[number])
      : undefined;

  const reservations = await prisma.reservation.findMany({
    where: filter ? { status: filter } : undefined,
    orderBy: { createdAt: "desc" },
    include: {
      user: true,
      item: { include: { images: { take: 1, orderBy: { order: "asc" } } } },
    },
  });

  return (
    <div className="space-y-5">
      <h1 className="font-display text-2xl">Reservations ({reservations.length})</h1>

      <div className="flex flex-wrap gap-2 text-sm">
        <FilterChip label="All" href="/admin/reservations" active={!filter} />
        {RESERVATION_STATUSES.map((s) => (
          <FilterChip
            key={s}
            label={STATUS_LABELS[s]}
            href={`/admin/reservations?status=${s}`}
            active={filter === s}
          />
        ))}
      </div>

      {reservations.length === 0 ? (
        <p className="rounded-lg border border-line bg-white/50 p-8 text-center text-muted">
          No reservations{filter ? ` with status “${STATUS_LABELS[filter]}”` : ""}.
        </p>
      ) : (
        <div className="overflow-x-auto rounded-lg border border-line bg-white/50">
          <table className="w-full min-w-[760px] text-sm">
            <thead className="border-b border-line text-left text-xs uppercase tracking-wide text-muted">
              <tr>
                <th className="px-4 py-3 font-medium">Item</th>
                <th className="px-4 py-3 font-medium">Reserved by</th>
                <th className="px-4 py-3 font-medium">When</th>
                <th className="px-4 py-3 font-medium">Item status</th>
                <th className="px-4 py-3 font-medium">Reservation</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-line">
              {reservations.map((r) => (
                <tr key={r.id}>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      <div className="relative h-12 w-10 shrink-0 overflow-hidden rounded bg-sand">
                        {r.item.images[0] && (
                          <Image
                            src={r.item.images[0].url}
                            alt=""
                            fill
                            sizes="40px"
                            className="object-cover"
                          />
                        )}
                      </div>
                      <div>
                        <Link
                          href={`/admin/items/${r.itemId}/edit`}
                          className="font-medium hover:text-clay-dark"
                        >
                          {r.item.title}
                        </Link>
                        <p className="text-xs text-muted">
                          {formatPrice(r.item.price)}
                        </p>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <p className="font-medium">{r.user.name}</p>
                    <p className="text-xs text-muted">{r.user.email}</p>
                  </td>
                  <td className="px-4 py-3 text-muted">
                    {formatDateTime(r.createdAt)}
                  </td>
                  <td className="px-4 py-3 text-muted">
                    {STATUS_LABELS[r.item.status]}
                  </td>
                  <td className="px-4 py-3">
                    <ReservationStatusSelect id={r.id} status={r.status} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

function FilterChip({
  label,
  href,
  active,
}: {
  label: string;
  href: string;
  active: boolean;
}) {
  return (
    <Link
      href={href}
      className={`rounded-full px-3 py-1.5 ${
        active
          ? "bg-ink text-cream"
          : "border border-line text-muted hover:bg-sand hover:text-ink"
      }`}
    >
      {label}
    </Link>
  );
}
