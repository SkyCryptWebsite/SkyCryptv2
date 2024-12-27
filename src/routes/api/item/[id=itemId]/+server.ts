import { renderItem } from "$lib/server/helper/renderer";
import { error } from "@sveltejs/kit";
import type { RequestHandler } from "./$types";

// GET /api/head/[id=itemId]
export const GET: RequestHandler = async ({ params, cookies }) => {
  const { id } = params;

  try {
    const [newId, damage] = id.split(":");
    const packs = JSON.parse(cookies.get("disabledPacks") || "[]");
    const attachment = await renderItem(newId, { damage: isNaN(parseInt(damage)) ? 0 : parseInt(damage), packs });

    return new Response(attachment.image, {
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
