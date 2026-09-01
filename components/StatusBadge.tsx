import { STATUS_LABELS } from "@/lib/constants";

const STYLES: Record<string, string> = {
  AVAILABLE: "bg-sage/15 text-sage",
  RESERVED: "bg-clay/15 text-clay-dark",
  SOLD: "bg-ink/10 text-muted",
  PENDING: "bg-clay/15 text-clay-dark",
  CONFIRMED: "bg-sage/15 text-sage",
  CANCELLED: "bg-ink/10 text-muted",
};

export function StatusBadge({ status }: { status: string }) {
  return (
    <span
      className={`inline-flex items-center rounded-full px-2.5 py-1 text-xs font-medium tracking-wide ${
        STYLES[status] ?? "bg-ink/10 text-muted"
      }`}
    >
      {STATUS_LABELS[status] ?? status}
    </span>
  );
}
