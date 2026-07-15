import { browser } from "$app/environment";

const ENABLED_PACKS_COOKIE = "enabledPacks";
const LEGACY_DISABLED_PACKS_COOKIE = "disabledPacks";
const COOKIE_EXPIRY = "Fri, 31 Dec 9999 23:59:59 GMT";

function readCookie(name: string): string | null {
  if (!browser) return null;

  const cookie = document.cookie
    .split(";")
    .map((part) => part.trim())
    .find((part) => part.startsWith(`${name}=`));

  return cookie?.slice(name.length + 1) ?? null;
}

export function parsePackIds(value: string | null): string[] | null {
  if (value === null) return null;

  try {
    const decoded = decodeURIComponent(value);
    const parsed: unknown = JSON.parse(decoded);
    if (!Array.isArray(parsed) || !parsed.every((entry) => typeof entry === "string")) return null;
    return parsed;
  } catch {
    return null;
  }
}

export function serializePackIds(packIds: string[]): string {
  return JSON.stringify(packIds);
}

export function readEnabledPacksCookie(): string[] | null {
  return parsePackIds(readCookie(ENABLED_PACKS_COOKIE));
}

export function readLegacyDisabledPacksCookie(): string[] | null {
  return parsePackIds(readCookie(LEGACY_DISABLED_PACKS_COOKIE));
}

export function writeEnabledPacksCookie(enabledPacks: string[]): void {
  if (!browser) return;

  const value = encodeURIComponent(serializePackIds(enabledPacks));
  document.cookie = `${ENABLED_PACKS_COOKIE}=${value}; expires=${COOKIE_EXPIRY}; path=/; SameSite=Lax`;
}

export function removeLegacyDisabledPacksCookie(): void {
  if (!browser) return;

  document.cookie = `${LEGACY_DISABLED_PACKS_COOKIE}=; Max-Age=0; path=/; SameSite=Lax`;
}
