import { validateURL } from "$lib/shared/helper";
import { z } from "zod";

export const schema = z.object({
  query: z.string().refine((value) => validateURL(value), {
    message: "Please enter a valid Minecraft username or UUID"
  })
});
