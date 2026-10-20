import { building, dev } from "$app/env";
import { PUBLIC_ORIGIN as baseUrl } from "$app/env/public";
import { DefaultCard } from "$src/lib/components/cards";
import ErrorCard from "$src/lib/components/cards/default/ErrorCard.svelte";
import { parseSettingsFromParams } from "$src/lib/components/cards/default/schema";
import {
  getCombinedProfileStats,
  getProfileNetworth,
  getProfileStats,
  getSelectedProfileStats
} from "$src/lib/shared/api/skycrypt-api.remote";
import { log } from "evlog";
import { render } from "svelte/server";
import { Renderer, type Font, type ImageSource } from "takumi-js/node";
import { ImageResponse } from "takumi-js/response";
import type { RequestHandler } from "./$types";
import appStyles from "$routes/layout.css?inline";

// Create shared renderer with 64MB cache budget
const renderer = new Renderer({ cacheMaxBytes: 64 * 1024 * 1024 });

let assetsPromise: Promise<{ images: ImageSource[] }> | undefined;
const loadAssets = () => (assetsPromise ??= setupAssetsAndRenderer());
loadAssets();

// shortcut: a fixed guess, not load-tested. Tune it, or make it an env var, once real burst numbers exist.
const MAX_CONCURRENT_CARDS = 16;
let cardsInFlight = 0;

export const GET: RequestHandler = async (event) => {
  if (cardsInFlight >= MAX_CONCURRENT_CARDS) {
    return new Response("Too many card renders, try again shortly", { status: 503, headers: { "retry-after": "5" } });
  }
  cardsInFlight++;
  try {
    return await renderCard(event);
  } finally {
    cardsInFlight--;
  }
};

async function renderCard({ params, request, url, locals }: Parameters<RequestHandler>[0]) {
  const start = performance.now();
  const { ign, profile } = params;
  const settings = parseSettingsFromParams(url.searchParams);

  // Await shared assets
  const { images } = await loadAssets();

  const isSameOrigin = request.headers.get("sec-fetch-site") === "same-origin";
  const cacheControl = dev || isSameOrigin ? "no-cache, no-store, must-revalidate" : "public, max-age=86400, immutable";

  try {
    const fetchStart = performance.now();
    const fetchPlayerImage = (uuid: string) =>
      fetchAssetBuffer(`https://nmsr.nickac.dev/fullbody/${uuid}?no=shadow`, "Player Image", request.signal);
    const { playerImage, ...cardData } = profile
      ? await fetchProfileCardData(ign, profile, fetchPlayerImage)
      : await fetchSelectedProfileCardData(ign, fetchPlayerImage);
    const fetchDuration = performance.now() - fetchStart;

    const componentRenderStart = performance.now();
    const { body, head } = render(DefaultCard, {
      props: {
        ...cardData,
        settings
      }
    });
    const html = `${head}${body}`;
    const componentRenderDuration = performance.now() - componentRenderStart;

    // 3. Measure Image Rasterization
    const renderStart = performance.now();
    const imageResponse = new ImageResponse(html, {
      width: 1500,
      height: 340,
      quality: 80,
      format: "webp",
      headers: {
        "cache-control": cacheControl
      },
      css: appStyles,
      emoji: "twemoji",
      signal: request.signal,
      images: [...images, { src: "player", data: playerImage, cache: "none" }],
      renderer,
      onError: () => {}
    });

    await imageResponse.ready;
    const renderDuration = performance.now() - renderStart;

    const totalDuration = performance.now() - start;
    locals.log.set({
      card: {
        totalMs: Math.round(totalDuration),
        fetchMs: Math.round(fetchDuration),
        componentMs: Math.round(componentRenderDuration),
        rasterizeMs: Math.round(renderDuration)
      }
    });

    // Server-Timing header
    imageResponse.headers.set(
      "Server-Timing",
      `fetch;dur=${fetchDuration.toFixed(2)}, component;dur=${componentRenderDuration.toFixed(2)}, render;dur=${renderDuration.toFixed(2)}, total;dur=${totalDuration.toFixed(2)}`
    );

    return imageResponse;
  } catch (error) {
    if (request.signal.aborted) return new Response(null, { status: 499 });
    log.error({
      action: "card.generate_failed",
      ign,
      profile,
      preRegisteredImages: images.map((img) => ({ src: img.src, byteLength: img.data.byteLength })),
      error
    });

    try {
      const { head, body } = render(ErrorCard);

      const errorResponse = new ImageResponse(`${head}${body}`, {
        width: 1500,
        height: 340,
        quality: 80,
        format: "webp",
        headers: {
          "cache-control": "no-cache, no-store, must-revalidate"
        },
        css: appStyles,
        emoji: "twemoji",
        images,
        renderer,
        onError: () => {}
      });

      await errorResponse.ready;
      return errorResponse;
    } catch (err) {
      log.error({ action: "card.error_card_failed", ign, profile, error: err });
      return new Response("Internal Server Error", { status: 500 });
    }
  }
}

type PlayerImageFetcher = (uuid: string) => Promise<ArrayBuffer>;

async function fetchProfileCardData(ign: string, profileId: string, fetchPlayerImage: PlayerImageFetcher) {
  const profilePromise = Promise.resolve(getProfileStats({ uuid: ign, profileId }));
  const [profileResult, networthResult, combinedResult, playerImageResult] = await Promise.allSettled([
    profilePromise,
    getProfileNetworth({ uuid: ign, profileId }),
    getCombinedProfileStats({ uuid: ign, profileId }),
    profilePromise.then((profile) => fetchPlayerImage(profile.uuid ?? ign))
  ]);

  if (profileResult.status === "rejected") throw profileResult.reason;
  if (networthResult.status === "rejected") throw networthResult.reason;
  if (combinedResult.status === "rejected") throw combinedResult.reason;
  if (playerImageResult.status === "rejected") throw playerImageResult.reason;

  return {
    profile: profileResult.value,
    networth: networthResult.value,
    dungeons: combinedResult.value.dungeons,
    playerImage: playerImageResult.value
  };
}

async function fetchSelectedProfileCardData(ign: string, fetchPlayerImage: PlayerImageFetcher) {
  const profile = await getSelectedProfileStats({ uuid: ign });
  const profileId = profile.profile_id;
  const uuid = profile.uuid ?? ign;

  if (!profileId) throw new Error("Selected profile is missing a profile ID");

  const [networthResult, combinedResult, playerImageResult] = await Promise.allSettled([
    getProfileNetworth({ uuid, profileId }),
    getCombinedProfileStats({ uuid, profileId }),
    fetchPlayerImage(uuid)
  ]);

  if (networthResult.status === "rejected") throw networthResult.reason;
  if (combinedResult.status === "rejected") throw combinedResult.reason;
  if (playerImageResult.status === "rejected") throw playerImageResult.reason;

  return {
    profile,
    networth: networthResult.value,
    dungeons: combinedResult.value.dungeons,
    playerImage: playerImageResult.value
  };
}

/** Validates external asset buffers, checks HTTP status, and verifies that responses aren't HTML error/redirect pages. */
async function fetchAssetBuffer(url: string, assetName: string, signal?: AbortSignal): Promise<ArrayBuffer> {
  const res = await fetch(url, { signal });
  if (!res.ok) {
    throw new Error(`[Asset Fetch Failed] ${assetName} (${url}) returned HTTP ${res.status}: ${res.statusText}`);
  }

  const contentLength = res.headers.get("content-length");
  if (contentLength && Number(contentLength) > 8 * 1024 * 1024) {
    throw new Error(`[Asset Fetch Too Large] ${assetName} (${url}) exceeded the 8 MiB limit.`);
  }

  const buffer = await res.arrayBuffer();
  if (buffer.byteLength === 0) {
    throw new Error(`[Asset Fetch Empty] ${assetName} (${url}) returned an empty buffer.`);
  }
  if (buffer.byteLength > 8 * 1024 * 1024) {
    throw new Error(`[Asset Fetch Too Large] ${assetName} (${url}) exceeded the 8 MiB limit.`);
  }

  const header = new Uint8Array(buffer.slice(0, 4));

  // Detect HTML error pages (e.g. '<!DO' or '<htm') returned with 200 OK
  if (header[0] === 0x3c) {
    const textPreview = new TextDecoder().decode(buffer.slice(0, 150));
    throw new Error(`[Corrupt Asset] ${assetName} returned HTML instead of raw binary: ${textPreview}`);
  }

  return buffer;
}

// Single initialization routine for fetching assets and registering fonts
async function setupAssetsAndRenderer() {
  if (building) return { images: [] };

  try {
    const [montserratNormalBuffer, minecraftFontBuffer, skycryptLogo, skycryptBackground] = await Promise.all([
      fetchAssetBuffer(`${baseUrl}/fonts/montserrat/montserrat-normal.woff2`, "Montserrat Font"),
      fetchAssetBuffer(`${baseUrl}/fonts/minecraft/MinecraftSevenv2-Regular.woff2`, "Minecraft Font"),
      fetchAssetBuffer(`${baseUrl}/favicon.png`, "Skycrypt Logo"),
      fetchAssetBuffer(`${baseUrl}/img/bg.png`, "Skycrypt Background")
    ]);

    const fonts: Font[] = [
      { name: "Montserrat", data: montserratNormalBuffer },
      { name: "Minecraft", data: minecraftFontBuffer }
    ];

    const images: ImageSource[] = [
      { src: "skycrypt-logo", data: skycryptLogo },
      { src: "skycrypt-background", data: skycryptBackground }
    ];

    // Register fonts once on startup
    for (const font of fonts) {
      await renderer.registerFont(font);
    }

    return { images };
  } catch (err) {
    log.error({ action: "card.init_assets_failed", error: err });
    assetsPromise = undefined;
    return { images: [] };
  }
}
