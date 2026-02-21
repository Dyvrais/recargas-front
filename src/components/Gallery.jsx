import React, { useEffect, useState, useMemo } from "react";
import { Swiper, SwiperSlide } from "swiper/react";

import "swiper/css";
import "swiper/css/pagination";
import "swiper/css/navigation";
import { Autoplay, Pagination, Navigation } from "swiper/modules";

export default function Gallery() {
  const [data, setData] = useState(null);

  useEffect(() => {
    let mounted = true;
    const fetchGallery = async () => {
      try {
        const res = await fetch(
          `${import.meta.env.VITE_API_URL}/api/galerias?populate=*`,
        );
        if (!res.ok) return;
        const json = await res.json();
        if (mounted) setData(json);
      } catch (e) {
        // ignore
      }
    };
    fetchGallery();
    return () => {
      mounted = false;
    };
  }, []);

  const resolveImageUrl = (field) => {
    if (!field) return null;
    if (typeof field === "string") return field;
    if (field.data) {
      const d = field.data;
      if (Array.isArray(d) && d[0]?.attributes?.url) return d[0].attributes.url;
      if (d.attributes?.url) return d.attributes.url;
    }
    if (Array.isArray(field) && field[0]?.url) return field[0].url;
    if (field.url) return field.url;
    if (field.attributes?.url) return field.attributes.url;
    return null;
  };

  const images = useMemo(() => {
    if (!data?.data) return [];
    const items = [];
    const base = String(import.meta.env.VITE_API_URL || "").replace(/\/$/, "");
    data.data.forEach((entry) => {
      const attrs = entry.attributes || entry;

      // Prefer ImagenBanner field which may contain multiple images
      const banner =
        attrs?.ImagenBanner || attrs?.imagenBanner || attrs?.Imagen_Banner;
      if (banner) {
        // Strapi v4: banner.data can be array or object
        if (banner.data) {
          const d = banner.data;
          if (Array.isArray(d)) {
            d.forEach((item, idx) => {
              const url = item?.attributes?.url || item?.url;
              if (url) {
                const src = url.startsWith("http") ? url : `${base}${url}`;
                items.push({ id: `${entry.id}-b-${idx}`, src });
              }
            });
            return; // processed banner images
          }
          const singleUrl = d.attributes?.url || d.url;
          if (singleUrl) {
            const src = singleUrl.startsWith("http")
              ? singleUrl
              : `${base}${singleUrl}`;
            items.push({ id: `${entry.id}-b`, src });
            return;
          }
        }

        // fallback if banner is direct object or array
        if (Array.isArray(banner)) {
          banner.forEach((it, idx) => {
            const url = it?.url || it?.attributes?.url;
            if (url) {
              const src = url.startsWith("http") ? url : `${base}${url}`;
              items.push({ id: `${entry.id}-b-${idx}`, src });
            }
          });
          return;
        }

        const url =
          banner.url ||
          banner.attributes?.url ||
          (typeof banner === "string" ? banner : null);
        if (url) {
          const src = url.startsWith("http") ? url : `${base}${url}`;
          items.push({ id: `${entry.id}-b`, src });
          return;
        }
      }

      // fallback: try other common fields
      const candidates = [
        entry.Imagen,
        attrs?.Imagen,
        attrs?.imagen,
        attrs?.Imagenes,
        attrs?.imagenes,
        attrs?.image,
        attrs?.images,
        attrs?.ImagenGaleria,
      ];
      for (const c of candidates) {
        const url = resolveImageUrl(c);
        if (url) {
          const src = url.startsWith("http") ? url : `${base}${url}`;
          items.push({ id: entry.id || items.length, src });
          break;
        }
      }
    });
    return items;
  }, [data]);

  return (
    <div className="w-screen mt-15">
      <Swiper
        spaceBetween={10}
        centeredSlides={true}
        autoplay={{
          delay: 2500,
          disableOnInteraction: false,
        }}
        lazy={true}
        pagination={{
          clickable: true,
        }}
        navigation={true}
        modules={[Autoplay, Pagination, Navigation]}
        className="w-screen md:w-200"
      >
        {images.length ? (
          images.map((item) => (
            <SwiperSlide key={item.id}>
              <img
                src={item.src}
                alt="Galeria"
                loading="lazy"
                className="w-screen h-[250px] md:h-[350px] object-contain"
              />
            </SwiperSlide>
          ))
        ) : (
          <SwiperSlide>
            <div className="w-screen h-[202px] md:h-[300px] flex items-center justify-center bg-gray-800 text-white">
              No images
            </div>
          </SwiperSlide>
        )}
      </Swiper>
    </div>
  );
}
