import Link from "next/link";
import { CATEGORIES, CONDITIONS, SIZES } from "@/lib/constants";

type Params = Record<string, string | undefined>;

const field =
  "rounded-md border border-line bg-surface px-3 py-2 text-sm text-cream outline-none transition-colors focus:border-purple";
const labelCls =
  "flex flex-col gap-1 font-display text-xs font-bold uppercase tracking-wide text-cream/50";

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
      className="grid gap-3 rounded-lg border border-line bg-surface/60 p-4 sm:grid-cols-2 lg:grid-cols-6"
    >
      <label className={`${labelCls} lg:col-span-2`}>
        Search
        <input
          type="search"
          name="q"
          defaultValue={params.q ?? ""}
          placeholder="Title or description"
          className={field}
        />
      </label>

      <label className={labelCls}>
        Category
        <select name="category" defaultValue={params.category ?? ""} className={field}>
          <option value="">All</option>
          {CATEGORIES.map((c) => (
            <option key={c} value={c}>
              {c}
            </option>
          ))}
        </select>
      </label>

      <label className={labelCls}>
        Size
        <select name="size" defaultValue={params.size ?? ""} className={field}>
          <option value="">All</option>
          {SIZES.map((s) => (
            <option key={s} value={s}>
              {s}
            </option>
          ))}
        </select>
      </label>

      <label className={labelCls}>
        Condition
        <select
          name="condition"
          defaultValue={params.condition ?? ""}
          className={field}
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
        <label className={`${labelCls} flex-1`}>
          Min TND
          <input
            type="number"
            name="minPrice"
            min="0"
            step="1"
            defaultValue={params.minPrice ?? ""}
            className={`${field} w-full`}
          />
        </label>
        <label className={`${labelCls} flex-1`}>
          Max TND
          <input
            type="number"
            name="maxPrice"
            min="0"
            step="1"
            defaultValue={params.maxPrice ?? ""}
            className={`${field} w-full`}
          />
        </label>
      </div>

      <div className="flex items-end gap-2 sm:col-span-2 lg:col-span-6">
        <button
          type="submit"
          className="rounded-md bg-purple px-6 py-2.5 font-display text-sm font-extrabold uppercase tracking-wider text-cream transition-colors hover:bg-purple-dark"
        >
          Apply filters
        </button>
        {active ? (
          <Link
            href="/shop"
            className="rounded-md px-4 py-2.5 font-display text-sm font-bold uppercase tracking-wider text-cream/50 transition-colors hover:text-cream"
          >
            Clear
          </Link>
        ) : null}
      </div>
    </form>
  );
}
