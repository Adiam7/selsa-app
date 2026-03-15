import Link from 'next/link';

export default function NotFound() {
  return (
    <main className="flex min-h-[60vh] flex-col items-center justify-center px-4 text-center">
      <h1 className="text-6xl font-bold tracking-tight text-neutral-900">404</h1>
      <p className="mt-4 text-lg text-neutral-600">
        Sorry, we couldn&apos;t find the page you&apos;re looking for.
      </p>
      <div className="mt-8 flex gap-4">
        <Link
          href="/"
          className="rounded-md bg-black px-6 py-3 text-sm font-medium text-white transition hover:bg-neutral-800"
        >
          Back to Home
        </Link>
        <Link
          href="/shop"
          className="rounded-md border border-neutral-300 px-6 py-3 text-sm font-medium text-neutral-700 transition hover:bg-neutral-50"
        >
          Browse Shop
        </Link>
      </div>
    </main>
  );
}
