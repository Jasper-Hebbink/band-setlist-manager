import Link from "next/link";
import { cookies } from "next/headers";
import { spotifyAccessTokenCookieName } from "@/lib/spotify/auth";
import { importSpotifyPlaylist } from "../actions";

type ImportPlaylistPageProps = {
  searchParams: Promise<{
    spotifyError?: string;
  }>;
};

export default async function ImportPlaylistPage({ searchParams }: ImportPlaylistPageProps) {
  const { spotifyError } = await searchParams;
  const cookieStore = await cookies();
  const isSpotifyConnected = Boolean(cookieStore.get(spotifyAccessTokenCookieName)?.value);
  const spotifyErrorMessage = getSpotifyErrorMessage(spotifyError);

  return (
    <section className="max-w-2xl">
      <Link className="text-sm text-zinc-600 hover:underline" href="/songs">
        Back to songs
      </Link>
      <h1 className="mt-3 text-2xl font-semibold">Import Spotify playlist</h1>
      <p className="mt-1 text-sm text-zinc-600">
        Connect Spotify, then paste a playlist URL or playlist ID. The app will create missing songs and make a setlist in the same order.
      </p>

      <div className="mt-6 rounded border border-zinc-200 bg-white p-5">
        <h2 className="text-sm font-semibold uppercase text-zinc-500">Spotify connection</h2>
        <p className="mt-2 text-sm text-zinc-600">
          Playlist import needs your Spotify permission. Track search still works without this step.
        </p>
        {spotifyErrorMessage ? (
          <p className="mt-3 rounded border border-red-200 bg-red-50 p-3 text-sm text-red-700">
            {spotifyErrorMessage}
          </p>
        ) : null}
        {isSpotifyConnected ? (
          <div className="mt-4 flex flex-wrap items-center gap-3">
            <span className="rounded border border-emerald-200 bg-emerald-50 px-3 py-2 text-sm font-medium text-emerald-700">
              Spotify connected
            </span>
            <a className="rounded border border-zinc-300 px-4 py-2 text-sm font-medium hover:bg-zinc-50" href="/api/spotify/disconnect">
              Reset connection
            </a>
          </div>
        ) : (
          <a className="mt-4 inline-block rounded bg-zinc-900 px-4 py-2 text-sm font-medium text-white hover:bg-zinc-700" href="/api/spotify/login">
            Connect Spotify
          </a>
        )}
      </div>

      <form action={importSpotifyPlaylist} className="mt-6 grid gap-4 rounded border border-zinc-200 bg-white p-5">
        <label className="grid gap-1 text-sm font-medium">
          Spotify playlist URL or ID
          <input
            required
            name="playlistInput"
            placeholder="https://open.spotify.com/playlist/..."
            className="rounded border border-zinc-300 px-3 py-2 font-normal"
          />
        </label>
        <div className="rounded border border-amber-200 bg-amber-50 p-3 text-sm text-amber-800">
          If the import says you need to connect Spotify, use the button above first.
        </div>
        <div className="flex justify-end">
          <button className="rounded bg-zinc-900 px-4 py-2 text-sm font-medium text-white hover:bg-zinc-700" type="submit">
            Import playlist
          </button>
        </div>
      </form>
    </section>
  );
}

function getSpotifyErrorMessage(error?: string) {
  switch (error) {
    case "connect_required":
      return "Connect Spotify first, then import the playlist.";
    case "missing_code":
      return "Spotify did not send an authorization code. Try connecting again.";
    case "state_mismatch":
      return "The Spotify login attempt was stale. Reset the connection and try again.";
    case "token_exchange_failed":
      return "Spotify login succeeded, but the app could not exchange the code for a token. Check the redirect URI and restart the dev server.";
    default:
      return error ? `Spotify connection failed: ${error}` : null;
  }
}
