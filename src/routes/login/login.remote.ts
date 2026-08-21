import { form } from "$app/server";
import { auth } from "$src/lib/server/auth";
import { fail, redirect } from "@sveltejs/kit";
import { z } from "zod";

export const signInSocial = form(
  z.object({ provider: z.string(), callbackURL: z.string() }),
  async ({ provider, callbackURL }) => {
    if (!provider) {
      return fail(400, { message: "Provider is required" });
    }

    const result = await auth.api.signInSocial({
      body: {
        provider: provider,
        callbackURL
      }
    });

    if (result.url) {
      return redirect(302, result.url);
    }
    return fail(400, { message: "Social sign-in failed" });
  }
);
