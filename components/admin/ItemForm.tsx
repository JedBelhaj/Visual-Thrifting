"use client";

import Link from "next/link";
import { useRef, useState, useTransition } from "react";
import { createItem, updateItem } from "@/lib/actions/items";
import {
  CATEGORIES,
  CONDITIONS,
  ITEM_STATUSES,
  SIZES,
  STATUS_LABELS,
} from "@/lib/constants";

type ExistingItem = {
  id: string;
  title: string;
  description: string;
  category: string;
  size: string;
  condition: string;
  price: number;
  status: string;
  images: { id: string; url: string }[];
};

type Slot =
  | { key: string; kind: "existing"; id: string; url: string }
  | { key: string; kind: "new"; file: File; url: string };

const input =
  "mt-1 w-full rounded-md border border-line bg-white px-3 py-2 text-sm text-ink";
const labelCls = "block text-sm text-muted";

let slotSeq = 0;
const nextKey = () => `slot-${slotSeq++}`;

export function ItemForm({ item }: { item?: ExistingItem }) {
  const formRef = useRef<HTMLFormElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();
  const [slots, setSlots] = useState<Slot[]>(() =>
    (item?.images ?? []).map((img) => ({
      key: nextKey(),
      kind: "existing" as const,
      id: img.id,
      url: img.url,
    })),
  );

  function addFiles(files: FileList | null) {
    if (!files?.length) return;
    const added: Slot[] = Array.from(files)
      .filter((f) => f.type.startsWith("image/"))
      .map((file) => ({
        key: nextKey(),
        kind: "new" as const,
        file,
        url: URL.createObjectURL(file),
      }));
    setSlots((prev) => [...prev, ...added]);
  }

  function removeSlot(key: string) {
    setSlots((prev) => {
      const target = prev.find((s) => s.key === key);
      if (target?.kind === "new") URL.revokeObjectURL(target.url);
      return prev.filter((s) => s.key !== key);
    });
  }

  function move(index: number, dir: -1 | 1) {
    setSlots((prev) => {
      const next = [...prev];
      const target = index + dir;
      if (target < 0 || target >= next.length) return prev;
      [next[index], next[target]] = [next[target], next[index]];
      return next;
    });
  }

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    if (slots.length === 0) {
      setError("Add at least one photo");
      return;
    }
    const fd = new FormData(formRef.current!);
    for (const s of slots) {
      if (s.kind === "existing") {
        fd.append("slot", `keep:${s.id}`);
      } else {
        fd.append("slot", "new");
        fd.append("photo", s.file);
      }
    }
    startTransition(async () => {
      const res = item ? await updateItem(item.id, fd) : await createItem(fd);
      if (res?.error) setError(res.error);
    });
  }

  return (
    <form
      ref={formRef}
      onSubmit={handleSubmit}
      className="max-w-2xl space-y-5"
    >
      <label className={labelCls}>
        Title
        <input
          name="title"
          required
          maxLength={140}
          defaultValue={item?.title}
          className={input}
        />
      </label>

      <label className={labelCls}>
        Description
        <textarea
          name="description"
          required
          rows={5}
          defaultValue={item?.description}
          className={input}
        />
      </label>

      <div className="grid gap-4 sm:grid-cols-2">
        <label className={labelCls}>
          Category
          <select
            name="category"
            defaultValue={item?.category ?? CATEGORIES[0]}
            className={input}
          >
            {CATEGORIES.map((c) => (
              <option key={c}>{c}</option>
            ))}
          </select>
        </label>

        <label className={labelCls}>
          Size
          <select
            name="size"
            defaultValue={item?.size ?? SIZES[0]}
            className={input}
          >
            {SIZES.map((s) => (
              <option key={s}>{s}</option>
            ))}
          </select>
        </label>

        <label className={labelCls}>
          Condition
          <select
            name="condition"
            defaultValue={item?.condition ?? CONDITIONS[0]}
            className={input}
          >
            {CONDITIONS.map((c) => (
              <option key={c}>{c}</option>
            ))}
          </select>
        </label>

        <label className={labelCls}>
          Price (TND)
          <input
            name="price"
            required
            inputMode="decimal"
            placeholder="45.000"
            defaultValue={item ? (item.price / 1000).toFixed(3) : ""}
            className={input}
          />
        </label>
      </div>

      <label className={labelCls}>
        Status
        <select
          name="status"
          defaultValue={item?.status ?? "AVAILABLE"}
          className={input}
        >
          {ITEM_STATUSES.map((s) => (
            <option key={s} value={s}>
              {STATUS_LABELS[s]}
            </option>
          ))}
        </select>
      </label>

      <fieldset className="space-y-3">
        <legend className={labelCls}>Photos</legend>
        <p className="text-xs text-muted">
          The first photo is the cover. Use the arrows to reorder, × to remove.
        </p>

        {slots.length > 0 && (
          <ul className="grid grid-cols-3 gap-3 sm:grid-cols-4">
            {slots.map((slot, i) => (
              <li
                key={slot.key}
                className="group relative overflow-hidden rounded-md border border-line bg-sand"
              >
                <div className="relative aspect-[4/5]">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={slot.url}
                    alt=""
                    className="absolute inset-0 h-full w-full object-cover"
                  />
                </div>
                {i === 0 && (
                  <span className="absolute left-1 top-1 rounded bg-ink/80 px-1.5 py-0.5 text-[10px] font-medium text-cream">
                    Cover
                  </span>
                )}
                <div className="flex items-center justify-between gap-1 bg-white/90 px-1.5 py-1">
                  <button
                    type="button"
                    onClick={() => move(i, -1)}
                    disabled={i === 0}
                    aria-label="Move earlier"
                    className="rounded px-1 text-sm text-muted hover:text-ink disabled:opacity-30"
                  >
                    ←
                  </button>
                  <button
                    type="button"
                    onClick={() => move(i, 1)}
                    disabled={i === slots.length - 1}
                    aria-label="Move later"
                    className="rounded px-1 text-sm text-muted hover:text-ink disabled:opacity-30"
                  >
                    →
                  </button>
                  <button
                    type="button"
                    onClick={() => removeSlot(slot.key)}
                    aria-label="Remove photo"
                    className="rounded px-1 text-sm text-muted hover:text-clay-dark"
                  >
                    ×
                  </button>
                </div>
              </li>
            ))}
          </ul>
        )}

        <input
          ref={fileInputRef}
          type="file"
          multiple
          accept="image/*"
          onChange={(e) => {
            addFiles(e.target.files);
            e.target.value = "";
          }}
          className="block w-full text-sm text-muted file:mr-3 file:rounded-full file:border-0 file:bg-ink file:px-4 file:py-2 file:text-sm file:text-cream"
        />
      </fieldset>

      {error && <p className="text-sm text-clay-dark">{error}</p>}

      <div className="flex items-center gap-3">
        <button
          type="submit"
          disabled={isPending}
          className="inline-flex items-center justify-center rounded-full bg-clay px-6 py-3 text-sm font-medium text-cream transition hover:bg-clay-dark disabled:cursor-not-allowed disabled:opacity-60"
        >
          {isPending
            ? "Saving…"
            : item
              ? "Save changes"
              : "Publish item"}
        </button>
        <Link href="/admin/items" className="text-sm text-muted hover:text-ink">
          Cancel
        </Link>
      </div>
    </form>
  );
}
