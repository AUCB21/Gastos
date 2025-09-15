import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { CreditCard, Building, Tag, MessageSquare, Edit, ArrowLeft } from 'lucide-react';
import api from '../api';
import NavBar from '../components/NavBar';
import { useUserData } from '../hooks/useUserData';
import delayedNavigate from '../hooks/delayedNavigate';

const MediosPagoDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useUserData();
  const [medioPago, setMedioPago] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editFormData, setEditFormData] = useState({});

  const tipoLabels = {
    'TC': 'Tarjeta de Crédito',
    'TD': 'Tarjeta de Débito', 
    'TR': 'Transferencia',
    'EF': 'Efectivo'
  };

  const tiposTarjeta = [
    { value: "VISA", label: "Visa" },
    { value: "MASTERCARD", label: "MasterCard" },
    { value: "MAESTRO", label: "Maestro" },
    { value: "AMEX", label: "American Express" },
    { value: "OTROS", label: "Otros" }
  ];

  const getMedioPago = React.useCallback(async () => {
    try {
      setLoading(true);
      const response = await api.get(`/api/medios-pago/${id}/`);
      setMedioPago(response.data);
      setEditFormData(response.data);
    } catch (error) {
      console.error('Error fetching medio de pago:', error);
      if (error.response?.status === 404) {
        alert('Medio de pago no encontrado');
        navigate('/medios-pago');
      } else if (error.response?.status === 401) {
        alert('Authentication error. Please log in again.');
        localStorage.clear();
        window.location.href = '/login';
      }
    } finally {
      setLoading(false);
    }
  }, [id, navigate]);

  useEffect(() => {
    getMedioPago();
  }, [id, getMedioPago]);

  const handleEditSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await api.put(`/api/medios-pago/${id}/`, editFormData);
      setMedioPago(response.data);
      setShowEditModal(false);
      alert('Medio de pago actualizado exitosamente');
    } catch (error) {
      console.error('Error updating medio de pago:', error);
      alert('Error al actualizar el medio de pago');
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setEditFormData({ ...editFormData, [name]: value });
  };

  const handleLogout = () => {
    navigate('/logout');
  };

  const getTypeIcon = (tipo) => {
    switch(tipo) {
      case 'TC':
      case 'TD':
        return <CreditCard className="w-8 h-8 text-green-600" />;
      case 'TR':
        return (
          <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" />
          </svg>
        );
      case 'EF':
        return (
          <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z" />
          </svg>
        );
      default:
        return <CreditCard className="w-8 h-8 text-green-600" />;
    }
  };

  if (loading) {
    return (
      <>
        <NavBar user={user} logout={handleLogout} />
        <div className="min-h-screen bg-gray-100 flex items-center justify-center">
          <p className="text-gray-500">Cargando medio de pago...</p>
        </div>
      </>
    );
  }

  if (!medioPago) {
    return (
      <>
        <NavBar user={user} logout={handleLogout} />
        <div className="min-h-screen bg-gray-100 flex items-center justify-center">
          <p className="text-gray-500">Medio de pago no encontrado</p>
        </div>
      </>
    );
  }

  return (
    <>
      <NavBar user={user} logout={handleLogout} />
      
      <div className="min-h-screen bg-gray-100 p-6">
        <div className="max-w-2xl mx-auto">
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <button
              onClick={() => delayedNavigate(navigate, '/medios-pago', 250)}
              className="flex items-center text-green-600 hover:text-green-700 transition-colors"
            >
              <ArrowLeft className="w-5 h-5 mr-2" />
              Volver a la lista
            </button>
            <button
              onClick={() => setShowEditModal(true)}
              className="flex items-center bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg transition-colors"
            >
              <Edit className="w-4 h-4 mr-2" />
              Editar
            </button>
          </div>

          {/* Main Card */}
          <div className="bg-white rounded-xl shadow-lg p-8">
            {/* Header */}
            <div className="text-center mb-8">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-green-100 rounded-full mb-4">
                {getTypeIcon(medioPago.tipo)}
              </div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">
                {medioPago.ente_emisor}
              </h1>
              <p className="text-lg text-gray-600">{tipoLabels[medioPago.tipo] || medioPago.tipo}</p>
            </div>

            {/* Details Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <div className="flex items-center">
                  <Building className="w-5 h-5 text-gray-400 mr-3" />
                  <div>
                    <p className="text-sm text-gray-500">Entidad Emisora</p>
                    <p className="text-lg font-medium text-gray-900">{medioPago.ente_emisor}</p>
                  </div>
                </div>

                <div className="flex items-center">
                  <Tag className="w-5 h-5 text-gray-400 mr-3" />
                  <div>
                    <p className="text-sm text-gray-500">Tipo</p>
                    <p className="text-lg font-medium text-gray-900">
                      {tipoLabels[medioPago.tipo] || medioPago.tipo}
                    </p>
                  </div>
                </div>

                {medioPago.tipo_tarjeta && (
                  <div className="flex items-center">
                    <CreditCard className="w-5 h-5 text-gray-400 mr-3" />
                    <div>
                      <p className="text-sm text-gray-500">Tipo de Tarjeta</p>
                      <p className="text-lg font-medium text-gray-900">
                        {tiposTarjeta.find(t => t.value === medioPago.tipo_tarjeta)?.label || medioPago.tipo_tarjeta}
                      </p>
                    </div>
                  </div>
                )}
              </div>

              <div className="space-y-4">
                {medioPago.extra && (
                  <div className="flex items-start">
                    <MessageSquare className="w-5 h-5 text-gray-400 mr-3 mt-1" />
                    <div>
                      <p className="text-sm text-gray-500">Comentarios</p>
                      <p className="text-lg font-medium text-gray-900">{medioPago.extra}</p>
                    </div>
                  </div>
                )}
              </div>
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
                <label className="block text-sm font-medium text-gray-700 mb-1">Entidad Emisora</label>
                <input
                  type="text"
                  name="ente_emisor"
                  value={editFormData.ente_emisor || ''}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-green-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Tipo</label>
                <select
                  name="tipo"
                  value={editFormData.tipo || ''}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-green-500"
                >
                  <option value="TC">Tarjeta de Crédito</option>
                  <option value="TD">Tarjeta de Débito</option>
                  <option value="TR">Transferencia</option>
                  <option value="EF">Efectivo</option>
                </select>
              </div>

              {(editFormData.tipo === 'TC' || editFormData.tipo === 'TD') && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Tipo de Tarjeta</label>
                  <select
                    name="tipo_tarjeta"
                    value={editFormData.tipo_tarjeta || ''}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-green-500"
                  >
                    <option value="">Seleccione marca</option>
                    {tiposTarjeta.map((tipo) => (
                      <option key={tipo.value} value={tipo.value}>
                        {tipo.label}
                      </option>
                    ))}
                  </select>
                </div>
              )}

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Comentarios</label>
                <textarea
                  name="extra"
                  value={editFormData.extra || ''}
                  onChange={handleInputChange}
                  rows={3}
                  className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-green-500 resize-none"
                />
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => setShowEditModal(false)}
                  className="flex-1 px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
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
    </>
  );
};

export default MediosPagoDetail;