import { building, dev } from "$app/environment";
import { env } from "$env/dynamic/public";
import { DefaultCard } from "$src/lib/components/cards";
import ErrorCard from "$src/lib/components/cards/default/ErrorCard.svelte";
import { parseSettingsFromParams } from "$src/lib/components/cards/default/schema";
import { resolveUuidByUsername, type ModelsPlayerResolve } from "$src/lib/shared/api/orval-generated";
import {
  getCombinedProfileStats,
  getProfileNetworth,
  getProfileStats,
  getSelectedProfileStats
} from "$src/lib/shared/api/skycrypt-api.remote";
import { render } from "svelte/server";
import { Renderer, type Font, type ImageSource } from "takumi-js/node";
import { ImageResponse } from "takumi-js/response";
import type { RequestHandler } from "./$types";
import appStyles from "$routes/layout.css?inline";

const { PUBLIC_ORIGIN: baseUrl } = env;

// Create shared renderer with 64MB cache budget
const renderer = new Renderer({ cacheMaxBytes: 64 * 1024 * 1024 });

// Initialize assets once and pre-register fonts onto the renderer
const assetsPromise = setupAssetsAndRenderer();

export const GET: RequestHandler = async ({ params, request, url }) => {
  const start = performance.now();
  const { ign, profile } = params;
  const settings = parseSettingsFromParams(url.searchParams);

  // Await shared assets (fonts are already registered on `renderer`)
  const { images } = await assetsPromise;

  const isSameOrigin = request.headers.get("sec-fetch-site") === "same-origin";
  const cacheControl = dev || isSameOrigin ? "no-cache, no-store, must-revalidate" : "public, max-age=86400, immutable";

  try {
    const fetchStart = performance.now();
    const user = (await resolveUuidByUsername(ign)).data as ModelsPlayerResolve;
    const cardData = profile
      ? await fetchProfileCardData(user.uuid ?? ign, profile)
      : await fetchSelectedProfileCardData(user.uuid ?? ign);
    const fetchDuration = performance.now() - fetchStart;

    const componentRenderStart = performance.now();
    const { body, head } = render(DefaultCard, {
      props: {
        ...cardData,
        settings
      }
    });
    const componentRenderDuration = performance.now() - componentRenderStart;

    const renderStart = performance.now();
    const imageResponse = new ImageResponse(`${head}${body}`, {
      width: 1500,
      height: 340,
      quality: 80,
      format: "webp",
      headers: {
        "cache-control": cacheControl
      },
      stylesheets: [appStyles],
      emoji: "twemoji",
      signal: request.signal,
      images,
      renderer
    });

    await imageResponse.ready;
    const renderDuration = performance.now() - renderStart;
    const totalDuration = performance.now() - start;
    console.info(
      `[Card Gen] Total: ${totalDuration.toFixed(2)}ms | Fetch: ${fetchDuration.toFixed(2)}ms | Rasterize: ${renderDuration.toFixed(2)}ms | Component Render: ${componentRenderDuration.toFixed(2)}ms`
    );

    // Server-Timing header
    imageResponse.headers.set(
      "Server-Timing",
      `fetch;dur=${fetchDuration}, render;dur=${renderDuration}, total;dur=${totalDuration}, component;dur=${componentRenderDuration}`
    );
    return imageResponse;
  } catch (error) {
    console.error("Error generating image:", error);
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
        stylesheets: [appStyles],
        emoji: "twemoji",
        images,
        renderer
      });

      await errorResponse.ready;
      return errorResponse;
    } catch (err) {
      console.error("Error generating error image:", err);
      return new Response("Internal Server Error", { status: 500 });
    }
  }
};

async function fetchProfileCardData(uuid: string, profileId: string) {
  const [profileResult, networthResult, combinedResult] = await Promise.allSettled([
    getProfileStats({ uuid, profileId }),
    getProfileNetworth({ uuid, profileId }),
    getCombinedProfileStats({ uuid, profileId })
  ]);

  if (profileResult.status === "rejected") throw profileResult.reason;
  if (networthResult.status === "rejected") throw networthResult.reason;
  if (combinedResult.status === "rejected") throw combinedResult.reason;

  return {
    profile: profileResult.value,
    networth: networthResult.value,
    dungeons: combinedResult.value.dungeons
  };
}

async function fetchSelectedProfileCardData(uuid: string) {
  const profile = await getSelectedProfileStats({ uuid });
  const profileId = profile.profile_id;

  if (!profileId) throw new Error("Selected profile is missing a profile ID");

  const [networthResult, combinedResult] = await Promise.allSettled([
    getProfileNetworth({ uuid, profileId }),
    getCombinedProfileStats({ uuid, profileId })
  ]);

  if (networthResult.status === "rejected") throw networthResult.reason;
  if (combinedResult.status === "rejected") throw combinedResult.reason;

  return {
    profile,
    networth: networthResult.value,
    dungeons: combinedResult.value.dungeons
  };
}

// Single initialization routine for fetching assets and registering fonts
async function setupAssetsAndRenderer() {
  if (building) return { fonts: [], images: [] };

  const [montserratNormalBuffer, minecraftFontBuffer, skycryptLogo, skycryptBackground] = await Promise.all([
    fetch(`${baseUrl}/fonts/montserrat/montserrat-normal.woff2`).then((res) => res.arrayBuffer()),
    fetch(`${baseUrl}/fonts/minecraft/MinecraftSevenv2-Regular.woff2`).then((res) => res.arrayBuffer()),
    fetch(`${baseUrl}/favicon.png`).then((res) => res.arrayBuffer()),
    fetch(`${baseUrl}/img/bg.png`).then((res) => res.arrayBuffer())
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

  return { fonts, images };
}
