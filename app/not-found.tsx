import Link from "next/link";

export default function NotFound() {
  return (
    <div className="mx-auto flex max-w-md flex-1 flex-col items-center justify-center px-5 py-24 text-center">
      <p className="font-display text-xs font-extrabold uppercase tracking-[0.2em] text-purple">
        ✦ 404
      </p>
      <h1 className="mt-3 font-display text-4xl font-extrabold uppercase leading-none">
        Not here
      </h1>
      <p className="mt-3 text-cream/55">
        This piece may have already found a new home.
      </p>
      <Link
        href="/"
        className="mt-7 rounded-md bg-purple px-7 py-3.5 font-display text-sm font-extrabold uppercase tracking-wider text-cream transition-colors hover:bg-purple-dark"
      >
        Back to the shop
      </Link>
    </div>
  );
}
