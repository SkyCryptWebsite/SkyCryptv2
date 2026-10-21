export const API_DOCS_URL = "https://api.shiiyu.moe";

export const API_USE_CASES = [
  { value: "website", label: "Website or web app" },
  { value: "discord-bot", label: "Discord bot" },
  { value: "mod", label: "Minecraft mod" },
  { value: "tool", label: "Tool or script" },
  { value: "other", label: "Something else" }
] as const;

export type ApiUseCase = (typeof API_USE_CASES)[number]["value"];
export type ApiKeyRequestStatus = "pending" | "approved" | "denied" | "revoked";
export type RateLimitRequestStatus = "pending" | "approved" | "denied";

// shortcut: arbitrary ceiling for self-service requests, raise it if staff regularly grant more.
export const MAX_REQUESTED_RATE_LIMIT = 10_000;

/** Scopes an API key can hold, stored as Better Auth permissions `{ api: [...] }`. New keys get `normal`. */
export const API_KEY_SCOPES = {
  normal: { label: "Normal", description: "Standard read access to the API." },
  "cache-bypass": { label: "Cache bypass", description: "May skip cached data and fetch fresh profiles." }
} as const;

export type ApiKeyScope = keyof typeof API_KEY_SCOPES;
export const DEFAULT_API_KEY_PERMISSIONS = { api: ["normal"] satisfies ApiKeyScope[] };
