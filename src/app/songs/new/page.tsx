import Link from "next/link";
import { createSong } from "../actions";
import { SongForm } from "./song-form";

export default function NewSongPage() {
  return (
    <section className="max-w-3xl">
      <Link className="text-sm text-zinc-600 hover:underline" href="/songs">
        Back to songs
      </Link>
      <h1 className="mt-3 text-2xl font-semibold">Add song</h1>
      <p className="mt-1 text-sm text-zinc-600">
        Search Spotify to prefill the basics, or add the song manually.
      </p>

      <SongForm action={createSong} />
    </section>
  );
}
