export const API_DOCS_URL = "https://sky.shiiyu.moe/api/openapi";

export const API_USE_CASES = [
  { value: "website", label: "Website or web app" },
  { value: "discord-bot", label: "Discord bot" },
  { value: "mod", label: "Minecraft mod" },
  { value: "tool", label: "Tool or script" },
  { value: "research", label: "Research or statistics" },
  { value: "other", label: "Something else" }
] as const;

export type ApiUseCase = (typeof API_USE_CASES)[number]["value"];
export type ApiKeyRequestStatus = "pending" | "approved" | "denied" | "revoked";
export type RateLimitRequestStatus = "pending" | "approved" | "denied";

// shortcut: arbitrary ceiling for self-service requests, raise it if staff regularly grant more.
export const MAX_REQUESTED_RATE_LIMIT = 10_000;
