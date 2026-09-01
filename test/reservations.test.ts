import { beforeEach, describe, expect, it, vi } from "vitest";
import { expectRedirect } from "./setup";
import { makeItem, makeUser, resetDb } from "./helpers";
import { prisma } from "@/lib/db";

/** Controllable auth state for the mocked session helpers. */
const auth: { session: { userId: string; role: string; name: string } | null } =
  { session: null };
const destroySession = vi.fn();

vi.mock("@/lib/auth", () => ({
  getSession: async () => auth.session,
  destroySession: (...args: unknown[]) => destroySession(...args),
  requireUser: async () => {
    if (!auth.session) {
      const err = new Error("NEXT_REDIRECT") as Error & { digest: string };
      err.digest = "NEXT_REDIRECT;replace;/login;307;";
      throw err;
    }
    return auth.session;
  },
}));

import {
  reserveItem,
  cancelReservation,
  setReservationStatus,
} from "@/lib/actions/reservations";

const fd = () => new FormData();

beforeEach(async () => {
  await resetDb();
  auth.session = null;
  destroySession.mockClear();
});

describe("reserveItem", () => {
  it("reserves an available item and marks it RESERVED", async () => {
    const user = await makeUser();
    const item = await makeItem();
    auth.session = { userId: user.id, role: "USER", name: user.name };

    const err = await reserveItem(item.id, {}, fd()).catch((e) => e);
    expectRedirect(err, "/account");

    const after = await prisma.item.findUnique({ where: { id: item.id } });
    expect(after?.status).toBe("RESERVED");

    const reservations = await prisma.reservation.findMany({
      where: { itemId: item.id },
    });
    expect(reservations).toHaveLength(1);
    expect(reservations[0].status).toBe("PENDING");
    expect(reservations[0].userId).toBe(user.id);
  });

  it("redirects to login when signed out", async () => {
    const item = await makeItem();
    const err = await reserveItem(item.id, {}, fd()).catch((e) => e);
    expectRedirect(err, `/login?next=/items/${item.id}`);
  });

  it("clears a stale session whose user no longer exists", async () => {
    const item = await makeItem();
    auth.session = { userId: "ghost-user-id", role: "USER", name: "Ghost" };

    const err = await reserveItem(item.id, {}, fd()).catch((e) => e);
    expectRedirect(err, `/login?next=/items/${item.id}`);
    expect(destroySession).toHaveBeenCalledOnce();

    // No orphan reservation was written.
    expect(await prisma.reservation.count()).toBe(0);
  });

  it("refuses an item that is not available", async () => {
    const user = await makeUser();
    const item = await makeItem({ status: "SOLD" });
    auth.session = { userId: user.id, role: "USER", name: user.name };

    const res = await reserveItem(item.id, {}, fd());
    expect(res.error).toMatch(/no longer available/i);
    expect(await prisma.reservation.count()).toBe(0);
  });

  it("refuses a second active reservation from the same user", async () => {
    const user = await makeUser();
    const item = await makeItem();
    auth.session = { userId: user.id, role: "USER", name: user.name };

    await reserveItem(item.id, {}, fd()).catch(() => {});
    // Admin puts it back on the rail without cancelling the reservation.
    await prisma.item.update({
      where: { id: item.id },
      data: { status: "AVAILABLE" },
    });

    const res = await reserveItem(item.id, {}, fd());
    expect(res.error).toMatch(/already reserved/i);
    expect(await prisma.reservation.count()).toBe(1);
  });

  it("returns an error for a missing item", async () => {
    const user = await makeUser();
    auth.session = { userId: user.id, role: "USER", name: user.name };
    const res = await reserveItem("does-not-exist", {}, fd());
    expect(res.error).toMatch(/not found/i);
  });
});

describe("cancelReservation", () => {
  async function reserved() {
    const user = await makeUser();
    const item = await makeItem();
    auth.session = { userId: user.id, role: "USER", name: user.name };
    await reserveItem(item.id, {}, fd()).catch(() => {});
    const reservation = await prisma.reservation.findFirstOrThrow({
      where: { itemId: item.id },
    });
    return { user, item, reservation };
  }

  it("cancels the owner's reservation and frees the item", async () => {
    const { reservation, item } = await reserved();
    await cancelReservation(reservation.id);

    const r = await prisma.reservation.findUnique({
      where: { id: reservation.id },
    });
    const i = await prisma.item.findUnique({ where: { id: item.id } });
    expect(r?.status).toBe("CANCELLED");
    expect(i?.status).toBe("AVAILABLE");
  });

  it("ignores a cancel from a different, non-admin user", async () => {
    const { reservation, item } = await reserved();
    const other = await makeUser();
    auth.session = { userId: other.id, role: "USER", name: other.name };

    await cancelReservation(reservation.id);

    const i = await prisma.item.findUnique({ where: { id: item.id } });
    expect(i?.status).toBe("RESERVED");
  });

  it("lets an admin cancel any reservation", async () => {
    const { reservation, item } = await reserved();
    const admin = await makeUser({ role: "ADMIN" });
    auth.session = { userId: admin.id, role: "ADMIN", name: admin.name };

    await cancelReservation(reservation.id);
    const i = await prisma.item.findUnique({ where: { id: item.id } });
    expect(i?.status).toBe("AVAILABLE");
  });

  it("does not resurrect a SOLD item", async () => {
    const { reservation, item } = await reserved();
    await prisma.item.update({
      where: { id: item.id },
      data: { status: "SOLD" },
    });
    await cancelReservation(reservation.id);
    const i = await prisma.item.findUnique({ where: { id: item.id } });
    expect(i?.status).toBe("SOLD");
  });
});

describe("setReservationStatus", () => {
  async function pending() {
    const user = await makeUser();
    const item = await makeItem();
    auth.session = { userId: user.id, role: "USER", name: user.name };
    await reserveItem(item.id, {}, fd()).catch(() => {});
    const reservation = await prisma.reservation.findFirstOrThrow({
      where: { itemId: item.id },
    });
    const admin = await makeUser({ role: "ADMIN" });
    auth.session = { userId: admin.id, role: "ADMIN", name: admin.name };
    return { item, reservation };
  }

  it("CONFIRMED marks the item SOLD", async () => {
    const { item, reservation } = await pending();
    await setReservationStatus(reservation.id, "CONFIRMED");
    const i = await prisma.item.findUnique({ where: { id: item.id } });
    expect(i?.status).toBe("SOLD");
  });

  it("CANCELLED returns a reserved item to AVAILABLE", async () => {
    const { item, reservation } = await pending();
    await setReservationStatus(reservation.id, "CANCELLED");
    const i = await prisma.item.findUnique({ where: { id: item.id } });
    expect(i?.status).toBe("AVAILABLE");
  });

  it("ignores an invalid status value", async () => {
    const { reservation } = await pending();
    await setReservationStatus(reservation.id, "BOGUS");
    const r = await prisma.reservation.findUnique({
      where: { id: reservation.id },
    });
    expect(r?.status).toBe("PENDING");
  });

  it("is a no-op for non-admins", async () => {
    const { item, reservation } = await pending();
    const user = await makeUser();
    auth.session = { userId: user.id, role: "USER", name: user.name };

    await setReservationStatus(reservation.id, "CONFIRMED");
    const i = await prisma.item.findUnique({ where: { id: item.id } });
    expect(i?.status).toBe("RESERVED");
  });
});
