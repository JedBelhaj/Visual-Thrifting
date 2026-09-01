"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/db";
import { destroySession, getSession, requireUser } from "@/lib/auth";
import { RESERVATION_STATUSES } from "@/lib/constants";

export type ReserveState = { error?: string };

export async function reserveItem(
  itemId: string,
  _prev: ReserveState,
  _formData: FormData,
): Promise<ReserveState> {
  const loginUrl = `/login?next=/items/${itemId}`;
  const session = await getSession();
  if (!session) redirect(loginUrl);

  // The session cookie can outlive the user row (account deleted, DB reset).
  // Treat that as logged out rather than letting a FK violation crash.
  const user = await prisma.user.findUnique({ where: { id: session.userId } });
  if (!user) {
    await destroySession();
    redirect(loginUrl);
  }

  const result = await prisma.$transaction(async (tx) => {
    const item = await tx.item.findUnique({ where: { id: itemId } });
    if (!item) return { error: "Item not found" };
    if (item.status !== "AVAILABLE") {
      return { error: "Sorry, this item is no longer available" };
    }

    const dupe = await tx.reservation.findFirst({
      where: { itemId, userId: user.id, status: { not: "CANCELLED" } },
    });
    if (dupe) return { error: "You've already reserved this item" };

    // Conditional update guards against two shoppers reserving at once:
    // only the transaction that flips AVAILABLE -> RESERVED wins.
    const claimed = await tx.item.updateMany({
      where: { id: itemId, status: "AVAILABLE" },
      data: { status: "RESERVED" },
    });
    if (claimed.count === 0) {
      return { error: "Sorry, this item is no longer available" };
    }

    await tx.reservation.create({
      data: { itemId, userId: user.id },
    });
    return { ok: true };
  });

  if ("error" in result && result.error) return { error: result.error };

  revalidatePath("/");
  revalidatePath("/shop");
  revalidatePath(`/items/${itemId}`);
  revalidatePath("/account");
  revalidatePath("/admin/reservations");
  redirect("/account");
}

/**
 * Cancel a reservation. Users may cancel their own; admins may cancel any.
 * When a pending/confirmed reservation is cancelled the item returns to
 * AVAILABLE (unless it was already marked SOLD).
 */
export async function cancelReservation(reservationId: string) {
  const session = await requireUser();
  const reservation = await prisma.reservation.findUnique({
    where: { id: reservationId },
    include: { item: true },
  });
  if (!reservation) return;
  if (session.role !== "ADMIN" && reservation.userId !== session.userId) return;
  if (reservation.status === "CANCELLED") return;

  await prisma.$transaction(async (tx) => {
    await tx.reservation.update({
      where: { id: reservationId },
      data: { status: "CANCELLED" },
    });
    if (reservation.item.status === "RESERVED") {
      await tx.item.update({
        where: { id: reservation.itemId },
        data: { status: "AVAILABLE" },
      });
    }
  });

  revalidatePath("/");
  revalidatePath("/shop");
  revalidatePath(`/items/${reservation.itemId}`);
  revalidatePath("/account");
  revalidatePath("/admin/reservations");
  revalidatePath("/admin");
}

/** Admin-only: move a reservation through its lifecycle. */
export async function setReservationStatus(reservationId: string, status: string) {
  const session = await requireUser();
  if (session.role !== "ADMIN") return;
  if (
    !RESERVATION_STATUSES.includes(
      status as (typeof RESERVATION_STATUSES)[number],
    )
  ) {
    return;
  }

  const reservation = await prisma.reservation.findUnique({
    where: { id: reservationId },
    include: { item: true },
  });
  if (!reservation) return;

  await prisma.$transaction(async (tx) => {
    await tx.reservation.update({
      where: { id: reservationId },
      data: { status: status as (typeof RESERVATION_STATUSES)[number] },
    });
    if (status === "CONFIRMED") {
      await tx.item.update({
        where: { id: reservation.itemId },
        data: { status: "SOLD" },
      });
    } else if (status === "CANCELLED" && reservation.item.status === "RESERVED") {
      await tx.item.update({
        where: { id: reservation.itemId },
        data: { status: "AVAILABLE" },
      });
    } else if (status === "PENDING" && reservation.item.status !== "SOLD") {
      await tx.item.update({
        where: { id: reservation.itemId },
        data: { status: "RESERVED" },
      });
    }
  });

  revalidatePath("/");
  revalidatePath("/shop");
  revalidatePath(`/items/${reservation.itemId}`);
  revalidatePath("/account");
  revalidatePath("/admin/reservations");
  revalidatePath("/admin");
}
