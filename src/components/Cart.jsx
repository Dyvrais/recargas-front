import React, { useState, useEffect } from "react";
import { IoMdCloseCircle } from "react-icons/io";
const Cart = ({ isOpen, onClose }) => {
  const [cart, setCart] = useState([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitMessage, setSubmitMessage] = useState("");
  const [telefono, setTelefono] = useState("");
  const [referencia, setReferencia] = useState("");

  useEffect(() => {
    const storedCart = JSON.parse(localStorage.getItem("cart") || "[]");
    setCart(storedCart);
  }, [isOpen]); // Reload when opened

  const removeItem = (index) => {
    const newCart = cart.filter((_, i) => i !== index);
    setCart(newCart);
    localStorage.setItem("cart", JSON.stringify(newCart));
  };

  const submitOrder = async () => {
    if (cart.length === 0) return;

    setIsSubmitting(true);
    setSubmitMessage("");

    try {
      const response = await fetch(
        `${import.meta.env.VITE_API_URL}/api/ordens`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            data: {
              CarritoJSON: cart,
              Estado: "PENDIENTE",
              Telefono: telefono ? parseInt(telefono) : null,
              Referencia: referencia ? parseInt(referencia) : null,
            },
          }),
        },
      );

      if (!response.ok) {
        throw new Error("Failed to submit order");
      }

      const result = await response.json();
      console.log("Order submitted:", result);

      // Clear cart
      setCart([]);
      localStorage.removeItem("cart");
      setSubmitMessage("Orden enviada exitosamente!");
      setTimeout(() => {
        setSubmitMessage("");
        onClose();
      }, 2000);
    } catch (error) {
      console.error("Error submitting order:", error);
      setSubmitMessage("Error al enviar la orden. Inténtalo de nuevo.");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center"
      onClick={onClose}
    >
      <div
        className="bg-gray-800 relative opacity-100 p-6 rounded-lg shadow-lg w-80 max-h-96 overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          className="close-button absolute top-2 right-2 text-2xl font-bold"
          onClick={onClose}
        >
          &times;
        </button>
        <h2 className="text-xl font-bold mb-4">Carrito</h2>
        {cart.length === 0 ? (
          <p>El carrito está vacío.</p>
        ) : (
          <>
            <ul className="space-y-2">
              {cart.map((item, index) => (
                <li
                  key={index}
                  className="flex justify-around text-sm items-center bg-gray-700 p-2 rounded"
                >
                  <div>
                    <p className="font-semibold">
                      {item.NombreProducto} - {item.CoinSeleccionada}
                    </p>
                    <p>{item.PrecioBolivares} Bs.</p>
                  </div>
                  <button
                    onClick={() => removeItem(index)}
                    className="text-center text-2xl text-red-400 hover:text-red-600"
                  >
                    <IoMdCloseCircle />
                  </button>
                </li>
              ))}
            </ul>
            <div className="mt-4 space-y-2">
              <label className="block text-sm text-white">
                Teléfono asociado a la cuenta:
                <input
                  type="tel"
                  value={telefono}
                  onChange={(e) => setTelefono(e.target.value)}
                  className="w-full p-2 rounded bg-gray-700 text-white"
                  placeholder="Ingresa el teléfono asociado a la cuenta"
                  required
                />
              </label>
              <label className="block text-sm text-white">
                Ultimos 4 digitos de la referencia:
                <input
                  type="text"
                  value={referencia}
                  onChange={(e) => setReferencia(e.target.value)}
                  className="w-full p-2 rounded bg-gray-700 text-white"
                  placeholder="Ingresa la referencia de pago"
                  required
                />
              </label>
            </div>
            <div className="mt-4 flex justify-between">
              <button
                onClick={submitOrder}
                disabled={isSubmitting}
                className="bg-yellow-500 text-black py-2 px-4 rounded disabled:opacity-50"
              >
                {isSubmitting ? "Enviando..." : "Enviar Orden"}
              </button>
              {submitMessage && (
                <span className="text-green-400">{submitMessage}</span>
              )}
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default Cart;
