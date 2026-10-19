import { getRequestEvent, query } from "$app/server";

/** The signed-in user's display fields for the header; everything else stays on the server. */
export const getHeaderUser = query(async () => {
  const { user } = getRequestEvent().locals;
  return user ? { name: user.name, image: user.image ?? null } : null;
});
