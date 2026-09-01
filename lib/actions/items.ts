"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { unlink } from "fs/promises";
import path from "path";
import { z } from "zod";
import { prisma } from "@/lib/db";
import { requireAdmin } from "@/lib/auth";
import { saveImages } from "@/lib/upload";
import { CATEGORIES, CONDITIONS, ITEM_STATUSES, SIZES } from "@/lib/constants";

export type ItemActionResult = { error?: string };

const itemSchema = z.object({
  title: z.string().trim().min(1, "Title is required").max(140),
  description: z.string().trim().min(1, "Description is required").max(4000),
  category: z.enum(CATEGORIES),
  size: z.enum(SIZES),
  condition: z.enum(CONDITIONS),
  price: z
    .string()
    .trim()
    .regex(/^\d+(\.\d{1,3})?$/, "Enter a price like 24.500"),
  status: z.enum(ITEM_STATUSES),
});

function toMillimes(price: string): number {
  return Math.round(parseFloat(price) * 1000);
}

type PhotoPlan = {
  keep: { id: string; order: number }[];
  create: { url: string; order: number }[];
};

/**
 * Reads the ordered `slot` manifest and matching `photo` files from the form.
 * Each slot is either `keep:<imageId>` (an existing photo the admin kept, in its
 * new position) or `new` (consumes the next uploaded file). Slot index === order.
 */
async function planPhotos(formData: FormData): Promise<PhotoPlan> {
  const slots = formData.getAll("slot").map(String);
  const files = formData
    .getAll("photo")
    .filter((f): f is File => f instanceof File && f.size > 0);

  // Orders at which a new photo should land, in upload order.
  const newOrders: number[] = [];
  const plan: PhotoPlan = { keep: [], create: [] };

  slots.forEach((slot, order) => {
    if (slot.startsWith("keep:")) {
      plan.keep.push({ id: slot.slice(5), order });
    } else if (slot === "new") {
      newOrders.push(order);
    }
  });

  // saveImages preserves input order, so url[i] belongs at newOrders[i].
  const urls = await saveImages(files.slice(0, newOrders.length));
  urls.forEach((url, i) => plan.create.push({ url, order: newOrders[i] ?? 999 }));

  // Normalise to a dense 0..n-1 sequence in case a file was skipped.
  const ordered = [
    ...plan.keep.map((k) => ({ ...k, kind: "keep" as const })),
    ...plan.create.map((c) => ({ ...c, kind: "create" as const })),
  ].sort((a, b) => a.order - b.order);

  plan.keep = [];
  plan.create = [];
  ordered.forEach((entry, order) => {
    if (entry.kind === "keep") plan.keep.push({ id: entry.id, order });
    else plan.create.push({ url: entry.url, order });
  });

  return plan;
}

function parseFields(formData: FormData) {
  return itemSchema.safeParse({
    title: formData.get("title"),
    description: formData.get("description"),
    category: formData.get("category"),
    size: formData.get("size"),
    condition: formData.get("condition"),
    price: formData.get("price"),
    status: formData.get("status"),
  });
}

async function deleteUploadFile(url: string) {
  if (!url.startsWith("/uploads/")) return;
  try {
    await unlink(path.join(process.cwd(), "public", url));
  } catch {
    // File already gone — ignore.
  }
}

export async function createItem(
  formData: FormData,
): Promise<ItemActionResult> {
  await requireAdmin();

  const parsed = parseFields(formData);
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Invalid input" };
  }

  const plan = await planPhotos(formData);
  if (plan.create.length === 0) {
    return { error: "Add at least one photo" };
  }

  const data = parsed.data;
  await prisma.item.create({
    data: {
      title: data.title,
      description: data.description,
      category: data.category,
      size: data.size,
      condition: data.condition,
      price: toMillimes(data.price),
      status: data.status,
      images: { create: plan.create },
    },
  });

  revalidatePath("/");
  revalidatePath("/shop");
  revalidatePath("/admin/items");
  revalidatePath("/admin");
  redirect("/admin/items");
}

export async function updateItem(
  id: string,
  formData: FormData,
): Promise<ItemActionResult> {
  await requireAdmin();

  const parsed = parseFields(formData);
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Invalid input" };
  }

  const existing = await prisma.item.findUnique({
    where: { id },
    include: { images: true },
  });
  if (!existing) return { error: "Item not found" };

  const plan = await planPhotos(formData);
  const ownIds = new Set(existing.images.map((img) => img.id));
  plan.keep = plan.keep.filter((k) => ownIds.has(k.id));
  const keptIds = new Set(plan.keep.map((k) => k.id));
  if (plan.keep.length === 0 && plan.create.length === 0) {
    return { error: "An item needs at least one photo" };
  }

  const removed = existing.images.filter((img) => !keptIds.has(img.id));
  const data = parsed.data;

  await prisma.$transaction([
    ...removed.map((img) =>
      prisma.itemImage.delete({ where: { id: img.id } }),
    ),
    ...plan.keep.map((k) =>
      prisma.itemImage.update({
        where: { id: k.id },
        data: { order: k.order },
      }),
    ),
    prisma.item.update({
      where: { id },
      data: {
        title: data.title,
        description: data.description,
        category: data.category,
        size: data.size,
        condition: data.condition,
        price: toMillimes(data.price),
        status: data.status,
        images: { create: plan.create },
      },
    }),
  ]);

  await Promise.all(removed.map((img) => deleteUploadFile(img.url)));

  revalidatePath("/");
  revalidatePath("/shop");
  revalidatePath(`/items/${id}`);
  revalidatePath("/admin/items");
  revalidatePath("/admin");
  redirect("/admin/items");
}

export async function setItemStatus(id: string, status: string) {
  await requireAdmin();
  if (!ITEM_STATUSES.includes(status as (typeof ITEM_STATUSES)[number])) return;
  await prisma.item.update({
    where: { id },
    data: { status: status as (typeof ITEM_STATUSES)[number] },
  });
  revalidatePath("/");
  revalidatePath("/shop");
  revalidatePath(`/items/${id}`);
  revalidatePath("/admin/items");
  revalidatePath("/admin");
}

export async function deleteItem(id: string) {
  await requireAdmin();
  const item = await prisma.item.findUnique({
    where: { id },
    include: { images: true },
  });
  if (!item) return;
  await prisma.item.delete({ where: { id } });
  await Promise.all(item.images.map((img) => deleteUploadFile(img.url)));
  revalidatePath("/");
  revalidatePath("/shop");
  revalidatePath("/admin/items");
  revalidatePath("/admin");
  redirect("/admin/items");
}
