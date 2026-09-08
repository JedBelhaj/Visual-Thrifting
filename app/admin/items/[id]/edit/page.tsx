import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/db";
import { formatDateTime } from "@/lib/format";
import { ItemForm } from "@/components/admin/ItemForm";
import { StatusBadge } from "@/components/StatusBadge";

export const dynamic = "force-dynamic";

export default async function EditItemPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const item = await prisma.item.findUnique({
    where: { id },
    include: {
      images: { orderBy: { order: "asc" } },
      reservations: {
        orderBy: { createdAt: "desc" },
        include: { user: true },
      },
    },
  });

  if (!item) notFound();

  return (
    <div className="space-y-5">
      <Link href="/admin/items" className="text-sm text-muted hover:text-cream">
        ← Items
      </Link>
      <div className="flex flex-wrap items-center gap-3">
        <h1 className="font-display text-2xl">Edit item</h1>
        <StatusBadge status={item.status} />
      </div>

      <ItemForm item={item} />

      {item.reservations.length > 0 && (
        <section className="max-w-2xl rounded-lg border border-line bg-surface p-4">
          <h2 className="font-display text-lg">Reservation history</h2>
          <ul className="mt-2 divide-y divide-line text-sm">
            {item.reservations.map((r) => (
              <li key={r.id} className="flex items-center justify-between py-2">
                <span>
                  {r.user.name}{" "}
                  <span className="text-muted">({r.user.email})</span>
                </span>
                <span className="flex items-center gap-3 text-muted">
                  {formatDateTime(r.createdAt)}
                  <StatusBadge status={r.status} />
                </span>
              </li>
            ))}
          </ul>
        </section>
      )}
    </div>
  );
}
