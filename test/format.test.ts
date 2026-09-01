import { describe, expect, it } from "vitest";
import { formatPrice, formatDate, formatDateTime } from "@/lib/format";

describe("formatPrice (millimes -> TND)", () => {
  it("renders three decimal places", () => {
    expect(formatPrice(24_500)).toBe("24.500 TND");
    expect(formatPrice(0)).toBe("0.000 TND");
    expect(formatPrice(1_000)).toBe("1.000 TND");
  });

  it("groups thousands", () => {
    expect(formatPrice(1_000_000)).toBe("1,000.000 TND");
  });

  it("rounds sub-millime values", () => {
    expect(formatPrice(24_500.6)).toBe("24.501 TND");
  });
});

describe("date formatting", () => {
  const d = new Date("2026-08-31T14:05:00Z");

  it("formatDate has no time component", () => {
    const out = formatDate(d);
    expect(out).toMatch(/2026/);
    expect(out).not.toMatch(/:/);
  });

  it("formatDateTime includes a time component", () => {
    expect(formatDateTime(d)).toMatch(/\d{2}:\d{2}/);
  });
});
