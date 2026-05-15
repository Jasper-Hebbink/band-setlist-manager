import Link from "next/link";
import { prisma } from "@/lib/prisma";

export default async function SetlistsPage() {
  const setlists = await prisma.setlist.findMany({
    include: {
      _count: {
        select: {
          setlistSongs: true,
        },
      },
    },
    orderBy: [{ date: "desc" }, { createdAt: "desc" }],
  });

  return (
    <section>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold">Setlists</h1>
          <p className="mt-1 text-sm text-zinc-600">Rehearsal and gig lists with songs in order.</p>
        </div>
        <Link className="rounded bg-zinc-900 px-4 py-2 text-sm font-medium text-white hover:bg-zinc-700" href="/setlists/new">
          New setlist
        </Link>
      </div>

      <div className="mt-6 rounded border border-zinc-200 bg-white">
        {setlists.length === 0 ? (
          <p className="p-6 text-sm text-zinc-600">No setlists yet. Create one after adding a few songs.</p>
        ) : (
          <ul className="divide-y divide-zinc-100">
            {setlists.map((setlist) => (
              <li key={setlist.id} className="flex flex-wrap items-center justify-between gap-3 p-4">
                <div>
                  <Link className="font-medium hover:underline" href={`/setlists/${setlist.id}`}>
                    {setlist.name}
                  </Link>
                  <div className="text-sm text-zinc-600">
                    {setlist.date ? setlist.date.toLocaleDateString() : "No date"} - {setlist._count.setlistSongs} songs
                  </div>
                </div>
                <Link className="text-sm text-zinc-600 hover:underline" href={`/setlists/${setlist.id}`}>
                  View
                </Link>
              </li>
            ))}
          </ul>
        )}
      </div>
    </section>
  );
}
