# Spotify integration

The MVP stores Spotify-ready fields on `Song`:

- `spotifyTrackId`
- `spotifyUrl`
- `albumArtUrl`
- `durationMs`

This folder now contains the first Spotify Web API integration:

- `search.ts` for track search

It uses the Client Credentials flow through these environment variables:

- `SPOTIFY_CLIENT_ID`
- `SPOTIFY_CLIENT_SECRET`

OAuth user login is intentionally not implemented yet. Playlist import and user-specific library features will need OAuth later.
