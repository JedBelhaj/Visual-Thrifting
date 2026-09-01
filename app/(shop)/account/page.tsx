import Link from "next/link";
import Image from "next/image";
import { prisma } from "@/lib/db";
import { requireUser } from "@/lib/auth";
import { formatPrice, formatDate } from "@/lib/format";
import { StatusBadge } from "@/components/StatusBadge";
import { CancelReservationButton } from "@/components/CancelReservationButton";

export const dynamic = "force-dynamic";

export default async function AccountPage() {
  const session = await requireUser();
  const reservations = await prisma.reservation.findMany({
    where: { userId: session.userId },
    orderBy: { createdAt: "desc" },
    include: { item: { include: { images: { orderBy: { order: "asc" }, take: 1 } } } },
  });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-2xl">Your reservations</h1>
        <p className="mt-1 text-sm text-muted">
          Hi {session.name}. Bring your ID to pick up and pay in person.
        </p>
      </div>

      {reservations.length === 0 ? (
        <p className="rounded-lg border border-line bg-white/50 p-8 text-center text-muted">
          You haven&apos;t reserved anything yet.{" "}
          <Link href="/shop" className="text-clay-dark underline">
            Browse the rail
          </Link>
          .
        </p>
      ) : (
        <ul className="space-y-3">
          {reservations.map((r) => {
            const cover = r.item.images[0]?.url;
            return (
              <li
                key={r.id}
                className="flex flex-wrap items-center gap-4 rounded-lg border border-line bg-white/50 p-3"
              >
                <div className="relative h-20 w-16 shrink-0 overflow-hidden rounded-md bg-sand">
                  {cover && (
                    <Image
                      src={cover}
                      alt=""
                      fill
                      sizes="64px"
                      className="object-cover"
                    />
                  )}
                </div>
                <div className="min-w-0 flex-1">
                  <Link
                    href={`/items/${r.itemId}`}
                    className="font-display text-base hover:text-clay-dark"
                  >
                    {r.item.title}
                  </Link>
                  <p className="text-xs text-muted">
                    {formatPrice(r.item.price)} · reserved {formatDate(r.createdAt)}
                  </p>
                </div>
                <StatusBadge status={r.status} />
                {r.status !== "CANCELLED" && r.status !== "CONFIRMED" && (
                  <CancelReservationButton id={r.id} />
                )}
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
