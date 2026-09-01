import { vi } from "vitest";

// Next.js runtime shims that the server actions reach for.
vi.mock("next/cache", () => ({
  revalidatePath: vi.fn(),
  revalidateTag: vi.fn(),
}));

vi.mock("next/navigation", () => ({
  redirect: vi.fn((url: string) => {
    const err = new Error(`NEXT_REDIRECT: ${url}`) as Error & { digest: string };
    err.digest = `NEXT_REDIRECT;replace;${url};307;`;
    throw err;
  }),
  notFound: vi.fn(() => {
    const err = new Error("NEXT_NOT_FOUND") as Error & { digest: string };
    err.digest = "NEXT_NOT_FOUND";
    throw err;
  }),
}));

/** Assert a thrown value is a `redirect()` to `target` (substring match). */
export function expectRedirect(err: unknown, target: string) {
  const digest = (err as { digest?: string })?.digest ?? "";
  if (!digest.startsWith("NEXT_REDIRECT")) {
    throw new Error(`expected a redirect, got: ${String(err)}`);
  }
  if (!digest.includes(target)) {
    throw new Error(`expected redirect to include "${target}", got "${digest}"`);
  }
}
