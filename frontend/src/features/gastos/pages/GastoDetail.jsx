import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Calendar, DollarSign, User, Tag, MessageSquare, CreditCard, Edit, ArrowLeft } from 'lucide-react';
import api from '../../../api';
import LayoutWrapper from '../../../shared/components/wrappers/LayoutWrapper';
import { EditModal } from '../../../shared/components/Modal';
import Toast from '../../../shared/components/Toast';
import { useUserData } from '../../../hooks/useUserData';
import { formatLocalDate } from '../../../utils/dateUtils';
import delayedNavigate from '../../../hooks/delayedNavigate';
import { getButtonClass } from '../../../utils/colorSystem';

const GastoDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useUserData();
  const [gasto, setGasto] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editFormData, setEditFormData] = useState({});
  const [toast, setToast] = useState(null);

  const showToast = (message, type = 'success') => {
    setToast({ message, type });
  };

  const getGasto = useCallback(async () => {
    try {
      const response = await api.get(`/api/gastos/${id}/`);
      setGasto(response.data);
      setEditFormData(response.data);
    } catch (error) {
      console.error('Error fetching gasto:', error);
      if (error.response?.status === 404) {
        navigate('/gastos');
      }
    } finally {
      setLoading(false);
    }
  }, [id, navigate]);

  useEffect(() => {
    if (id) {
      getGasto();
    }
  }, [id, getGasto]);

  const handleEditSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await api.put(`/api/gastos/${id}/`, editFormData);
      setGasto(response.data);
      setShowEditModal(false);
      showToast('Gasto actualizado exitosamente', 'success');
    } catch (error) {
      console.error('Error updating gasto:', error);
      showToast('Error al actualizar el gasto', 'error');
    }
  };

  const handlePayCuota = async () => {
    if (!gasto || gasto.pagos_realizados >= gasto.pagos_totales) {
      showToast("Este gasto ya está completamente pagado.", "warning");
      return;
    }

    try {
      const updatedGasto = {
        ...gasto,
        pagos_realizados: gasto.pagos_realizados + 1
      };
      
      const res = await api.patch(`/api/gastos/${id}/`, {
        pagos_realizados: updatedGasto.pagos_realizados
      });
      
      if (res.status === 200) {
        setGasto(res.data);
        showToast(`Cuota ${updatedGasto.pagos_realizados} de ${gasto.pagos_totales} pagada exitosamente.`, "success");
      }
    } catch (error) {
      console.error("Error paying installment:", error);
      showToast(`Error: ${error.response?.data?.detail || error.message}`, "error");
    }
  };

  const handleLogout = () => {
    navigate("/logout");
  };

  if (loading) {
    return (
      <LayoutWrapper user={user} onLogout={handleLogout} showSidebar={false} pageTitle="Cargando Gasto">
        <div className="max-w-2xl mx-auto">
          <div className="text-center py-10">
            <p className="text-gray-500">Cargando gasto...</p>
          </div>
        </div>
      </LayoutWrapper>
    );
  }

  if (!gasto) {
    return (
      <LayoutWrapper user={user} onLogout={handleLogout} showSidebar={false} pageTitle="Gasto No Encontrado">
        <div className="max-w-2xl mx-auto">
          <div className="text-center py-10">
            <h2 className="text-xl font-semibold text-gray-800 mb-4">Gasto no encontrado</h2>
            <button
              onClick={() => navigate('/gastos')}
              className="text-blue-600 hover:text-blue-700 transition-colors"
            >
              ← Volver a Gastos
            </button>
          </div>
        </div>
      </LayoutWrapper>
    );
  }

  const formattedDate = formatLocalDate(gasto.fecha_gasto);

  const isPaid = gasto?.pagos_realizados === gasto?.pagos_totales;
  const canPayCuota = !isPaid && gasto?.pagos_realizados < gasto?.pagos_totales;
  const hasCuotas = gasto?.pagos_totales > 1;
  const montoPagado = gasto.monto * (gasto.pagos_realizados / gasto.pagos_totales);
  const montoTotal = gasto.monto;

  const pageContent = (
    <div className="max-w-2xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <button
          onClick={() => delayedNavigate(navigate, '/gastos', 250)}
          className="flex items-center text-blue-600 hover:text-blue-700 transition-colors"
        >
          <ArrowLeft className="w-5 h-5 mr-2" />
          Volver a Gastos
        </button>
        
        <div className="flex gap-3">
          {canPayCuota && (
            <button
              onClick={handlePayCuota}
              className="bg-green-500 hover:bg-green-600 text-white text-sm font-medium px-4 py-2 rounded-lg transition-colors"
            >
              Pagar Cuota
            </button>
          )}
          <button
            onClick={() => setShowEditModal(true)}
            className={`${getButtonClass('formPrimary', 'form')} flex items-center px-4 py-2`}
          >
            <Edit className="w-4 h-4 mr-2" />
            Editar
          </button>
        </div>
      </div>

      {/* Gasto Card */}
      <div className="bg-white rounded-xl shadow-lg p-8">
        {/* Header with amount */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center mb-4">
            <div className="bg-blue-100 p-4 rounded-full">
              <DollarSign className="w-12 h-12 text-blue-600" />
            </div>
          </div>
          {hasCuotas ? (
            <>
              <h1 className="text-4xl font-bold text-gray-800 mb-2">
                ${montoPagado.toLocaleString()} / ${montoTotal.toLocaleString()} {gasto.moneda}
              </h1>
              <p className="text-sm text-gray-500 mb-2">
                {gasto.pagos_realizados} de {gasto.pagos_totales} cuotas de ${(gasto.monto / gasto.pagos_totales).toFixed(2)}
              </p>
            </>
          ) : (
            <h1 className="text-4xl font-bold text-gray-800 mb-2">
              ${gasto.monto.toLocaleString()} {gasto.moneda}
            </h1>
          )}
          <p className="text-xl text-gray-600">{gasto.vendedor}</p>
        </div>

        {/* Details Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Date */}
          <div className="flex items-start space-x-3">
            <Calendar className="w-5 h-5 text-gray-400 mt-0.5" />
            <div>
              <p className="text-sm font-medium text-gray-500">Fecha</p>
              <p className="text-gray-800">{formattedDate}</p>
            </div>
          </div>

          {/* Category */}
          <div className="flex items-start space-x-3">
            <Tag className="w-5 h-5 text-gray-400 mt-0.5" />
            <div>
              <p className="text-sm font-medium text-gray-500">Categoría</p>
              <p className="text-gray-800">{gasto.categoria?.name || gasto.categoria}</p>
            </div>
          </div>

          {/* Payment Method */}
          <div className="flex items-start space-x-3">
            <CreditCard className="w-5 h-5 text-gray-400 mt-0.5" />
            <div>
              <p className="text-sm font-medium text-gray-500">Medio de Pago</p>
              <p className="text-gray-800">{gasto.medio_pago?.ente_emisor || 'No especificado'}</p>
            </div>
          </div>

          {/* Payment Status */}
          <div className="flex items-start space-x-3">
            <User className="w-5 h-5 text-gray-400 mt-0.5" />
            <div>
              <p className="text-sm font-medium text-gray-500">Estado de Pago</p>
              <div className="flex items-center">
                <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                  gasto.pagos_realizados === gasto.pagos_totales
                    ? 'bg-green-100 text-green-800'
                    : 'bg-orange-100 text-orange-800'
                }`}>
                  {gasto.pagos_realizados === gasto.pagos_totales ? 'Pagado' : 'Pendiente'}
                </span>
                <span className="ml-2 text-sm text-gray-500">
                  ({gasto.pagos_realizados}/{gasto.pagos_totales})
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Comments */}
        {gasto.comentarios && (
          <div className="mt-6 pt-6 border-t border-gray-200">
            <div className="flex items-start space-x-3">
              <MessageSquare className="w-5 h-5 text-gray-400 mt-0.5" />
              <div className="flex-1">
                <p className="text-sm font-medium text-gray-500 mb-1">Comentarios</p>
                <p className="text-gray-800">{gasto.comentarios}</p>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Edit Modal */}
      <EditModal
        isOpen={showEditModal}
        onClose={() => setShowEditModal(false)}
        onSave={handleEditSubmit}
        title="Editar Gasto"
      >
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Monto Total</label>
                <input
                  type="number"
                  step="0.01"
                  value={editFormData.monto || ''}
                  onChange={(e) => setEditFormData({...editFormData, monto: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Vendedor</label>
                <input
                  type="text"
                  value={editFormData.vendedor || ''}
                  onChange={(e) => setEditFormData({...editFormData, vendedor: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Comentarios</label>
                <textarea
                  value={editFormData.comentarios || ''}
                  onChange={(e) => setEditFormData({...editFormData, comentarios: e.target.value})}
                  rows="3"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                />
              </div>
        </EditModal>
    </div>
  );

  return (
    <LayoutWrapper user={user} onLogout={handleLogout} showSidebar={false} pageTitle={`Gasto - ${gasto.vendedor}`}>
      {pageContent}
      
      {/* Toast Notification */}
      {toast && (
        <Toast
          message={toast.message}
          type={toast.type}
          onClose={() => setToast(null)}
        />
      )}
    </LayoutWrapper>
  );
};

export default GastoDetail;