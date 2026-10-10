import { SERVER_CMS_API_URL } from "$app/env/private";
import { PUBLIC_CMS_URL } from "$app/env/public";
import { getRequestEvent } from "$app/server";
import { error } from "@sveltejs/kit";

// NOTE: Supports cases where `content-type` is other than `json`
const getBody = <T>(c: Response | Request): Promise<T> => {
  const contentType = c.headers.get("content-type");

  if (contentType && contentType.includes("application/json")) {
    return c.json();
  }

  return c.text() as Promise<T>;
};

// NOTE: Resolve against the CMS base url (server-only, falls back to the public url).
const getUrl = (contextUrl: string): string => {
  const base = SERVER_CMS_API_URL || PUBLIC_CMS_URL;
  if (!base) error(500, "CMS URL not configured");
  // The OpenAPI paths already include the `/api` prefix, so strip a trailing one from the base.
  const baseUrl = base.replace(/\/api\/?$/, "");
  return new URL(`${baseUrl}${contextUrl}`).toString();
};

export const cmsFetch = async <T>(url: string, options: RequestInit): Promise<T> => {
  let fetchFunction = fetch;
  try {
    const event = getRequestEvent();
    fetchFunction = event.fetch;
  } catch {
    // Ignore this, we just won't have access to the request for this call
  }

  const requestUrl = getUrl(url);

  const response = await fetchFunction(requestUrl, options);
  const data = await getBody<T>(response);

  return { status: response.status, data, headers: response.headers } as T;
};
