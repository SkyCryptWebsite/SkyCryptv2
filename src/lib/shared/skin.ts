import ky from "ky";

interface ProfileResponse {
  properties: { name: string; value: string; signature?: string }[];
}

function sanitizeUrl(url?: string): string | undefined {
  return url ? url.replace(/^http:/, "https:") : undefined;
}

/** Looks up a player's skin and cape texture URLs through the mowojang session proxy. */
export async function fetchSkinTextures(uuid: string) {
  const profile = await ky(`https://mowojang.seraph.si/session/minecraft/profile/${uuid}`).json<ProfileResponse>();

  const texturesProperty = profile.properties.find((prop) => prop.name === "textures");

  if (!texturesProperty?.value) {
    throw new Error("No texture properties found");
  }

  const texturesJson = JSON.parse(atob(texturesProperty.value));
  const skinUrl = sanitizeUrl(texturesJson.textures?.SKIN?.url);
  const capeUrl = sanitizeUrl(texturesJson.textures?.CAPE?.url);

  if (!skinUrl) {
    throw new Error("No skin URL present in texture payload");
  }

  return { skinUrl, capeUrl };
}
