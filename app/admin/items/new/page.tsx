import Link from "next/link";
import { ItemForm } from "@/components/admin/ItemForm";

export default function NewItemPage() {
  return (
    <div className="space-y-5">
      <Link href="/admin/items" className="text-sm text-muted hover:text-cream">
        ← Items
      </Link>
      <h1 className="font-display text-2xl">Add an item</h1>
      <ItemForm />
    </div>
  );
}
