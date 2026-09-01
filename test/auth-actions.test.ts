import { beforeEach, describe, expect, it, vi } from "vitest";
import { expectRedirect } from "./setup";
import { resetDb } from "./helpers";
import { prisma } from "@/lib/db";

const createSession = vi.fn();
const destroySession = vi.fn();

vi.mock("@/lib/auth", () => ({
  createSession: (...a: unknown[]) => createSession(...a),
  destroySession: (...a: unknown[]) => destroySession(...a),
}));

import { signup, login, logout } from "@/lib/actions/auth";

function form(data: Record<string, string>) {
  const f = new FormData();
  for (const [k, v] of Object.entries(data)) f.set(k, v);
  return f;
}

beforeEach(async () => {
  await resetDb();
  createSession.mockClear();
  destroySession.mockClear();
});

describe("signup", () => {
  it("makes the very first account an admin", async () => {
    const err = await signup(
      {},
      form({ name: "Ada", email: "ADA@shop.test", password: "supersecret" }),
    ).catch((e) => e);
    expectRedirect(err, "/admin");

    const user = await prisma.user.findUniqueOrThrow({
      where: { email: "ada@shop.test" },
    });
    expect(user.role).toBe("ADMIN");
    expect(user.passwordHash).not.toBe("supersecret");
    expect(createSession).toHaveBeenCalledOnce();
  });

  it("makes later accounts regular users", async () => {
    await signup({}, form({ name: "Ada", email: "a@shop.test", password: "supersecret" })).catch(() => {});
    const err = await signup(
      {},
      form({ name: "Grace", email: "g@shop.test", password: "supersecret" }),
    ).catch((e) => e);
    expectRedirect(err, "/");

    const user = await prisma.user.findUniqueOrThrow({
      where: { email: "g@shop.test" },
    });
    expect(user.role).toBe("USER");
  });

  it("honours a safe ?next target", async () => {
    const err = await signup(
      {},
      form({
        name: "Ada",
        email: "a@shop.test",
        password: "supersecret",
        next: "/items/abc",
      }),
    ).catch((e) => e);
    expectRedirect(err, "/items/abc");
  });

  it("rejects a duplicate email", async () => {
    await signup({}, form({ name: "Ada", email: "a@shop.test", password: "supersecret" })).catch(() => {});
    const res = await signup(
      {},
      form({ name: "Ada2", email: "a@shop.test", password: "supersecret" }),
    );
    expect(res.error).toMatch(/already exists/i);
    expect(await prisma.user.count()).toBe(1);
  });

  it("rejects a short password", async () => {
    const res = await signup(
      {},
      form({ name: "Ada", email: "a@shop.test", password: "short" }),
    );
    expect(res.error).toMatch(/8 characters/i);
    expect(await prisma.user.count()).toBe(0);
  });

  it("rejects an invalid email", async () => {
    const res = await signup(
      {},
      form({ name: "Ada", email: "not-an-email", password: "supersecret" }),
    );
    expect(res.error).toMatch(/valid email/i);
  });
});

describe("login", () => {
  beforeEach(async () => {
    await signup(
      {},
      form({ name: "Ada", email: "ada@shop.test", password: "supersecret" }),
    ).catch(() => {});
    createSession.mockClear();
  });

  it("accepts correct credentials (case-insensitive email)", async () => {
    const err = await login(
      {},
      form({ email: "  ADA@shop.test ", password: "supersecret" }),
    ).catch((e) => e);
    expectRedirect(err, "/admin");
    expect(createSession).toHaveBeenCalledOnce();
  });

  it("rejects a wrong password", async () => {
    const res = await login(
      {},
      form({ email: "ada@shop.test", password: "wrongpass" }),
    );
    expect(res.error).toMatch(/incorrect/i);
    expect(createSession).not.toHaveBeenCalled();
  });

  it("rejects an unknown email without leaking which field failed", async () => {
    const res = await login(
      {},
      form({ email: "nobody@shop.test", password: "supersecret" }),
    );
    expect(res.error).toMatch(/incorrect email or password/i);
  });
});

describe("logout", () => {
  it("clears the session and redirects home", async () => {
    const err = await logout().catch((e) => e);
    expectRedirect(err, "/");
    expect(destroySession).toHaveBeenCalledOnce();
  });
});
