import { CACHED_EMOJIS } from "$constants/emojis";
import { DISCORD_WEBHOOK, HYPIXEL_API_KEY } from "$env/static/private";
import { isPlayer } from "$params/player";
import { isUUID } from "$params/uuid";
import type { Profile, ProfilesResponse } from "$types/global";
import { SkyCryptError } from "./constants/error";
import { REDIS } from "./db/redis";

const headers = { Accept: "application/json", "User-Agent": "SkyCrypt", "API-KEY": HYPIXEL_API_KEY };

export async function getProfiles(paramPlayer: string) {
  const uuid = await getUUID(paramPlayer);
  if (!uuid) {
    throw new SkyCryptError("Player not found");
  }

  const profiles = await fetchProfiles(uuid);
  const output = [];
  for (const profile of profiles) {
    output.push({
      profile_id: profile.profile_id,
      cute_name: profile.cute_name,
      game_mode: profile.game_mode ?? "normal",
      selected: profile.selected
    });
  }

  return output;
}

export async function fetchProfiles(uuid: string, options = { cache: false }): Promise<Profile[]> {
  if (!isUUID(uuid)) {
    uuid = await getUUID(uuid, options);
  }

  const cache = await REDIS.get(`PROFILES:${uuid}`);
  if (cache) {
    return JSON.parse(cache);
  }

  const response = await fetch(`https://api.hypixel.net/v2/skyblock/profiles?uuid=${uuid}`, {
    headers
  });

  const data: ProfilesResponse = await response.json();
  if (data.success === false) {
    throw new SkyCryptError(data?.cause ?? "Request to Hypixel API failed. Please try again!");
  }

  const { profiles } = data;
  if (!profiles || profiles.length === 0) {
    throw new SkyCryptError("No profiles found");
  }

  // 5 minutes
  REDIS.SETEX(`PROFILES:${uuid}`, 60 * 5, JSON.stringify(profiles));

  return profiles;
}

export async function getUUID(paramPlayer: string, options = { cache: false }) {
  if (isUUID(paramPlayer)) {
    return paramPlayer;
  }

  const uuid = await REDIS.get(`UUID:${paramPlayer}`);
  if (uuid && options.cache) {
    return uuid;
  }

  const data = await resolveUsernameOrUUID(paramPlayer);
  if (data.id) {
    // 24 hours
    REDIS.SETEX(`UUID:${paramPlayer}`, 60 * 60 * 24, data.id);
    return data.id;
  }

  return null;
}

export async function getUsername(paramPlayer: string, options = { cache: false }) {
  if (isPlayer(paramPlayer) && isUUID(paramPlayer) === false) {
    return paramPlayer;
  }

  const username = await REDIS.get(`USERNAME:${paramPlayer}`);
  if (username && options.cache) {
    return username ?? paramPlayer;
  }

  const data = await resolveUsernameOrUUID(paramPlayer);
  if (data.name) {
    // 24 hours
    REDIS.SETEX(`UUID:${data.name}`, 60 * 60 * 24, paramPlayer);
    REDIS.SETEX(`USERNAME:${paramPlayer}`, 60 * 60 * 24, data.name);
    return data.name;
  }

  return null;
}

async function resolveUsernameOrUUID(paramPlayer: string) {
  const response = await fetch(`https://mowojang.matdoes.dev/${paramPlayer}`);
  if (response.status === 204) {
    throw new SkyCryptError("Player not found");
  }

  const data = await response.json();
  if (data.errorMessage) {
    throw new SkyCryptError(data.errorMessage);
  }

  return data;
}

export async function getProfile(uuid: string, profileId: string | null, options = { cache: false }) {
  const profiles = await fetchProfiles(uuid, options);

  const profile = (profileId && profiles.find((p) => p.cute_name.toUpperCase() === profileId.toUpperCase() || p.profile_id === profileId)) ?? profiles.find((p) => p.selected);
  if (!profile) {
    throw new SkyCryptError("Profile not found");
  }

  profile.uuid = await getUUID(uuid, options);

  return profile;
}

export async function fetchPlayer(uuid: string, options = { cache: false }) {
  if (!isUUID(uuid)) {
    uuid = await getUUID(uuid, options);
  }

  const cache = await REDIS.get(`PLAYER:${uuid}`);
  if (cache) {
    return JSON.parse(cache);
  }

  const response = await fetch(`https://api.hypixel.net/v2/player?uuid=${uuid}`, {
    headers
  });

  const data = await response.json();
  if (data.success === false) {
    throw new SkyCryptError(data?.cause ?? "Request to Hypixel API failed. Please try again!");
  }

  // 30 minutes
  REDIS.SETEX(`PLAYER:${uuid}`, 60 * 30, JSON.stringify(data.player));

  return data.player;
}

export async function fetchMuseum(profileId: string) {
  const cache = await REDIS.get(`MUSEUM:${profileId}`);
  if (cache) {
    return JSON.parse(cache);
  }

  const response = await fetch(`https://api.hypixel.net/v2/skyblock/museum?profile=${profileId}`, {
    headers
  });

  const data = await response.json();
  if (data.success === false) {
    throw new SkyCryptError(data?.cause ?? "Request to Hypixel API failed. Please try again!");
  }

  const { members } = data;
  if (!members || Object.keys(members).length === 0) {
    return null;
  }

  // 30 minutes
  REDIS.SETEX(`MUSEUM:${profileId}`, 60 * 30, JSON.stringify(members));

  return members;
}

export function getDisplayName(username: string, paramPlayer: string): string {
  const emoji = CACHED_EMOJIS.get(paramPlayer);
  if (emoji) {
    return `${username} ${emoji}`;
  }

  return username;
}

export async function sendWebhookMessage(
  e: Error,
  {
    uuid,
    username,
    profileCuteName,
    profileId
  }: {
    uuid: string;
    username: string;
    profileCuteName: string;
    profileId: string;
  }
) {
  try {
    if (DISCORD_WEBHOOK === undefined || DISCORD_WEBHOOK.length === 0) {
      return;
    }

    const description = [`Username: \`${username}\` (\`${uuid}\`)`, `Profile: \`${profileCuteName}\` (\`${profileId}\`)`, `Link: https://sky.shiiyu.moe/stats/${username}${profileCuteName ? `/${profileCuteName}` : ""}`, `\`\`\`${e.stack}\`\`\``];

    const embed = {
      title: "Error",
      description: description.join("\n"),
      color: 16711680
    };

    await fetch(DISCORD_WEBHOOK, {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({ embeds: [embed] })
    });
  } catch (e) {
    console.error(e);
  }
}
