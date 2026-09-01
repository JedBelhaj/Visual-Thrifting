"use client";

import Link from "next/link";
import { useActionState } from "react";
import {
  login,
  signup,
  type AuthState,
} from "@/lib/actions/auth";
import { SubmitButton } from "@/components/SubmitButton";

const btn =
  "w-full rounded-full bg-clay px-6 py-3 text-sm font-medium text-cream transition hover:bg-clay-dark disabled:opacity-60";
const input =
  "mt-1 w-full rounded-md border border-line bg-white px-3 py-2 text-ink";

export function AuthForm({
  mode,
  next,
}: {
  mode: "login" | "signup";
  next?: string;
}) {
  const action = mode === "login" ? login : signup;
  const [state, formAction] = useActionState<AuthState, FormData>(action, {});

  return (
    <div className="mx-auto max-w-sm py-8">
      <h1 className="font-display text-2xl">
        {mode === "login" ? "Welcome back" : "Create your account"}
      </h1>
      <p className="mt-1 text-sm text-muted">
        {mode === "login"
          ? "Log in to reserve items and track your pickups."
          : "You only need an account to reserve — browsing is open to everyone."}
      </p>

      <form action={formAction} className="mt-6 space-y-4">
        {next ? <input type="hidden" name="next" value={next} /> : null}

        {mode === "signup" && (
          <label className="block text-sm">
            <span className="text-muted">Name</span>
            <input name="name" required autoComplete="name" className={input} />
          </label>
        )}

        <label className="block text-sm">
          <span className="text-muted">Email</span>
          <input
            type="email"
            name="email"
            required
            autoComplete="email"
            className={input}
          />
        </label>

        <label className="block text-sm">
          <span className="text-muted">Password</span>
          <input
            type="password"
            name="password"
            required
            autoComplete={mode === "login" ? "current-password" : "new-password"}
            minLength={mode === "signup" ? 8 : undefined}
            className={input}
          />
        </label>

        {state.error && <p className="text-sm text-clay-dark">{state.error}</p>}

        <SubmitButton
          pendingText={mode === "login" ? "Logging in…" : "Creating…"}
          className={btn}
        >
          {mode === "login" ? "Log in" : "Sign up"}
        </SubmitButton>
      </form>

      <p className="mt-4 text-sm text-muted">
        {mode === "login" ? (
          <>
            New here?{" "}
            <Link href="/signup" className="text-clay-dark underline">
              Create an account
            </Link>
          </>
        ) : (
          <>
            Already have an account?{" "}
            <Link href="/login" className="text-clay-dark underline">
              Log in
            </Link>
          </>
        )}
      </p>
    </div>
  );
}
