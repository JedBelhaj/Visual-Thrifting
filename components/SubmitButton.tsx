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
        "inline-flex items-center justify-center rounded-full bg-clay px-6 py-3 text-sm font-medium text-cream transition hover:bg-clay-dark disabled:cursor-not-allowed disabled:opacity-60"
      }
    >
      {pending ? (pendingText ?? "Working…") : children}
    </button>
  );
}
