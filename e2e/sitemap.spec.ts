import { expect, test } from "@playwright/test";

const ORIGIN = "https://sky.shiiyu.moe";

test("/sitemap.xml exposes only complete public URLs", async ({ request }) => {
  const response = await request.get("/sitemap.xml");

  expect(response.status()).toBe(200);
  expect(response.headers()["content-type"]).toContain("application/xml");
  expect(response.headers()["cache-control"]).toBe("max-age=0, s-maxage=3600");

  const body = await response.text();
  const locations = [...body.matchAll(/<loc>([^<]+)<\/loc>/g)].map((match) => match[1]);
  const urls = locations.map((location) => new URL(location));
  const paths = urls.map((url) => url.pathname);

  expect(locations.length).toBeGreaterThanOrEqual(2);
  expect(urls.every((url) => url.origin === ORIGIN)).toBe(true);
  expect(paths).toContain("/");
  expect(paths).toContain("/newsroom");
  expect(paths).not.toContain("/login");
  expect(paths).not.toContain("/dashboard");
  expect(paths).not.toContain("/sitemap.xml");
  expect(paths.some((path) => path === "/api" || path.startsWith("/api/"))).toBe(false);
  expect(locations.some((location) => location.includes("[ign]") || location.includes("[[profile]]") || location.includes("[slug]"))).toBe(false);
});
