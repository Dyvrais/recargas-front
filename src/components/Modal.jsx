import React, { useState, useRef, useMemo } from "react";
import useSWR from "swr";
import CachedImg from "../lib/CachedImg";

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
  const [successMessage, setSuccessMessage] = useState("");
  const [idZonaVal, setIdZonaVal] = useState("");
  const formRef = useRef(null);
  const [isFormValid, setIsFormValid] = useState(false);

  const { data: dolarData } = useSWR("https://ve.dolarapi.com/v1/dolares");

  React.useEffect(() => {
    if (!dolarData) return;
    try {
      setDolarParalelo(dolarData[1].promedio);
      setDolar(dolarData[0].promedio);
    } catch (e) {
      // ignore malformed dolar data
    }
  }, [dolarData]);

  const opcionesSorted = useMemo(() => {
    if (!data?.data) return [];
    const rate = Number(DolarParalelo) || 0;
    return [...data.data].sort((a, b) => {
      const aBs = Math.trunc((a?.Precio || 0) * rate * 100) / 100;
      const bBs = Math.trunc((b?.Precio || 0) * rate * 100) / 100;
      return aBs - bBs;
    });
  }, [data, DolarParalelo]);

  const handleTelefonoChange = (e) => {
    // 1. Eliminar todo lo que no sea número
    const input = e.target.value.replace(/\D/g, "");

    // 2. Limitar a 11 dígitos (formato estándar 04XX1234567)
    const truncated = input.slice(0, 11);

    // 3. Aplicar la máscara dinámica (Ej: 0412-1234567)
    let formatted = truncated;
    if (truncated.length > 4) {
      formatted = `${truncated.slice(0, 4)}-${truncated.slice(4)}`;
    }

    setTelefono(formatted);
  };

  const key =
    isOpen && itemId !== null
      ? `/api/opcions?filters[product][id][$eq]=${itemId}&populate=*`
      : null;

  const {
    data: opcionesData,
    error: opcionesError,
    isLoading: opcionesLoading,
  } = useSWR(key);

  // Mirror SWR states into local state used by the component
  React.useEffect(() => {
    setIsLoading(Boolean(opcionesLoading));
    setError(
      opcionesError ? opcionesError.message || String(opcionesError) : null,
    );
    setData(opcionesData || null);
  }, [opcionesData, opcionesError, opcionesLoading]);

  const validateFormFields = () => {
    const form = formRef.current;
    if (!form) return false;
    const elements = Array.from(form.elements || []);
    // Only validate fields that are explicitly required
    for (const el of elements) {
      // Treat either native `required` or our CSS marker class `required-field` as required
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

  const strictValidate = () => {
    // Ensure a coin/option is selected
    if (!selectedOptionId) return false;
    const productName = data?.data?.[0]?.product?.Nombre || "";
    const categoria = data?.data?.[0]?.product?.categoria || "";
    const phone = String(telefono || "").trim();

    // streaming items only need phone
    if (categoria === "streaming") return phone.length > 0;

    switch (productName) {
      case "Steam":
        return Boolean(
          String(userIdVal || "").trim() &&
          String(passwordVal || "").trim() &&
          phone.length > 0,
        );
      case "Free Fire":
      case "Free Fire Pases y Tarjetas":
        return Boolean(String(userIdVal || "").trim() && phone.length > 0);
      case "Roblox":
        return Boolean(
          String(emailVal || "").trim() &&
          String(passwordVal || "").trim() &&
          phone.length > 0,
        );
      case "Mobile Legends":
        return Boolean(
          String(userIdVal || "").trim() &&
          String(idZonaVal || "").trim() &&
          phone.length > 0,
        );
      case "Delta Force":
      case "Bloodstrike":
        return Boolean(String(userIdVal || "").trim() && phone.length > 0);
      default:
        // Most other products require at least a contact phone
        return phone.length > 0;
    }
  };

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center"
      onClick={onClose}
    >
      <div
        className="bg-gray-800 relative opacity-100 p-6 rounded-lg shadow-lg w-80 md:w-120 overflow-y-auto max-h-[80vh]"
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
                fill="#eab308"
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

              <div className="my-2 grid grid-cols-1 gap-4 ">
                {(() => {
                  const productName = data.data[0].product?.Nombre;
                  let options = opcionesSorted;
                  if (productName === "Free Fire Pases y Tarjetas") {
                    const priority = [
                      "Tarjeta semanal básica",
                      "Tarjeta semanal",
                      "Tarjeta mensual",
                      "Pase booyah",
                      "Paquete de nivel (completo)",
                    ];
                    options = [...opcionesSorted].sort((a, b) => {
                      const nameA = (a.TipoCoin || "").toString();
                      const nameB = (b.TipoCoin || "").toString();
                      const ia = priority.indexOf(nameA);
                      const ib = priority.indexOf(nameB);
                      if (ia !== -1 || ib !== -1) {
                        if (ia === -1) return 1;
                        if (ib === -1) return -1;
                        return ia - ib;
                      }
                      return 0;
                    });
                  }

                  if (productName === "Mobile Legends") {
                    const priority = ["Pase semanal de la MLBB"];
                    options = [...opcionesSorted].sort((a, b) => {
                      const nameA = (a.TipoCoin || "").toString();
                      const nameB = (b.TipoCoin || "").toString();
                      const ia = priority.indexOf(nameA);
                      const ib = priority.indexOf(nameB);
                      if (ia !== -1 || ib !== -1) {
                        if (ia === -1) return -1;
                        if (ib === -1) return 1;
                        return ia - ib;
                      }
                      return 0;
                    });
                  }

                  return options.map((opcion) => {
                    const getImageUrl = (imgField) => {
                      if (!imgField) return null;
                      const base = (import.meta.env.VITE_API_URL || "").replace(
                        /\/$/,
                        "",
                      );

                      if (typeof imgField === "string") {
                        return imgField.startsWith("/")
                          ? base + imgField
                          : imgField;
                      }

                      if (imgField.data) {
                        const d = imgField.data;
                        const url = Array.isArray(d)
                          ? d[0]?.attributes?.url
                          : d.attributes?.url;
                        if (url) return url.startsWith("/") ? base + url : url;
                      }

                      if (Array.isArray(imgField) && imgField[0]?.url) {
                        const url = imgField[0].url;
                        return url.startsWith("/") ? base + url : url;
                      }
                      if (imgField.url) {
                        const url = imgField.url;
                        return url.startsWith("/") ? base + url : url;
                      }

                      if (imgField.attributes?.url) {
                        const url = imgField.attributes.url;
                        return url.startsWith("/") ? base + url : url;
                      }

                      return null;
                    };

                    const bsPrice =
                      Math.trunc(opcion.Precio * DolarParalelo * 100) / 100;
                    const selected = selectedOptionId === opcion.id;
                    const imgUrl = getImageUrl(opcion.ImagenCoin);

                    return (
                      <button
                        key={opcion.id}
                        type="button"
                        onClick={() => setSelectedOptionId(opcion.id)}
                        className={`border flex rounded-lg text-sm p-2 items-center text-left ${selected ? "bg-yellow-400 text-black" : "bg-gray-900 text-white"}`}
                      >
                        {imgUrl ? (
                          <CachedImg
                            src={imgUrl}
                            className="size-6 justify-center"
                            alt={opcion.TipoCoin || ""}
                          />
                        ) : null}
                        <div className="flex flex-col pl-4 py-2">
                          <p className="font-semibold">{opcion.TipoCoin}</p>
                          <p
                            className={`${selected ? "font-bold text-black" : "text-yellow-500"}`}
                          >
                            {bsPrice} Bs.
                          </p>
                        </div>
                      </button>
                    );
                  });
                })()}
              </div>
            </div>

            <form
              ref={formRef}
              className="flex flex-col gap-2 my-4"
              onSubmit={(e) => e.preventDefault()}
              onChange={() =>
                setIsFormValid(validateFormFields() && strictValidate())
              }
            >
              {data.data[0].product?.Nombre == "Steam" && (
                <>
                  <label htmlFor="datos-cuenta" className="text-sm text-white">
                    Datos de cuenta:
                  </label>
                  <input
                    value={userIdVal}
                    onChange={(e) => setUserIdVal(e.target.value)}
                    type="text"
                    id="userId"
                    name="userId"
                    className="p-2 rounded-lg bg-gray-700 text-white"
                    placeholder="Usuario de la cuenta"
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
                    onChange={handleTelefonoChange}
                    className="w-full p-2 rounded bg-gray-700 text-white"
                    placeholder="Ingresa tu teléfono ej: 04121234567"
                    maxLength={12}
                    required
                  />
                </>
              )}

              {/* FREE FIRE IF OPERATION */}
              {(data.data[0].product?.Nombre == "Free Fire" ||
                data.data[0].product?.Nombre ==
                  "Free Fire Pases y Tarjetas") && (
                <>
                  <label htmlFor="id" className="text-sm text-white">
                    ID de jugador:
                  </label>
                  <input
                    value={userIdVal}
                    onChange={(e) => setUserIdVal(e.target.value)}
                    type="number"
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
                    onChange={handleTelefonoChange}
                    className="w-full p-2 rounded bg-gray-700 text-white"
                    placeholder="Ingresa tu teléfono ej: 04121234567"
                    maxLength={12}
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
                    onChange={handleTelefonoChange}
                    className="w-full p-2 rounded bg-gray-700 text-white"
                    placeholder="Ingresa tu teléfono ej: 04121234567"
                    maxLength={12}
                    required
                  />
                </>
              )}

              {/* BLOOD STRIKE IF OPERATION */}
              {data.data[0].product?.Nombre == "Bloodstrike" && (
                <>
                  <label htmlFor="id" className="text-sm text-white">
                    ID de jugador:
                  </label>
                  <input
                    value={userIdVal}
                    onChange={(e) => setUserIdVal(e.target.value)}
                    type="number"
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
                    onChange={handleTelefonoChange}
                    className="w-full p-2 rounded bg-gray-700 text-white"
                    placeholder="Ingresa tu teléfono ej: 04121234567"
                    maxLength={12}
                    required
                  />
                </>
              )}

              {/* COD MOBILE IF OPERATION */}
              {data.data[0].product?.Nombre == "Call of Duty Mobile" && (
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
                    onChange={handleTelefonoChange}
                    className="w-full p-2 rounded bg-gray-700 text-white"
                    placeholder="Ingresa tu teléfono ej: 04121234567"
                    maxLength={12}
                    required
                  />
                </>
              )}

              {/* CLASH ROYALE IF OPERATION */}
              {data.data[0].product?.Nombre == "Clash Royale" && (
                <>
                  <label htmlFor="email" className="text-sm text-white">
                    Datos de la cuenta:
                  </label>
                  <input
                    value={emailVal}
                    onChange={(e) => setEmailVal(e.target.value)}
                    type="text"
                    id="email"
                    name="email"
                    className="p-2 rounded-lg bg-gray-700 text-white"
                    placeholder="Ingresa tu correo de Supercell"
                  />
                  <label className="block text-sm text-white">
                    Teléfono de contacto (WhatsApp):
                  </label>
                  <input
                    type="tel"
                    value={telefono}
                    onChange={handleTelefonoChange}
                    className="w-full p-2 rounded bg-gray-700 text-white"
                    placeholder="Ingresa tu teléfono ej: 04121234567"
                    maxLength={12}
                    required
                  />
                </>
              )}

              {/* DELTA FORCE IF OPERATION */}
              {data.data[0].product?.Nombre == "Delta Force" && (
                <>
                  <label htmlFor="email" className="text-sm text-white">
                    ID de jugador:
                  </label>
                  <input
                    value={userIdVal}
                    onChange={(e) => setUserIdVal(e.target.value)}
                    type="number"
                    id="userId"
                    name="userId"
                    className="p-2 rounded-lg bg-gray-700 text-white"
                    placeholder="Ingresa tu ID"
                  />
                  <label className="block text-sm text-white">
                    Teléfono de contacto (WhatsApp):
                  </label>
                  <input
                    type="tel"
                    value={telefono}
                    onChange={handleTelefonoChange}
                    className="w-full p-2 rounded bg-gray-700 text-white"
                    placeholder="Ingresa tu teléfono ej: 04121234567"
                    maxLength={12}
                    required
                  />
                </>
              )}

              {/* EA FC MOBILE IF OPERATION */}
              {data.data[0].product?.Nombre == "EA FC Mobile" && (
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
                    <option value="Facebook">Facebook</option>
                    <option value="EA">EA</option>
                    <option value="Google">Google</option>
                  </select>
                  <label className="block text-sm text-white">
                    Teléfono de contacto (WhatsApp):
                  </label>
                  <input
                    type="tel"
                    value={telefono}
                    onChange={handleTelefonoChange}
                    className="w-full p-2 rounded bg-gray-700 text-white"
                    placeholder="Ingresa tu teléfono ej: 04121234567"
                    maxLength={12}
                    required
                  />
                </>
              )}

              {/* WILD RIFT IF OPERATION */}
              {data.data[0].product?.Nombre == "Wild Rift" && (
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
                    <option value="Facebook">Facebook</option>
                    <option value="Riot">Riot</option>
                    <option value="Google">Google</option>
                  </select>
                  <label className="block text-sm text-white">
                    Teléfono de contacto (WhatsApp):
                  </label>
                  <input
                    type="tel"
                    value={telefono}
                    onChange={handleTelefonoChange}
                    className="w-full p-2 rounded bg-gray-700 text-white"
                    placeholder="Ingresa tu teléfono ej: 04121234567"
                    maxLength={12}
                    required
                  />
                </>
              )}

              {/* MOBILE LEGENDS IF OPERATION */}
              {data.data[0].product?.Nombre == "Mobile Legends" && (
                <>
                  <label htmlFor="id" className="text-sm text-white">
                    ID de jugador:
                  </label>
                  <input
                    value={userIdVal}
                    onChange={(e) => setUserIdVal(e.target.value)}
                    type="number"
                    id="userId"
                    name="userId"
                    className="p-2 rounded-lg bg-gray-700 text-white"
                    placeholder="Ingresa tu ID"
                  />
                  <label className="block text-sm text-white">
                    Identificación de zona:
                  </label>
                  <input
                    value={idZonaVal}
                    onChange={(e) => setIdZonaVal(e.target.value)}
                    type="text"
                    id="idzona"
                    name="idzona"
                    className="p-2 rounded-lg bg-gray-700 text-white"
                    placeholder="Ingresa tu ID de zona"
                  />
                  <label className="block text-sm text-white">
                    Teléfono de contacto (WhatsApp):
                  </label>
                  <input
                    type="tel"
                    value={telefono}
                    onChange={handleTelefonoChange}
                    className="w-full p-2 rounded bg-gray-700 text-white"
                    placeholder="Ingresa tu teléfono ej: 04121234567"
                    maxLength={12}
                    required
                  />
                </>
              )}
              {/* STREAMING IF OPERATION */}
              {data.data[0].product?.categoria == "streaming" && (
                <>
                  <label className="block text-sm text-white">
                    Teléfono de contacto (WhatsApp):
                  </label>
                  <input
                    type="tel"
                    value={telefono}
                    onChange={(e) => setTelefono(e.target.value)}
                    className="w-full p-2 rounded bg-gray-700 text-white"
                    placeholder="Ingresa tu teléfono ej: 04121234567"
                    pattern="0[412]{2}[0-9]{7}"
                    required
                  />
                </>
              )}

              {/* BRAWL STARS AND CLASH OF CLANS IF OPERATION */}
              {(data.data[0].product?.Nombre == "Brawl Stars" ||
                data.data[0].product?.Nombre == "Clash of Clans") && (
                <>
                  <label className="block text-sm text-white">
                    Teléfono de contacto (WhatsApp):
                  </label>
                  <input
                    type="tel"
                    value={telefono}
                    onChange={handleTelefonoChange}
                    className="w-full p-2 rounded bg-gray-700 text-white"
                    placeholder="Ingresa tu teléfono ej: 04121234567"
                    maxLength={12}
                    required
                  />
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
                    placeholder="Ingresa tu correo Supercell"
                  />
                </>
              )}

              {/* TIKTOK IF OPERATION */}
              {data.data[0].product?.Nombre == "TikTok" && (
                <>
                  <label className="block text-sm text-white">
                    Teléfono de contacto (WhatsApp):
                  </label>
                  <input
                    type="tel"
                    value={telefono}
                    onChange={handleTelefonoChange}
                    className="w-full p-2 rounded bg-gray-700 text-white"
                    placeholder="Ingresa tu teléfono ej: 04121234567"
                    maxLength={12}
                    required
                  />
                  <label htmlFor="datos-cuenta" className="text-sm text-white">
                    Datos de cuenta:
                  </label>
                  <input
                    value={userIdVal}
                    onChange={(e) => setUserIdVal(e.target.value)}
                    type="text"
                    id="userId"
                    name="userId"
                    className="p-2 rounded-lg bg-gray-700 text-white"
                    placeholder="Correo electrónico/usuario de la cuenta"
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
                    <option value="Facebook">Facebook</option>
                    <option value="TikTok">TikTok</option>
                    <option value="Google">Google</option>
                  </select>
                </>
              )}

              {/* ZINLI IF OPERATION */}
              {data.data[0].product?.Nombre == "Zinli" && (
                <>
                  <label className="block text-sm text-white">
                    Teléfono de contacto (WhatsApp):
                  </label>
                  <input
                    type="tel"
                    value={telefono}
                    onChange={handleTelefonoChange}
                    className="w-full p-2 rounded bg-gray-700 text-white"
                    placeholder="Ingresa tu teléfono ej: 04121234567"
                    maxLength={12}
                    required
                  />
                  <label htmlFor="datos-cuenta" className="text-sm text-white">
                    Datos de Zinli:
                  </label>
                  <input
                    value={emailVal}
                    onChange={(e) => setEmailVal(e.target.value)}
                    type="email"
                    id="email"
                    name="email"
                    className="p-2 rounded-lg bg-gray-700 text-white"
                    placeholder="Correo electrónico asociado a tu cuenta de Zinli"
                  />
                </>
              )}
              {/* <label htmlFor="payment" className="text-sm text-white">
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
                <option value="zinli">Zinli</option>
                <option value="binance">Binance</option>
                <option value="kontigo">Kontigo</option>
              </select> */}
            </form>

            <div className="flex flex-col items-center gap-2">
              <button
                id="cart"
                onClick={() => {
                  // Validate form before allowing add-to-cart
                  if (!validateFormFields() || !strictValidate()) {
                    setError("Por favor completa los campos requeridos.");
                    return;
                  }
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
                    IDCoin: opcion.id,
                    NombreProducto: productName,
                    CoinSeleccionada: opcion.TipoCoin,
                    PrecioDolares: opcion.Precio,
                    PrecioBolivares:
                      Math.trunc(opcion.Precio * DolarParalelo * 100) / 100,
                    IDdelUsuario: userIdVal,
                    CorreoDeCuenta: emailVal,
                    ContraseñaDeCuenta: passwordVal,
                    MetodoDeInicioSesion: loginMethod,
                    TelefonoDeContacto: telefono,
                    IDZona: idZonaVal,
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
                    setIdZonaVal("");
                  } catch (e) {
                    setError("No se pudo guardar el carrito.");
                  }
                }}
                disabled={!isFormValid || !selectedOptionId}
                className="bg-yellow-500 py-1 px-2 rounded-lg text-black disabled:opacity-50"
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

// Homens 🔥 queimem a vila 🏘️ e o templo 🏛️ de Atenas ⚔️,
// destruam 💥 tudo e todos ☠️, vamos saudar 🙌 nosso senhor Ares 🩸🛡️,
// vamos homens ⚔️, acabem com tudo 💣🔥!!
