import { useEffect, useState } from "react";
import useSWR from "swr";
import Modal from "./Modal";
import CachedImg from "../lib/CachedImg";

// Simple fetch function
export default function Products() {
  const { data } = useSWR("/api/products?populate=*");
  const products = data?.data || [];
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [activeId, setActiveId] = useState(null);
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");

  const handleOpenModal = (id) => {
    setActiveId(id);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setActiveId(null);
  };

  // data comes from SWR; no manual fetch needed

  // Debounce search input to avoid filtering on every keystroke
  useEffect(() => {
    const handle = setTimeout(() => setDebouncedSearch(search), 300);
    return () => clearTimeout(handle);
  }, [search]);

  if (!products.length)
    return (
      <div role="status" className="flex w-screen flex-col items-center mt-10">
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
    );

  return (
    <section
      id="juegos"
      className="flex w-screen flex-col mt-8 justify-center items-center scroll-mt-20 scroll-smooth"
    >
      <h2 className="font-Melon tracking-wide font-bold text-center text-white my-3 text-xl md:text-3xl">
        CATALOGO
      </h2>

      <input
        type="search"
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        className="w-[80%] max-w-md p-2 border border-gray-300 rounded-lg mb-4"
        placeholder="🔍 Buscar productos..."
      />

      {/* Filtered list based on search (case-insensitive) and categoria === 'juegos' */}
      {products.filter &&
        (() => {
          const q = debouncedSearch.trim().toLowerCase();

          // Limit to categoria === "juegos"
          const juegosOnly = products.filter(
            (p) => (p.categoria || "").toString().toLowerCase() === "juegos",
          );

          const filtered = q
            ? juegosOnly.filter((p) =>
                (p.Nombre || "").toLowerCase().includes(q),
              )
            : juegosOnly;

          return (
            <div className="grid grid-cols-2 gap-4 place-items-center justify-center rounded-lg items-center md:grid-cols-4">
              {filtered.length ? (
                [...filtered]
                  .sort((a, b) => {
                    const priority = [
                      "Free Fire",
                      "Roblox",
                      "Free Fire Pases y Tarjetas",
                      "Bloodstrike",
                    ];
                    const nameA = (a.Nombre || "").toString();
                    const nameB = (b.Nombre || "").toString();
                    const ia = priority.indexOf(nameA);
                    const ib = priority.indexOf(nameB);
                    if (ia !== -1 || ib !== -1) {
                      if (ia === -1) return 1;
                      if (ib === -1) return -1;
                      return ia - ib;
                    }
                    return nameA.localeCompare(nameB);
                  })
                  .map((product) => (
                    <button
                      onClick={() => handleOpenModal(product.id)}
                      className="bg-gray-800 rounded-lg h-full hover:scale-105 transition-transform duration-200 w-fit"
                      key={product.id}
                    >
                      {product.Imagen?.[0]?.url ? (
                        <CachedImg
                          src={product.Imagen[0].url}
                          alt={product.Nombre || ""}
                          className="size-32 md:size-45 rounded-t-lg object-cover"
                        />
                      ) : null}
                      <h3 className="text-white text-sm font-Noto text-center box-border m-auto w-[110px] py-2">
                        {product.Nombre || "Nombre indefinido"}
                      </h3>
                    </button>
                  ))
              ) : (
                <p className="m-auto text-center text-white">
                  No se encontraron productos.
                </p>
              )}
            </div>
          );
        })()}

      <Modal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        itemId={activeId}
      />
    </section>
  );
}
