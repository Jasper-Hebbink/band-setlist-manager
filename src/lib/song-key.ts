type GetSongBpmSearchSong = {
  id: string;
  title: string;
  key_of?: string;
  artist?: {
    name?: string;
  };
};

type GetSongBpmSearchResponse = {
  search?: GetSongBpmSearchSong[];
};

type GetSongBpmSongResponse = {
  song?: {
    key_of?: string;
  };
};

export type SongKeyLookupInput = {
  title: string;
  artist: string;
};

export async function findSongKey({ title, artist }: SongKeyLookupInput) {
  const apiKey = process.env.GETSONGBPM_API_KEY;

  if (!apiKey) {
    throw new Error("Missing GETSONGBPM_API_KEY");
  }

  const lookup = `song:${title} artist:${artist}`;
  const searchParams = new URLSearchParams({
    api_key: apiKey,
    type: "both",
    lookup,
    limit: "1",
  });

  const searchResponse = await fetch(`https://api.getsong.co/search/?${searchParams.toString()}`, {
    cache: "no-store",
  });

  if (!searchResponse.ok) {
    throw new Error(`Song key search failed with status ${searchResponse.status}`);
  }

  const searchData = (await searchResponse.json()) as GetSongBpmSearchResponse;
  const bestMatch = searchData.search?.[0];

  if (!bestMatch) {
    return null;
  }

  if (bestMatch.key_of) {
    return bestMatch.key_of;
  }

  const songParams = new URLSearchParams({
    api_key: apiKey,
    id: bestMatch.id,
  });

  const songResponse = await fetch(`https://api.getsong.co/song/?${songParams.toString()}`, {
    cache: "no-store",
  });

  if (!songResponse.ok) {
    throw new Error(`Song key detail lookup failed with status ${songResponse.status}`);
  }

  const songData = (await songResponse.json()) as GetSongBpmSongResponse;

  return songData.song?.key_of || null;
}
