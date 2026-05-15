"use client";

import { useState } from "react";
import { formatSongStatus, songStatuses } from "@/lib/song-status";
import { formatDuration } from "@/lib/duration";

type SpotifyTrackResult = {
  spotifyTrackId: string;
  title: string;
  artist: string;
  durationMs: number;
  spotifyUrl: string;
  albumArtUrl: string | null;
};

type SongFormProps = {
  action: (formData: FormData) => void | Promise<void>;
};

export function SongForm({ action }: SongFormProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [isSearching, setIsSearching] = useState(false);
  const [searchError, setSearchError] = useState<string | null>(null);
  const [searchResults, setSearchResults] = useState<SpotifyTrackResult[]>([]);
  const [title, setTitle] = useState("");
  const [artist, setArtist] = useState("");
  const [durationMs, setDurationMs] = useState("");
  const [spotifyTrackId, setSpotifyTrackId] = useState("");
  const [spotifyUrl, setSpotifyUrl] = useState("");
  const [albumArtUrl, setAlbumArtUrl] = useState("");

  async function handleSearch() {
    const trimmedQuery = searchQuery.trim();

    if (!trimmedQuery) {
      setSearchResults([]);
      return;
    }

    setIsSearching(true);
    setSearchError(null);

    try {
      const response = await fetch(`/api/spotify/search?q=${encodeURIComponent(trimmedQuery)}`);
      const data = (await response.json()) as {
        tracks?: SpotifyTrackResult[];
        error?: string;
      };

      if (!response.ok) {
        throw new Error(data.error ?? "Spotify search failed");
      }

      setSearchResults(data.tracks ?? []);
    } catch (error) {
      setSearchError(error instanceof Error ? error.message : "Spotify search failed");
      setSearchResults([]);
    } finally {
      setIsSearching(false);
    }
  }

  function useSpotifyTrack(track: SpotifyTrackResult) {
    setTitle(track.title);
    setArtist(track.artist);
    setDurationMs(String(track.durationMs));
    setSpotifyTrackId(track.spotifyTrackId);
    setSpotifyUrl(track.spotifyUrl);
    setAlbumArtUrl(track.albumArtUrl ?? "");
  }

  return (
    <form action={action} className="mt-6 grid gap-5 rounded border border-zinc-200 bg-white p-5">
      <section className="rounded border border-zinc-200 bg-zinc-50 p-4">
        <h2 className="text-sm font-semibold uppercase text-zinc-500">Spotify search</h2>
        <div className="mt-3 flex flex-col gap-3 sm:flex-row">
          <input
            type="search"
            value={searchQuery}
            onChange={(event) => setSearchQuery(event.target.value)}
            onKeyDown={(event) => {
              if (event.key === "Enter") {
                event.preventDefault();
                void handleSearch();
              }
            }}
            placeholder="Search track or artist"
            className="min-w-0 flex-1 rounded border border-zinc-300 px-3 py-2"
          />
          <button
            type="button"
            onClick={() => void handleSearch()}
            className="rounded bg-zinc-900 px-4 py-2 text-sm font-medium text-white hover:bg-zinc-700 disabled:bg-zinc-400"
            disabled={isSearching}
          >
            {isSearching ? "Searching" : "Search"}
          </button>
        </div>

        {searchError ? <p className="mt-3 text-sm text-red-700">{searchError}</p> : null}

        {searchResults.length > 0 ? (
          <ul className="mt-4 divide-y divide-zinc-200 rounded border border-zinc-200 bg-white">
            {searchResults.map((track) => (
              <li key={track.spotifyTrackId} className="grid gap-3 p-3 sm:grid-cols-[56px_1fr_auto] sm:items-center">
                <div className="h-14 w-14 overflow-hidden rounded border border-zinc-200 bg-zinc-100">
                  {track.albumArtUrl ? (
                    <img src={track.albumArtUrl} alt="" className="h-full w-full object-cover" />
                  ) : null}
                </div>
                <div className="min-w-0">
                  <div className="font-medium">{track.title}</div>
                  <div className="text-sm text-zinc-600">
                    {track.artist} - {formatDuration(track.durationMs)}
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => useSpotifyTrack(track)}
                  className="rounded border border-zinc-300 px-3 py-2 text-sm font-medium hover:bg-zinc-50"
                >
                  Use track
                </button>
              </li>
            ))}
          </ul>
        ) : null}
      </section>

      <div className="grid gap-4 md:grid-cols-2">
        <label className="grid gap-1 text-sm font-medium">
          Title
          <input
            required
            name="title"
            value={title}
            onChange={(event) => setTitle(event.target.value)}
            className="rounded border border-zinc-300 px-3 py-2 font-normal"
          />
        </label>
        <label className="grid gap-1 text-sm font-medium">
          Artist
          <input
            required
            name="artist"
            value={artist}
            onChange={(event) => setArtist(event.target.value)}
            className="rounded border border-zinc-300 px-3 py-2 font-normal"
          />
        </label>
        <label className="grid gap-1 text-sm font-medium">
          Status
          <select name="status" defaultValue="NEW" className="rounded border border-zinc-300 px-3 py-2 font-normal">
            {songStatuses.map((status) => (
              <option key={status} value={status}>
                {formatSongStatus(status)}
              </option>
            ))}
          </select>
        </label>
        <label className="grid gap-1 text-sm font-medium">
          Duration in milliseconds
          <input
            name="durationMs"
            inputMode="numeric"
            placeholder="Example: 210000"
            value={durationMs}
            onChange={(event) => setDurationMs(event.target.value)}
            className="rounded border border-zinc-300 px-3 py-2 font-normal"
          />
        </label>
        <label className="grid gap-1 text-sm font-medium">
          Key
          <input name="key" placeholder="Example: G" className="rounded border border-zinc-300 px-3 py-2 font-normal" />
        </label>
        <label className="grid gap-1 text-sm font-medium">
          Capo
          <input name="capo" placeholder="Example: 2nd fret" className="rounded border border-zinc-300 px-3 py-2 font-normal" />
        </label>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <label className="grid gap-1 text-sm font-medium">
          Spotify track ID
          <input
            name="spotifyTrackId"
            value={spotifyTrackId}
            onChange={(event) => setSpotifyTrackId(event.target.value)}
            className="rounded border border-zinc-300 px-3 py-2 font-normal"
          />
        </label>
        <label className="grid gap-1 text-sm font-medium">
          Spotify URL
          <input
            name="spotifyUrl"
            type="url"
            value={spotifyUrl}
            onChange={(event) => setSpotifyUrl(event.target.value)}
            className="rounded border border-zinc-300 px-3 py-2 font-normal"
          />
        </label>
        <label className="grid gap-1 text-sm font-medium md:col-span-2">
          Album art URL
          <input
            name="albumArtUrl"
            type="url"
            value={albumArtUrl}
            onChange={(event) => setAlbumArtUrl(event.target.value)}
            className="rounded border border-zinc-300 px-3 py-2 font-normal"
          />
        </label>
      </div>

      <label className="grid gap-1 text-sm font-medium">
        Guitar notes
        <textarea name="guitar" rows={3} className="rounded border border-zinc-300 px-3 py-2 font-normal" />
      </label>
      <div className="grid gap-4 md:grid-cols-3">
        <label className="grid gap-1 text-sm font-medium">
          My part
          <textarea name="myPart" rows={3} className="rounded border border-zinc-300 px-3 py-2 font-normal" />
        </label>
        <label className="grid gap-1 text-sm font-medium">
          Lead part
          <textarea name="leadPart" rows={3} className="rounded border border-zinc-300 px-3 py-2 font-normal" />
        </label>
        <label className="grid gap-1 text-sm font-medium">
          Keys part
          <textarea name="keysPart" rows={3} className="rounded border border-zinc-300 px-3 py-2 font-normal" />
        </label>
      </div>
      <label className="grid gap-1 text-sm font-medium">
        General notes
        <textarea name="notes" rows={4} className="rounded border border-zinc-300 px-3 py-2 font-normal" />
      </label>

      <div className="flex justify-end">
        <button className="rounded bg-zinc-900 px-4 py-2 text-sm font-medium text-white hover:bg-zinc-700" type="submit">
          Save song
        </button>
      </div>
    </form>
  );
}
