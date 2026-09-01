"use client";

import { cancelReservation } from "@/lib/actions/reservations";
import { SubmitButton } from "@/components/SubmitButton";

export function CancelReservationButton({ id }: { id: string }) {
  const action = cancelReservation.bind(null, id);
  return (
    <form action={action}>
      <SubmitButton
        pendingText="Cancelling…"
        className="rounded-full border border-line px-4 py-2 text-xs font-medium text-muted transition hover:border-clay hover:text-clay-dark disabled:opacity-60"
      >
        Cancel reservation
      </SubmitButton>
    </form>
  );
}
