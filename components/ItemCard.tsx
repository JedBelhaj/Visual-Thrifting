import Link from "next/link";
import Image from "next/image";
import { formatPrice } from "@/lib/format";
import { StatusBadge } from "@/components/StatusBadge";

type Props = {
  item: {
    id: string;
    title: string;
    price: number;
    size: string;
    condition: string;
    status: string;
    images: { url: string }[];
  };
};

export function ItemCard({ item }: Props) {
  const cover = item.images[0]?.url;
  const sold = item.status === "SOLD";

  return (
    <Link href={`/items/${item.id}`} className="group block">
      <div className="relative aspect-[4/5] overflow-hidden rounded-lg bg-sand">
        {cover ? (
          <Image
            src={cover}
            alt={item.title}
            fill
            sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 280px"
            className={`object-cover transition duration-500 group-hover:scale-[1.03] ${
              sold ? "opacity-60 grayscale" : ""
            }`}
          />
        ) : (
          <div className="flex h-full items-center justify-center text-sm text-muted">
            No photo
          </div>
        )}
        {item.status !== "AVAILABLE" && (
          <div className="absolute left-3 top-3">
            <StatusBadge status={item.status} />
          </div>
        )}
      </div>
      <div className="mt-3 flex items-baseline justify-between gap-3">
        <h3 className="font-display text-base leading-snug group-hover:text-clay-dark">
          {item.title}
        </h3>
        <span className="shrink-0 text-sm font-medium">
          {formatPrice(item.price)}
        </span>
      </div>
      <p className="mt-0.5 text-xs text-muted">
        Size {item.size} · {item.condition}
      </p>
    </Link>
  );
}
