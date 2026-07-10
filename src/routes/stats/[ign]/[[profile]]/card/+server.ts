import { building, dev } from "$app/environment";
import { env } from "$env/dynamic/public";
import appStyles from "$routes/layout.css?inline";
import { DefaultCard } from "$src/lib/components/cards";
import ErrorCard from "$src/lib/components/cards/default/ErrorCard.svelte";
import { parseSettingsFromParams } from "$src/lib/components/cards/default/schema";
import { getApiUuidUsername, type ModelsPlayerResolve } from "$src/lib/shared/api/orval-generated";
import { getCombined, getNetworth, getProfileStats } from "$src/lib/shared/api/skycrypt-api.remote";
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
    const user = (await getApiUuidUsername(ign)).data as ModelsPlayerResolve;
    // allSettled (not Promise.all) so a losing-side rejection is never orphaned:
    // Promise.all rejects on the first failure but leaves the others running, and
    // their later rejection becomes an unhandled rejection that crashes Node 24.
    const [
      // prettier-ignore
      profileResult,
      networthResult,
      combinedResult
    ] = await Promise.allSettled([
      // prettier-ignore
      getProfileStats({ uuid: user.uuid ?? ign, profileId: profile ?? "" }),
      getNetworth({ uuid: user.uuid ?? ign, profileId: profile ?? "" }),
      getCombined({ uuid: user.uuid ?? ign, profileId: profile ?? "" })
    ]);

    if (profileResult.status === "rejected") throw profileResult.reason;
    if (networthResult.status === "rejected") throw networthResult.reason;
    if (combinedResult.status === "rejected") throw combinedResult.reason;

    const profileData = profileResult.value;
    const networthData = networthResult.value;
    const combinedData = combinedResult.value;

    const { body: renderedHTML } = render(DefaultCard, {
      props: {
        profile: profileData,
        networth: networthData,
        dungeons: combinedData.dungeons,
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
