import { useEffect, useState } from "react";

const CACHE_NAME = "image-cache-v1";
const DEFAULT_TTL = 3 * 24 * 60 * 60 * 1000; // 3 days

function normalizeUrl(url) {
  if (!url) return null;
  const isFull = /^(https?:)?\/\//i.test(url);
  if (isFull) return url;
  const base = String(import.meta.env.VITE_API_URL || "").replace(/\/$/, "");
  if (!base) return url;
  return `${base}${url.startsWith("/") ? "" : "/"}${url}`;
}

export default function useCachedImage(originalUrl) {
  const [src, setSrc] = useState(null);

  useEffect(() => {
    let cancelled = false;
    let objectUrl = null;
    const url = normalizeUrl(originalUrl);
    if (!url) {
      setSrc(null);
      return () => {};
    }

    const ttl = Number(import.meta.env.VITE_IMAGE_CACHE_TTL) || DEFAULT_TTL;

    async function load() {
      try {
        if (typeof caches === "undefined") {
          // fallback to direct url
          if (!cancelled) setSrc(url);
          return;
        }

        const metaRaw = localStorage.getItem("img_cache_meta") || "{}";
        let meta = {};
        try {
          meta = JSON.parse(metaRaw);
        } catch (e) {
          meta = {};
        }

        const now = Date.now();
        const cachedTs = meta[url];
        const cache = await caches.open(CACHE_NAME);

        if (cachedTs && now - cachedTs < ttl) {
          const match = await cache.match(url);
          if (match) {
            const blob = await match.blob();
            objectUrl = URL.createObjectURL(blob);
            if (!cancelled) setSrc(objectUrl);
            return;
          }
        }

        const resp = await fetch(url, { mode: "cors" });
        if (!resp.ok) throw new Error("Image fetch failed");
        const respClone = resp.clone();
        try {
          await cache.put(url, respClone);
        } catch (e) {
          /* ignore */
        }
        meta[url] = Date.now();
        try {
          localStorage.setItem("img_cache_meta", JSON.stringify(meta));
        } catch (e) {}
        const blob = await resp.blob();
        objectUrl = URL.createObjectURL(blob);
        if (!cancelled) setSrc(objectUrl);
      } catch (e) {
        console.error("useCachedImage error:", e);
        if (!cancelled) setSrc(originalUrl);
      }
    }

    load();

    return () => {
      cancelled = true;
      if (objectUrl) {
        try {
          URL.revokeObjectURL(objectUrl);
        } catch (e) {}
      }
    };
  }, [originalUrl]);

  return src;
}
