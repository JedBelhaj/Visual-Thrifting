import Link from "next/link";

export default function NotFound() {
  return (
    <div className="mx-auto flex max-w-md flex-1 flex-col items-center justify-center px-5 py-24 text-center">
      <h1 className="font-display text-3xl">Not here</h1>
      <p className="mt-2 text-muted">
        This piece may have already found a new home.
      </p>
      <Link
        href="/"
        className="mt-6 rounded-full bg-clay px-6 py-3 text-sm font-medium text-cream hover:bg-clay-dark"
      >
        Back to the shop
      </Link>
    </div>
  );
}
