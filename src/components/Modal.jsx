import React, { useState, useEffect, useRef } from "react";
import { FaRegCopy } from "react-icons/fa";
import { FaCheck } from "react-icons/fa";

const Modal = ({ isOpen, onClose, itemId }) => {
  const [data, setData] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  const [DolarParalelo, setDolarParalelo] = useState("");
  const [Dolar, setDolar] = useState("");
  const [selectedOptionId, setSelectedOptionId] = useState(null);
  const [userIdVal, setUserIdVal] = useState("");
  const [emailVal, setEmailVal] = useState("");
  const [passwordVal, setPasswordVal] = useState("");
  const [telefono, setTelefono] = useState("");
  const [loginMethod, setLoginMethod] = useState("-");
  const [paymentMethod, setPaymentMethod] = useState("pago-movil");
  const [successMessage, setSuccessMessage] = useState("");
  const [copyMessage, setCopyMessage] = useState("");

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
    await copyToClipboard(text);
  };

  useEffect(() => {
    fetch("https://ve.dolarapi.com/v1/dolares")
      .then((response) => response.json())
      .then((data) => {
        setDolarParalelo(data[1].promedio);
        setDolar(data[0].promedio);
      });
  }, []);

  useEffect(() => {
    const controller = new AbortController();
    const signal = controller.signal;

    const fetchData = async () => {
      if (!isOpen || itemId === null) {
        setData(null);
        setError(null);
        return;
      }

      setIsLoading(true);
      setError(null); // Clear any previous errors

      try {
        // 2. The actual fetch call, passing the abort signal
        const response = await fetch(
          `${import.meta.env.VITE_API_URL}/api/opcions?filters[product][id][$eq]=${itemId}&populate=product`,
          { signal },
        );

        // 3. Catch HTTP errors (fetch doesn't throw errors for 404s automatically)
        if (!response.ok) {
          throw new Error(`Data not found (Error ${response.status})`);
        }

        const result = await response.json();
        setData(result);
      } catch (err) {
        // 4. Ignore the error if it was caused by us intentionally aborting the request
        if (err.name !== "AbortError") {
          setError(err.message);
        }
      } finally {
        // Stop the loading spinner only if the request wasn't cancelled
        if (!signal.aborted) {
          setIsLoading(false);
        }
      }
    };

    fetchData();

    return () => {
      controller.abort();
    };
  }, [isOpen, itemId]);

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center"
      onClick={onClose}
    >
      <div
        className="bg-gray-800 relative opacity-100 p-6 rounded-lg shadow-lg w-80 overflow-y-auto max-h-[80vh]"
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
      >
        {isLoading ? (
          <div role="status" className="flex flex-col items-center">
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
                fill="#145cfa"
              />
            </svg>
            <span className="sr-only">Loading...</span>
          </div>
        ) : error ? (
          <div style={{ color: "red" }}>
            <h2 className="font-bold">Oops!</h2>
            <p className="font-bold">{error}</p>
          </div>
        ) : data && data.data && data.data.length > 0 ? (
          <>
            <button
              className="close-button absolute top-0 right-2 p-1 text-white text-2xl font-bold"
              onClick={onClose}
            >
              &times;
            </button>
            <div className="text-sm">
              <h2 className="font-bold mb-2">
                {data.data[0].product?.Nombre || "Producto"}
              </h2>

              <div className="my-2 grid grid-cols-2 gap-4 ">
                {data.data.map((opcion) => {
                  const bsPrice =
                    Math.trunc(opcion.Precio * DolarParalelo * 100) / 100;
                  const selected = selectedOptionId === opcion.id;
                  return (
                    <button
                      key={opcion.id}
                      type="button"
                      onClick={() => setSelectedOptionId(opcion.id)}
                      className={`border rounded-lg text-sm p-2 text-left ${selected ? "bg-yellow-400 text-black" : "bg-gray-700 text-white"}`}
                    >
                      <p className="font-semibold">{opcion.TipoCoin}</p>
                      <p>{bsPrice} Bs.</p>
                    </button>
                  );
                })}
              </div>
            </div>

            <form
              className="flex flex-col gap-2 my-4"
              onSubmit={(e) => e.preventDefault()}
            >
              {/* FREE FIRE IF OPERATION */}
              {data.data[0].product?.Nombre == "Free Fire" && (
                <>
                  <label htmlFor="id" className="text-sm text-white">
                    ID de jugador:
                  </label>
                  <input
                    value={userIdVal}
                    onChange={(e) => setUserIdVal(e.target.value)}
                    type="text"
                    id="id"
                    name="id"
                    className="p-2 rounded-lg bg-gray-700 text-white"
                    placeholder="Ingresa tu ID"
                  />
                  <label className="block text-sm text-white">
                    Teléfono de contacto (WhatsApp):
                  </label>
                  <input
                    type="tel"
                    value={telefono}
                    onChange={(e) => setTelefono(e.target.value)}
                    className="w-full p-2 rounded bg-gray-700 text-white"
                    placeholder="Ingresa tu teléfono"
                    required
                  />
                </>
              )}

              {/* ROBLOX IF OPERATION */}
              {data.data[0].product?.Nombre == "Roblox" && (
                <>
                  <label htmlFor="datos-cuenta" className="text-sm text-white">
                    Datos de cuenta:
                  </label>
                  <input
                    value={userIdVal}
                    onChange={(e) => setUserIdVal(e.target.value)}
                    type="text"
                    id="id"
                    name="id"
                    className="p-2 rounded-lg bg-gray-700 text-white"
                    placeholder="ID de la cuenta"
                  />
                  <input
                    value={emailVal}
                    onChange={(e) => setEmailVal(e.target.value)}
                    type="email"
                    id="email"
                    name="email"
                    className="p-2 rounded-lg bg-gray-700 text-white"
                    placeholder="Correo electrónico de la cuenta"
                  />
                  <input
                    value={passwordVal}
                    onChange={(e) => setPasswordVal(e.target.value)}
                    type="password"
                    id="password"
                    name="password"
                    className="p-2 rounded-lg bg-gray-700 text-white"
                    placeholder="Contraseña de la cuenta"
                  />

                  <label className="block text-sm text-white">
                    Teléfono de contacto (WhatsApp):
                  </label>
                  <input
                    type="tel"
                    value={telefono}
                    onChange={(e) => setTelefono(e.target.value)}
                    className="w-full p-2 rounded bg-gray-700 text-white"
                    placeholder="Ingresa tu teléfono"
                    required
                  />
                </>
              )}

              {/* BLOOD STRIKE IF OPERATION */}
              {data.data[0].product?.Nombre == "Blood Strike" && (
                <>
                  <label htmlFor="id" className="text-sm text-white">
                    ID de jugador:
                  </label>
                  <input
                    value={userIdVal}
                    onChange={(e) => setUserIdVal(e.target.value)}
                    type="text"
                    id="id"
                    name="id"
                    className="p-2 rounded-lg bg-gray-700 text-white"
                    placeholder="Ingresa tu ID"
                  />
                  <label className="block text-sm text-white">
                    Teléfono de contacto (WhatsApp):
                  </label>
                  <input
                    type="tel"
                    value={telefono}
                    onChange={(e) => setTelefono(e.target.value)}
                    className="w-full p-2 rounded bg-gray-700 text-white"
                    placeholder="Ingresa tu teléfono"
                    required
                  />
                </>
              )}

              {/* COD MOBILE IF OPERATION */}
              {data.data[0].product?.Nombre == "COD Mobile" && (
                <>
                  <label htmlFor="datos-cuenta" className="text-sm text-white">
                    Datos de cuenta:
                  </label>
                  <input
                    value={emailVal}
                    onChange={(e) => setEmailVal(e.target.value)}
                    type="email"
                    id="email"
                    name="email"
                    className="p-2 rounded-lg bg-gray-700 text-white"
                    placeholder="Correo electrónico de la cuenta"
                  />
                  <input
                    value={passwordVal}
                    onChange={(e) => setPasswordVal(e.target.value)}
                    type="password"
                    id="password"
                    name="password"
                    className="p-2 rounded-lg bg-gray-700 text-white"
                    placeholder="Contraseña de la cuenta"
                  />
                  <label htmlFor="iniciosesion" className="text-sm text-white">
                    Metodo de inicio de sesión:
                  </label>
                  <select
                    id="iniciosesion"
                    name="iniciosesion"
                    value={loginMethod}
                    onChange={(e) => setLoginMethod(e.target.value)}
                    className="p-2 rounded-lg bg-gray-700 text-white"
                  >
                    <option value="facebook">Facebook</option>
                    <option value="google">Google</option>
                    <option value="activision">Activision</option>
                  </select>
                  <label className="block text-sm text-white">
                    Teléfono de contacto (WhatsApp):
                  </label>
                  <input
                    type="tel"
                    value={telefono}
                    onChange={(e) => setTelefono(e.target.value)}
                    className="w-full p-2 rounded bg-gray-700 text-white"
                    placeholder="Ingresa tu teléfono"
                    required
                  />
                </>
              )}
              <label htmlFor="payment" className="text-sm text-white">
                Método de pago:
              </label>
              <select
                id="payment"
                name="payment"
                value={paymentMethod}
                onChange={(e) => setPaymentMethod(e.target.value)}
                className="p-2 rounded-lg bg-gray-700 text-white"
              >
                <option value="pago-movil">Pago movil</option>
                {/* <option value="zinli">Zinli</option>
                <option value="binance">Binance</option>
                <option value="kontigo">Kontigo</option> */}
              </select>
            </form>

            {/* Payment details placeholder per method */}
            <div className="text-sm bg-gray-700 text-white p-3 rounded-lg mb-3">
              {paymentMethod === "pago-movil" && (
                <ul ref={paymentListRef} className="list-none space-y-2">
                  <li className="font-semibold">Pago Móvil</li>
                  <li className="flex items-center justify-between">
                    <span>Banco: Banco Plaza</span>
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
                    <span className="ml-2">Copiar todo</span>
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

            <div className="flex flex-col items-center gap-2">
              <button
                id="cart"
                onClick={() => {
                  const opcion = data.data.find(
                    (o) => o.id === selectedOptionId,
                  );
                  if (!opcion) {
                    setError(
                      "Seleccione una opción antes de añadir al carrito.",
                    );
                    return;
                  }
                  const productName = data.data[0].product?.Nombre || "";
                  const cartItem = {
                    IDProducto: itemId,
                    NombreProducto: productName,
                    IDCoin: opcion.id,
                    CoinSeleccionada: opcion.TipoCoin,
                    PrecioDolares: opcion.Precio,
                    PrecioBolivares:
                      Math.trunc(opcion.Precio * DolarParalelo * 100) / 100,
                    IDdelUsuario: userIdVal,
                    CorreoCuenta: emailVal,
                    ContraseñaCuenta: passwordVal,
                    MetodoInicioSesion: loginMethod,
                    MetodoPago: paymentMethod,
                    FechaAgregado: new Date().toISOString(),
                  };

                  try {
                    const existing = JSON.parse(
                      localStorage.getItem("cart") || "[]",
                    );
                    existing.push(cartItem);
                    localStorage.setItem("cart", JSON.stringify(existing));
                    setSuccessMessage("Añadido al carrito");
                    setError(null);
                    // optional: clear form or close modal

                    setTimeout(() => {
                      setSuccessMessage("");
                      onClose();
                    }, 1500);
                    setTelefono("");
                    setEmailVal("");
                    setPasswordVal("");
                    setUserIdVal("");
                  } catch (e) {
                    setError("No se pudo guardar el carrito.");
                  }
                }}
                className="bg-yellow-500 py-1 px-2 rounded-lg text-black"
              >
                Añadir al carrito
              </button>
              {successMessage && (
                <span className="w-full text-center text-white bg-green-500 px-2 py-1 rounded">
                  {successMessage}
                </span>
              )}
            </div>
          </>
        ) : (
          <p>No hay opciones disponibles para este producto.</p>
        )}
      </div>
    </div>
  );
};

export default Modal;
