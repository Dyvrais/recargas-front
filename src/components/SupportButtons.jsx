import { useState } from "react";
import { FaWhatsapp } from "react-icons/fa";
import { IoWarningOutline } from "react-icons/io5";
import { IoChatbubbleEllipsesSharp } from "react-icons/io5";

import useSWR from "swr";

export default function SupportButtons() {
  const [supportOpen, setSupportOpen] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const { data } = useSWR("/api/products?populate=*");
  const products = data?.data || [];
  const [nombreSupport, setNombreSupport] = useState("");
  const [productoSupport, setProductoSupport] = useState("");
  const [articuloSupport, setArticuloSupport] = useState("");
  const [referenciaSupport, setReferenciaSupport] = useState("");
  const [problemaSupport, setProblemaSupport] = useState("");

  const mensajeSupport = `¡Hola! Necesito ayuda con mi compra. \n Nombre: ${nombreSupport} \n Producto: ${productoSupport} \n Artículo: ${articuloSupport} \n Referencia: ${referenciaSupport} \n Problema: ${problemaSupport}`;

  const handleOpenModal = () => {
    setIsModalOpen(true);
  };

  return (
    <div className="fixed bottom-12 right-4 z-50">
      <button
        onClick={() => setSupportOpen((s) => !s)}
        aria-expanded={supportOpen}
        aria-label="Toggle support"
        className="text-white bg-[#25D366] rounded-full p-2 text-3xl mr-3"
      >
        <FaWhatsapp className="text-4xl" />
      </button>

      <div
        className={`absolute bottom-full right-0 mb-2 overflow-hidden bg-[#08090a] backdrop-blur transition-max-h duration-300 ${
          supportOpen ? "max-h-60" : "max-h-0"
        }`}
      >
        <ul className="flex flex-col bg-[#25D366] rounded-lg items-center font-Melon space-y-4 p-3 text-md text-white font-bold">
          <li className="w-full text-center transition">
            <a
              target="_blank"
              rel="noopener noreferrer"
              className="p-2 cursor-pointer"
              onClick={() => handleOpenModal()}
            >
              Soporte
            </a>
            <div className="w-3/4 m-auto border-t border-gray-300 mt-3"></div>
          </li>
          <li className="w-full text-center  transition">
            <a
              href="https://whatsapp.com/channel/0029Vb7NWy7D8SDvcVXmWT1F"
              target="_blank"
              rel="noopener noreferrer"
              className="p-2 cursor-pointer"
              onClick={() => setSupportOpen(false)}
            >
              Canal
            </a>
            <div className="w-3/4 m-auto border-t border-gray-300 mt-3"></div>
          </li>
          <li className="w-full text-center  transition">
            <a
              href="https://www.instagram.com/reel/DVQJUwgDoYd/"
              target="_blank"
              rel="noopener noreferrer"
              className="p-2 cursor-pointer"
              onClick={() => setSupportOpen(false)}
            >
              Tutorial
            </a>
          </li>
        </ul>
      </div>

      <div
        className={`fixed inset-0 bg-black/50  ${
          isModalOpen
            ? "opacity-100 pointer-events-auto"
            : "opacity-0 pointer-events-none"
        }`}
        onClick={() => setIsModalOpen(false)}
      >
        <div
          className="bg-gray-800 relative rounded-lg p-6 overflow-y-auto text-white max-h-[80vh] max-w-[80%] md:max-w-sm mx-auto mt-20"
          onClick={(e) => e.stopPropagation()}
        >
          <button
            className="absolute top-2 right-2 p-1 text-white text-4xl font-bold"
            onClick={() => setIsModalOpen(false)}
          >
            &times;
          </button>
          <form className="flex flex-col text-left">
            <h2 className="text-xl font-bold mb-4">
              <IoChatbubbleEllipsesSharp className="inline-block text-3xl" />{" "}
              Soporte de WhatsApp
            </h2>
            <p className="mb-4 bg-gray-900 p-3 rounded-lg text-sm">
              <IoWarningOutline className="inline-block text-xl" />{" "}
              <b className="text-yellow-500">IMPORTANTE:</b> Verifica el{" "}
              <span className="text-yellow-500">tutorial de recarga</span> y ten
              tu <span className="text-yellow-500">comprobante de pago</span> a
              mano. <br /> Completa el formulario para agilizar tu solicitud.
            </p>
            <label>Nombre:</label>
            <input
              type="text"
              className="bg-gray-600 p-2 text-white placeholder:text-gray-400 border border-gray-500 rounded-lg mb-4"
              placeholder="Tu nombre"
              onChange={(e) => setNombreSupport(e.target.value)}
            />

            <label>Producto:</label>
            <select
              className="bg-gray-600 p-2 text-white border border-gray-500 rounded-lg mb-4 w-full"
              onChange={(e) => setProductoSupport(e.target.value)}
            >
              <option value="">Selecciona un producto</option>
              {products.length ? (
                [...products]
                  .sort((a, b) =>
                    (a.Nombre || "").localeCompare(b.Nombre || ""),
                  )
                  .map((product) => (
                    <option value={product.Nombre}>{product.Nombre}</option>
                  ))
              ) : (
                <option value="">No se encontraron productos</option>
              )}
            </select>
            <label>Articulo a comprar:</label>
            <input
              type="text"
              className="bg-gray-600 p-2 text-white placeholder:text-gray-400 border border-gray-500 rounded-lg mb-4"
              placeholder="Indique el artículo Ej: 520 + 72 Diamantes"
              onChange={(e) => setArticuloSupport(e.target.value)}
            />
            <label>Referencia de pago:</label>
            <input
              type="text"
              className="bg-gray-600 p-2 text-white placeholder:text-gray-400 border border-gray-500 rounded-lg mb-4"
              placeholder="Indique la referencia de pago"
              onChange={(e) => setReferenciaSupport(e.target.value)}
            />
            <label>Descripcion del problema:</label>
            <textarea
              className="bg-gray-600 p-2 text-white placeholder:text-gray-400 border border-gray-500 rounded-lg mb-4"
              placeholder="Por favor, detalla tu inconveniente aqui..."
              rows="3"
              onChange={(e) => setProblemaSupport(e.target.value)}
            ></textarea>
          </form>
          <a
            href={`https://wa.me/+584122188263?text=${encodeURIComponent(mensajeSupport)}`}
            target="_blank"
            rel="noopener noreferrer"
            className="bg-[#25D366] text-white px-4 py-2 rounded-lg"
            onClick={() => setIsModalOpen(false)}
          >
            <FaWhatsapp className="inline-block mr-2 text-xl" />
            Enviar al Whatsapp
          </a>
        </div>
      </div>
    </div>
  );
}
