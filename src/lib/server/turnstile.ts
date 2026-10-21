import { TURNSTILE_SECRET_KEY } from "$app/env/private";

export async function verifyTurnstile(token: string, remoteIp?: string) {
  const response = await fetch("https://challenges.cloudflare.com/turnstile/v0/siteverify", {
    method: "POST",
    body: new URLSearchParams({
      secret: TURNSTILE_SECRET_KEY,
      response: token,
      ...(remoteIp && { remoteip: remoteIp })
    }),
    signal: AbortSignal.timeout(10_000)
  });
  if (!response.ok) return false;
  const result: { success?: boolean } = await response.json();
  return result.success === true;
}
