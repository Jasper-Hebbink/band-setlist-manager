import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { createSetlist } from "../actions";
import { formatSongStatus } from "@/lib/song-status";

export default async function NewSetlistPage() {
  const songs = await prisma.song.findMany({
    orderBy: [{ artist: "asc" }, { title: "asc" }],
  });

  return (
    <section>
      <Link className="text-sm text-zinc-600 hover:underline" href="/setlists">
        Back to setlists
      </Link>
      <h1 className="mt-3 text-2xl font-semibold">Create setlist</h1>
      <p className="mt-1 text-sm text-zinc-600">Choose songs and give each one a position. Positions are cleaned up when saved.</p>

      <form action={createSetlist} className="mt-6 grid gap-5 rounded border border-zinc-200 bg-white p-5">
        <div className="grid gap-4 md:grid-cols-2">
          <label className="grid gap-1 text-sm font-medium">
            Name
            <input required name="name" placeholder="Friday rehearsal" className="rounded border border-zinc-300 px-3 py-2 font-normal" />
          </label>
          <label className="grid gap-1 text-sm font-medium">
            Date
            <input name="date" type="date" className="rounded border border-zinc-300 px-3 py-2 font-normal" />
          </label>
        </div>

        <label className="grid gap-1 text-sm font-medium">
          Notes
          <textarea name="notes" rows={3} className="rounded border border-zinc-300 px-3 py-2 font-normal" />
        </label>

        <section>
          <h2 className="text-sm font-semibold uppercase text-zinc-500">Songs</h2>
          <div className="mt-3 rounded border border-zinc-200">
            {songs.length === 0 ? (
              <p className="p-4 text-sm text-zinc-600">
                No songs available yet. <Link className="underline" href="/songs/new">Add a song first</Link>.
              </p>
            ) : (
              <ul className="divide-y divide-zinc-100">
                {songs.map((song, index) => (
                  <li key={song.id} className="grid gap-3 p-4 text-sm md:grid-cols-[40px_1fr_120px] md:items-center">
                    <input
                      type="checkbox"
                      name="songId"
                      value={song.id}
                      className="h-4 w-4 rounded border-zinc-300"
                      aria-label={`Add ${song.title}`}
                    />
                    <div>
                      <div className="font-medium">{song.title}</div>
                      <div className="text-zinc-600">
                        {song.artist} - {formatSongStatus(song.status)}
                      </div>
                    </div>
                    <label className="grid gap-1 text-xs font-medium text-zinc-500">
                      Position
                      <input
                        name={`position-${song.id}`}
                        inputMode="numeric"
                        defaultValue={index + 1}
                        className="rounded border border-zinc-300 px-2 py-1 text-sm font-normal text-zinc-900"
                      />
                    </label>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </section>

        <div className="flex justify-end">
          <button className="rounded bg-zinc-900 px-4 py-2 text-sm font-medium text-white hover:bg-zinc-700" type="submit">
            Save setlist
          </button>
        </div>
      </form>
    </section>
  );
}
