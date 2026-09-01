"use server";

import { redirect } from "next/navigation";
import bcrypt from "bcryptjs";
import { z } from "zod";
import { prisma } from "@/lib/db";
import { createSession, destroySession } from "@/lib/auth";
import { safeNext } from "@/lib/redirects";

export type AuthState = { error?: string };

const emailField = z
  .string()
  .trim()
  .toLowerCase()
  .pipe(z.email("Enter a valid email"));

const signupSchema = z.object({
  name: z.string().trim().min(1, "Name is required").max(80),
  email: emailField,
  password: z.string().min(8, "Password must be at least 8 characters").max(200),
});

const loginSchema = z.object({
  email: emailField,
  password: z.string().min(1, "Password is required"),
});

export async function signup(
  _prev: AuthState,
  formData: FormData,
): Promise<AuthState> {
  const parsed = signupSchema.safeParse({
    name: formData.get("name"),
    email: formData.get("email"),
    password: formData.get("password"),
  });
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Invalid input" };
  }

  const { name, email, password } = parsed.data;
  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing) return { error: "An account with that email already exists" };

  const passwordHash = await bcrypt.hash(password, 10);
  const userCount = await prisma.user.count();
  const user = await prisma.user.create({
    data: {
      name,
      email,
      passwordHash,
      // First account to register becomes the admin — convenient for setup.
      role: userCount === 0 ? "ADMIN" : "USER",
    },
  });

  await createSession({ userId: user.id, role: user.role, name: user.name });
  redirect(
    safeNext(formData.get("next")) ?? (user.role === "ADMIN" ? "/admin" : "/"),
  );
}

export async function login(
  _prev: AuthState,
  formData: FormData,
): Promise<AuthState> {
  const parsed = loginSchema.safeParse({
    email: formData.get("email"),
    password: formData.get("password"),
  });
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Invalid input" };
  }

  const { email, password } = parsed.data;
  const user = await prisma.user.findUnique({ where: { email } });
  if (!user || !(await bcrypt.compare(password, user.passwordHash))) {
    return { error: "Incorrect email or password" };
  }

  await createSession({ userId: user.id, role: user.role, name: user.name });
  redirect(
    safeNext(formData.get("next")) ?? (user.role === "ADMIN" ? "/admin" : "/"),
  );
}

export async function logout() {
  await destroySession();
  redirect("/");
}
