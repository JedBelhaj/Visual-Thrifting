import { describe, expect, it } from "vitest";
import { safeNext } from "@/lib/redirects";

describe("safeNext", () => {
  it("keeps same-origin relative paths", () => {
    expect(safeNext("/account")).toBe("/account");
    expect(safeNext("/items/abc123")).toBe("/items/abc123");
    expect(safeNext("/admin/items?status=PENDING")).toBe(
      "/admin/items?status=PENDING",
    );
  });

  it("rejects protocol-relative and absolute URLs", () => {
    expect(safeNext("//evil.example")).toBeNull();
    expect(safeNext("https://evil.example")).toBeNull();
    expect(safeNext("http://evil.example/path")).toBeNull();
    expect(safeNext("/\\evil.example")).toBeNull();
  });

  it("rejects non-path and non-string input", () => {
    expect(safeNext("account")).toBeNull();
    expect(safeNext("")).toBeNull();
    expect(safeNext(null)).toBeNull();
    expect(safeNext(undefined)).toBeNull();
    expect(safeNext(42)).toBeNull();
  });
});
