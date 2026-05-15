type SpotifyTokenResponse = {
  access_token: string;
  token_type: string;
  expires_in: number;
};

type SpotifyTrack = {
  id: string;
  name: string;
  duration_ms: number;
  external_urls: {
    spotify?: string;
  };
  artists: Array<{
    name: string;
  }>;
  album: {
    images: Array<{
      url: string;
      height: number | null;
      width: number | null;
    }>;
  };
};

type SpotifyPlaylistTrackItem = {
  track: SpotifyTrack | null;
};

type SpotifyPlaylistTracksResponse = {
  items: SpotifyPlaylistTrackItem[];
  next: string | null;
};

type SpotifyPlaylistResponse = {
  name: string;
  tracks: {
    total: number;
  };
};

type SpotifySearchResponse = {
  tracks?: {
    items: SpotifyTrack[];
  };
};

export type SpotifyTrackSearchResult = {
  spotifyTrackId: string;
  title: string;
  artist: string;
  durationMs: number;
  spotifyUrl: string;
  albumArtUrl: string | null;
};

export type SpotifyPlaylistImportData = {
  playlistName: string;
  tracks: SpotifyTrackSearchResult[];
};

let cachedAccessToken: string | null = null;
let cachedAccessTokenExpiresAt = 0;

async function getSpotifyAccessToken(forceRefresh = false) {
  if (!forceRefresh && cachedAccessToken && Date.now() < cachedAccessTokenExpiresAt) {
    return cachedAccessToken;
  }

  const clientId = process.env.SPOTIFY_CLIENT_ID;
  const clientSecret = process.env.SPOTIFY_CLIENT_SECRET;

  if (!clientId || !clientSecret) {
    throw new Error("Missing SPOTIFY_CLIENT_ID or SPOTIFY_CLIENT_SECRET");
  }

  const credentials = Buffer.from(`${clientId}:${clientSecret}`).toString("base64");
  const body = new URLSearchParams({
    grant_type: "client_credentials",
  });

  const response = await fetch("https://accounts.spotify.com/api/token", {
    method: "POST",
    headers: {
      Authorization: `Basic ${credentials}`,
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body,
    cache: "no-store",
  });

  if (!response.ok) {
    throw new Error(`Spotify token request failed with status ${response.status}`);
  }

  const data = (await response.json()) as SpotifyTokenResponse;

  cachedAccessToken = data.access_token;
  cachedAccessTokenExpiresAt = Date.now() + (data.expires_in - 60) * 1000;

  return cachedAccessToken;
}

async function spotifyApiFetch(url: string, userAccessToken?: string) {
  if (userAccessToken) {
    return fetch(url, {
      headers: {
        Authorization: `Bearer ${userAccessToken}`,
      },
      cache: "no-store",
    });
  }

  let accessToken = await getSpotifyAccessToken();
  let response = await fetch(url, {
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
    cache: "no-store",
  });

  if (response.status === 401) {
    cachedAccessToken = null;
    cachedAccessTokenExpiresAt = 0;
    accessToken = await getSpotifyAccessToken(true);
    response = await fetch(url, {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
      cache: "no-store",
    });
  }

  return response;
}

async function spotifyErrorMessage(response: Response, fallback: string) {
  try {
    const body = (await response.json()) as {
      error?: {
        message?: string;
      };
    };

    return body.error?.message ? `${fallback}: ${body.error.message}` : fallback;
  } catch {
    return fallback;
  }
}

function mapSpotifyTrack(track: SpotifyTrack): SpotifyTrackSearchResult {
  return {
    spotifyTrackId: track.id,
    title: track.name,
    artist: track.artists.map((artist) => artist.name).join(", "),
    durationMs: track.duration_ms,
    spotifyUrl: track.external_urls.spotify ?? "",
    albumArtUrl: track.album.images[0]?.url ?? null,
  };
}

export async function searchSpotifyTracks(query: string): Promise<SpotifyTrackSearchResult[]> {
  const trimmedQuery = query.trim();

  if (!trimmedQuery) {
    return [];
  }

  const searchParams = new URLSearchParams({
    q: trimmedQuery,
    type: "track",
    limit: "8",
    market: "US",
  });

  const response = await spotifyApiFetch(`https://api.spotify.com/v1/search?${searchParams.toString()}`);

  if (!response.ok) {
    const message = await spotifyErrorMessage(response, `Spotify search failed with status ${response.status}`);
    throw new Error(message);
  }

  const data = (await response.json()) as SpotifySearchResponse;

  return (data.tracks?.items ?? []).map(mapSpotifyTrack);
}

export function getSpotifyPlaylistId(input: string) {
  const trimmedInput = input.trim();

  if (!trimmedInput) {
    return null;
  }

  if (!trimmedInput.includes("/")) {
    return trimmedInput;
  }

  try {
    const url = new URL(trimmedInput);
    const parts = url.pathname.split("/").filter(Boolean);
    const playlistIndex = parts.findIndex((part) => part === "playlist");

    return playlistIndex >= 0 ? parts[playlistIndex + 1] ?? null : null;
  } catch {
    return null;
  }
}

export async function getSpotifyPlaylistTracks(input: string, userAccessToken?: string): Promise<SpotifyPlaylistImportData> {
  const playlistId = getSpotifyPlaylistId(input);

  if (!playlistId) {
    throw new Error("Enter a valid Spotify playlist URL or ID.");
  }

  const playlistResponse = await spotifyApiFetch(`https://api.spotify.com/v1/playlists/${playlistId}`, userAccessToken);

  if (!playlistResponse.ok) {
    const message = await spotifyErrorMessage(
      playlistResponse,
      `Spotify playlist request failed with status ${playlistResponse.status}`,
    );
    throw new Error(message);
  }

  const playlist = (await playlistResponse.json()) as SpotifyPlaylistResponse;
  const tracks: SpotifyTrackSearchResult[] = [];
  let nextUrl: string | null =
    `https://api.spotify.com/v1/playlists/${playlistId}/items?limit=100&fields=items(track(id,name,duration_ms,external_urls,artists(name),album(images(url,height,width)))),next`;

  while (nextUrl) {
    const tracksResponse = await spotifyApiFetch(nextUrl, userAccessToken);

    if (!tracksResponse.ok) {
      const message = await spotifyErrorMessage(
        tracksResponse,
        `Spotify playlist tracks request failed with status ${tracksResponse.status}`,
      );
      throw new Error(message);
    }

    const data = (await tracksResponse.json()) as SpotifyPlaylistTracksResponse;

    for (const item of data.items) {
      if (item.track?.id) {
        tracks.push(mapSpotifyTrack(item.track));
      }
    }

    nextUrl = data.next;
  }

  return {
    playlistName: playlist.name,
    tracks,
  };
}
