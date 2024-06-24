import { getArmor } from "$lib/renderer";
import type { RequestHandler } from "./$types";
import { error } from "@sveltejs/kit";

export const GET: RequestHandler = async ({ params }) => {
  const { type, color } = params;

  try {
    const attachment = await getArmor(type, color);

    return new Response(attachment, { headers: { "Content-Type": "image/png" } });
  } catch (errorMsg) {
    console.log("ERROR:", errorMsg);
    throw error(500, "Internal server error");
  }
};
