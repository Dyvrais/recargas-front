import { Swiper, SwiperSlide } from "swiper/react";

import "swiper/css";
import "swiper/css/pagination";
import "swiper/css/navigation";
import { Autoplay, Pagination, Navigation } from "swiper/modules";

export default function Gallery() {
  const PhotoGallery = [
    {
      id: 1,
      src: "https://dl.dir.freefiremobile.com/common/web_event/hash/54f31449f5f91cf0cc223cc635cd5952jpg",
      alt: "Imagen 1",
    },
    {
      id: 2,
      src: "https://images.tynker.com/blog/wp-content/uploads/20250401220809/robloxxjpg-1.jpg",
      alt: "Imagen 2",
    },
    {
      id: 3,
      src: "https://www.charlieintel.com/cdn-image/wp-content/uploads/2021/09/call-of-duty-mobile-ranked.jpg",
      alt: "Imagen 3",
    },
    {
      id: 4,
      src: "https://www.blood-strike.com/m/h5/20230616173253/data/share.png",
      alt: "Imagen 4",
    },
  ];
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
        className="w-screen"
      >
        {PhotoGallery.map((item) => (
          <SwiperSlide key={item.id}>
            <img
              src={item.src}
              alt={item.alt}
              loading="lazy"
              className="w-screen h-[202px] object-contain"
            />
          </SwiperSlide>
        ))}
      </Swiper>
    </div>
  );
}
