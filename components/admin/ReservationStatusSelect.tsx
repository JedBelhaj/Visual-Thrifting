"use client";

import { useTransition } from "react";
import { setReservationStatus } from "@/lib/actions/reservations";
import { RESERVATION_STATUSES, STATUS_LABELS } from "@/lib/constants";

export function ReservationStatusSelect({
  id,
  status,
}: {
  id: string;
  status: string;
}) {
  const [pending, startTransition] = useTransition();

  return (
    <select
      value={status}
      disabled={pending}
      onChange={(e) => {
        const next = e.target.value;
        startTransition(() => setReservationStatus(id, next));
      }}
      className="rounded-md border border-line bg-surface px-2 py-1 text-xs text-cream disabled:opacity-50"
    >
      {RESERVATION_STATUSES.map((s) => (
        <option key={s} value={s}>
          {STATUS_LABELS[s]}
        </option>
      ))}
    </select>
  );
}
