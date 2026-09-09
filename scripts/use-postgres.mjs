// Flips the Prisma datasource to PostgreSQL for a hosted (Vercel) build.
//
// The repo is checked in as SQLite so local dev and the test suite need zero
// setup. This runs only in `npm run vercel-build`, before `prisma generate`,
// so the generated client and the deploy target match.
import { readFileSync, writeFileSync } from "node:fs";

const file = new URL("../prisma/schema.prisma", import.meta.url);
const src = readFileSync(file, "utf8");
const out = src.replace(
  /provider\s*=\s*"sqlite"/,
  'provider = "postgresql"',
);

if (out === src) {
  console.log("[use-postgres] provider already postgresql or pattern not found");
} else {
  writeFileSync(file, out);
  console.log("[use-postgres] schema.prisma datasource -> postgresql");
}
