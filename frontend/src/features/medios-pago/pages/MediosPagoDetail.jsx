import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { CreditCard, Building, Tag, MessageSquare, Edit, ArrowLeft } from 'lucide-react';
import api from '../../../api';
import LayoutWrapper from '../../../shared/components/wrappers/LayoutWrapper';
import { useUserData } from '../../../hooks/useUserData';
import delayedNavigate from '../../../hooks/delayedNavigate';

const MediosPagoDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useUserData();
  const [medioPago, setMedioPago] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editFormData, setEditFormData] = useState({});

  const getMedioPago = useCallback(async () => {
    try {
      const response = await api.get(`/api/medios-pago/${id}/`);
      setMedioPago(response.data);
      setEditFormData(response.data);
    } catch (error) {
      console.error('Error fetching medio de pago:', error);
      if (error.response?.status === 404) {
        navigate('/medios-pago');
      }
    } finally {
      setLoading(false);
    }
  }, [id, navigate]);

  useEffect(() => {
    if (id) {
      getMedioPago();
    }
  }, [id, getMedioPago]);

  const handleEditSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await api.put(`/api/medios-pago/${id}/`, editFormData);
      setMedioPago(response.data);
      setShowEditModal(false);
      alert('Medio de Pago actualizado exitosamente');
    } catch (error) {
      console.error('Error updating medio de pago:', error);
      alert('Error al actualizar el medio de pago');
    }
  };

  const handleLogout = () => {
    navigate("/logout");
  };

  const getTipoLabel = (tipo) => {
    const tipos = {
      'TC': 'Tarjeta de Crédito',
      'TD': 'Tarjeta de Débito',
      'TR': 'Transferencia',
      'EF': 'Efectivo'
    };
    return tipos[tipo] || tipo;
  };

  if (loading) {
    return (
      <LayoutWrapper user={user} onLogout={handleLogout} showSidebar={false} pageTitle="Cargando Medio de Pago">
        <div className="max-w-2xl mx-auto">
          <div className="text-center py-10">
            <p className="text-gray-500">Cargando medio de pago...</p>
          </div>
        </div>
      </LayoutWrapper>
    );
  }

  if (!medioPago) {
    return (
      <LayoutWrapper user={user} onLogout={handleLogout} showSidebar={false} pageTitle="Medio de Pago No Encontrado">
        <div className="max-w-2xl mx-auto">
          <div className="text-center py-10">
            <h2 className="text-xl font-semibold text-gray-800 mb-4">Medio de Pago no encontrado</h2>
            <button
              onClick={() => navigate('/medios-pago')}
              className="text-green-600 hover:text-green-700 transition-colors"
            >
              ← Volver a Medios de Pago
            </button>
          </div>
        </div>
      </LayoutWrapper>
    );
  }

  const pageContent = (
    <div className="max-w-2xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <button
          onClick={() => delayedNavigate(navigate, '/medios-pago', 250)}
          className="flex items-center text-green-600 hover:text-green-700 transition-colors"
        >
          <ArrowLeft className="w-5 h-5 mr-2" />
          Volver a Medios de Pago
        </button>
        
        <button
          onClick={() => setShowEditModal(true)}
          className="flex items-center bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors"
        >
          <Edit className="w-4 h-4 mr-2" />
          Editar
        </button>
      </div>

      {/* MedioPago Card */}
      <div className="bg-white rounded-xl shadow-lg p-8">
        {/* Header with icon */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center mb-4">
            <div className="bg-green-100 p-4 rounded-full">
              <CreditCard className="w-12 h-12 text-green-600" />
            </div>
          </div>
          <h1 className="text-3xl font-bold text-gray-800 mb-2">
            {medioPago.ente_emisor}
          </h1>
          <p className="text-xl text-gray-600">{getTipoLabel(medioPago.tipo)}</p>
        </div>

        {/* Details Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Tipo */}
          <div className="flex items-start space-x-3">
            <Tag className="w-5 h-5 text-gray-400 mt-0.5" />
            <div>
              <p className="text-sm font-medium text-gray-500">Tipo</p>
              <p className="text-gray-800">{getTipoLabel(medioPago.tipo)}</p>
            </div>
          </div>

          {/* Ente Emisor */}
          <div className="flex items-start space-x-3">
            <Building className="w-5 h-5 text-gray-400 mt-0.5" />
            <div>
              <p className="text-sm font-medium text-gray-500">Ente Emisor</p>
              <p className="text-gray-800">{medioPago.ente_emisor}</p>
            </div>
          </div>

          {/* Tipo de Tarjeta (if applicable) */}
          {medioPago.tipo_tarjeta && (
            <div className="flex items-start space-x-3">
              <CreditCard className="w-5 h-5 text-gray-400 mt-0.5" />
              <div>
                <p className="text-sm font-medium text-gray-500">Tipo de Tarjeta</p>
                <p className="text-gray-800">{medioPago.tipo_tarjeta}</p>
              </div>
            </div>
          )}

          {/* Extra Info (if available) */}
          {medioPago.extra && (
            <div className="flex items-start space-x-3">
              <MessageSquare className="w-5 h-5 text-gray-400 mt-0.5" />
              <div>
                <p className="text-sm font-medium text-gray-500">Información Extra</p>
                <p className="text-gray-800">{medioPago.extra}</p>
              </div>
            </div>
          )}
        </div>

        {/* Usage Stats */}
        <div className="mt-8 pt-6 border-t border-gray-200">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">Estadísticas de Uso</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="bg-gray-50 rounded-lg p-4">
              <p className="text-sm text-gray-500">Gastos Asociados</p>
              <p className="text-2xl font-bold text-gray-800">
                {medioPago.gastos_count || 0}
              </p>
            </div>
            <div className="bg-gray-50 rounded-lg p-4">
              <p className="text-sm text-gray-500">Monto Total</p>
              <p className="text-2xl font-bold text-gray-800">
                ${medioPago.total_amount || '0.00'}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Edit Modal */}
      {showEditModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl shadow-xl p-6 w-full max-w-md max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-bold text-gray-900">Editar Medio de Pago</h2>
              <button
                onClick={() => setShowEditModal(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleEditSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Ente Emisor</label>
                <input
                  type="text"
                  value={editFormData.ente_emisor || ''}
                  onChange={(e) => setEditFormData({...editFormData, ente_emisor: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 outline-none"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Tipo</label>
                <select
                  value={editFormData.tipo || ''}
                  onChange={(e) => setEditFormData({...editFormData, tipo: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 outline-none"
                  required
                >
                  <option value="">Seleccionar tipo</option>
                  <option value="TC">Tarjeta de Crédito</option>
                  <option value="TD">Tarjeta de Débito</option>
                  <option value="TR">Transferencia</option>
                  <option value="EF">Efectivo</option>
                </select>
              </div>

              {(editFormData.tipo === 'TC' || editFormData.tipo === 'TD') && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Tipo de Tarjeta</label>
                  <input
                    type="text"
                    value={editFormData.tipo_tarjeta || ''}
                    onChange={(e) => setEditFormData({...editFormData, tipo_tarjeta: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 outline-none"
                    placeholder="Ej: Visa, Mastercard, etc."
                  />
                </div>
              )}

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Información Extra</label>
                <textarea
                  value={editFormData.extra || ''}
                  onChange={(e) => setEditFormData({...editFormData, extra: e.target.value})}
                  rows="3"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 outline-none"
                  placeholder="Información adicional"
                />
              </div>

              <div className="flex space-x-3 pt-4">
                <button
                  type="button"
                  onClick={() => setShowEditModal(false)}
                  className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="flex-1 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
                >
                  Guardar
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );

  return (
    <LayoutWrapper user={user} onLogout={handleLogout} showSidebar={false} pageTitle={`Medio de Pago - ${medioPago.ente_emisor}`}>
      {pageContent}
    </LayoutWrapper>
  );
};

export default MediosPagoDetail;