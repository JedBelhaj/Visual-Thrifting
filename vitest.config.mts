import { defineConfig } from "vitest/config";
import path from "node:path";

const root = process.cwd();
const testDbUrl = `file:${path.join(root, "prisma", "test.db")}`;

// Applied to the config/globalSetup process; `test.env` covers the workers.
process.env.DATABASE_URL ||= testDbUrl;
process.env.AUTH_SECRET ||= "test-only-secret-not-used-in-prod";

export default defineConfig({
  test: {
    environment: "node",
    globalSetup: ["./test/global-setup.ts"],
    setupFiles: ["./test/setup.ts"],
    fileParallelism: false,
    env: {
      DATABASE_URL: testDbUrl,
      AUTH_SECRET: "test-only-secret-not-used-in-prod",
    },
  },
  resolve: {
    alias: {
      "server-only": path.join(root, "test/stubs/server-only.ts"),
      "@": root,
    },
  },
});
