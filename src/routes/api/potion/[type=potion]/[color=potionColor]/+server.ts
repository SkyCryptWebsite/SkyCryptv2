import { POTION_COLORS } from "$constants/constants";
import { getPotion } from "$lib/server/helper/renderer";
import { error } from "@sveltejs/kit";
import type { RequestHandler } from "./$types";

export const GET: RequestHandler = async ({ params }) => {
  const { type, color } = params;

  const potionColor = POTION_COLORS[color];

  try {
    const attachment = await getPotion(type, potionColor);

    return new Response(attachment, {
      headers: {
        "Content-Type": "image/png",
        "Cache-Control": "public, max-age=1209600, immutable"
      }
    });
  } catch (errorMsg) {
    console.log("ERROR:", errorMsg);
    throw error(500, "Internal server error");
  }
};
