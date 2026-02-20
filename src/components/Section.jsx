import React from "react";

export default function Section() {
  const ImgCatalog = [
    {
      id: 1,
      src: "https://cdn2.steamgriddb.com/icon_thumb/5a5431eae1ec51aca746e023ed05c97f.png",
      alt: "Imagen 1",
      title: "Free Fire",
    },
    {
      id: 2,
      src: "https://d12jofbmgge65s.cloudfront.net/wp-content/uploads/2021/12/Roblox.jpg",
      alt: "Imagen 2",
      title: "Roblox",
    },
    {
      id: 3,
      src: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRIuef0Tg44y4GQcaJG3kMloa05J0pzQnehDg&s",
      alt: "Imagen 3",
      title: "Call of Duty Mobile",
    },
    {
      id: 4,
      src: "https://cdn.aptoide.com/imgs/b/b/0/bb010754b916af0f22cc31ebe8b52c58_icon.png",
      alt: "Imagen 4",
      title: "Blood Strike",
    },
    {
      id: 5,
      src: "https://cdn2.steamgriddb.com/icon_thumb/5a5431eae1ec51aca746e023ed05c97f.png",
      alt: "Imagen 1",
      title: "Free Fire",
    },
    {
      id: 6,
      src: "https://d12jofbmgge65s.cloudfront.net/wp-content/uploads/2021/12/Roblox.jpg",
      alt: "Imagen 2",
      title: "Roblox",
    },
    {
      id: 7,
      src: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRIuef0Tg44y4GQcaJG3kMloa05J0pzQnehDg&s",
      alt: "Imagen 3",
      title: "Call of Duty Mobile",
    },
    {
      id: 8,
      src: "https://cdn.aptoide.com/imgs/b/b/0/bb010754b916af0f22cc31ebe8b52c58_icon.png",
      alt: "Imagen 4",
      title: "Blood Strike",
    },
  ];

  return (
    <section
      id="catalogo"
      className="flex flex-col justify-center items-center scroll-mt-20 scroll-smooth"
    >
      <h2 className="font-Noto tracking-wide font-bold text-center text-yellow-500 my-3 text-xl md:text-7xl">
        CATALOGO
      </h2>

      <input
        type="search"
        className="w-[80%] max-w-md p-2 border border-gray-300 rounded-lg mb-4"
        placeholder="🔍 Buscar juegos..."
      ></input>

      <div className="px-3">
        <div className="grid grid-cols-2 gap-x-2 gap-y-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 xl:gap-x-8">
          {ImgCatalog.map((item) => (
            <div
              key={item.id}
              className="flex h-25 justify-evenly items-center p-2 rounded-lg md:mb-4 bg-[#262e47]"
            >
              <img
                src={item.src}
                alt={item.alt}
                loading="lazy"
                className="size-15 md:size-20 object-cover rounded-md"
              />

              <div className="">
                <h3 className="text-sm md:text-xl font-Noto mb-2 m-auto text-white justify-center text-center">
                  {item.title}
                </h3>
                <button className="bg-white text-sm font-Noto text-black rounded-lg px-1">
                  COMPRAR
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
