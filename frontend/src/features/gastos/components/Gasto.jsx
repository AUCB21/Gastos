import React from "react";
import { formatLocalDate } from "../../../utils/dateUtils";

const Gasto = ({ gasto, onDelete, onEdit }) => {
    // Fix timezone issue: parse date in local timezone instead of UTC
    const formattedDate = formatLocalDate(gasto.fecha_gasto);
    
    // Determine payment status
    const isPaid = gasto.pagos_realizados === gasto.pagos_totales;
    const statusText = isPaid ? "Pagado" : "Pendiente";

  return (
    <div className="bg-white shadow rounded-xl p-4 flex justify-between items-center">
      {/* Info izquierda */}
      <div>
        <h2 className="text-lg font-semibold text-gray-800">
          {gasto.vendedor}
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
        <p className="text-lg font-bold text-blue-600">
          ${gasto.monto.toLocaleString()} {gasto.moneda}
        </p>
        <button 
          onClick={() => onEdit(gasto.id)}
          className="text-blue-500 hover:text-blue-700 p-2 rounded-lg hover:bg-blue-50 transition-colors duration-200"
          title="Editar gasto"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
          </svg>
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
};

export default Gasto;