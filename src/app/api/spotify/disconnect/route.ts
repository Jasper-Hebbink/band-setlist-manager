import { NextResponse } from "next/server";
import { spotifyAccessTokenCookieName, spotifyOAuthStateCookieName } from "@/lib/spotify/auth";

export async function GET(request: Request) {
  const requestUrl = new URL(request.url);
  const redirectUrl = new URL("/songs/import-playlist", requestUrl.origin);
  const response = NextResponse.redirect(redirectUrl);

  response.cookies.set(spotifyAccessTokenCookieName, "", {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    maxAge: 0,
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
}
