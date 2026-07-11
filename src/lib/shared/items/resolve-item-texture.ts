export type ResolvedItemTexture = {
  texture: string;
  texture_pack?: string;
};

const resolutionCache = new Map<string, Promise<ResolvedItemTexture>>();

function enabledPacksCookie(): string {
  if (typeof document === "undefined") return "";
  const cookie = document.cookie
    .split(";")
    .map((part) => part.trim())
    .find((part) => part.startsWith("enabledPacks="));
  const value = cookie?.slice("enabledPacks=".length) ?? "";
  try {
    return decodeURIComponent(value);
  } catch {
    return value;
  }
}

function resolverUrl(textureUrl: string, enabledPacks: string): string | null {
  const url = new URL(textureUrl, window.location.origin);
  const match = url.pathname.match(/^(.*\/api\/item\/)([^/]+)$/);
  if (!match) return null;
  url.pathname = `${match[1]}${match[2]}/resolve`;
  if (enabledPacks) url.searchParams.set("enabledPacks", enabledPacks);
  return url.toString();
}

export function resolveItemTexture(textureUrl: string): Promise<ResolvedItemTexture> {
  const enabledPacks = enabledPacksCookie();
  const cacheKey = `${textureUrl}|${enabledPacks}`;
  const cached = resolutionCache.get(cacheKey);
  if (cached) return cached;

  const url = resolverUrl(textureUrl, enabledPacks);
  if (!url) return Promise.resolve({ texture: textureUrl });

  const resolution = fetch(url)
    .then(async (response) => {
      if (!response.ok) throw new Error(`Failed to resolve item texture: ${response.status}`);
      return (await response.json()) as ResolvedItemTexture;
    })
    .catch(() => ({ texture: textureUrl }));

  resolutionCache.set(cacheKey, resolution);
  return resolution;
}
