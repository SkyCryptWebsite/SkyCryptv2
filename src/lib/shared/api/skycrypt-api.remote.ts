import { prerender, query } from "$app/server";
import {
  getCombinedProfileStats as getCombinedProfileStatsRequest,
  getGardenStats as getGardenStatsRequest,
  getPlayerStats as getPlayerStatsRequest,
  getProfileEmbed as getProfileEmbedRequest,
  getProfileInventory as getProfileInventoryRequest,
  getProfileNetworth as getProfileNetworthRequest,
  getProfileStats as getProfileStatsRequest,
  getSelectedProfileEmbed as getSelectedProfileEmbedRequest,
  getSelectedProfileStats as getSelectedProfileStatsRequest,
  getSourceInfo as getSourceInfoRequest,
  listResourcePacks as listResourcePacksRequest,
  resolveUsernameByUuid as resolveUsernameByUuidRequest,
  resolveUuidByUsername as resolveUuidByUsernameRequest,
  searchProfileInventory as searchProfileInventoryRequest,
  type ModelsProcessingError,
  type ModelsSourceInfo
} from "$lib/shared/api/orval-generated";
import {
  GetCombinedProfileStatsParams,
  GetGardenStatsParams,
  GetPlayerStatsParams,
  GetProfileEmbedParams,
  GetProfileInventoryParams,
  GetProfileNetworthParams,
  GetProfileStatsParams,
  GetSelectedProfileEmbedParams,
  GetSelectedProfileStatsParams,
  ResolveUsernameByUuidParams,
  ResolveUuidByUsernameParams,
  SearchProfileInventoryParams
} from "$lib/shared/api/orval-generated-zod";
import { APIEndpointName } from "$types";
import { error, isHttpError } from "@sveltejs/kit";

/**
 * Type helper to extract the success data type from an API response
 * Excludes ModelsProcessingError from the union type
 */
type ExtractSuccessData<TResponse> = TResponse extends { data: infer TData }
  ? Exclude<TData, ModelsProcessingError>
  : never;

/**
 * Generic helper function to handle API fetching with consistent error handling
 * Reduces boilerplate for API section fetching
 * Automatically infers the return type from the API response, excluding error types
 *
 * @param sectionName - Name of the section being fetched (used for logging)
 * @param apiFetcher - Function that calls the API endpoint
 * @returns The success data type, excluding ModelsProcessingError
 * @throws SvelteKit error if the API returns an error or the request fails
 */
async function fetchSection<TResponse extends { data: unknown; status: number }>(
  sectionName: APIEndpointName,
  apiFetcher: () => Promise<TResponse>
): Promise<ExtractSuccessData<TResponse>> {
  try {
    const { data, status } = await apiFetcher();
    // Check if the API returned a processing error
    if (typeof data === "object" && data !== null && "error" in data && data.error) {
      console.error(`API returned an error for ${sectionName}:`, data);
      error(status, data.error as string);
    }
    return data as ExtractSuccessData<TResponse>;
  } catch (err) {
    if (isHttpError(err)) {
      console.error(`HTTP error fetching ${sectionName} section data:`, err);
      error(err.status, err.body);
    }
    console.error(`Error fetching ${sectionName} section data:`, err);
    error(500, `Failed to fetch ${sectionName} section data`);
  }
}

/** Fetch player stats for a specific profile */
export const getProfileStats = query(GetProfileStatsParams, async ({ uuid, profileId }) => {
  return fetchSection(APIEndpointName.PROFILE, () => getProfileStatsRequest(uuid, profileId));
});

/** Fetch player stats for the selected profile */
export const getSelectedProfileStats = query(GetSelectedProfileStatsParams, async ({ uuid }) => {
  return fetchSection(APIEndpointName.PROFILE, () => getSelectedProfileStatsRequest(uuid));
});

/** Fetch combined section data for a specific profile */
export const getCombinedProfileStats = query(GetCombinedProfileStatsParams, async ({ uuid, profileId }) => {
  return fetchSection(APIEndpointName.COMBINED, () => getCombinedProfileStatsRequest(uuid, profileId));
});

/** Fetch additional stats data for a specific profile */
export const getPlayerStats = query(GetPlayerStatsParams, async ({ uuid, profileId }) => {
  return fetchSection(APIEndpointName.STATS, () => getPlayerStatsRequest(uuid, profileId));
});

/** Fetch networth data for a specific profile */
export const getProfileNetworth = query(GetProfileNetworthParams, async ({ uuid, profileId }) => {
  return fetchSection(APIEndpointName.NETWORTH, () => getProfileNetworthRequest(uuid, profileId));
});

/** Fetch all inventory tabs for a specific profile */
export const getProfileInventory = query(GetProfileInventoryParams, async ({ uuid, profileId }) => {
  return fetchSection(APIEndpointName.INVENTORY, () => getProfileInventoryRequest(uuid, profileId));
});

/** Search all inventories for matching items */
export const searchProfileInventory = query(SearchProfileInventoryParams, async ({ uuid, profileId, searchParam }) => {
  return fetchSection(APIEndpointName.INVENTORY, () => searchProfileInventoryRequest(uuid, profileId, searchParam));
});

/** Fetch garden data for a specific profile */
export const getGardenStats = query(GetGardenStatsParams, async ({ uuid, profileId }) => {
  return fetchSection(APIEndpointName.GARDEN, () => getGardenStatsRequest(uuid, profileId));
});

/** Fetch embed data for a specific profile */
export const getProfileEmbed = query(GetProfileEmbedParams, async ({ uuid, profileId }) => {
  return fetchSection(APIEndpointName.EMBED, () => getProfileEmbedRequest(uuid, profileId));
});

/** Fetch embed data for the selected profile */
export const getSelectedProfileEmbed = query(GetSelectedProfileEmbedParams, async ({ uuid }) => {
  return fetchSection(APIEndpointName.EMBED, () => getSelectedProfileEmbedRequest(uuid));
});

/** Resolve a username to a UUID */
export const resolveUuidByUsername = query(ResolveUuidByUsernameParams, async ({ username }) => {
  return fetchSection(APIEndpointName.SEARCH, () => resolveUuidByUsernameRequest(username));
});

/** Resolve a UUID to a username */
export const resolveUsernameByUuid = prerender(ResolveUsernameByUuidParams, async ({ uuid }) => {
  return fetchSection(APIEndpointName.USERNAME, () => resolveUsernameByUuidRequest(uuid));
});

/** Fetch resource packs */
export const listResourcePacks = prerender(async () => {
  return fetchSection(APIEndpointName.RESOURCEPACK, () => listResourcePacksRequest());
});

/** Fetch the source information for the currently running backend service. */
export const getSourceInfo = query(async (): Promise<ModelsSourceInfo | null> => {
  try {
    const { data } = await getSourceInfoRequest({ cache: "no-store" });
    return data;
  } catch (error) {
    console.warn("Failed to load backend version information", error);
    return null;
  }
});
