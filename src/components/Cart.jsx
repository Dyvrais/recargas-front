import React, { useState, useEffect, useMemo, useRef } from "react";
import ReceiptModal from "./ReceiptModal";
import { IoMdCloseCircle } from "react-icons/io";
import { FaRegCopy } from "react-icons/fa";
import { FaCheck } from "react-icons/fa";
import { IoCartOutline } from "react-icons/io5";

const Cart = ({ isOpen, onClose }) => {
  const [cart, setCart] = useState([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitMessage, setSubmitMessage] = useState("");
  const [submitError, setSubmitError] = useState(false);
  const [receiptOpen, setReceiptOpen] = useState(false);
  const [receiptData, setReceiptData] = useState(null);
  const [paymentMethod, setPaymentMethod] = useState("pago-movil");
  const [copyMessage, setCopyMessage] = useState("");
  const [referencia, setReferencia] = useState("");
  const [idOrden, setIdOrden] = useState(null);

  const paymentListRef = useRef(null);

  const copyToClipboard = async (text) => {
    try {
      if (navigator && navigator.clipboard && navigator.clipboard.writeText) {
        await navigator.clipboard.writeText(text);
        setCopyMessage("Copiado al portapapeles");
        setTimeout(() => setCopyMessage(""), 1500);
        return;
      }
    } catch (e) {
      // fallthrough to fallback
    }

    try {
      const textarea = document.createElement("textarea");
      textarea.value = text;
      textarea.style.position = "fixed";
      textarea.style.left = "-9999px";
      document.body.appendChild(textarea);
      textarea.select();
      document.execCommand("copy");
      document.body.removeChild(textarea);
      setCopyMessage("Copiado al portapapeles");
      setTimeout(() => setCopyMessage(""), 2000);
    } catch (e) {
      // ignore
    }
  };

  const handleCopy = async (text) => {
    if (!text) return;
    await copyToClipboard(text);
  };

  const handleCopyAll = async () => {
    const text = paymentListRef.current?.innerText?.trim() || "";
    if (!text) return;
    const totalText = `Monto Total: ${montoTotal.toFixed(2)} Bs.`;
    const combined = `${text}\n${totalText}`;
    await copyToClipboard(combined);
  };

  useEffect(() => {
    const storedCart = JSON.parse(localStorage.getItem("cart") || "[]");
    setCart(storedCart);
  }, [isOpen]); // Reload when opened

  const removeItem = (index) => {
    const newCart = cart.filter((_, i) => i !== index);
    setCart(newCart);
    localStorage.setItem("cart", JSON.stringify(newCart));
  };

  const montoTotal = useMemo(() => {
    return cart.reduce((sum, item) => {
      const raw = item?.PrecioBolivares;
      const num = parseFloat(
        raw === undefined || raw === null
          ? 0
          : String(raw).replace(/[^0-9.-]+/g, ""),
      );
      return sum + (isNaN(num) ? 0 : num);
    }, 0);
  }, [cart]);

  const submitOrder = async (e) => {
    if (e && e.preventDefault) e.preventDefault();

    if (cart.length === 0) return;

    // Validate required fields
    if (!referencia || !referencia.toString().trim()) {
      setSubmitError(true);
      setSubmitMessage("Por favor completa los campos requeridos.");
      return;
    }

    setIsSubmitting(true);
    setSubmitError(false);
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
              Referencia: referencia ? parseInt(referencia) : null,
              MetodoPago: paymentMethod,
            },
          }),
        },
      );

      if (!response.ok) {
        throw new Error("Failed to submit order");
      }

      const result = await response.json();
      console.log("Order submitted:", result);

      // Keep a snapshot for the receipt, then clear cart storage
      setReceiptData(cart || []);
      setReceiptOpen(true);
      setCart([]);
      localStorage.removeItem("cart");
      const nroOrden = result.data.id - 1; // Strapi auto-increments after creation, so the new order ID is current max + 1
      setIdOrden(nroOrden);
      setSubmitError(false);
    } catch (error) {
      console.error("Error submitting order:", error);
      setSubmitError(true);
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
        className="bg-gray-800 relative opacity-100 p-6 rounded-lg shadow-lg w-80 md:w-100 max-h-96 overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          className="close-button absolute top-2 right-2 text-2xl font-bold"
          onClick={onClose}
        >
          &times;
        </button>
        <div className="text-center flex items-center justify-center">
          <span className="text-xl font-bold mb-4">
            Carrito
            <IoCartOutline className="text-yellow-500 text-xl font-bold md:text-3xl inline-block ml-2" />
          </span>
        </div>
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
                  <img
                    src={item.ImagenCoin}
                    alt={item.NombreProducto}
                    className="w-10 h-10 object-contain"
                  />
                  <div className="">
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
            <div className="mt-3 text-white font-semibold">
              Monto Total: {montoTotal.toFixed(2)} Bs.
            </div>
            <form className="mt-4 space-y-2">
              <label htmlFor="payment" className="block text-sm text-white">
                Método de pago:
              </label>
              <select
                id="payment"
                name="payment"
                value={paymentMethod}
                onChange={(e) => setPaymentMethod(e.target.value)}
                className="w-full p-2 rounded mt-2 bg-gray-700 text-white"
              >
                <option value="pago-movil">Pago movil</option>
                {/* <option value="zinli">Zinli</option>
                <option value="binance">Binance</option>
                <option value="kontigo">Kontigo</option> */}
              </select>

              {/* Payment details placeholder per method */}
              <div className="text-sm bg-gray-700 text-white p-3 rounded-lg mb-3">
                {paymentMethod === "pago-movil" && (
                  <ul ref={paymentListRef} className="list-none space-y-2">
                    <li className="font-semibold">Pago Móvil</li>
                    <li className="flex items-center justify-between">
                      <span>Banco: 0138 - Banco Plaza</span>
                      <button
                        className="text-sm bg-gray-600 px-2 py-1 rounded"
                        onClick={() => handleCopy("Banco Plaza")}
                      >
                        <FaRegCopy />
                      </button>
                    </li>
                    <li className="flex items-center justify-between">
                      <span>Cedula: 26.551.722</span>
                      <button
                        className="text-sm bg-gray-600 px-2 py-1 rounded"
                        onClick={() => handleCopy("26.551.722")}
                      >
                        <FaRegCopy />
                      </button>
                    </li>
                    <li className="flex items-center justify-between">
                      <span>Telefono: 0412-6310088</span>
                      <button
                        className="text-sm bg-gray-600 px-2 py-1 rounded"
                        onClick={() => handleCopy("04126310088")}
                      >
                        <FaRegCopy />
                      </button>
                    </li>
                    <button
                      onClick={handleCopyAll}
                      className="mt-2 m-auto flex items-center gap-1 text-md bg-gray-600 px-2 py-1 rounded"
                    >
                      <FaRegCopy />
                      <span className="ml-2">Copiar datos</span>
                    </button>
                  </ul>
                )}
                {copyMessage && (
                  <div className="my-2 m-auto bg-green-600 text-white text-center p-2 w-fit rounded-full flex items-center gap-2">
                    <FaCheck className="text-sm" />
                    <span>{copyMessage}</span>
                  </div>
                )}
                {/* {paymentMethod === "zinli" && (
                <div>
                  <h4 className="font-semibold">Zinli</h4>
                  <p>ID Zinli: zinli_user_123</p>
                  <p>Email: pagos@zinli.example</p>
                  <p>Banco asociado: Zinli Bank</p>
                  <p>Referencia: ZIN-REF-5678</p>
                </div>
              )}
              {paymentMethod === "binance" && (
                <div>
                  <h4 className="font-semibold">Binance</h4>
                  <p>Wallet: 0xABCDEF0123456789</p>
                  <p>Etiqueta/Memo: 987654321</p>
                  <p>Moneda: USDT TRC20</p>
                  <p>Referencia: BIN-REF-9012</p>
                </div>
              )}
              {paymentMethod === "kontigo" && (
                <div>
                  <h4 className="font-semibold">Kontigo</h4>
                  <p>ID Comercio: KONT-0001</p>
                  <p>Número: 555-1234</p>
                  <p>Contacto: ventas@kontigo.example</p>
                  <p>Referencia: KON-REF-3456</p>
                </div>
              )} */}
              </div>
              <label className="block text-sm text-white">
                Ultimos 4 digitos de la referencia:
                <input
                  type="text"
                  value={referencia}
                  maxLength={4}
                  onChange={(e) => setReferencia(e.target.value)}
                  className="w-full p-2 rounded mt-2 bg-gray-700 text-white"
                  placeholder="Ingresa la referencia de pago"
                  required
                />
              </label>
              <button
                onClick={submitOrder}
                disabled={isSubmitting}
                type="submit"
                className="mt-4  bg-yellow-500 m-auto text-center text-black py-2 px-4 rounded disabled:opacity-50"
              >
                {isSubmitting ? "Enviando..." : "Enviar Orden"}
              </button>
              {submitMessage && (
                <p className={submitError ? "text-red-400" : "text-green-400"}>
                  {submitMessage}
                </p>
              )}
            </form>
          </>
        )}
        <ReceiptModal
          isOpen={receiptOpen}
          onClose={() => {
            setReceiptOpen(false);
            // close the cart modal as well when receipt is dismissed
            onClose();
            setReferencia("");
          }}
          data={receiptData}
          orderId={idOrden}
          paymentMethod={paymentMethod}
          referencia={referencia}
        />
      </div>
    </div>
  );
};

export default Cart;
