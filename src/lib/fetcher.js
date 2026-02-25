const API_BASE = String(import.meta.env.VITE_API_URL || "").replace(/\/$/, "");

import { getCache, setCache } from "./cache";

export default async function fetcher(path) {
  const isFull = typeof path === "string" && /^(https?:)?\/\//i.test(path);
  const url = isFull
    ? path
    : `${API_BASE}${path.startsWith("/") ? "" : "/"}${path}`;
  const res = await fetch(url);
  if (!res.ok) {
    const error = new Error("An error occurred while fetching the data.");
    try {
      error.info = await res.json();
    } catch (e) {
      error.info = null;
    }
    error.status = res.status;
    throw error;
  }

  // Only cache GET-like requests (we're a simple fetcher used by SWR)
  const cacheKey = url;
  const cached = getCache(cacheKey);
  if (cached) return cached;

  const json = await res.json();

  // store in cache (ttl can be overridden via VITE_API_CACHE_TTL)
  try {
    setCache(cacheKey, json);
  } catch (e) {
    // ignore cache errors
  }

  return json;
}
