/// <reference no-default-lib="true"/>
/// <reference lib="esnext" />
/// <reference lib="webworker" />

import { version } from "$app/env";

const self = globalThis.self as unknown as ServiceWorkerGlobalScope;
const cacheName = `cache-${version}`;

async function deleteOldCaches() {
  for (const key of await caches.keys()) {
    if (key !== cacheName) await caches.delete(key);
  }
}

self.addEventListener("install", (event) => {
  event.waitUntil(deleteOldCaches());
});

self.addEventListener("activate", (event) => {
  event.waitUntil(deleteOldCaches());
});
