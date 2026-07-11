import { prerender, query } from "$app/server";
import { getApiCombinedUuidProfileId, getApiEmbedUuid, getApiGardenUuidProfileId, getApiInventorySearchUuidProfileIdSearchParam, getApiInventoryUuidProfileId, getApiNetworthUuidProfileId, getApiPlayerStatsUuidProfileId, getApiResourcepacks, getApiSource, getApiStatsUuidProfileId, getApiUsernameUuid, getApiUuidUsername, type ModelsProcessingError, type ModelsSourceInfo } from "$lib/shared/api/orval-generated";
import { GetApiCombinedUuidProfileIdParams, GetApiEmbedUuidParams, GetApiEmbedUuidQueryParams, GetApiGardenUuidProfileIdParams, GetApiInventorySearchUuidProfileIdSearchParamParams, GetApiInventoryUuidProfileIdParams, GetApiNetworthUuidProfileIdParams, GetApiPlayerStatsUuidProfileIdParams, GetApiStatsUuidProfileIdParams, GetApiUsernameUuidParams, GetApiUuidUsernameParams } from "$lib/shared/api/orval-generated-zod";
import { APIEndpointName } from "$types";
import { error, isHttpError } from "@sveltejs/kit";
import z from "zod";

/**
 * Type helper to extract the success data type from an API response
 * Excludes ModelsProcessingError from the union type
 */
type ExtractSuccessData<TResponse> = TResponse extends { data: infer TData } ? Exclude<TData, ModelsProcessingError> : never;

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
async function fetchSection<TResponse extends { data: unknown; status: number }>(sectionName: APIEndpointName, apiFetcher: () => Promise<TResponse>): Promise<ExtractSuccessData<TResponse>> {
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
export const getProfileStats = query(GetApiStatsUuidProfileIdParams, async ({ uuid, profileId }) => {
  return fetchSection(APIEndpointName.PROFILE, () => getApiStatsUuidProfileId(uuid, profileId));
});

/** Fetch combined section data for a specific profile */
export const getCombined = query(GetApiCombinedUuidProfileIdParams, async ({ uuid, profileId }) => {
  return fetchSection(APIEndpointName.COMBINED, () => getApiCombinedUuidProfileId(uuid, profileId));
});

/** Fetch additional stats data for a specific profile */
export const getAdditionalStats = query(GetApiPlayerStatsUuidProfileIdParams, async ({ uuid, profileId }) => {
  return fetchSection(APIEndpointName.STATS, () => getApiPlayerStatsUuidProfileId(uuid, profileId));
});

/** Fetch networth data for a specific profile */
export const getNetworth = query(GetApiNetworthUuidProfileIdParams, async ({ uuid, profileId }) => {
  return fetchSection(APIEndpointName.NETWORTH, () => getApiNetworthUuidProfileId(uuid, profileId));
});

/** Fetch all inventory tabs for a specific profile */
export const getInventories = query(GetApiInventoryUuidProfileIdParams, async ({ uuid, profileId }) => {
  return fetchSection(APIEndpointName.INVENTORY, () => getApiInventoryUuidProfileId(uuid, profileId));
});

/** Search all inventories for matching items */
export const searchInventorySection = query(GetApiInventorySearchUuidProfileIdSearchParamParams, async ({ uuid, profileId, searchParam }) => {
  return fetchSection(APIEndpointName.INVENTORY, () => getApiInventorySearchUuidProfileIdSearchParam(uuid, profileId, searchParam));
});

/** Fetch garden data for a specific profile */
export const getGarden = query(GetApiGardenUuidProfileIdParams, async ({ uuid, profileId }) => {
  return fetchSection(APIEndpointName.GARDEN, () => getApiGardenUuidProfileId(uuid, profileId));
});

/** Fetch embed data */
export const getEmbedData = query(z.object({ ...GetApiEmbedUuidParams.shape, ...GetApiEmbedUuidQueryParams.shape }), async ({ uuid, profileId }) => {
  return fetchSection(APIEndpointName.EMBED, () => getApiEmbedUuid(uuid, { profileId: profileId }));
});

/** Search user */
export const searchUser = query(GetApiUuidUsernameParams, async ({ username }) => {
  return await fetchSection(APIEndpointName.SEARCH, () => getApiUuidUsername(username));
});

export const getUsernamePrerendered = prerender(GetApiUsernameUuidParams, async ({ uuid }) => {
  return fetchSection(APIEndpointName.USERNAME, () => getApiUsernameUuid(uuid));
});

/** Fetch packs */
export const getPacks = prerender(async () => {
  return fetchSection(APIEndpointName.RESOURCEPACK, () => getApiResourcepacks());
});

/** Fetch the version of the currently running backend service. */
export const getBackendSource = query(async (): Promise<ModelsSourceInfo | null> => {
  try {
    const { data } = await getApiSource({ cache: "no-store" });
    return data;
  } catch (error) {
    console.warn("Failed to load backend version information", error);
    return null;
  }
});
