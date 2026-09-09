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
  /** Unsplash photo IDs (the part after `photo-` in images.unsplash.com URLs). */
  photos: string[];
};

const ITEMS: SeedItem[] = [
  {
    title: "Rust zip bomber",
    description:
      "Lightweight shell bomber in a warm rust tone. Ribbed collar and cuffs, full zip, welt pockets. No marks, zip runs clean.",
    category: "Outerwear",
    size: "L",
    condition: "Very good",
    price: 65000,
    photos: ["1591047139829-d91aecb6caea"],
  },
  {
    title: "Camel belted wrap coat",
    description:
      "Long camel wrap coat in a soft wool blend, with a self-tie belt and no buttons — the drape does the work. Fully lined. Immaculate.",
    category: "Outerwear",
    size: "M",
    condition: "Excellent",
    price: 90000,
    photos: ["1539533018447-63fcce2678e3"],
  },
  {
    title: "Olive cotton utility jacket",
    description:
      "Boxy olive field jacket in washed cotton, with four flap pockets and a drawcord waist. Broken-in and soft. Small mark on one cuff.",
    category: "Outerwear",
    size: "S",
    condition: "Good",
    price: 45000,
    photos: ["1544022613-e87ca75a784a"],
  },
  {
    title: "Cream fringe knit poncho",
    description:
      "Undyed cotton knit poncho with a fringed hem. Soft, breathable, throws over everything. One tiny pull on the back, otherwise excellent.",
    category: "Knitwear",
    size: "One Size",
    condition: "Excellent",
    price: 48000,
    photos: ["1434389677669-e08b4cac3105"],
  },
  {
    title: "Chambray pin-dot shirt",
    description:
      "Lightweight chambray shirt with an all-over pin dot, a soft collar and a curved hem. Three-quarter sleeves. Barely worn.",
    category: "Tops",
    size: "M",
    condition: "Very good",
    price: 30000,
    photos: ["1596755094514-f87e34085b2c"],
  },
  {
    title: "Plain white cotton tee",
    description:
      "A good honest white tee in mid-weight combed cotton. Straight cut, ribbed neck that hasn't gone slack. Light wear at the hem.",
    category: "Tops",
    size: "M",
    condition: "Good",
    price: 16000,
    photos: ["1521572163474-6864f9cf17ab"],
  },
  {
    title: "Ecru heavyweight sweatshirt",
    description:
      "Boxy loopback-cotton crew in an ecru off-white. Dense, structured, holds its shape. No pilling, no marks.",
    category: "Tops",
    size: "L",
    condition: "Excellent",
    price: 26000,
    photos: ["1620799140408-edc6dcb6d633"],
  },
  {
    title: "Light-wash straight jeans",
    description:
      "Mid-rise straight-leg jeans in a soft light wash with natural fading. Rigid-ish cotton, breaks in nicely. Hems intact.",
    category: "Bottoms",
    size: "S",
    condition: "Good",
    price: 38000,
    photos: ["1602293589930-45aad59ba3ab"],
  },
  {
    title: "Blush tie-cuff joggers",
    description:
      "Relaxed blush-pink joggers with elasticated tie cuffs and side pockets. Soft brushed-back jersey. Like new.",
    category: "Bottoms",
    size: "S",
    condition: "Very good",
    price: 30000,
    photos: ["1594633312681-425c7b97ccd1"],
  },
  {
    title: "Scarlet floor-length gown",
    description:
      "Bias-cut crepe gown in a deep scarlet, with a subtle train and a covered shoulder. Dramatic drape. Worn once.",
    category: "Dresses",
    size: "S",
    condition: "Excellent",
    price: 58000,
    photos: ["1595777457583-95e059d581b8", "1612336307429-8a898d10e223"],
  },
  {
    title: "Plum off-shoulder dress",
    description:
      "Ribbed stretch-knit midi in a deep plum, with a folded off-shoulder neckline. Hugs and holds its shape. Excellent condition.",
    category: "Dresses",
    size: "M",
    condition: "Excellent",
    price: 44000,
    photos: ["1566174053879-31528523f8ae"],
  },
  {
    title: "Brown leather lace-up boots",
    description:
      "Brown leather derby boots on a stacked heel. Barely worn — soles have most of their tread. Comes with the original box.",
    category: "Shoes",
    size: "L",
    condition: "Excellent",
    price: 60000,
    photos: ["1608256246200-53e635b5b65f", "1449505278894-297fdb3edbc1"],
  },
  {
    title: "Quilted leather camera bag",
    description:
      "Compact quilted leather crossbody with a chain-and-leather strap and gold hardware. Holds a phone, cards and keys. Corners still crisp.",
    category: "Bags",
    size: "One Size",
    condition: "Very good",
    price: 72000,
    photos: ["1548036328-c9fa89d128fa"],
  },
  {
    title: "Cherry red top-handle bag",
    description:
      "Structured top-handle bag in cherry-red box leather with a flip lock and a detachable strap. Sharp corners, clean lining, light hardware wear.",
    category: "Bags",
    size: "One Size",
    condition: "Very good",
    price: 78000,
    photos: ["1584917865442-de89df76afd3"],
  },
  {
    title: "Rose chevron chain bag",
    description:
      "Structured shoulder bag in blush leather with a tonal chevron panel and a slim chain strap. Magnetic flap, suede lining. Hardware unmarked.",
    category: "Bags",
    size: "One Size",
    condition: "Excellent",
    price: 54000,
    photos: ["1566150905458-1bf1fc113f0d"],
  },
];

/**
 * Brand-tinted placeholder used only when a real photo can't be fetched (e.g.
 * the seed runs offline). Keeps the grid on-identity instead of blank.
 */
const PALETTES = [
  ["#8b35c8", "#e6ddd2"],
  ["#5a1a90", "#c9a8e6"],
  ["#241f2e", "#8b35c8"],
  ["#7928b0", "#e6ddd2"],
  ["#3a2352", "#b98fd6"],
  ["#16131c", "#8b35c8"],
];

async function makePhoto(
  key: string,
  label: string,
  variant: number,
): Promise<string> {
  const [bg, fg] = PALETTES[variant % PALETTES.length];
  const w = 1200;
  const h = 1500;
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${w}" height="${h}">
    <defs>
      <linearGradient id="g" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0" stop-color="${bg}"/>
        <stop offset="1" stop-color="${fg}"/>
      </linearGradient>
    </defs>
    <rect width="${w}" height="${h}" fill="url(#g)"/>
    <circle cx="${w / 2}" cy="${h / 2 - 60}" r="220" fill="${fg}" opacity="0.28"/>
    <text x="${w / 2}" y="${h - 130}" text-anchor="middle"
      font-family="Arial Narrow, Arial, sans-serif" font-weight="800"
      font-size="66" letter-spacing="3" fill="${fg}" opacity="0.85">${label.toUpperCase()}</text>
  </svg>`;
  const name = `seed-${key}.jpg`;
  const buf = await sharp(Buffer.from(svg)).jpeg({ quality: 82 }).toBuffer();
  await writeFile(path.join(UPLOAD_DIR, name), buf);
  return `/uploads/${name}`;
}

const PHOTO_W = 1200;
const PHOTO_H = 1500;

/** Fetches a real Unsplash photo; falls back to a placeholder on any failure. */
async function fetchPhoto(
  unsplashId: string,
  key: string,
  label: string,
  variant: number,
): Promise<string> {
  const name = `seed-${key}.jpg`;
  try {
    const url = `https://images.unsplash.com/photo-${unsplashId}?w=${PHOTO_W}&h=${PHOTO_H}&fit=crop&crop=entropy&q=80`;
    const res = await fetch(url, { signal: AbortSignal.timeout(20000) });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const raw = Buffer.from(await res.arrayBuffer());
    if (raw.byteLength < 5000) throw new Error("response too small");
    const jpg = await sharp(raw)
      .resize(PHOTO_W, PHOTO_H, { fit: "cover" })
      .jpeg({ quality: 82 })
      .toBuffer();
    await writeFile(path.join(UPLOAD_DIR, name), jpg);
    return `/uploads/${name}`;
  } catch (err) {
    console.warn(
      `  ! photo ${unsplashId} failed (${(err as Error).message}) — using placeholder`,
    );
    return makePhoto(key, label, variant);
  }
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
      for (let p = 0; p < item.photos.length; p++) {
        urls.push(
          await fetchPhoto(
            item.photos[p],
            `${index}-${p}`,
            `${item.category} ${p + 1}`,
            index + p,
          ),
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
      console.log(`  + ${created.title} (${urls.length} photo${urls.length === 1 ? "" : "s"})`);
      index++;
    }

    // A couple of sample reservations so the account + admin views have data.
    const [first, second] = await prisma.item.findMany({
      take: 2,
      orderBy: { createdAt: "asc" },
    });
    if (first) {
      await prisma.reservation.create({
        data: { itemId: first.id, userId: shopper.id, status: "PENDING" },
      });
      await prisma.item.update({
        where: { id: first.id },
        data: { status: "RESERVED" },
      });
    }
    if (second) {
      await prisma.reservation.create({
        data: { itemId: second.id, userId: shopper.id, status: "CONFIRMED" },
      });
      await prisma.item.update({
        where: { id: second.id },
        data: { status: "SOLD" },
      });
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
