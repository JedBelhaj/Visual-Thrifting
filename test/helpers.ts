import bcrypt from "bcryptjs";
import type { Prisma } from "@prisma/client";
import { prisma } from "@/lib/db";

export async function resetDb() {
  await prisma.reservation.deleteMany();
  await prisma.itemImage.deleteMany();
  await prisma.item.deleteMany();
  await prisma.user.deleteMany();
}

let seq = 0;

export function makeUser(overrides: Partial<Prisma.UserCreateInput> = {}) {
  seq += 1;
  return prisma.user.create({
    data: {
      name: "Test User",
      email: `user${seq}@test.dev`,
      passwordHash: bcrypt.hashSync("password123", 4),
      role: "USER",
      ...overrides,
    },
  });
}

export function makeItem(overrides: Partial<Prisma.ItemCreateInput> = {}) {
  return prisma.item.create({
    data: {
      title: "Vintage Test Jacket",
      description: "A jacket for tests.",
      category: "Outerwear",
      size: "M",
      condition: "Good",
      price: 25_000,
      status: "AVAILABLE",
      ...overrides,
    },
    include: { images: { orderBy: { order: "asc" } } },
  });
}

export function makeItemWithImages(count: number, overrides = {}) {
  return prisma.item.create({
    data: {
      title: "Item With Photos",
      description: "desc",
      category: "Tops",
      size: "S",
      condition: "Excellent",
      price: 30_000,
      status: "AVAILABLE",
      images: {
        create: Array.from({ length: count }, (_, i) => ({
          url: `/uploads/existing-${i}.jpg`,
          order: i,
        })),
      },
      ...overrides,
    },
    include: { images: { orderBy: { order: "asc" } } },
  });
}

/** A minimal image File for upload-path tests. */
export function fakeImage(name = "photo.jpg") {
  return new File([Buffer.from("fake-jpeg-bytes")], name, {
    type: "image/jpeg",
  });
}
