import type { RequestHandler } from "./$types";

// An internal endpoint used to proxy images for security/privacy reasons.
export const GET: RequestHandler = async ({ request }) => {
  const url = new URL(request.url);
  const imageUrl = url.searchParams.get("url");

  // Security: Only allow requests from our own website
  // We check that the Referer header matches our own origin.
  const origin = url.origin;
  const referer = request.headers.get("referer");

  if (!referer || !referer.startsWith(origin)) {
    return new Response("Forbidden: Access allowed only from safe origin", { status: 403 });
  }

  if (!imageUrl) {
    return new Response("Missing 'url' query parameter", { status: 400 });
  }

  try {
    const targetUrl = new URL(imageUrl);

    // Security: Prevent SSRF (Server-Side Request Forgery)
    // Block attempts to access localhost or private networks
    const hostname = targetUrl.hostname.toLowerCase();
    if (
      hostname === "localhost" ||
      hostname === "127.0.0.1" ||
      hostname === "::1" ||
      hostname.startsWith("192.168.") ||
      hostname.startsWith("10.") ||
      hostname.endsWith(".local")
    ) {
      return new Response("Forbidden: Invalid image host", { status: 403 });
    }

    // Only allow http/https
    if (!["http:", "https:"].includes(targetUrl.protocol)) {
      return new Response("Forbidden: Invalid protocol", { status: 403 });
    }

    // Security: Add timeout to prevent hanging connections
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 5000); // 5 second timeout

    try {
      const response = await fetch(imageUrl, {
        signal: controller.signal,
        headers: {
          // 4. Custom User-Agent
          "User-Agent": "SkyCrypt-Image-Proxy/1.0"
        }
      });
      clearTimeout(timeoutId);

      if (!response.ok) {
        return new Response("Failed to fetch image", { status: 502 });
      }

      const contentType = response.headers.get("Content-Type") || "application/octet-stream";

      // Security: Ensure the response is actually an image
      if (!contentType.startsWith("image/")) {
        return new Response("Invalid content type", { status: 400 });
      }

      // Security: Prevent DoS via large files (e.g. 5MB limit)
      const contentLength = response.headers.get("Content-Length");
      if (contentLength && parseInt(contentLength, 10) > 5 * 1024 * 1024) {
        return new Response("Image too large", { status: 400 });
      }

      // Stream the response instead of buffering to memory
      return new Response(response.body, {
        headers: {
          "Content-Type": contentType,
          "Cache-Control": "public, max-age=2592000, immutable",
          "X-Content-Type-Options": "nosniff", // Prevent browser from sniffing content type
          // Security: CSP to prevent script execution
          "Content-Security-Policy": "default-src 'none'; img-src 'self'; sandbox"
        }
      });
    } catch (error) {
      clearTimeout(timeoutId);
      throw error;
    }
  } catch (error) {
    console.error("Image Proxy Error:", error);
    return new Response("Error fetching image", { status: 500 });
  }
};
