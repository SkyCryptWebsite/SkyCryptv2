import { resolve } from "$app/paths";
import { auth } from "$src/lib/server/auth";
import { redirect } from "@sveltejs/kit";
import type { PageServerLoad } from "./$types";

export const load = (async (event) => {
  await auth.api.signOut({ headers: event.request.headers });

  return redirect(302, resolve("login"));
}) satisfies PageServerLoad;
