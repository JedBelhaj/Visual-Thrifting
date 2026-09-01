"use client";

import { useActionState } from "react";
import { reserveItem, type ReserveState } from "@/lib/actions/reservations";
import { SubmitButton } from "@/components/SubmitButton";

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
        className="w-full cursor-not-allowed rounded-full bg-sand px-6 py-3 text-sm font-medium text-muted"
      >
        Not available
      </button>
    );
  }

  return (
    <form action={formAction} className="space-y-2">
      <SubmitButton
        pendingText="Reserving…"
        className="w-full rounded-full bg-clay px-6 py-3 text-sm font-medium text-cream transition hover:bg-clay-dark disabled:opacity-60"
      >
        {loggedIn ? "Reserve this item" : "Log in to reserve"}
      </SubmitButton>
      {state.error && <p className="text-sm text-clay-dark">{state.error}</p>}
      <p className="text-xs text-muted">
        Reserving holds the item for pickup. No payment now — pay in person.
      </p>
    </form>
  );
}
