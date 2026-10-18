import { PUBLIC_DISCORD_INVITE } from "$app/env/public";
import { gameModeIcons } from "$src/lib/shared/constants/game-modes";
import type { APIContainerComponent } from "discord-api-types/v10";
import type { ModelsEmbedData } from "#lib/shared/api/orval-generated.js";
import { getLongDescription } from "#lib/shared/embedGenerator.js";

export function createDiscordEmbed(data: ModelsEmbedData) {
  const color =
    [data.rank?.plusColor, data.rank?.rankColor].find((value) => /^#[\da-f]{6}$/i.test(value ?? "")) || "#282828";
  const username = encodeURIComponent(data.username || "");
  const profile = encodeURIComponent(data.profile_cute_name || "");
  const profileUrl = `https://sky.shiiyu.moe/stats/${username}/${profile}`;
  const trackingParams = "?utm_source=SkyCrypt&utm_campaign=DiscordEmbed";
  const rank = data.rank?.rankText ? ` [${data.rank.rankText + data.rank.plusText}] ` : "";
  const gameModeIcon = gameModeIcons[data.game_mode as keyof typeof gameModeIcons];
  const profileName = data.profile_cute_name
    ? ` (${data.profile_cute_name}${gameModeIcon ? " " + gameModeIcon : ""})`
    : "";

  const title =
    rank + (data.displayName || data.username) + profileName.replace(/[\\[\]*_`<>]/g, "\\$&").replace(/[\r\n]/g, " ");
  const summary = {
    type: 10 as const,
    content: `### [${title}](${profileUrl})\n${getLongDescription(data).trim()}`
  };

  return {
    component: {
      type: 17,
      accent_color: Number.parseInt(color.slice(1), 16),
      components: [
        data.uuid
          ? {
              type: 9,
              components: [summary],
              accessory: {
                type: 11,
                media: { url: `https://nmsr.nickac.dev/bust/${encodeURIComponent(data.uuid)}?y=-20` }
              }
            }
          : summary,
        { type: 14, divider: true, spacing: 1 },
        {
          type: 1,
          components: [
            {
              type: 2,
              style: 5,
              label: "SkyCrypt",
              url: `${profileUrl}${trackingParams}`,
              emoji: { id: "1558259246070505512", name: "skycrypt" }
            },
            {
              type: 2,
              style: 5,
              label: "SkyCrypt Discord",
              url: PUBLIC_DISCORD_INVITE,
              emoji: { id: "1558259241679196280", name: "discord" }
            },
            {
              type: 2,
              style: 5,
              label: "Plancke",
              url: `https://plancke.io/hypixel/player/stats/${username}${trackingParams}`,
              emoji: { id: "1558259244275597414", name: "plancke" }
            },
            {
              type: 2,
              style: 5,
              label: "Elite",
              url: `https://eliteskyblock.com/@${username}/${profile}${trackingParams}`,
              emoji: { id: "1558259242828435507", name: "elite" }
            }
          ]
        },
        { type: 10, content: `-# SkyCrypt • v${__NPM_PACKAGE_VERSION__}` }
      ]
    }
  } satisfies { component: APIContainerComponent };
}

export function serializeDiscordEmbed(embed: { component: APIContainerComponent }): string {
  return JSON.stringify(embed).replace(/</g, "\\u003c").replace(/>/g, "\\u003e").replace(/&/g, "\\u0026");
}
