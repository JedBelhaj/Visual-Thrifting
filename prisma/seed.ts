import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";
import { writeFile, mkdir } from "fs/promises";
import path from "path";
import sharp from "sharp";

const prisma = new PrismaClient();
const UPLOAD_DIR = path.join(process.cwd(), "public", "uploads");

const ADMIN_EMAIL = "admin@visualthrift.test";
const ADMIN_PASSWORD = "admin12345";
const SHOPPER_EMAIL = "sam@example.test";
const SHOPPER_PASSWORD = "shopper12345";

type SeedItem = {
  title: string;
  description: string;
  category: string;
  size: string;
  condition: string;
  price: number; // millimes (1 TND = 1000)
  photos: number;
};

const ITEMS: SeedItem[] = [
  {
    title: "Rust corduroy overshirt",
    description:
      "Heavyweight cotton cord in a warm rust tone. Boxy fit, chest pockets, real horn buttons. A couple of soft fades at the cuffs — otherwise excellent.",
    category: "Outerwear",
    size: "L",
    condition: "Very good",
    price: 55000,
    photos: 3,
  },
  {
    title: "Cream fisherman knit",
    description:
      "Chunky undyed wool with a classic cable front. Warm without being scratchy. No holes, no pilling worth mentioning.",
    category: "Knitwear",
    size: "M",
    condition: "Excellent",
    price: 60000,
    photos: 2,
  },
  {
    title: "High-waist pleated trousers",
    description:
      "Tailored wool-blend trousers with a single forward pleat and a tapered leg. Hemmed to a 30\" inseam. Dry-cleaned and pressed.",
    category: "Bottoms",
    size: "S",
    condition: "Very good",
    price: 40000,
    photos: 2,
  },
  {
    title: "Floral tea dress",
    description:
      "Silky viscose midi with a ditsy floral print, covered buttons and a self belt. Gentle drape, swishes nicely.",
    category: "Dresses",
    size: "M",
    condition: "Good",
    price: 35000,
    photos: 3,
  },
  {
    title: "Tan leather crossbody",
    description:
      "Small structured bag in vegetable-tanned leather that has aged to a lovely honey. Adjustable strap, brass hardware, suede lining.",
    category: "Bags",
    size: "One Size",
    condition: "Very good",
    price: 75000,
    photos: 2,
  },
  {
    title: "Striped breton long sleeve",
    description:
      "Classic heavy cotton breton, navy on off-white. Slightly cropped. Holds its shape after washing.",
    category: "Tops",
    size: "S",
    condition: "Excellent",
    price: 28000,
    photos: 1,
  },
  {
    title: "Suede desert boots",
    description:
      "Sand suede, crepe sole, barely worn — soles still have most of their tread. Comes with the original box.",
    category: "Shoes",
    size: "L",
    condition: "Excellent",
    price: 65000,
    photos: 2,
  },
  {
    title: "Quilted barn jacket",
    description:
      "Olive cotton barn coat with a diamond-quilted lining and corduroy collar. Roomy pockets. One inner pocket seam resewn.",
    category: "Outerwear",
    size: "XL",
    condition: "Good",
    price: 50000,
    photos: 2,
  },
];

const PALETTES = [
  ["#c2683f", "#e8c9a0"],
  ["#6b7b5e", "#d7ddc9"],
  ["#8a5a44", "#e4cdb8"],
  ["#40566b", "#cdd8e0"],
  ["#9c6b8e", "#e6d2df"],
  ["#7a7168", "#e4dace"],
];

/** Generates a simple studio-style placeholder photo so the seed works offline. */
async function makePhoto(
  key: string,
  label: string,
  variant: number,
): Promise<string> {
  const [bg, fg] = PALETTES[variant % PALETTES.length];
  const w = 800;
  const h = 1000;
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${w}" height="${h}">
    <defs>
      <linearGradient id="g" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0" stop-color="${bg}"/>
        <stop offset="1" stop-color="${fg}"/>
      </linearGradient>
    </defs>
    <rect width="${w}" height="${h}" fill="url(#g)"/>
    <circle cx="${w / 2}" cy="${h / 2 - 40}" r="150" fill="${fg}" opacity="0.35"/>
    <text x="${w / 2}" y="${h - 90}" text-anchor="middle" font-family="Georgia, serif"
      font-size="46" fill="#2b2620" opacity="0.8">${label}</text>
  </svg>`;
  const name = `seed-${key}.jpg`;
  const buf = await sharp(Buffer.from(svg)).jpeg({ quality: 82 }).toBuffer();
  await writeFile(path.join(UPLOAD_DIR, name), buf);
  return `/uploads/${name}`;
}

async function main() {
  await mkdir(UPLOAD_DIR, { recursive: true });

  const admin = await prisma.user.upsert({
    where: { email: ADMIN_EMAIL },
    update: {},
    create: {
      name: "Shop Admin",
      email: ADMIN_EMAIL,
      passwordHash: await bcrypt.hash(ADMIN_PASSWORD, 10),
      role: "ADMIN",
    },
  });

  const shopper = await prisma.user.upsert({
    where: { email: SHOPPER_EMAIL },
    update: {},
    create: {
      name: "Sam Shopper",
      email: SHOPPER_EMAIL,
      passwordHash: await bcrypt.hash(SHOPPER_PASSWORD, 10),
      role: "USER",
    },
  });

  const existing = await prisma.item.count();
  if (existing > 0) {
    console.log(`Items already present (${existing}); skipping item seed.`);
  } else {
    let index = 0;
    for (const item of ITEMS) {
      const urls: string[] = [];
      for (let p = 0; p < item.photos; p++) {
        urls.push(
          await makePhoto(`${index}-${p}`, `${item.category} · ${p + 1}`, index + p),
        );
      }
      const created = await prisma.item.create({
        data: {
          title: item.title,
          description: item.description,
          category: item.category,
          size: item.size,
          condition: item.condition,
          price: item.price,
          images: { create: urls.map((url, order) => ({ url, order })) },
        },
      });
      console.log(`  + ${created.title} (${urls.length} photos)`);
      index++;
    }

    // A couple of sample reservations.
    const [first, second] = await prisma.item.findMany({ take: 2, orderBy: { createdAt: "asc" } });
    if (first) {
      await prisma.reservation.create({
        data: { itemId: first.id, userId: shopper.id, status: "PENDING" },
      });
      await prisma.item.update({ where: { id: first.id }, data: { status: "RESERVED" } });
    }
    if (second) {
      await prisma.reservation.create({
        data: { itemId: second.id, userId: shopper.id, status: "CONFIRMED" },
      });
      await prisma.item.update({ where: { id: second.id }, data: { status: "SOLD" } });
    }
  }

  console.log("\nSeed complete.");
  console.log(`  Admin:   ${admin.email} / ${ADMIN_PASSWORD}`);
  console.log(`  Shopper: ${shopper.email} / ${SHOPPER_PASSWORD}`);
}

main()
  .then(() => prisma.$disconnect())
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });
