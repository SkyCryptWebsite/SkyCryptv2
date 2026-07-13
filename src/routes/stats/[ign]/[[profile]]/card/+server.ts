import { building, dev } from "$app/environment";
import { env } from "$env/dynamic/public";
import appStyles from "$routes/layout.css?inline";
import { DefaultCard } from "$src/lib/components/cards";
import ErrorCard from "$src/lib/components/cards/default/ErrorCard.svelte";
import { parseSettingsFromParams } from "$src/lib/components/cards/default/schema";
import { resolveUuidByUsername, type ModelsPlayerResolve } from "$src/lib/shared/api/orval-generated";
import { getCombinedProfileStats, getProfileNetworth, getProfileStats, getSelectedProfileStats } from "$src/lib/shared/api/skycrypt-api.remote";
import { html as toReactNode } from "satori-html";
import { render } from "svelte/server";
import { Renderer, type Font, type ImageSource } from "takumi-js/node";
import { ImageResponse } from "takumi-js/response";
import type { RequestHandler } from "./$types";

const { PUBLIC_ORIGIN: baseUrl } = env;

const { fonts, images } = await initializeAssets();

const renderer = new Renderer();

export const GET: RequestHandler = async ({ params, request, url }) => {
  const { ign, profile } = params;

  const settings = parseSettingsFromParams(url.searchParams);

  try {
    const user = (await resolveUuidByUsername(ign)).data as ModelsPlayerResolve;
    const cardData = profile ? await fetchProfileCardData(user.uuid ?? ign, profile) : await fetchSelectedProfileCardData(user.uuid ?? ign);

    const { body: renderedHTML } = render(DefaultCard, {
      props: {
        ...cardData,
        settings
      }
    });

    const isSameOrigin = request.headers.get("sec-fetch-site") === "same-origin";

    const imageResponse = new ImageResponse(toReactNode(renderedHTML), {
      width: 1500,
      height: 340,
      quality: 80,
      format: "webp",
      headers: {
        ...request.headers,
        "cache-control": dev || isSameOrigin ? "no-cache, no-store, must-revalidate" : "public, max-age=86400, immutable"
      },
      stylesheets: [appStyles],
      emoji: "twemoji",
      fonts,
      images,
      renderer
    });

    await imageResponse.ready;
    return imageResponse;
  } catch (error) {
    console.error("Error generating image:", error);
    try {
      const { body: errorHTML } = render(ErrorCard);

      const errorResponse = new ImageResponse(toReactNode(errorHTML), {
        width: 1500,
        height: 340,
        quality: 80,
        format: "webp",
        headers: {
          ...request.headers,
          "cache-control": "no-cache, no-store, must-revalidate"
        },
        stylesheets: [appStyles],
        emoji: "twemoji",
        fonts,
        images,
        renderer
      });

      await errorResponse.ready;
      return errorResponse;
    } catch (error) {
      console.error("Error generating error image:", error);
      return new Response("Internal Server Error", { status: 500 });
    }
  }
};

async function fetchProfileCardData(uuid: string, profileId: string) {
  // allSettled (not Promise.all) so a losing-side rejection is never orphaned:
  // Promise.all rejects on the first failure but leaves the others running, and
  // their later rejection becomes an unhandled rejection that crashes Node 24.
  const [profileResult, networthResult, combinedResult] = await Promise.allSettled([getProfileStats({ uuid, profileId }), getProfileNetworth({ uuid, profileId }), getCombinedProfileStats({ uuid, profileId })]);

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

  const [networthResult, combinedResult] = await Promise.allSettled([getProfileNetworth({ uuid, profileId }), getCombinedProfileStats({ uuid, profileId })]);

  if (networthResult.status === "rejected") throw networthResult.reason;
  if (combinedResult.status === "rejected") throw combinedResult.reason;

  return {
    profile,
    networth: networthResult.value,
    dungeons: combinedResult.value.dungeons
  };
}

async function initializeAssets() {
  if (building) return { fonts: [], images: [] };
  const [
    // prettier-ignore
    montserratNormalBuffer,
    minecraftFontBuffer,
    skycryptLogo,
    skycryptBackground
  ] = await Promise.all([
    // prettier-ignore
    fetch(`${baseUrl}/fonts/montserrat/montserrat-normal.woff2`).then((res) => res.arrayBuffer()),
    fetch(`${baseUrl}/fonts/minecraft/MinecraftSevenv2-Regular.woff2`).then((res) => res.arrayBuffer()),
    fetch(`${baseUrl}/favicon.png`).then((res) => res.arrayBuffer()),
    fetch(`${baseUrl}/img/bg.png`).then((res) => res.arrayBuffer())
  ]);

  const fonts: Font[] = [
    {
      name: "Montserrat",
      data: montserratNormalBuffer
    },
    {
      name: "Minecraft",
      data: minecraftFontBuffer
    }
  ];

  const images: ImageSource[] = [
    {
      src: "skycrypt-logo",
      data: skycryptLogo
    },
    {
      src: "skycrypt-background",
      data: skycryptBackground
    }
  ];

  return { fonts, images };
}
