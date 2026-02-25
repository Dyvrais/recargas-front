import React from "react";
import useCachedImage from "./useCachedImage";

export default function CachedImg({ src, alt, className, ...rest }) {
  const cached = useCachedImage(src);
  const final =
    cached ||
    (src
      ? String(src).startsWith("http")
        ? src
        : `${import.meta.env.VITE_API_URL}${src}`
      : "");
  return <img src={final} alt={alt} className={className} {...rest} />;
}
