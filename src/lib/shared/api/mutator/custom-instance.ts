import { building } from "$app/env";
import { SERVER_API_TOKEN } from "$app/env/private";
import { PUBLIC_SERVER_API_URL } from "$app/env/public";
import { getRequestEvent } from "$app/server";

// NOTE: Supports cases where `content-type` is other than `json`
const getBody = <T>(c: Response | Request): Promise<T> => {
  const contentType = c.headers.get("content-type");

  if (contentType && contentType.includes("application/json")) {
    return c.json();
  }

  return c.text() as Promise<T>;
};

// NOTE: Update just base url
const getUrl = (contextUrl: string): string => {
  // Remove the trailing /api/ if present
  const baseUrl = PUBLIC_SERVER_API_URL.replace(/\/api\/?$/, "");
  const requestUrl = new URL(`${baseUrl}${contextUrl}`);

  return requestUrl.toString();
};

// NOTE: Add headers
const getHeaders = (headers?: HeadersInit): HeadersInit => {
  try {
    const { request } = getRequestEvent();

    // Convert the request Headers object to a plain object
    const requestHeadersObj: Record<string, string> = {};
    request.headers.forEach((value, key) => {
      requestHeadersObj[key] = value;
    });

    const mergedHeaders: HeadersInit = {
      ...requestHeadersObj,
      ...headers,
      "X-API-Token": SERVER_API_TOKEN
    };

    return mergedHeaders;
  } catch {
    return {
      ...headers,
      "X-API-Token": SERVER_API_TOKEN
    };
  }
};

export const customFetch = async <T>(url: string, options: RequestInit): Promise<T> => {
  let fetchFunction = fetch;
  // During prerender, event.fetch resolves URLs on ORIGIN's host through the app's own router, so the
  // backend (served on that same host) is never reached and every call 404s. Use the global fetch instead.
  if (!building) {
    try {
      const event = getRequestEvent();
      fetchFunction = event.fetch;
    } catch {
      // Ignore this, we just won't have access to the request for this call
    }
  }

  const requestUrl = getUrl(url);
  const requestHeaders = getHeaders(options.headers);

  const requestInit: RequestInit = {
    ...options,
    headers: requestHeaders
  };

  const method = options.method ?? "GET";
  const startedAt = Date.now();
  if (building) {
    const sentHeaders = Object.fromEntries(new Headers(requestHeaders).entries());
    if (sentHeaders["x-api-token"]) sentHeaders["x-api-token"] = `<redacted len=${sentHeaders["x-api-token"].length}>`;
    delete sentHeaders.cookie;
    console.info(
      `[prerender-fetch] -> ${method} ${requestUrl} (PUBLIC_SERVER_API_URL=${PUBLIC_SERVER_API_URL}, ` +
        `tokenSet=${SERVER_API_TOKEN.length > 0}, eventFetch=${fetchFunction !== fetch}) headers=${JSON.stringify(sentHeaders)}`
    );
  }

  const response = await fetchFunction(requestUrl, requestInit);
  const data = await getBody<T>(response);

  if (building) {
    const preview = typeof data === "string" ? data : JSON.stringify(data);
    console.info(
      `[prerender-fetch] <- ${response.status} ${method} ${response.url || requestUrl} in ${Date.now() - startedAt}ms ` +
        `redirected=${response.redirected} content-type=${response.headers.get("content-type")} ` +
        `body=${preview.slice(0, 300)}`
    );
  }

  return { status: response.status, data, headers: response.headers } as T;
};
