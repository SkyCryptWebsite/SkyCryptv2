import { lookup, type LookupAddress } from "node:dns";
import http, { type IncomingMessage } from "node:http";
import https from "node:https";
import { BlockList, isIP, type LookupFunction } from "node:net";
import { Readable } from "node:stream";

export const MAX_IMAGE_BYTES = 5 * 1024 * 1024;
const MAX_REDIRECTS = 3;

/** The URL points at an internal address or a non-http(s) protocol. */
export class BlockedImageError extends Error {}

// Loopback, private, link-local (cloud metadata), CGNAT, multicast and reserved ranges.
// BlockList also matches IPv4-mapped IPv6 addresses such as ::ffff:127.0.0.1 against the IPv4 rules.
const blocked = new BlockList();
for (const [network, prefix] of [
  ["0.0.0.0", 8],
  ["10.0.0.0", 8],
  ["100.64.0.0", 10],
  ["127.0.0.0", 8],
  ["169.254.0.0", 16],
  ["172.16.0.0", 12],
  ["192.0.0.0", 24],
  ["192.168.0.0", 16],
  ["198.18.0.0", 15],
  ["224.0.0.0", 3]
] as const) {
  blocked.addSubnet(network, prefix, "ipv4");
}
for (const [network, prefix] of [
  ["::", 127],
  ["64:ff9b::", 96],
  ["fc00::", 7],
  ["fe80::", 10],
  ["ff00::", 8]
] as const) {
  blocked.addSubnet(network, prefix, "ipv6");
}

export function isPublicAddress(address: string): boolean {
  const family = isIP(address);
  return family !== 0 && !blocked.check(address, family === 6 ? "ipv6" : "ipv4");
}

// Checks every address at connect time, so a hostname that resolves (or later rebinds) to an internal IP is refused.
const publicOnlyLookup: LookupFunction = (hostname, options, callback) => {
  lookup(hostname, { ...options, all: true }, (error, addresses: LookupAddress[]) => {
    if (error) return callback(error, "", 0);
    const internal = addresses.find(({ address }) => !isPublicAddress(address));
    if (internal) return callback(new BlockedImageError(`Blocked internal address ${internal.address}`), "", 0);
    if (options.all) return (callback as unknown as (err: null, addresses: LookupAddress[]) => void)(null, addresses);
    callback(null, addresses[0].address, addresses[0].family);
  });
};

function get(url: URL, signal: AbortSignal): Promise<IncomingMessage> {
  // Node skips `lookup` for IP literals, so check those directly.
  const host = url.hostname.replace(/^\[|\]$/g, "");
  if (isIP(host) && !isPublicAddress(host))
    return Promise.reject(new BlockedImageError(`Blocked internal address ${host}`));

  return new Promise((resolve, reject) => {
    const client = url.protocol === "https:" ? https : http;
    client
      .get(url, { lookup: publicOnlyLookup, signal, headers: { "User-Agent": "SkyCrypt-Image-Proxy/1.0" } }, resolve)
      .on("error", reject);
  });
}

/** Fetches a public http(s) URL, following a few redirects; every hop goes through the internal-address check. */
export async function fetchPublicImage(url: URL, signal: AbortSignal): Promise<IncomingMessage> {
  for (let hop = 0; ; hop++) {
    if (url.protocol !== "http:" && url.protocol !== "https:")
      throw new BlockedImageError(`Blocked protocol ${url.protocol}`);
    const response = await get(url, signal);
    const location = response.headers.location;
    if (!location || !response.statusCode || response.statusCode < 300 || response.statusCode >= 400) return response;
    response.resume();
    if (hop >= MAX_REDIRECTS) throw new Error("Too many redirects");
    url = new URL(location, url);
  }
}

/** Streams the body, erroring once it passes `MAX_IMAGE_BYTES` even when the upstream sent no Content-Length. */
export function limitedBody(response: IncomingMessage): ReadableStream<Uint8Array> {
  let bytes = 0;
  return (Readable.toWeb(response) as ReadableStream<Uint8Array>).pipeThrough(
    new TransformStream<Uint8Array, Uint8Array>({
      transform(chunk, controller) {
        bytes += chunk.byteLength;
        if (bytes > MAX_IMAGE_BYTES) {
          response.destroy();
          controller.error(new Error("Image too large"));
        } else {
          controller.enqueue(chunk);
        }
      }
    })
  );
}
