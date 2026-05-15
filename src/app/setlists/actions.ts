"use server";

import { redirect } from "next/navigation";
import { optionalDate, optionalNumber, optionalString, requiredString } from "@/lib/forms";
import { prisma } from "@/lib/prisma";

export async function createSetlist(formData: FormData) {
  const selectedSongIds = formData
    .getAll("songId")
    .map((value) => Number(value))
    .filter((value) => Number.isInteger(value));

  const rows = selectedSongIds
    .map((songId, index) => {
      const requestedPosition = optionalNumber(formData, `position-${songId}`);

      return {
        songId,
        position: requestedPosition && requestedPosition > 0 ? requestedPosition : index + 1,
      };
    })
    .sort((a, b) => a.position - b.position)
    .map((row, index) => ({
      songId: row.songId,
      position: index + 1,
    }));

  const setlist = await prisma.setlist.create({
    data: {
      name: requiredString(formData, "name"),
      date: optionalDate(formData, "date"),
      notes: optionalString(formData, "notes"),
      setlistSongs: {
        create: rows,
      },
    },
  });

  redirect(`/setlists/${setlist.id}`);
}

export async function deleteSetlist(formData: FormData) {
  const setlistId = Number(requiredString(formData, "setlistId"));

  if (!Number.isInteger(setlistId)) {
    throw new Error("Invalid setlist ID");
  }

  await prisma.setlist.delete({
    where: {
      id: setlistId,
    },
  });

  redirect("/setlists");
}
