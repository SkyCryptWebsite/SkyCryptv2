import { readEnabledPacksCookie, serializePackIds } from "$lib/shared/resource-packs";

export type ResolvedItemTexture = {
  texture: string;
  texture_pack?: string;
};

const resolutionCache = new Map<string, Promise<ResolvedItemTexture>>();

function resolverUrl(textureUrl: string, enabledPacks: string): string | null {
  const url = new URL(textureUrl, window.location.origin);
  const match = url.pathname.match(/^(.*\/api\/item\/)([^/]+)$/);
  if (!match) return null;
  url.pathname = `${match[1]}${match[2]}/resolve`;
  if (enabledPacks) url.searchParams.set("enabledPacks", enabledPacks);
  return url.toString();
}

export function resolveItemTexture(textureUrl: string, texturePack?: string): Promise<ResolvedItemTexture> {
  const enabledPacksCookie = readEnabledPacksCookie();
  const enabledPacks = enabledPacksCookie === null ? "" : serializePackIds(enabledPacksCookie);
  const cacheKey = `${textureUrl}|${enabledPacks}|${texturePack ?? ""}`;
  const cached = resolutionCache.get(cacheKey);
  if (cached) return cached;

  const fallback: ResolvedItemTexture = { texture: textureUrl };
  if (texturePack) fallback.texture_pack = texturePack;

  const resolver = texturePack ? null : resolverUrl(textureUrl, enabledPacks);
  const resolution = resolver
    ? fetch(resolver)
        .then(async (response) => {
          if (!response.ok) throw new Error(`Failed to resolve item texture: ${response.status}`);
          return (await response.json()) as ResolvedItemTexture;
        })
        .catch(() => fallback)
    : Promise.resolve(fallback);

  resolutionCache.set(cacheKey, resolution);
  return resolution;
}
