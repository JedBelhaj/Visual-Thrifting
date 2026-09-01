import { execSync } from "node:child_process";
import fs from "node:fs";
import path from "node:path";

/** Builds a fresh SQLite schema for the test run. */
export default function setup() {
  const root = process.cwd();
  const dbPath = path.join(root, "prisma", "test.db");
  const url = `file:${dbPath}`;

  // Start from a clean file so a plain (non-destructive) `db push` just
  // creates the schema — avoids Prisma's `--force-reset` guard.
  for (const f of [dbPath, `${dbPath}-journal`, `${dbPath}-shm`, `${dbPath}-wal`]) {
    if (fs.existsSync(f)) fs.rmSync(f);
  }

  execSync("npx prisma db push --skip-generate", {
    cwd: root,
    stdio: "inherit",
    env: { ...process.env, DATABASE_URL: url },
  });
}
