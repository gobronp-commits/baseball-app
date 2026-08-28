"use server";

import { revalidatePath } from "next/cache";
import { addComment } from "@/lib/comments";
import { getGameById } from "@/lib/games";

export async function addCommentAction(gameId: string, formData: FormData) {
  const author = String(formData.get("author") ?? "").trim().slice(0, 60);
  const body = String(formData.get("body") ?? "").trim().slice(0, 2000);
  if (!author || !body) return;

  const game = getGameById(gameId);
  if (!game) return;

  addComment(gameId, author, body, `${game.awayTeam} @ ${game.homeTeam} (${game.date})`);

  revalidatePath(`/games/${gameId}`);
  revalidatePath("/activity");
}
