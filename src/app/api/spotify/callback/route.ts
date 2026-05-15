import { NextResponse } from "next/server";
import {
  exchangeSpotifyCodeForToken,
  spotifyAccessTokenCookieName,
  spotifyOAuthStateCookieName,
} from "@/lib/spotify/auth";

export async function GET(request: Request) {
  const requestUrl = new URL(request.url);
  const code = requestUrl.searchParams.get("code");
  const error = requestUrl.searchParams.get("error");
  const state = requestUrl.searchParams.get("state");
  const expectedState = request.headers
    .get("cookie")
    ?.split(";")
    .map((cookie) => cookie.trim())
    .find((cookie) => cookie.startsWith(`${spotifyOAuthStateCookieName}=`))
    ?.split("=")[1];
  const redirectUrl = new URL("/songs/import-playlist", requestUrl.origin);

  if (error) {
    redirectUrl.searchParams.set("spotifyError", error);
    return NextResponse.redirect(redirectUrl);
  }

  if (!code) {
    redirectUrl.searchParams.set("spotifyError", "missing_code");
    return NextResponse.redirect(redirectUrl);
  }

  if (!state || !expectedState || state !== expectedState) {
    redirectUrl.searchParams.set("spotifyError", "state_mismatch");
    return NextResponse.redirect(redirectUrl);
  }

  try {
    const token = await exchangeSpotifyCodeForToken(code);
    const response = NextResponse.redirect(redirectUrl);

    response.cookies.set(spotifyAccessTokenCookieName, token.access_token, {
      httpOnly: true,
      sameSite: "lax",
      secure: process.env.NODE_ENV === "production",
      maxAge: token.expires_in,
      path: "/",
    });
    response.cookies.set(spotifyOAuthStateCookieName, "", {
      httpOnly: true,
      sameSite: "lax",
      secure: process.env.NODE_ENV === "production",
      maxAge: 0,
      path: "/",
    });

    return response;
  } catch {
    redirectUrl.searchParams.set("spotifyError", "token_exchange_failed");
    return NextResponse.redirect(redirectUrl);
  }
}
