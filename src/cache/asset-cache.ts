import { debug, info } from "../utils";
import { ASSET_CACHE_NAME } from "./shared";

/**
 * Registers the service worker that manages app-hosted asset caching.
 *
 * Provenance:
 * - this registration flow was AI-generated
 * - review service worker lifecycle and messaging behavior carefully when editing
 */
export const registerAssetCacheServiceWorker = async () => {
    if (!("serviceWorker" in navigator)) {
        debug("[asset-cache] service workers are not supported in this browser");
        return;
    }

    const serviceWorkerUrl = import.meta.env.DEV
        ? new URL("../service-worker.ts", import.meta.url)
        : new URL(
              `${import.meta.env.BASE_URL}service-worker.js`,
              window.location.origin,
          );
    const serviceWorkerScope = import.meta.env.BASE_URL;
    debug(
        `[asset-cache] registering service worker at ${serviceWorkerUrl.pathname} with scope ${serviceWorkerScope}`,
    );

    try {
        const registration = await navigator.serviceWorker.register(
            serviceWorkerUrl,
            {
                type: "module",
                scope: serviceWorkerScope,
            },
        );
        debug(
            `[asset-cache] service worker registered with scope ${registration.scope}`,
        );
    } catch (error) {
        info(`[asset-cache] failed to register service worker: ${error}`);
    }
};

/**
 * Clears all app-managed browser persistence.
 *
 * Responsibilities:
 * - clear `localStorage`
 * - clear the app-owned network asset cache
 *
 * Provenance:
 * - this clearing behavior was AI-generated
 * - keep it aligned with the Settings "Clear Local Storage" semantics
 */
export const clearAppStorage = async () => {
    debug("[asset-cache] clearing localStorage");
    localStorage.clear();

    if (!("caches" in window)) {
        debug("[asset-cache] CacheStorage is not available in this browser");
        return;
    }

    const cacheNames = await caches.keys();
    debug(`[asset-cache] found ${cacheNames.length} cache storage entries`);

    const deletedCacheNames = cacheNames.filter(
        (cacheName) => cacheName === ASSET_CACHE_NAME,
    );

    await Promise.all(
        deletedCacheNames.map((cacheName) => caches.delete(cacheName)),
    );
    debug(
        `[asset-cache] cleared ${deletedCacheNames.length} app-managed cache entries`,
    );
};
