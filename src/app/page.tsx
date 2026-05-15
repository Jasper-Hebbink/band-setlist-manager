import Link from "next/link";

export default function HomePage() {
  return (
    <section className="grid gap-6 md:grid-cols-2">
      <div>
        <p className="text-sm font-medium uppercase tracking-wide text-zinc-500">Local rehearsal tool</p>
        <h1 className="mt-2 text-3xl font-semibold">Manage songs and build practical setlists.</h1>
        <p className="mt-3 max-w-xl text-zinc-600">
          Track song readiness, guitar and capo notes, your own parts, and ordered setlists for rehearsal.
        </p>
      </div>
      <div className="grid gap-3 self-start">
        <Link className="rounded border border-zinc-200 bg-white p-4 hover:bg-zinc-50" href="/songs">
          <span className="block font-medium">Songs</span>
          <span className="text-sm text-zinc-600">View your repertoire and add songs manually.</span>
        </Link>
        <Link className="rounded border border-zinc-200 bg-white p-4 hover:bg-zinc-50" href="/setlists">
          <span className="block font-medium">Setlists</span>
          <span className="text-sm text-zinc-600">Create rehearsal or gig lists with songs in order.</span>
        </Link>
      </div>
    </section>
  );
}
