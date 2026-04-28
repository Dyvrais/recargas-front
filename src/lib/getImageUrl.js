export function getImageUrl(imgField) {
  if (!imgField) return null;

  const base = String(import.meta.env.VITE_API_URL || "").replace(/\/$/, "");

  if (typeof imgField === "string") {
    return imgField.startsWith("/") ? base + imgField : imgField;
  }

  if (imgField.data) {
    const d = imgField.data;
    const url = Array.isArray(d) ? d[0]?.attributes?.url : d.attributes?.url;
    if (url) return url.startsWith("/") ? base + url : url;
  }

  if (Array.isArray(imgField) && imgField[0]?.url) {
    const url = imgField[0].url;
    return url.startsWith("/") ? base + url : url;
  }

  if (imgField.url) {
    const url = imgField.url;
    return url.startsWith("/") ? base + url : url;
  }

  if (imgField.attributes?.url) {
    const url = imgField.attributes.url;
    return url.startsWith("/") ? base + url : url;
  }

  return null;
}
