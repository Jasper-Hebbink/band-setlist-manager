import Link from "next/link";
import { notFound } from "next/navigation";
import { formatDuration } from "@/lib/duration";
import { prisma } from "@/lib/prisma";
import { formatSongStatus, statusBadgeClass } from "@/lib/song-status";
import { addSongDocument, deleteSong, deleteSongDocument, updateSongKeyFromApi } from "../actions";

type SongDetailPageProps = {
  params: Promise<{
    id: string;
  }>;
};

function DetailBlock({ label, value }: { label: string; value: string | null }) {
  return (
    <div>
      <dt className="text-xs font-medium uppercase text-zinc-500">{label}</dt>
      <dd className="mt-1 whitespace-pre-wrap text-sm text-zinc-800">{value || "-"}</dd>
    </div>
  );
}

export default async function SongDetailPage({ params }: SongDetailPageProps) {
  const { id } = await params;
  const songId = Number(id);

  if (!Number.isInteger(songId)) {
    notFound();
  }

  const song = await prisma.song.findUnique({
    where: { id: songId },
    include: {
      setlistSongs: {
        include: {
          setlist: true,
        },
        orderBy: { id: "desc" },
      },
      documents: {
        orderBy: {
          createdAt: "desc",
        },
      },
    },
  });

  if (!song) {
    notFound();
  }

  return (
    <section>
      <Link className="text-sm text-zinc-600 hover:underline" href="/songs">
        Back to songs
      </Link>

      <div className="mt-4 grid gap-6 md:grid-cols-[160px_1fr]">
        <div className="h-40 w-40 overflow-hidden rounded border border-zinc-200 bg-zinc-100">
          {song.albumArtUrl ? (
            // A plain image keeps this local MVP simple; Next image configuration can come later.
            <img src={song.albumArtUrl} alt={`${song.title} album art`} className="h-full w-full object-cover" />
          ) : (
            <div className="flex h-full items-center justify-center px-4 text-center text-sm text-zinc-500">No album art</div>
          )}
        </div>

        <div>
          <span className={`rounded border px-2 py-1 text-xs font-medium ${statusBadgeClass(song.status)}`}>
            {formatSongStatus(song.status)}
          </span>
          <h1 className="mt-3 text-3xl font-semibold">{song.title}</h1>
          <p className="mt-1 text-lg text-zinc-600">{song.artist}</p>
          <div className="mt-4 grid gap-3 text-sm md:grid-cols-4">
            <div>
              <span className="block text-zinc-500">Duration</span>
              <span>{formatDuration(song.durationMs)}</span>
            </div>
            <div>
              <span className="block text-zinc-500">Key</span>
              <div className="flex flex-wrap items-center gap-2">
                <span>{song.key ?? "-"}</span>
                <form action={updateSongKeyFromApi}>
                  <input type="hidden" name="songId" value={song.id} />
                  <button className="rounded border border-zinc-300 px-2 py-1 text-xs hover:bg-zinc-50" type="submit">
                    Find key
                  </button>
                </form>
              </div>
            </div>
            <div>
              <span className="block text-zinc-500">Capo</span>
              <span>{song.capo ?? "-"}</span>
            </div>
            <div>
              <span className="block text-zinc-500">Spotify</span>
              {song.spotifyUrl ? (
                <a className="text-zinc-900 underline" href={song.spotifyUrl} target="_blank" rel="noreferrer">
                  Open track
                </a>
              ) : (
                <span>-</span>
              )}
            </div>
          </div>
        </div>
      </div>

      <dl className="mt-8 grid gap-5 rounded border border-zinc-200 bg-white p-5 md:grid-cols-2">
        <DetailBlock label="Guitar notes" value={song.guitar} />
        <DetailBlock label="My part" value={song.myPart} />
        <DetailBlock label="Lead part" value={song.leadPart} />
        <DetailBlock label="Keys part" value={song.keysPart} />
        <div className="md:col-span-2">
          <DetailBlock label="General notes" value={song.notes} />
        </div>
      </dl>

      <section className="mt-8">
        <h2 className="text-lg font-semibold">PDF notes</h2>
        <div className="mt-3 grid gap-4 rounded border border-zinc-200 bg-white p-4">
          <form action={addSongDocument} encType="multipart/form-data" className="grid gap-3 md:grid-cols-[1fr_1fr_auto] md:items-end">
            <input type="hidden" name="songId" value={song.id} />
            <label className="grid gap-1 text-sm font-medium">
              Document title
              <input required name="title" placeholder="Chord chart" className="rounded border border-zinc-300 px-3 py-2 font-normal" />
            </label>
            <label className="grid gap-1 text-sm font-medium">
              PDF file
              <input required name="document" type="file" accept="application/pdf" className="rounded border border-zinc-300 px-3 py-2 text-sm font-normal" />
            </label>
            <button className="rounded bg-zinc-900 px-4 py-2 text-sm font-medium text-white hover:bg-zinc-700" type="submit">
              Add PDF
            </button>
          </form>

          {song.documents.length === 0 ? (
            <p className="text-sm text-zinc-600">No PDF notes attached yet.</p>
          ) : (
            <div className="grid gap-4">
              {song.documents.map((document) => (
                <article key={document.id} className="rounded border border-zinc-200">
                  <div className="flex flex-wrap items-center justify-between gap-3 border-b border-zinc-200 p-3">
                    <div>
                      <h3 className="font-medium">{document.title}</h3>
                      <a className="text-sm text-zinc-600 underline" href={document.fileUrl} target="_blank" rel="noreferrer">
                        Open PDF
                      </a>
                    </div>
                    <form action={deleteSongDocument}>
                      <input type="hidden" name="songId" value={song.id} />
                      <input type="hidden" name="documentId" value={document.id} />
                      <button className="rounded border border-red-200 px-3 py-2 text-sm font-medium text-red-700 hover:bg-red-50" type="submit">
                        Delete PDF
                      </button>
                    </form>
                  </div>
                  <iframe className="h-[520px] w-full" src={document.fileUrl} title={document.title} />
                </article>
              ))}
            </div>
          )}
        </div>
      </section>

      <section className="mt-8">
        <h2 className="text-lg font-semibold">Appears in setlists</h2>
        <div className="mt-3 rounded border border-zinc-200 bg-white">
          {song.setlistSongs.length === 0 ? (
            <p className="p-4 text-sm text-zinc-600">This song is not in any setlists yet.</p>
          ) : (
            <ul className="divide-y divide-zinc-100">
              {song.setlistSongs.map((item) => (
                <li key={item.id} className="flex items-center justify-between gap-3 p-4 text-sm">
                  <Link className="font-medium hover:underline" href={`/setlists/${item.setlist.id}`}>
                    {item.setlist.name}
                  </Link>
                  <span className="text-zinc-600">Position {item.position}</span>
                </li>
              ))}
            </ul>
          )}
        </div>
      </section>

      <section className="mt-8 rounded border border-red-200 bg-red-50 p-4">
        <h2 className="text-lg font-semibold text-red-900">Delete song</h2>
        <p className="mt-1 text-sm text-red-800">
          This removes the song, its setlist positions, and uploaded PDF note files.
        </p>
        <form action={deleteSong} className="mt-3">
          <input type="hidden" name="songId" value={song.id} />
          <button className="rounded bg-red-700 px-4 py-2 text-sm font-medium text-white hover:bg-red-800" type="submit">
            Delete song
          </button>
        </form>
      </section>
    </section>
  );
}
