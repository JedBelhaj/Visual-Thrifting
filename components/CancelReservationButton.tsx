"use client";

import { cancelReservation } from "@/lib/actions/reservations";
import { SubmitButton } from "@/components/SubmitButton";

export function CancelReservationButton({ id }: { id: string }) {
  const action = cancelReservation.bind(null, id);
  return (
    <form action={action}>
      <SubmitButton
        pendingText="Cancelling…"
        className="rounded-md border border-line px-4 py-2 font-display text-xs font-bold uppercase tracking-wide text-cream/55 transition-colors hover:border-purple hover:text-purple disabled:opacity-60"
      >
        Cancel reservation
      </SubmitButton>
    </form>
  );
}
