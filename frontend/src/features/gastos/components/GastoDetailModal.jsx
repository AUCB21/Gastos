import React, { useState } from 'react';
import { X, Calendar, DollarSign, User, Tag, MessageSquare, CreditCard, Edit2, CheckCircle } from 'lucide-react';
import { formatLocalDate } from '../../../utils/dateUtils';
import { componentStyles } from '../../../utils/colorSystem';

const GastoDetailModal = ({ gasto, onClose, onPayCuota, onEdit }) => {
  const [confirmAction, setConfirmAction] = useState(false);
  const [actionType, setActionType] = useState(null); // 'pay' or 'edit'

  if (!gasto) return null;

  const formattedDate = formatLocalDate(gasto.fecha_gasto);
  const isPaid = gasto.pagos_realizados === gasto.pagos_totales;
  const canPayCuota = !isPaid && gasto.pagos_realizados < gasto.pagos_totales;
  const hasCuotas = gasto.pagos_totales > 1;
  const montoPagado = gasto.monto * (gasto.pagos_realizados / gasto.pagos_totales);
  const montoTotal = gasto.monto;

  const handleActionRequest = (type) => {
    setActionType(type);
    setConfirmAction(true);
  };

  const handleConfirmAction = () => {
    if (actionType === 'pay') {
      onPayCuota(gasto.id);
    } else if (actionType === 'edit') {
      onEdit(gasto.id);
    }
    setConfirmAction(false);
    onClose();
  };

  const handleCancelAction = () => {
    setConfirmAction(false);
    setActionType(null);
  };

  return (
    <div className={`${componentStyles.modal.overlay} flex items-center justify-center`} onClick={onClose}>
      <div 
        className={`${componentStyles.modal.content} max-w-2xl w-full mx-4`}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h2 className="text-2xl font-bold text-gray-900">Detalle del Gasto</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {/* Title */}
          <div>
            <h3 className="text-xl font-semibold text-gray-800">{gasto.titulo || 'Sin título'}</h3>
            <div className="flex items-center gap-2 mt-2">
              <span
                className={`text-xs font-medium px-3 py-1 rounded-full ${
                  isPaid
                    ? 'bg-green-100 text-green-700'
                    : 'bg-orange-100 text-orange-700'
                }`}
              >
                {isPaid ? 'Pagado' : 'Pendiente'}
              </span>
              <span className="text-sm text-gray-500">
                {gasto.pagos_realizados} / {gasto.pagos_totales} cuotas
              </span>
            </div>
          </div>

          {/* Amount Info */}
          <div className="bg-blue-50 rounded-lg p-4">
            <div className="flex items-center gap-2 mb-2">
              <DollarSign className="w-5 h-5 text-blue-600" />
              <span className="font-medium text-gray-700">Monto</span>
            </div>
            {hasCuotas ? (
              <div>
                <p className="text-2xl font-bold text-gray-900">
                  ${montoPagado.toLocaleString()} / ${montoTotal.toLocaleString()} {gasto.moneda}
                </p>
                <p className="text-sm text-gray-600 mt-1">
                  {gasto.pagos_realizados} de {gasto.pagos_totales} cuotas de ${(gasto.monto / gasto.pagos_totales).toFixed(2)}
                </p>
              </div>
            ) : (
              <p className="text-2xl font-bold text-gray-900">
                ${gasto.monto.toLocaleString()} {gasto.moneda}
              </p>
            )}
          </div>

          {/* Details Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Date */}
            <div className="flex items-start gap-3">
              <Calendar className="w-5 h-5 text-gray-400 mt-0.5" />
              <div>
                <p className="text-sm text-gray-500">Fecha</p>
                <p className="font-medium text-gray-900">{formattedDate}</p>
              </div>
            </div>

            {/* Vendor */}
            <div className="flex items-start gap-3">
              <User className="w-5 h-5 text-gray-400 mt-0.5" />
              <div>
                <p className="text-sm text-gray-500">Vendedor</p>
                <p className="font-medium text-gray-900">{gasto.vendedor}</p>
              </div>
            </div>

            {/* Category */}
            <div className="flex items-start gap-3">
              <Tag className="w-5 h-5 text-gray-400 mt-0.5" />
              <div>
                <p className="text-sm text-gray-500">Categoría</p>
                <p className="font-medium text-gray-900">{gasto.categoria?.name || gasto.categoria}</p>
              </div>
            </div>

            {/* Payment Method */}
            <div className="flex items-start gap-3">
              <CreditCard className="w-5 h-5 text-gray-400 mt-0.5" />
              <div>
                <p className="text-sm text-gray-500">Medio de Pago</p>
                <p className="font-medium text-gray-900">
                  {gasto.medio_pago_info?.ente_emisor 
                    ? `${gasto.medio_pago_info.ente_emisor}${gasto.medio_pago_info.tipo ? ` - ${gasto.medio_pago_info.tipo}` : ''}`
                    : 'No especificado'
                  }
                </p>
              </div>
            </div>
          </div>

          {/* Comments */}
          {gasto.comentarios && (
            <div className="flex items-start gap-3">
              <MessageSquare className="w-5 h-5 text-gray-400 mt-0.5" />
              <div className="flex-1">
                <p className="text-sm text-gray-500 mb-1">Comentarios</p>
                <p className="text-gray-700">{gasto.comentarios}</p>
              </div>
            </div>
          )}
        </div>

        {/* Confirmation Section */}
        {confirmAction && (
          <div className="px-6 py-4 bg-yellow-50 border-t border-yellow-200">
            <p className="text-sm font-medium text-yellow-800 mb-3">
              {actionType === 'pay' 
                ? `¿Confirmar pago de cuota ${gasto.pagos_realizados + 1} de ${gasto.pagos_totales}?`
                : '¿Confirmar edición del gasto?'
              }
            </p>
            <div className="flex gap-2">
              <button
                onClick={handleConfirmAction}
                className="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-lg transition-colors"
              >
                <CheckCircle className="w-4 h-4 inline mr-2" />
                Confirmar
              </button>
              <button
                onClick={handleCancelAction}
                className="flex-1 bg-gray-200 hover:bg-gray-300 text-gray-700 font-medium py-2 px-4 rounded-lg transition-colors"
              >
                Cancelar
              </button>
            </div>
          </div>
        )}

        {/* Action Buttons */}
        {!confirmAction && (
          <div className="px-6 py-4 border-t border-gray-200 flex gap-3">
            {canPayCuota && (
              <button
                onClick={() => handleActionRequest('pay')}
                className="flex-1 bg-green-500 hover:bg-green-600 text-white font-medium py-3 px-4 rounded-lg transition-colors"
              >
                Pagar Cuota
              </button>
            )}
            <button
              onClick={() => handleActionRequest('edit')}
              className="flex-1 bg-blue-500 hover:bg-blue-600 text-white font-medium py-3 px-4 rounded-lg transition-colors flex items-center justify-center gap-2"
            >
              <Edit2 className="w-4 h-4" />
              Editar Gasto
            </button>
            <button
              onClick={onClose}
              className="px-6 bg-gray-200 hover:bg-gray-300 text-gray-700 font-medium py-3 rounded-lg transition-colors"
            >
              Cerrar
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default GastoDetailModal;
