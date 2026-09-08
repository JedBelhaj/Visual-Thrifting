"use client";

import { useFormStatus } from "react-dom";

type Props = {
  children: React.ReactNode;
  pendingText?: string;
  className?: string;
};

export function SubmitButton({ children, pendingText, className }: Props) {
  const { pending } = useFormStatus();
  return (
    <button
      type="submit"
      disabled={pending}
      className={
        className ??
        "inline-flex items-center justify-center rounded-md bg-purple px-6 py-3 font-display text-sm font-extrabold uppercase tracking-wider text-cream transition-colors hover:bg-purple-dark disabled:cursor-not-allowed disabled:opacity-60"
      }
    >
      {pending ? (pendingText ?? "Working…") : children}
    </button>
  );
}
