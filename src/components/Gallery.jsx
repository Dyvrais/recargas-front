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
            <div
              role="status"
              className="flex w-screen flex-col items-center mt-10"
            >
              <svg
                aria-hidden="true"
                class="w-8 h-8 text-neutral-tertiary animate-spin fill-brand"
                viewBox="0 0 100 101"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  d="M100 50.5908C100 78.2051 77.6142 100.591 50 100.591C22.3858 100.591 0 78.2051 0 50.5908C0 22.9766 22.3858 0.59082 50 0.59082C77.6142 0.59082 100 22.9766 100 50.5908ZM9.08144 50.5908C9.08144 73.1895 27.4013 91.5094 50 91.5094C72.5987 91.5094 90.9186 73.1895 90.9186 50.5908C90.9186 27.9921 72.5987 9.67226 50 9.67226C27.4013 9.67226 9.08144 27.9921 9.08144 50.5908Z"
                  fill="currentColor"
                />
                <path
                  d="M93.9676 39.0409C96.393 38.4038 97.8624 35.9116 97.0079 33.5539C95.2932 28.8227 92.871 24.3692 89.8167 20.348C85.8452 15.1192 80.8826 10.7238 75.2124 7.41289C69.5422 4.10194 63.2754 1.94025 56.7698 1.05124C51.7666 0.367541 46.6976 0.446843 41.7345 1.27873C39.2613 1.69328 37.813 4.19778 38.4501 6.62326C39.0873 9.04874 41.5694 10.4717 44.0505 10.1071C47.8511 9.54855 51.7191 9.52689 55.5402 10.0491C60.8642 10.7766 65.9928 12.5457 70.6331 15.2552C75.2735 17.9648 79.3347 21.5619 82.5849 25.841C84.9175 28.9121 86.7997 32.2913 88.1811 35.8758C89.083 38.2158 91.5421 39.6781 93.9676 39.0409Z"
                  fill="#eab308"
                />
              </svg>
              <span class="sr-only">Loading...</span>
            </div>
          </SwiperSlide>
        )}
      </Swiper>
    </div>
  );
}
