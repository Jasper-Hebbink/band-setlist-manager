import { NextResponse } from "next/server";
import { searchSpotifyTracks } from "@/lib/spotify/search";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const query = searchParams.get("q") ?? "";

  if (!query.trim()) {
    return NextResponse.json({ tracks: [] });
  }

  try {
    const tracks = await searchSpotifyTracks(query);
    return NextResponse.json({ tracks });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Spotify search failed";
    const status = message.includes("Missing SPOTIFY") ? 500 : 502;

    return NextResponse.json({ error: message }, { status });
  }
}
