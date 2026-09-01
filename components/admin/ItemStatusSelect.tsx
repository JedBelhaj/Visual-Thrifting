"use client";

import { useTransition } from "react";
import { setItemStatus } from "@/lib/actions/items";
import { ITEM_STATUSES, STATUS_LABELS } from "@/lib/constants";

export function ItemStatusSelect({
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
        startTransition(() => setItemStatus(id, next));
      }}
      className="rounded-md border border-line bg-white px-2 py-1 text-xs text-ink disabled:opacity-50"
    >
      {ITEM_STATUSES.map((s) => (
        <option key={s} value={s}>
          {STATUS_LABELS[s]}
        </option>
      ))}
    </select>
  );
}
