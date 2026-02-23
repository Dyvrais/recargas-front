import React from "react";

const ReceiptModal = ({
  isOpen,
  onClose,
  data,
  orderId,
  paymentMethod,
  referencia,
}) => {
  if (!isOpen || !data) return null;

  const montoTotal = data.reduce((sum, item) => {
    const num =
      parseFloat(String(item.PrecioBolivares || 0).replace(/[^0-9.-]+/g, "")) ||
      0;
    return sum + num;
  }, 0);

  return (
    <div
      className="fixed inset-0 z-60 flex items-center justify-center font-Noto bg-black/40"
      onClick={onClose}
    >
      <div
        className="bg-white text-black rounded-lg p-4 w-72 md:w-96 shadow-lg"
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
      >
        <h3 className="text-center text-sm font-bold text-white bg-green-600 rounded-lg rounded-lg p-2 mb-4">
          Su orden ha sido registrada con exito
        </h3>
        <div className="text-center border-b pb-2 mb-2">
          <h3 className="font-bold">Recibo</h3>
          {orderId ? <small className="text-xs">Orden #{orderId}</small> : null}
        </div>
        <div className="text-sm space-y-2 max-h-60 overflow-y-auto">
          {data.map((item, idx) => (
            <div key={idx} className="flex justify-between">
              <div>
                <div className="font-semibold">{item.NombreProducto}</div>
                <div className="text-xs text-gray-700">
                  {item.CoinSeleccionada}
                </div>
              </div>
              <div className="text-right">
                <div className="font-semibold">{item.PrecioBolivares} Bs.</div>
              </div>
            </div>
          ))}
        </div>
        <div className="border-t mt-3 pt-2">
          <div className="flex justify-between font-semibold">
            <span>Total:</span>
            <span>{montoTotal.toFixed(2)} Bs.</span>
          </div>
          <div className="mt-2 text-xs">
            <div>
              Metodo:{" "}
              {paymentMethod === "pago-movil" ? "Pago Móvil" : paymentMethod}
            </div>
            <div>Referencia: {referencia || "-"}</div>
          </div>
        </div>
        <div className="mt-4 flex justify-end">
          <button
            onClick={onClose}
            className="bg-gray-800 text-white px-3 py-1 rounded"
          >
            Cerrar
          </button>
        </div>
      </div>
    </div>
  );
};

export default ReceiptModal;
