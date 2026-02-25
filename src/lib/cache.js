const CACHE_PREFIX = "swr_cache_v1:";
const DEFAULT_TTL = Number(import.meta.env.VITE_API_CACHE_TTL) || 18000000;

function keyFor(k) {
  return `${CACHE_PREFIX}${k}`;
}

export function getCache(key) {
  try {
    if (typeof localStorage === "undefined") return null;
    const raw = localStorage.getItem(keyFor(key));
    if (!raw) return null;
    const obj = JSON.parse(raw);
    if (!obj || !obj.ts) return null;
    const ttl = typeof obj.ttl === "number" ? obj.ttl : DEFAULT_TTL;
    if (Date.now() - obj.ts > ttl) {
      localStorage.removeItem(keyFor(key));
      return null;
    }
    return obj.data;
  } catch (e) {
    return null;
  }
}

export function setCache(key, data, ttl) {
  try {
    if (typeof localStorage === "undefined") return;
    const obj = {
      ts: Date.now(),
      ttl: typeof ttl === "number" ? ttl : DEFAULT_TTL,
      data,
    };
    localStorage.setItem(keyFor(key), JSON.stringify(obj));
  } catch (e) {}
}

export function delCache(key) {
  try {
    if (typeof localStorage === "undefined") return;
    localStorage.removeItem(keyFor(key));
  } catch (e) {}
}

export default { getCache, setCache, delCache };
