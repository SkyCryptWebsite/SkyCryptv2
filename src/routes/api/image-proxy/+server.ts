import { log } from "evlog";
import { BlockedImageError, fetchPublicImage, limitedBody, MAX_IMAGE_BYTES } from "#lib/server/image-proxy";
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
    const response = await fetchPublicImage(new URL(imageUrl), AbortSignal.timeout(5000));

    if (!response.statusCode || response.statusCode < 200 || response.statusCode >= 300) {
      response.resume();
      return new Response("Failed to fetch image", { status: 502 });
    }

    const contentType = response.headers["content-type"] || "application/octet-stream";

    // Security: Ensure the response is actually an image
    if (!contentType.startsWith("image/")) {
      response.resume();
      return new Response("Invalid content type", { status: 400 });
    }

    // Security: Prevent DoS via large files. limitedBody also enforces this while streaming.
    if (Number(response.headers["content-length"]) > MAX_IMAGE_BYTES) {
      response.destroy();
      return new Response("Image too large", { status: 400 });
    }

    return new Response(limitedBody(response), {
      headers: {
        "Content-Type": contentType,
        "Cache-Control": "public, max-age=2592000, immutable",
        "X-Content-Type-Options": "nosniff", // Prevent browser from sniffing content type
        // Security: CSP to prevent script execution
        "Content-Security-Policy": "default-src 'none'; img-src 'self'; sandbox"
      }
    });
  } catch (error) {
    if (error instanceof BlockedImageError) {
      return new Response("Forbidden: Invalid image host", { status: 403 });
    }
    log.error({ action: "image_proxy.failed", error });
    return new Response("Error fetching image", { status: 500 });
  }
};
