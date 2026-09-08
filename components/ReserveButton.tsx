"use client";

import { useActionState } from "react";
import { reserveItem, type ReserveState } from "@/lib/actions/reservations";
import { SubmitButton } from "@/components/SubmitButton";

const reserveBtn =
  "w-full rounded-md bg-purple px-6 py-3.5 font-display text-sm font-extrabold uppercase tracking-wider text-cream transition-colors hover:bg-purple-dark disabled:opacity-60";

export function ReserveButton({
  itemId,
  disabled,
  loggedIn,
}: {
  itemId: string;
  disabled: boolean;
  loggedIn: boolean;
}) {
  const action = reserveItem.bind(null, itemId);
  const [state, formAction] = useActionState<ReserveState, FormData>(action, {});

  if (disabled) {
    return (
      <button
        disabled
        className="w-full cursor-not-allowed rounded-md bg-surface px-6 py-3.5 font-display text-sm font-extrabold uppercase tracking-wider text-cream/40"
      >
        Not available
      </button>
    );
  }

  return (
    <form action={formAction} className="space-y-2">
      <SubmitButton pendingText="Reserving…" className={reserveBtn}>
        {loggedIn ? "Reserve this item" : "Log in to reserve"}
      </SubmitButton>
      {state.error && <p className="text-sm text-hot">{state.error}</p>}
      <p className="text-xs text-cream/45">
        Reserving holds the item for pickup. No payment now — pay in person.
      </p>
    </form>
  );
}
