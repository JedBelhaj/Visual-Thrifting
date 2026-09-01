import { beforeEach, describe, expect, it, vi } from "vitest";
import { expectRedirect } from "./setup";
import { fakeImage, makeItemWithImages, resetDb } from "./helpers";
import { prisma } from "@/lib/db";

vi.mock("@/lib/auth", () => ({
  requireAdmin: vi.fn(async () => ({
    userId: "admin-id",
    role: "ADMIN",
    name: "Admin",
  })),
}));

// Don't touch the filesystem — hand back deterministic urls in input order.
let uploadCounter = 0;
vi.mock("@/lib/upload", () => ({
  saveImages: vi.fn(async (files: File[]) =>
    files.map(() => `/uploads/mock-${uploadCounter++}.jpg`),
  ),
}));

import { createItem, updateItem, deleteItem, setItemStatus } from "@/lib/actions/items";

function baseFields(over: Record<string, string> = {}) {
  const form = new FormData();
  form.set("title", "Camel Wool Coat");
  form.set("description", "Warm and heavy.");
  form.set("category", "Outerwear");
  form.set("size", "L");
  form.set("condition", "Very good");
  form.set("price", "120.000");
  form.set("status", "AVAILABLE");
  for (const [k, v] of Object.entries(over)) form.set(k, v);
  return form;
}

beforeEach(async () => {
  await resetDb();
  uploadCounter = 0;
});

describe("createItem", () => {
  it("creates an item with ordered photos and price in millimes", async () => {
    const form = baseFields({ price: "24.500" });
    form.append("slot", "new");
    form.append("slot", "new");
    form.append("photo", fakeImage("a.jpg"));
    form.append("photo", fakeImage("b.jpg"));

    const err = await createItem(form).catch((e) => e);
    expectRedirect(err, "/admin/items");

    const item = await prisma.item.findFirstOrThrow({
      include: { images: { orderBy: { order: "asc" } } },
    });
    expect(item.price).toBe(24_500);
    expect(item.images.map((i) => i.order)).toEqual([0, 1]);
    expect(item.images[0].url).not.toBe(item.images[1].url);
  });

  it("rejects an item with no photos", async () => {
    const res = await createItem(baseFields());
    expect(res?.error).toMatch(/at least one photo/i);
    expect(await prisma.item.count()).toBe(0);
  });

  it("validates required fields", async () => {
    const form = baseFields({ title: "" });
    form.append("slot", "new");
    form.append("photo", fakeImage());
    const res = await createItem(form);
    expect(res?.error).toMatch(/title/i);
    expect(await prisma.item.count()).toBe(0);
  });

  it("rejects a malformed price", async () => {
    const form = baseFields({ price: "twenty" });
    form.append("slot", "new");
    form.append("photo", fakeImage());
    const res = await createItem(form);
    expect(res?.error).toMatch(/price/i);
  });

  it("rejects a category outside the allowed list", async () => {
    const form = baseFields({ category: "Spaceships" });
    form.append("slot", "new");
    form.append("photo", fakeImage());
    const res = await createItem(form);
    expect(res?.error).toBeTruthy();
  });
});

describe("updateItem", () => {
  it("reorders kept photos", async () => {
    const item = await makeItemWithImages(2);
    const [img0, img1] = item.images;

    const form = baseFields();
    form.append("slot", `keep:${img1.id}`);
    form.append("slot", `keep:${img0.id}`);

    const err = await updateItem(item.id, form).catch((e) => e);
    expectRedirect(err, "/admin/items");

    const fresh = await prisma.item.findUniqueOrThrow({
      where: { id: item.id },
      include: { images: { orderBy: { order: "asc" } } },
    });
    expect(fresh.images.map((i) => i.id)).toEqual([img1.id, img0.id]);
    expect(fresh.images.map((i) => i.order)).toEqual([0, 1]);
  });

  it("removes unkept photos", async () => {
    const item = await makeItemWithImages(3);
    const keep = item.images[1];

    const form = baseFields();
    form.append("slot", `keep:${keep.id}`);
    await updateItem(item.id, form).catch(() => {});

    const images = await prisma.itemImage.findMany({
      where: { itemId: item.id },
    });
    expect(images).toHaveLength(1);
    expect(images[0].id).toBe(keep.id);
  });

  it("adds a new photo ahead of an existing one", async () => {
    const item = await makeItemWithImages(1);
    const existing = item.images[0];

    const form = baseFields();
    form.append("slot", "new");
    form.append("slot", `keep:${existing.id}`);
    form.append("photo", fakeImage("cover.jpg"));

    await updateItem(item.id, form).catch(() => {});

    const fresh = await prisma.item.findUniqueOrThrow({
      where: { id: item.id },
      include: { images: { orderBy: { order: "asc" } } },
    });
    expect(fresh.images).toHaveLength(2);
    expect(fresh.images[0].url).toMatch(/mock-/);
    expect(fresh.images[1].id).toBe(existing.id);
  });

  it("refuses to leave an item with zero photos", async () => {
    const item = await makeItemWithImages(2);
    const res = await updateItem(item.id, baseFields());
    expect(res?.error).toMatch(/at least one photo/i);
    expect(await prisma.itemImage.count({ where: { itemId: item.id } })).toBe(2);
  });

  it("persists edited fields", async () => {
    const item = await makeItemWithImages(1);
    const form = baseFields({ title: "Renamed Coat", price: "99.900" });
    form.append("slot", `keep:${item.images[0].id}`);
    await updateItem(item.id, form).catch(() => {});

    const fresh = await prisma.item.findUniqueOrThrow({ where: { id: item.id } });
    expect(fresh.title).toBe("Renamed Coat");
    expect(fresh.price).toBe(99_900);
  });
});

describe("deleteItem", () => {
  it("removes the item and its images", async () => {
    const item = await makeItemWithImages(2);
    const err = await deleteItem(item.id).catch((e) => e);
    expectRedirect(err, "/admin/items");

    expect(await prisma.item.findUnique({ where: { id: item.id } })).toBeNull();
    expect(await prisma.itemImage.count({ where: { itemId: item.id } })).toBe(0);
  });
});

describe("setItemStatus", () => {
  it("updates a valid status", async () => {
    const item = await makeItemWithImages(1);
    await setItemStatus(item.id, "SOLD");
    const fresh = await prisma.item.findUniqueOrThrow({ where: { id: item.id } });
    expect(fresh.status).toBe("SOLD");
  });

  it("ignores an invalid status", async () => {
    const item = await makeItemWithImages(1);
    await setItemStatus(item.id, "ON_FIRE");
    const fresh = await prisma.item.findUniqueOrThrow({ where: { id: item.id } });
    expect(fresh.status).toBe("AVAILABLE");
  });
});
