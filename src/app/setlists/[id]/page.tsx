import Link from "next/link";
import { notFound } from "next/navigation";
import { formatDuration, formatTotalDuration } from "@/lib/duration";
import { prisma } from "@/lib/prisma";
import { formatSongStatus, statusBadgeClass } from "@/lib/song-status";
import { deleteSetlist } from "../actions";

type SetlistDetailPageProps = {
  params: Promise<{
    id: string;
  }>;
};

export default async function SetlistDetailPage({ params }: SetlistDetailPageProps) {
  const { id } = await params;
  const setlistId = Number(id);

  if (!Number.isInteger(setlistId)) {
    notFound();
  }

  const setlist = await prisma.setlist.findUnique({
    where: { id: setlistId },
    include: {
      setlistSongs: {
        include: {
          song: true,
        },
        orderBy: {
          position: "asc",
        },
      },
    },
  });

  if (!setlist) {
    notFound();
  }

  const totalDurationMs = setlist.setlistSongs.reduce((total, item) => total + (item.song.durationMs ?? 0), 0);

  return (
    <section>
      <Link className="text-sm text-zinc-600 hover:underline" href="/setlists">
        Back to setlists
      </Link>

      <div className="mt-4 flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-3xl font-semibold">{setlist.name}</h1>
          <p className="mt-1 text-zinc-600">{setlist.date ? setlist.date.toLocaleDateString() : "No date set"}</p>
        </div>
        <div className="rounded border border-zinc-200 bg-white px-4 py-3 text-sm">
          <span className="block text-zinc-500">Total duration</span>
          <span className="font-medium">{formatTotalDuration(totalDurationMs)}</span>
        </div>
      </div>

      {setlist.notes ? (
        <div className="mt-6 rounded border border-zinc-200 bg-white p-4">
          <h2 className="text-sm font-semibold uppercase text-zinc-500">Notes</h2>
          <p className="mt-2 whitespace-pre-wrap text-sm text-zinc-800">{setlist.notes}</p>
        </div>
      ) : null}

      <div className="mt-6 overflow-hidden rounded border border-zinc-200 bg-white">
        {setlist.setlistSongs.length === 0 ? (
          <p className="p-6 text-sm text-zinc-600">This setlist has no songs yet.</p>
        ) : (
          <table className="w-full border-collapse text-left text-sm">
            <thead className="bg-zinc-50 text-xs uppercase text-zinc-500">
              <tr>
                <th className="w-16 px-4 py-3">#</th>
                <th className="px-4 py-3">Song</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3">Guitar / capo</th>
                <th className="px-4 py-3">Duration</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-100">
              {setlist.setlistSongs.map((item) => (
                <tr key={item.id} className="align-top hover:bg-zinc-50">
                  <td className="px-4 py-3 font-medium text-zinc-500">{item.position}</td>
                  <td className="px-4 py-3">
                    <Link className="font-medium hover:underline" href={`/songs/${item.song.id}`}>
                      {item.song.title}
                    </Link>
                    <div className="text-zinc-600">{item.song.artist}</div>
                  </td>
                  <td className="px-4 py-3">
                    <span className={`rounded border px-2 py-1 text-xs font-medium ${statusBadgeClass(item.song.status)}`}>
                      {formatSongStatus(item.song.status)}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-zinc-700">
                    <div>Capo: {item.song.capo ?? "-"}</div>
                    <div className="mt-1 whitespace-pre-wrap text-zinc-600">{item.song.guitar ?? "-"}</div>
                  </td>
                  <td className="px-4 py-3 text-zinc-700">{formatDuration(item.song.durationMs)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      <section className="mt-8 rounded border border-red-200 bg-red-50 p-4">
        <h2 className="text-lg font-semibold text-red-900">Delete setlist</h2>
        <p className="mt-1 text-sm text-red-800">This removes the setlist only. The songs stay in your song library.</p>
        <form action={deleteSetlist} className="mt-3">
          <input type="hidden" name="setlistId" value={setlist.id} />
          <button className="rounded bg-red-700 px-4 py-2 text-sm font-medium text-white hover:bg-red-800" type="submit">
            Delete setlist
          </button>
        </form>
      </section>
    </section>
  );
}
