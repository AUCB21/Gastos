import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Calendar, DollarSign, User, Tag, MessageSquare, CreditCard, Edit, ArrowLeft } from 'lucide-react';
import api from '../api';
import NavBar from '../components/NavBar';
import { useUserData } from '../hooks/useUserData';
import { formatLocalDate } from '../utils/dateUtils';
import delayedNavigate from '../hooks/delayedNavigate';

const GastoDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useUserData();
  const [gasto, setGasto] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editFormData, setEditFormData] = useState({});

  const getGasto = async () => {
    try {
      setLoading(true);
      const response = await api.get(`/api/gastos/${id}/`);
      setGasto(response.data);
      setEditFormData(response.data);
    } catch (error) {
      console.error('Error fetching gasto:', error);
      if (error.response?.status === 404) {
        alert('Gasto no encontrado');
        navigate('/gastos');
      } else if (error.response?.status === 401) {
        alert('Authentication error. Please log in again.');
        localStorage.clear();
        window.location.href = '/login';
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    getGasto();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  const handleEditSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await api.put(`/api/gastos/${id}/`, editFormData);
      setGasto(response.data);
      setShowEditModal(false);
      alert('Gasto actualizado exitosamente');
    } catch (error) {
      console.error('Error updating gasto:', error);
      alert('Error al actualizar el gasto');
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setEditFormData({ ...editFormData, [name]: value });
  };

  const handleLogout = () => {
    navigate('/logout');
  };

  if (loading) {
    return (
      <>
        <NavBar user={user} logout={handleLogout} />
        <div className="min-h-screen bg-gray-100 flex items-center justify-center">
          <p className="text-gray-500">Cargando gasto...</p>
        </div>
      </>
    );
  }

  if (!gasto) {
    return (
      <>
        <NavBar user={user} logout={handleLogout} />
        <div className="min-h-screen bg-gray-100 flex items-center justify-center">
          <p className="text-gray-500">Gasto no encontrado</p>
        </div>
      </>
    );
  }

  const isPaid = gasto.pagos_realizados === gasto.pagos_totales;
  const formattedDate = formatLocalDate(gasto.fecha_gasto);

  return (
    <>
      <NavBar user={user} logout={handleLogout} />
      
      <div className="min-h-screen bg-gray-100 p-6">
        <div className="max-w-2xl mx-auto">
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <button
              onClick={() => delayedNavigate(navigate, '/gastos', 250)}
              className="flex items-center text-blue-600 hover:text-blue-700 transition-colors"
            >
              <ArrowLeft className="w-5 h-5 mr-2" />
              Volver a la lista
            </button>
            <button
              onClick={() => setShowEditModal(true)}
              className="flex items-center bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-colors"
            >
              <Edit className="w-4 h-4 mr-2" />
              Editar
            </button>
          </div>

          {/* Main Card */}
          <div className="bg-white rounded-xl shadow-lg p-8">
            {/* Header */}
            <div className="text-center mb-8">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-100 rounded-full mb-4">
                <DollarSign className="w-8 h-8 text-blue-600" />
              </div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">
                ${gasto.monto.toLocaleString()} {gasto.moneda}
              </h1>
              <p className="text-lg text-gray-600">{gasto.vendedor}</p>
            </div>

            {/* Status Badge */}
            <div className="flex justify-center mb-8">
              <span
                className={`px-4 py-2 rounded-full text-sm font-medium ${
                  isPaid
                    ? 'bg-green-100 text-green-700'
                    : 'bg-orange-100 text-orange-700'
                }`}
              >
                {isPaid ? 'Pagado Completamente' : 'Pago Pendiente'}
              </span>
            </div>

            {/* Details Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <div className="flex items-center">
                  <Calendar className="w-5 h-5 text-gray-400 mr-3" />
                  <div>
                    <p className="text-sm text-gray-500">Fecha del Gasto</p>
                    <p className="text-lg font-medium text-gray-900">{formattedDate}</p>
                  </div>
                </div>

                <div className="flex items-center">
                  <Tag className="w-5 h-5 text-gray-400 mr-3" />
                  <div>
                    <p className="text-sm text-gray-500">Categoría</p>
                    <p className="text-lg font-medium text-gray-900">
                      {gasto.categoria.name || gasto.categoria}
                    </p>
                  </div>
                </div>

                <div className="flex items-center">
                  <CreditCard className="w-5 h-5 text-gray-400 mr-3" />
                  <div>
                    <p className="text-sm text-gray-500">Medio de Pago</p>
                    <p className="text-lg font-medium text-gray-900">
                      {gasto.medio_pago?.ente_emisor || 'No especificado'}
                    </p>
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <div className="flex items-center">
                  <User className="w-5 h-5 text-gray-400 mr-3" />
                  <div>
                    <p className="text-sm text-gray-500">Vendedor</p>
                    <p className="text-lg font-medium text-gray-900">{gasto.vendedor}</p>
                  </div>
                </div>

                <div className="flex items-center">
                  <DollarSign className="w-5 h-5 text-gray-400 mr-3" />
                  <div>
                    <p className="text-sm text-gray-500">Pagos</p>
                    <p className="text-lg font-medium text-gray-900">
                      {gasto.pagos_realizados} de {gasto.pagos_totales} cuotas
                    </p>
                  </div>
                </div>

                {gasto.comentarios && (
                  <div className="flex items-start">
                    <MessageSquare className="w-5 h-5 text-gray-400 mr-3 mt-1" />
                    <div>
                      <p className="text-sm text-gray-500">Comentarios</p>
                      <p className="text-lg font-medium text-gray-900">{gasto.comentarios}</p>
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
              <h2 className="text-xl font-bold text-gray-900">Editar Gasto</h2>
              <button
                onClick={() => setShowEditModal(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                ✕
              </button>
            </div>
            
            <form onSubmit={handleEditSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Monto</label>
                  <input
                    type="number"
                    name="monto"
                    step="0.01"
                    value={editFormData.monto || ''}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Moneda</label>
                  <select
                    name="moneda"
                    value={editFormData.moneda || ''}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="ARS">ARS</option>
                    <option value="USD">USD</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Vendedor</label>
                <input
                  type="text"
                  name="vendedor"
                  value={editFormData.vendedor || ''}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Pagos Realizados</label>
                  <input
                    type="number"
                    name="pagos_realizados"
                    min="0"
                    value={editFormData.pagos_realizados || ''}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Pagos Totales</label>
                  <input
                    type="number"
                    name="pagos_totales"
                    min="1"
                    value={editFormData.pagos_totales || ''}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Comentarios</label>
                <textarea
                  name="comentarios"
                  value={editFormData.comentarios || ''}
                  onChange={handleInputChange}
                  rows={3}
                  className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 resize-none"
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
                  className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
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

export default GastoDetail;