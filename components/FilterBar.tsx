import Link from "next/link";
import { CATEGORIES, CONDITIONS, SIZES } from "@/lib/constants";

type Params = Record<string, string | undefined>;

export function FilterBar({ params }: { params: Params }) {
  const active =
    params.q ||
    params.category ||
    params.size ||
    params.condition ||
    params.minPrice ||
    params.maxPrice;

  return (
    <form
      method="get"
      className="grid gap-3 rounded-lg border border-line bg-white/50 p-4 sm:grid-cols-2 lg:grid-cols-6"
    >
      <label className="flex flex-col gap-1 text-xs text-muted lg:col-span-2">
        Search
        <input
          type="search"
          name="q"
          defaultValue={params.q ?? ""}
          placeholder="Title or description"
          className="rounded-md border border-line bg-white px-3 py-2 text-sm text-ink"
        />
      </label>

      <label className="flex flex-col gap-1 text-xs text-muted">
        Category
        <select
          name="category"
          defaultValue={params.category ?? ""}
          className="rounded-md border border-line bg-white px-3 py-2 text-sm text-ink"
        >
          <option value="">All</option>
          {CATEGORIES.map((c) => (
            <option key={c} value={c}>
              {c}
            </option>
          ))}
        </select>
      </label>

      <label className="flex flex-col gap-1 text-xs text-muted">
        Size
        <select
          name="size"
          defaultValue={params.size ?? ""}
          className="rounded-md border border-line bg-white px-3 py-2 text-sm text-ink"
        >
          <option value="">All</option>
          {SIZES.map((s) => (
            <option key={s} value={s}>
              {s}
            </option>
          ))}
        </select>
      </label>

      <label className="flex flex-col gap-1 text-xs text-muted">
        Condition
        <select
          name="condition"
          defaultValue={params.condition ?? ""}
          className="rounded-md border border-line bg-white px-3 py-2 text-sm text-ink"
        >
          <option value="">All</option>
          {CONDITIONS.map((c) => (
            <option key={c} value={c}>
              {c}
            </option>
          ))}
        </select>
      </label>

      <div className="flex gap-2">
        <label className="flex flex-1 flex-col gap-1 text-xs text-muted">
          Min $
          <input
            type="number"
            name="minPrice"
            min="0"
            step="1"
            defaultValue={params.minPrice ?? ""}
            className="w-full rounded-md border border-line bg-white px-3 py-2 text-sm text-ink"
          />
        </label>
        <label className="flex flex-1 flex-col gap-1 text-xs text-muted">
          Max $
          <input
            type="number"
            name="maxPrice"
            min="0"
            step="1"
            defaultValue={params.maxPrice ?? ""}
            className="w-full rounded-md border border-line bg-white px-3 py-2 text-sm text-ink"
          />
        </label>
      </div>

      <div className="flex items-end gap-2 sm:col-span-2 lg:col-span-6">
        <button
          type="submit"
          className="rounded-full bg-ink px-5 py-2 text-sm text-cream transition hover:bg-clay-dark"
        >
          Apply filters
        </button>
        {active ? (
          <Link
            href="/shop"
            className="rounded-full px-4 py-2 text-sm text-muted transition hover:bg-sand hover:text-ink"
          >
            Clear
          </Link>
        ) : null}
      </div>
    </form>
  );
}
