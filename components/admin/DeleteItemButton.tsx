"use client";

import { deleteItem } from "@/lib/actions/items";

export function DeleteItemButton({ id }: { id: string }) {
  return (
    <form
      action={deleteItem.bind(null, id)}
      onSubmit={(e) => {
        if (!confirm("Delete this item permanently? This cannot be undone.")) {
          e.preventDefault();
        }
      }}
    >
      <button
        type="submit"
        className="text-xs text-muted underline transition hover:text-purple"
      >
        Delete
      </button>
    </form>
  );
}
