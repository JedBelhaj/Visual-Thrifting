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
  "w-full rounded-md bg-purple px-6 py-3 font-display text-sm font-extrabold uppercase tracking-wider text-cream transition-colors hover:bg-purple-dark disabled:opacity-60";
const input =
  "mt-1 w-full rounded-md border border-line bg-surface px-3 py-2 text-cream outline-none transition-colors focus:border-purple";

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
      <h1 className="font-display text-3xl font-extrabold uppercase leading-none">
        {mode === "login" ? "Welcome back" : "Create your account"}
      </h1>
      <p className="mt-2 text-sm text-cream/55">
        {mode === "login"
          ? "Log in to reserve items and track your pickups."
          : "You only need an account to reserve — browsing is open to everyone."}
      </p>

      <form action={formAction} className="mt-6 space-y-4">
        {next ? <input type="hidden" name="next" value={next} /> : null}

        {mode === "signup" && (
          <label className="block text-sm">
            <span className="font-display text-xs font-bold uppercase tracking-wide text-cream/50">Name</span>
            <input name="name" required autoComplete="name" className={input} />
          </label>
        )}

        <label className="block text-sm">
          <span className="font-display text-xs font-bold uppercase tracking-wide text-cream/50">Email</span>
          <input
            type="email"
            name="email"
            required
            autoComplete="email"
            className={input}
          />
        </label>

        <label className="block text-sm">
          <span className="font-display text-xs font-bold uppercase tracking-wide text-cream/50">Password</span>
          <input
            type="password"
            name="password"
            required
            autoComplete={mode === "login" ? "current-password" : "new-password"}
            minLength={mode === "signup" ? 8 : undefined}
            className={input}
          />
        </label>

        {state.error && <p className="text-sm text-hot">{state.error}</p>}

        <SubmitButton
          pendingText={mode === "login" ? "Logging in…" : "Creating…"}
          className={btn}
        >
          {mode === "login" ? "Log in" : "Sign up"}
        </SubmitButton>
      </form>

      <p className="mt-5 text-sm text-cream/55">
        {mode === "login" ? (
          <>
            New here?{" "}
            <Link href="/signup" className="text-purple underline underline-offset-4">
              Create an account
            </Link>
          </>
        ) : (
          <>
            Already have an account?{" "}
            <Link href="/login" className="text-purple underline underline-offset-4">
              Log in
            </Link>
          </>
        )}
      </p>
    </div>
  );
}
