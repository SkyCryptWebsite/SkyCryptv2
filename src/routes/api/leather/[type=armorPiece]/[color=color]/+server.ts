import { getArmor } from "$lib/server/helper/renderer";
import { error } from "@sveltejs/kit";
import type { RequestHandler } from "./$types";

export const GET: RequestHandler = async ({ params }) => {
  const { type, color } = params;

  try {
    const attachment = await getArmor(type, color);

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
