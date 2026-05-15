export const spotifyAccessTokenCookieName = "spotify_access_token";
export const spotifyOAuthStateCookieName = "spotify_oauth_state";

type SpotifyAuthorizationTokenResponse = {
  access_token: string;
  token_type: string;
  expires_in: number;
  refresh_token?: string;
  scope: string;
};

export function getSpotifyRedirectUri() {
  return process.env.SPOTIFY_REDIRECT_URI ?? "http://127.0.0.1:3000/api/spotify/callback";
}

export function getSpotifyAuthorizeUrl(state: string) {
  const clientId = process.env.SPOTIFY_CLIENT_ID;

  if (!clientId) {
    throw new Error("Missing SPOTIFY_CLIENT_ID");
  }

  const searchParams = new URLSearchParams({
    response_type: "code",
    client_id: clientId,
    redirect_uri: getSpotifyRedirectUri(),
    scope: "playlist-read-private playlist-read-collaborative",
    state,
  });

  return `https://accounts.spotify.com/authorize?${searchParams.toString()}`;
}

export async function exchangeSpotifyCodeForToken(code: string) {
  const clientId = process.env.SPOTIFY_CLIENT_ID;
  const clientSecret = process.env.SPOTIFY_CLIENT_SECRET;

  if (!clientId || !clientSecret) {
    throw new Error("Missing SPOTIFY_CLIENT_ID or SPOTIFY_CLIENT_SECRET");
  }

  const credentials = Buffer.from(`${clientId}:${clientSecret}`).toString("base64");
  const body = new URLSearchParams({
    grant_type: "authorization_code",
    code,
    redirect_uri: getSpotifyRedirectUri(),
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
    throw new Error(`Spotify authorization token request failed with status ${response.status}`);
  }

  return (await response.json()) as SpotifyAuthorizationTokenResponse;
}
