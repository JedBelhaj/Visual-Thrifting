/**
 * Only allow same-origin, relative redirect targets (e.g. from a `?next=`
 * param or a hidden form field). Anything protocol-relative or absolute is
 * rejected so it can't be used for an open redirect.
 */
export function safeNext(value: unknown): string | null {
  if (typeof value !== "string") return null;
  if (!value.startsWith("/")) return null;
  if (value.startsWith("//") || value.startsWith("/\\")) return null;
  return value;
}
