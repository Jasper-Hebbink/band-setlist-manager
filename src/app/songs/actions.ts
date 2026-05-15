"use server";

import type { SongStatus } from "@/generated/prisma/enums";
import { mkdir, unlink, writeFile } from "fs/promises";
import { redirect } from "next/navigation";
import { cookies } from "next/headers";
import path from "path";
import { randomUUID } from "crypto";
import { optionalNumber, optionalString, requiredString } from "@/lib/forms";
import { prisma } from "@/lib/prisma";
import { findSongKey } from "@/lib/song-key";
import { songStatuses } from "@/lib/song-status";
import { spotifyAccessTokenCookieName } from "@/lib/spotify/auth";
import { getSpotifyPlaylistTracks } from "@/lib/spotify/search";

function getSongDocumentPath(fileUrl: string) {
  return path.join(process.cwd(), "public", fileUrl.replace(/^\/+/, ""));
}

async function deleteUploadedSongDocument(fileUrl: string) {
  try {
    await unlink(getSongDocumentPath(fileUrl));
  } catch {
    // The database should still be cleaned up if the local file is already gone.
  }
}

export async function createSong(formData: FormData) {
  const rawStatus = optionalString(formData, "status") ?? "NEW";
  const status = songStatuses.includes(rawStatus as SongStatus) ? (rawStatus as SongStatus) : "NEW";

  const song = await prisma.song.create({
    data: {
      title: requiredString(formData, "title"),
      artist: requiredString(formData, "artist"),
      spotifyTrackId: optionalString(formData, "spotifyTrackId"),
      spotifyUrl: optionalString(formData, "spotifyUrl"),
      albumArtUrl: optionalString(formData, "albumArtUrl"),
      durationMs: optionalNumber(formData, "durationMs"),
      key: optionalString(formData, "key"),
      capo: optionalString(formData, "capo"),
      status,
      guitar: optionalString(formData, "guitar"),
      myPart: optionalString(formData, "myPart"),
      leadPart: optionalString(formData, "leadPart"),
      keysPart: optionalString(formData, "keysPart"),
      notes: optionalString(formData, "notes"),
    },
  });

  redirect(`/songs/${song.id}`);
}

export async function deleteSong(formData: FormData) {
  const songId = Number(requiredString(formData, "songId"));

  if (!Number.isInteger(songId)) {
    throw new Error("Invalid song ID");
  }

  const documents = await prisma.songDocument.findMany({
    where: {
      songId,
    },
    select: {
      fileUrl: true,
    },
  });

  await prisma.song.delete({
    where: {
      id: songId,
    },
  });

  await Promise.all(documents.map((document) => deleteUploadedSongDocument(document.fileUrl)));

  redirect("/songs");
}

export async function importSpotifyPlaylist(formData: FormData) {
  const playlistInput = requiredString(formData, "playlistInput");
  const cookieStore = await cookies();
  const spotifyAccessToken = cookieStore.get(spotifyAccessTokenCookieName)?.value;

  if (!spotifyAccessToken) {
    redirect("/songs/import-playlist?spotifyError=connect_required");
  }

  const playlistData = await getSpotifyPlaylistTracks(playlistInput, spotifyAccessToken);
  const importedSongIds: number[] = [];

  for (const track of playlistData.tracks) {
    const existingSong = await prisma.song.findFirst({
      where: {
        spotifyTrackId: track.spotifyTrackId,
      },
      select: {
        id: true,
      },
    });

    if (existingSong) {
      importedSongIds.push(existingSong.id);
      continue;
    }

    const song = await prisma.song.create({
      data: {
        title: track.title,
        artist: track.artist,
        spotifyTrackId: track.spotifyTrackId,
        spotifyUrl: track.spotifyUrl,
        albumArtUrl: track.albumArtUrl,
        durationMs: track.durationMs,
      },
      select: {
        id: true,
      },
    });

    importedSongIds.push(song.id);
  }

  const uniqueSongIds = Array.from(new Set(importedSongIds));
  const setlist = await prisma.setlist.create({
    data: {
      name: playlistData.playlistName,
      notes: `Imported from Spotify playlist. ${playlistData.tracks.length} tracks found.`,
      setlistSongs: {
        create: uniqueSongIds.map((songId, index) => ({
          songId,
          position: index + 1,
        })),
      },
    },
    select: {
      id: true,
    },
  });

  redirect(`/setlists/${setlist.id}`);
}

export async function addSongDocument(formData: FormData) {
  const songId = Number(requiredString(formData, "songId"));
  const title = requiredString(formData, "title");
  const file = formData.get("document");

  if (!Number.isInteger(songId)) {
    throw new Error("Invalid song ID");
  }

  if (!(file instanceof File) || file.size === 0) {
    throw new Error("Choose a PDF file");
  }

  if (file.type !== "application/pdf") {
    throw new Error("Only PDF files are supported");
  }

  const uploadDirectory = path.join(process.cwd(), "public", "uploads", "song-documents");
  await mkdir(uploadDirectory, { recursive: true });

  const fileName = `${randomUUID()}.pdf`;
  const filePath = path.join(uploadDirectory, fileName);
  const fileBuffer = Buffer.from(await file.arrayBuffer());

  await writeFile(filePath, fileBuffer);

  await prisma.songDocument.create({
    data: {
      songId,
      title,
      fileUrl: `/uploads/song-documents/${fileName}`,
    },
  });

  redirect(`/songs/${songId}`);
}

export async function deleteSongDocument(formData: FormData) {
  const documentId = Number(requiredString(formData, "documentId"));
  const songId = Number(requiredString(formData, "songId"));

  if (!Number.isInteger(documentId) || !Number.isInteger(songId)) {
    throw new Error("Invalid document ID");
  }

  const document = await prisma.songDocument.delete({
    where: {
      id: documentId,
    },
  });

  await deleteUploadedSongDocument(document.fileUrl);

  redirect(`/songs/${songId}`);
}

export async function updateSongKeyFromApi(formData: FormData) {
  const songId = Number(requiredString(formData, "songId"));

  if (!Number.isInteger(songId)) {
    throw new Error("Invalid song ID");
  }

  const song = await prisma.song.findUnique({
    where: {
      id: songId,
    },
    select: {
      title: true,
      artist: true,
    },
  });

  if (!song) {
    throw new Error("Song not found");
  }

  const key = await findSongKey(song);

  if (key) {
    await prisma.song.update({
      where: {
        id: songId,
      },
      data: {
        key,
      },
    });
  }

  redirect(`/songs/${songId}`);
}
