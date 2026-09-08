import Link from "next/link";
import Image from "next/image";
import { prisma } from "@/lib/db";
import { formatPrice, formatDate } from "@/lib/format";
import { ItemStatusSelect } from "@/components/admin/ItemStatusSelect";
import { DeleteItemButton } from "@/components/admin/DeleteItemButton";

export const dynamic = "force-dynamic";

export default async function AdminItemsPage() {
  const items = await prisma.item.findMany({
    orderBy: { createdAt: "desc" },
    include: {
      images: { take: 1, orderBy: { order: "asc" } },
      _count: { select: { reservations: true } },
    },
  });

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <h1 className="font-display text-2xl">Items ({items.length})</h1>
        <Link
          href="/admin/items/new"
          className="rounded-full bg-purple px-5 py-2.5 text-sm font-medium text-cream hover:bg-purple-dark"
        >
          + Add item
        </Link>
      </div>

      {items.length === 0 ? (
        <p className="rounded-lg border border-line bg-surface p-8 text-center text-muted">
          No items yet. Add your first piece.
        </p>
      ) : (
        <div className="overflow-x-auto rounded-lg border border-line bg-surface">
          <table className="w-full min-w-[720px] text-sm">
            <thead className="border-b border-line text-left text-xs uppercase tracking-wide text-muted">
              <tr>
                <th className="px-4 py-3 font-medium">Item</th>
                <th className="px-4 py-3 font-medium">Category</th>
                <th className="px-4 py-3 font-medium">Size</th>
                <th className="px-4 py-3 font-medium">Price</th>
                <th className="px-4 py-3 font-medium">Reservations</th>
                <th className="px-4 py-3 font-medium">Status</th>
                <th className="px-4 py-3 font-medium">Added</th>
                <th className="px-4 py-3" />
              </tr>
            </thead>
            <tbody className="divide-y divide-line">
              {items.map((item) => (
                <tr key={item.id}>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      <div className="relative h-12 w-10 shrink-0 overflow-hidden rounded bg-surface-2">
                        {item.images[0] && (
                          <Image
                            src={item.images[0].url}
                            alt=""
                            fill
                            sizes="40px"
                            className="object-cover"
                          />
                        )}
                      </div>
                      <Link
                        href={`/admin/items/${item.id}/edit`}
                        className="font-medium hover:text-purple"
                      >
                        {item.title}
                      </Link>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-muted">{item.category}</td>
                  <td className="px-4 py-3 text-muted">{item.size}</td>
                  <td className="px-4 py-3">{formatPrice(item.price)}</td>
                  <td className="px-4 py-3 text-muted">
                    {item._count.reservations}
                  </td>
                  <td className="px-4 py-3">
                    <ItemStatusSelect id={item.id} status={item.status} />
                  </td>
                  <td className="px-4 py-3 text-muted">
                    {formatDate(item.createdAt)}
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      <Link
                        href={`/admin/items/${item.id}/edit`}
                        className="text-xs text-purple underline"
                      >
                        Edit
                      </Link>
                      <DeleteItemButton id={item.id} />
                    </div>
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
