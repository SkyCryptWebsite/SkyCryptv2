import { renderItem } from "$lib/server/helper/renderer";
import { error } from "@sveltejs/kit";
import type { RequestHandler } from "./$types";

// GET /api/head/[id=itemId]
export const GET: RequestHandler = async ({ params }) => {
  const { id } = params;
  console.log(id);

  try {
    const [newId, damage] = id.split(":");
    console.log(newId, { damage: isNaN(parseInt(damage)) ? 0 : parseInt(damage) });
    const attachment = await renderItem(newId, { damage: isNaN(parseInt(damage)) ? 0 : parseInt(damage) });

    return new Response(attachment.image, { headers: { "Content-Type": "image/png" } });
  } catch (errorMsg) {
    console.log("ERROR:", errorMsg);
    throw error(500, "Internal server error");
  }
};
