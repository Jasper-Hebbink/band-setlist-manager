import Link from "next/link";
import { formatDuration } from "@/lib/duration";
import { prisma } from "@/lib/prisma";
import { formatSongStatus, statusBadgeClass } from "@/lib/song-status";

export default async function SongsPage() {
  const songs = await prisma.song.findMany({
    orderBy: [{ artist: "asc" }, { title: "asc" }],
  });

  return (
    <section>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold">Songs</h1>
          <p className="mt-1 text-sm text-zinc-600">Your band repertoire, readiness, and rehearsal notes.</p>
        </div>
        <div className="flex gap-2">
          <Link className="rounded border border-zinc-300 bg-white px-4 py-2 text-sm font-medium hover:bg-zinc-50" href="/songs/import-playlist">
            Import playlist
          </Link>
          <Link className="rounded bg-zinc-900 px-4 py-2 text-sm font-medium text-white hover:bg-zinc-700" href="/songs/new">
            Add song
          </Link>
        </div>
      </div>

      <div className="mt-6 overflow-hidden rounded border border-zinc-200 bg-white">
        {songs.length === 0 ? (
          <p className="p-6 text-sm text-zinc-600">No songs yet. Add your first song manually.</p>
        ) : (
          <table className="w-full border-collapse text-left text-sm">
            <thead className="bg-zinc-50 text-xs uppercase text-zinc-500">
              <tr>
                <th className="px-4 py-3">Song</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3">Key</th>
                <th className="px-4 py-3">Capo</th>
                <th className="px-4 py-3">Duration</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-100">
              {songs.map((song) => (
                <tr key={song.id} className="hover:bg-zinc-50">
                  <td className="px-4 py-3">
                    <Link className="font-medium hover:underline" href={`/songs/${song.id}`}>
                      {song.title}
                    </Link>
                    <div className="text-zinc-600">{song.artist}</div>
                  </td>
                  <td className="px-4 py-3">
                    <span className={`rounded border px-2 py-1 text-xs font-medium ${statusBadgeClass(song.status)}`}>
                      {formatSongStatus(song.status)}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-zinc-700">{song.key ?? "-"}</td>
                  <td className="px-4 py-3 text-zinc-700">{song.capo ?? "-"}</td>
                  <td className="px-4 py-3 text-zinc-700">{formatDuration(song.durationMs)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </section>
  );
}
