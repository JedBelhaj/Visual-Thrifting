import { STATUS_LABELS } from "@/lib/constants";

const STYLES: Record<string, string> = {
  AVAILABLE: "bg-purple/20 text-purple ring-purple/30",
  RESERVED: "bg-hot/15 text-hot ring-hot/30",
  SOLD: "bg-cream/10 text-cream/50 ring-cream/15",
  PENDING: "bg-hot/15 text-hot ring-hot/30",
  CONFIRMED: "bg-purple/20 text-purple ring-purple/30",
  CANCELLED: "bg-cream/10 text-cream/50 ring-cream/15",
};

export function StatusBadge({ status }: { status: string }) {
  return (
    <span
      className={`inline-flex items-center rounded-full px-2.5 py-1 font-display text-[0.7rem] font-extrabold uppercase tracking-[0.1em] ring-1 ring-inset ${
        STYLES[status] ?? "bg-cream/10 text-cream/50 ring-cream/15"
      }`}
    >
      {STATUS_LABELS[status] ?? status}
    </span>
  );
}
