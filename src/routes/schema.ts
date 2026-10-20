import { z } from "zod/v4-mini";
import { validateURL } from "#lib/shared/helper";

export const schema = z.object({
  query: z.string().check(
    z.refine((value) => validateURL(value), {
      error: "Please enter a valid Minecraft username or UUID"
    })
  )
});
