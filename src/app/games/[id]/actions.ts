"use server";

import { revalidatePath } from "next/cache";
import { addComment } from "@/lib/comments";
import { saveCommentPhoto } from "@/lib/commentPhotos";
import { getGameById } from "@/lib/games";

export async function addCommentAction(gameId: string, formData: FormData) {
  const author = String(formData.get("author") ?? "").trim().slice(0, 60);
  const body = String(formData.get("body") ?? "").trim().slice(0, 2000);
  const photoFile = formData.get("photo");

  let photoPath: string | null = null;
  try {
    photoPath = await saveCommentPhoto(photoFile instanceof File ? photoFile : null);
  } catch {
    return;
  }

  if (!author || (!body && !photoPath)) return;

  const game = getGameById(gameId);
  if (!game) return;

  addComment(
    gameId,
    author,
    body,
    photoPath,
    `${game.awayTeam} @ ${game.homeTeam} (${game.date})`
  );

  revalidatePath(`/games/${gameId}`);
  revalidatePath("/activity");
}
