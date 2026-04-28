import React, { useState, useEffect, useMemo, useRef } from "react";
import ReceiptModal from "./ReceiptModal";
import CachedImg from "../lib/CachedImg";
import { IoMdCloseCircle } from "react-icons/io";
import { FaRegCopy } from "react-icons/fa";
import { FaCheck } from "react-icons/fa";
import { IoCartOutline } from "react-icons/io5";
import { FaPlus, FaMinus } from "react-icons/fa";
import { getImageUrl } from "../lib/getImageUrl";

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
  const [idOrden] = useState(null);

  const paymentListRef = useRef(null);
  const formRef = useRef(null);
  const [isFormValid, setIsFormValid] = useState(false);

  const copyToClipboard = async (text) => {
    try {
      if (navigator && navigator.clipboard && navigator.clipboard.writeText) {
        await navigator.clipboard.writeText(text);
        setCopyMessage("Copiado al portapapeles");
        setTimeout(() => setCopyMessage(""), 1500);
        return;
      }
    } catch {
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
    } catch {
      // ignore
    }
  };

  const handleReferenciaChange = (e) => {
    const input = e.target.value.replace(/\D/g, "");
    const truncated = input.slice(0, 4);
    setReferencia(truncated);
  };

  const strictValidateCart = () => {
    // require referencia and keep existing element-level checks
    const ref = String(referencia || "").trim();
    if (!ref) return false;
    return validateFormFields();
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

  const validateFormFields = () => {
    const form = formRef.current;
    if (!form) return false;
    const elements = Array.from(form.elements || []);
    // Only validate fields that are explicitly required
    for (const el of elements) {
      const isMarkedRequired =
        el.required ||
        (el.classList && el.classList.contains("required-field"));
      if (!isMarkedRequired) continue;
      const tag = (el.tagName || "").toUpperCase();
      const type = (el.type || "").toLowerCase();
      if (
        tag === "BUTTON" ||
        type === "button" ||
        type === "submit" ||
        type === "hidden"
      )
        continue;
      if (el.disabled) continue;

      if (type === "radio" || type === "checkbox") {
        const group = form.querySelectorAll(`input[name="${el.name}"]`);
        if (group.length > 0) {
          const anyChecked = Array.from(group).some((g) => g.checked);
          if (!anyChecked) return false;
          continue;
        }
      }

      const val = el.value;
      if (!String(val || "").trim()) return false;
    }
    return true;
  };

  useEffect(() => {
    const storedCart = JSON.parse(localStorage.getItem("cart") || "[]");
    setCart(storedCart);
  }, [isOpen]); // Reload when opened

  const updateItemQuantity = (index, delta) => {
    const newCart = cart.map((item, i) => {
      if (i !== index) return item;
      const currentQty = Number(item.Cantidad || 1);
      const nextQty = Math.max(1, currentQty + delta);
      return { ...item, Cantidad: nextQty };
    });
    setCart(newCart);
    localStorage.setItem("cart", JSON.stringify(newCart));
  };

  const removeItem = (index) => {
    const newCart = cart.filter((_, i) => i !== index);
    setCart(newCart);
    localStorage.setItem("cart", JSON.stringify(newCart));
  };

  const montoTotal = useMemo(() => {
    return cart.reduce((sum, item) => {
      const qty = Number(item.Cantidad || 1);
      const raw = item?.PrecioBolivares;
      const num = parseFloat(
        raw === undefined || raw === null
          ? 0
          : String(raw).replace(/[^0-9.-]+/g, ""),
      );
      return sum + (isNaN(num) ? 0 : num) * (isNaN(qty) ? 1 : qty);
    }, 0);
  }, [cart]);

  const submitOrder = async (e) => {
    if (e && e.preventDefault) e.preventDefault();

    if (cart.length === 0) return;

    // Validate all form fields; prevent submission if any are empty
    if (!validateFormFields() || !strictValidateCart()) {
      setSubmitError(true);
      setSubmitMessage("Por favor completa los campos requeridos.");
      return;
    }

    setIsSubmitting(true);
    setSubmitError(false);
    setSubmitMessage("");

    try {
      const response = await fetch(
        `${import.meta.env.VITE_API_URL}api/ordens`,
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
        console.error("Failed to submit order:", response.statusText);
        throw new Error("Failed to submit order");
      }

      const result = await response.json();
      console.log("Order submitted:", result);

      // Keep a snapshot for the receipt, then clear cart storage
      setReceiptData(cart || []);
      setReceiptOpen(true);
      setCart([]);
      localStorage.removeItem("cart");
      // const nroOrden = result.data.id - 1; // Strapi auto-increments after creation, so the new order ID is current max + 1
      // setIdOrden(nroOrden);
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
        className="bg-gray-800 relative opacity-100 p-6 rounded-lg shadow-lg w-[95%] md:w-120 max-h-96 overflow-y-auto"
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
              {cart.map((item, index) => {
                const qty = Number(item.Cantidad || 1);
                const rawPrice = parseFloat(
                  String(item.PrecioBolivares || "").replace(/[^0-9.-]+/g, ""),
                );
                const itemTotal = isNaN(rawPrice) ? 0 : rawPrice * qty;
                const itemImgUrl = getImageUrl(item.ImagenCoin);
                if (itemImgUrl) {
                  console.log("imgUrl for cart item", itemImgUrl);
                }
                return (
                  <li
                    key={index}
                    className="flex flex-col gap-3 text-sm bg-gray-900 p-3 rounded"
                  >
                    <div className="flex items-center justify-between gap-1 w-full text-xs md:text-sm">
                      <div className="min-w-0 m-auto flex flex-col items-center sm:items-start">
                        <p className="font-semibold flex justify-center text-center sm:text-left">
                          {itemImgUrl ? (
                            <CachedImg
                              src={itemImgUrl}
                              alt={item.NombreProducto || "Imagen del producto"}
                              className="size-10 p-1 md:size-12 m-auto rounded object-contain mb-1"
                            />
                          ) : null}
                          {item.NombreProducto} - {item.CoinSeleccionada}
                        </p>
                        <p className="text-yellow-500 m-auto">
                          {item.PrecioBolivares} Bs.
                        </p>
                      </div>
                      <div
                        id="botones"
                        className="flex flex-row items-center justify-end gap-1 flex-shrink-0"
                      >
                        <button
                          onClick={() => updateItemQuantity(index, -1)}
                          className="bg-gray-700 p-2 rounded text-white"
                        >
                          <FaMinus />
                        </button>
                        <span className="min-w-[32px] text-center text-md text-white">
                          {qty}
                        </span>
                        <button
                          onClick={() => updateItemQuantity(index, 1)}
                          className="bg-yellow-500 p-2 rounded text-black"
                        >
                          <FaPlus />
                        </button>
                        <button
                          onClick={() => removeItem(index)}
                          className="text-center text-2xl text-red-400 hover:text-red-600"
                        >
                          <IoMdCloseCircle />
                        </button>
                      </div>
                    </div>
                    <div className="flex items-center justify-between text-white">
                      <div className="text-xs text-gray-400">Subtotal</div>
                      <div className="font-semibold">
                        {itemTotal.toFixed(2)} Bs.
                      </div>
                    </div>
                  </li>
                );
              })}
            </ul>
            <div className="mt-3 text-white font-semibold">
              Monto Total:{" "}
              <span className="text-yellow-500">
                {montoTotal.toFixed(2)} Bs.
              </span>
            </div>
            <form
              ref={formRef}
              onChange={() =>
                setIsFormValid(validateFormFields() && strictValidateCart())
              }
              className="mt-4 space-y-2"
            >
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
                <option value="pago-movil">Pago movil 1</option>
                <option value="pago-movil-2">Pago movil 2</option>
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
                      <span>Banco: 0102 - Banco de Venezuela</span>
                      <button
                        className="text-sm bg-gray-600 px-2 py-1 rounded"
                        onClick={() => handleCopy("0102 - Banco de Venezuela")}
                      >
                        <FaRegCopy />
                      </button>
                    </li>
                    <li className="flex items-center justify-between">
                      <span>Cedula: 8.507.321</span>
                      <button
                        className="text-sm bg-gray-600 px-2 py-1 rounded"
                        onClick={() => handleCopy("8.507.321")}
                      >
                        <FaRegCopy />
                      </button>
                    </li>
                    <li className="flex items-center justify-between">
                      <span>Telefono: 0414-6138263</span>
                      <button
                        className="text-sm bg-gray-600 px-2 py-1 rounded"
                        onClick={() => handleCopy("0414-6138263")}
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

                {paymentMethod === "pago-movil-2" && (
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
                        onClick={() => handleCopy("0412-6310088")}
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
                  type="number"
                  value={referencia}
                  maxLength={4}
                  onChange={handleReferenciaChange}
                  className="w-full p-2 rounded mt-2 bg-gray-700 text-white"
                  placeholder="Ingresa la referencia de pago"
                  required
                />
              </label>
              <button
                onClick={submitOrder}
                disabled={isSubmitting || !isFormValid}
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
