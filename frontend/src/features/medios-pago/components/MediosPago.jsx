import React from "react";

const MediosPago = ({ medioPago, onDelete, onEdit }) => {
  const tipoLabels = {
    'TC': 'Tarjeta de Crédito',
    'TD': 'Tarjeta de Débito', 
    'TR': 'Transferencia',
    'EF': 'Efectivo'
  };

  const getTypeIcon = (tipo) => {
    switch(tipo) {
      case 'TC':
      case 'TD':
        return (
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
          </svg>
        );
      case 'TR':
        return (
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" />
          </svg>
        );
      case 'EF':
        return (
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z" />
          </svg>
        );
      default:
        return (
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
          </svg>
        );
    }
  };

  return (
    <div className="bg-white shadow rounded-xl p-4 flex justify-between items-center">
      {/* Info izquierda */}
      <div className="flex items-center gap-3">
        <div className="p-2 bg-blue-50 rounded-lg text-blue-600">
          {getTypeIcon(medioPago.tipo)}
        </div>
        <div>
          <h2 className="text-lg font-semibold text-gray-800">
            {medioPago.ente_emisor}
          </h2>
          <p className="text-sm text-gray-500">
            {tipoLabels[medioPago.tipo] || medioPago.tipo}
            {medioPago.tipo_tarjeta && ` • ${medioPago.tipo_tarjeta}`}
          </p>
          {medioPago.extra && (
            <p className="text-sm text-gray-500 mt-1">{medioPago.extra}</p>
          )}
        </div>
      </div>

      {/* Acciones */}
      <div className="flex items-center space-x-2">
        <button 
          onClick={() => onEdit(medioPago.id)}
          className="text-emerald-500 hover:text-emerald-700 p-2 rounded-lg hover:bg-emerald-50 transition-colors duration-200"
          title="Editar medio de pago"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
          </svg>
        </button>
        <button 
          onClick={() => onDelete(medioPago.id)}
          className="text-red-500 hover:text-red-700 p-2 rounded-lg hover:bg-red-50 transition-colors duration-200"
          title="Eliminar medio de pago"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
          </svg>
        </button>
      </div>
    </div>
  );
};

export default MediosPago;