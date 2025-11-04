import React, { memo, useState, useCallback } from "react";
import { Eye } from "lucide-react";
import { formatLocalDate } from "../../../utils/dateUtils";
import { getTextClass } from "../../../utils/colorSystem";

const Gasto = memo(({ gasto, onDelete, onEdit, onPayCuota }) => {
    // Fix timezone issue: parse date in local timezone instead of UTC
    const formattedDate = formatLocalDate(gasto.fecha_gasto);
    
    // State for payment confirmation
    const [isConfirming, setIsConfirming] = useState(false);
    
    // Determine payment status
    const isPaid = gasto.pagos_realizados === gasto.pagos_totales;
    const statusText = isPaid ? "Pagado" : "Pendiente";
    const canPayCuota = !isPaid && gasto.pagos_realizados < gasto.pagos_totales;
    
    // Calculate amounts
    const hasCuotas = gasto.pagos_totales > 1;

    const montoPagado = gasto.monto * (gasto.pagos_realizados / gasto.pagos_totales);

    const montoTotal = gasto.monto;

    // Handle payment button click
    const handlePaymentClick = useCallback(() => {
      if (isConfirming) {
        // Second click - confirm payment
        onPayCuota(gasto.id);
        setIsConfirming(false);
      } else {
        // First click - show confirmation
        setIsConfirming(true);
        // Auto-reset after 3 seconds if not confirmed
        setTimeout(() => {
          setIsConfirming(false);
        }, 3000);
      }
    }, [isConfirming, onPayCuota, gasto.id]);

  return (
    <div className="bg-white shadow rounded-xl p-4 flex justify-between items-center">
      {/* Info izquierda */}
      <div>
        <h2 className="text-lg font-semibold text-gray-800">
          {gasto.titulo}
        </h2>
        <p className="text-sm text-gray-500">
          {gasto.categoria.name || gasto.categoria} • {formattedDate}
        </p>
        {gasto.comentarios && (
          <p className="text-sm text-gray-500 mt-1">{gasto.comentarios}</p>
        )}
        <div className="flex items-center gap-2 mt-2">
          <span
            className={`text-xs font-medium px-2 py-1 rounded-full ${
              isPaid
                ? "bg-green-100 text-green-700"
                : "bg-orange-100 text-orange-700"
            }`}
          >
            {statusText}
          </span>
          <span className="text-xs text-gray-500">
            {gasto.pagos_realizados} / {gasto.pagos_totales} pagos
          </span>
        </div>
      </div>

      {/* Monto + acciones */}
      <div className="flex items-center space-x-4">
        <div className="text-right">
          {hasCuotas ? (
            <>
              <p className={`text-lg font-bold ${getTextClass(gasto.moneda)}`}>
                ${montoPagado.toLocaleString()} / ${montoTotal.toLocaleString()} {gasto.moneda}
              </p>
              <p className="text-xs text-gray-500">
                {gasto.pagos_realizados} de {gasto.pagos_totales > 1 ? gasto.pagos_totales : 1} cuotas de ${(gasto.monto / gasto.pagos_totales).toFixed(2)}
              </p>
            </>
          ) : (
            <p className={`text-lg font-bold ${getTextClass(gasto.moneda)}`}>
              ${gasto.monto.toLocaleString()} {gasto.moneda}
            </p>
          )}
        </div>
        {canPayCuota && (
          <button 
            onClick={handlePaymentClick}
            className={`text-white text-sm font-medium px-4 py-2 rounded-lg transition-all duration-200 ${
              isConfirming 
                ? 'bg-yellow-500 hover:bg-yellow-600 animate-pulse' 
                : 'bg-green-500 hover:bg-green-600'
            }`}
          >
            {isConfirming ? '¿Confirmar?' : 'Pagar cuota'}
          </button>
        )}
        <button 
          onClick={() => onEdit(gasto.id)}
          className="text-dodger-blue-500 hover:text-dodger-blue-700 p-2 rounded-lg text-b hover:bg-dodger-blue-50 transition-colors duration-200"
          title="Ver detalles"
        >
          <Eye className="w-5 h-5" />
        </button>
        <button 
          onClick={() => onDelete(gasto.id)}
          className="text-red-500 hover:text-red-700 p-2 rounded-lg hover:bg-red-50 transition-colors duration-200"
          title="Eliminar gasto"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
          </svg>
        </button>
      </div>
    </div>
  );
});

Gasto.displayName = 'Gasto';

export default Gasto;