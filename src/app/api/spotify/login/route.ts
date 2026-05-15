import { NextResponse } from "next/server";
import { randomUUID } from "crypto";
import { getSpotifyAuthorizeUrl, spotifyOAuthStateCookieName } from "@/lib/spotify/auth";

export async function GET(request: Request) {
  const requestUrl = new URL(request.url);

  if (requestUrl.hostname !== "127.0.0.1") {
    const loopbackUrl = new URL(requestUrl.pathname, "http://127.0.0.1:3000");
    return NextResponse.redirect(loopbackUrl);
  }

  const state = randomUUID();
  const response = NextResponse.redirect(getSpotifyAuthorizeUrl(state));

  response.cookies.set(spotifyOAuthStateCookieName, state, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    maxAge: 60 * 10,
    path: "/",
  });

  return response;
}
