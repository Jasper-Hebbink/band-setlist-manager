import type { SongStatus } from "@/generated/prisma/enums";

export const songStatuses: SongStatus[] = [
  "NEW",
  "PRACTICING",
  "ALMOST_READY",
  "READY",
  "PAUSED",
];

export function formatSongStatus(status: SongStatus) {
  return status
    .toLowerCase()
    .split("_")
    .map((word) => word[0].toUpperCase() + word.slice(1))
    .join(" ");
}

export function statusBadgeClass(status: SongStatus) {
  switch (status) {
    case "READY":
      return "border-emerald-200 bg-emerald-50 text-emerald-700";
    case "ALMOST_READY":
      return "border-sky-200 bg-sky-50 text-sky-700";
    case "PRACTICING":
      return "border-amber-200 bg-amber-50 text-amber-700";
    case "PAUSED":
      return "border-stone-200 bg-stone-100 text-stone-700";
    case "NEW":
    default:
      return "border-zinc-200 bg-zinc-50 text-zinc-700";
  }
}
