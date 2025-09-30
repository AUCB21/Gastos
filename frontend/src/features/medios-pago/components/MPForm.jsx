import React, { useState } from "react";
import { CreditCard, Building, Tag, MessageSquare } from 'lucide-react';

const MPForm = ({ onMPCreated }) => {
  // Use a single state object to manage all form data
  const [formData, setFormData] = useState({
    ente_emisor: "",
    tipo: "",
    tipo_tarjeta: "",
    extra: ""
  });
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});

  const tiposTarjeta = [
    { value: "VISA", label: "Visa" },
    { value: "MASTERCARD", label: "MasterCard" },
    { value: "MAESTRO", label: "Maestro" },
    { value: "AMEX", label: "American Express" },
    { value: "OTROS", label: "Otros" }
  ];

  // Function to handle changes in any form input
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
    
    // Clear error for this field when user starts typing
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  // Validation function
  const validateForm = () => {
    const newErrors = {};
    
    if (!formData.ente_emisor.trim()) {
      newErrors.ente_emisor = 'Ingrese la entidad emisora';
    }
    if (!formData.tipo) {
      newErrors.tipo = 'Seleccione un tipo';
    }
    if ((formData.tipo === 'TC' || formData.tipo === 'TD') && !formData.tipo_tarjeta) {
      newErrors.tipo_tarjeta = 'Seleccione el tipo de tarjeta';
    }
    
    return newErrors;
  };

  // Function to handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validate form
    const newErrors = validateForm();
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }
    
    setLoading(true);
    
    try {
      await onMPCreated(formData);
      setFormData({
        ente_emisor: "",
        tipo: "",
        tipo_tarjeta: "",
        extra: ""
      });
      setErrors({});
    } catch (error) {
      alert(`Error: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-4">
      <div className="max-w-xl mx-auto">
        <div className="bg-white rounded-xl shadow-lg p-6">
          {/* Header */}
          <div className="text-center mb-6">
            <div className="inline-flex items-center justify-center w-12 h-12 bg-green-100 rounded-full mb-3">
              <CreditCard className="w-6 h-6 text-green-600" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-1">Crea un medio de pago</h2>
            <p className="text-gray-600 text-sm">Complete los campos para agregar un medio de pago</p>
          </div>

          <div className="space-y-4">
            {/* Entidad Emisora y Tipo Row */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  <Building className="inline w-4 h-4 mr-1" />
                  Entidad Emisora *
                </label>
                <input
                  type="text"
                  name="ente_emisor"
                  value={formData.ente_emisor}
                  onChange={handleInputChange}
                  className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-colors ${
                    errors.ente_emisor ? 'border-red-300 bg-red-50' : 'border-gray-200'
                  }`}
                  placeholder="Banco o entidad"
                />
                {errors.ente_emisor && (
                  <p className="mt-1 text-xs text-red-600">{errors.ente_emisor}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  <Tag className="inline w-4 h-4 mr-1" />
                  Tipo *
                </label>
                <select
                  name="tipo"
                  value={formData.tipo}
                  onChange={handleInputChange}
                  className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-colors ${
                    errors.tipo ? 'border-red-300 bg-red-50' : 'border-gray-200'
                  }`}
                >
                  <option value="">Tipo</option>
                  <option value="TC">Tarjeta de Crédito</option>
                  <option value="TD">Tarjeta de Débito</option>
                  <option value="TR">Transferencia</option>
                  <option value="EF">Efectivo</option>
                </select>
                {errors.tipo && (
                  <p className="mt-1 text-xs text-red-600">{errors.tipo}</p>
                )}
              </div>
            </div>

            {/* Tipo de Tarjeta - Conditional */}
            {(formData.tipo === 'TC' || formData.tipo === 'TD') && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  <CreditCard className="inline w-4 h-4 mr-1" />
                  Tipo de Tarjeta *
                </label>
                <select
                  name="tipo_tarjeta"
                  value={formData.tipo_tarjeta}
                  onChange={handleInputChange}
                  className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-colors ${
                    errors.tipo_tarjeta ? 'border-red-300 bg-red-50' : 'border-gray-200'
                  }`}
                >
                  <option value="">Seleccione medio</option>
                  {tiposTarjeta.map((tipo) => (
                    <option key={tipo.value} value={tipo.value}>
                      {tipo.label}
                    </option>
                  ))}
                </select>
                {errors.tipo_tarjeta && (
                  <p className="mt-1 text-xs text-red-600">{errors.tipo_tarjeta}</p>
                )}
              </div>
            )}

            {/* Comentarios */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                <MessageSquare className="inline w-4 h-4 mr-1" />
                Comentarios
              </label>
              <textarea
                name="extra"
                value={formData.extra}
                onChange={handleInputChange}
                rows={2}
                className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-colors resize-none ${
                  errors.extra ? 'border-red-300 bg-red-50' : 'border-gray-200'
                }`}
                placeholder="Información adicional sobre este medio de pago (Ej: últimos 4 dígitos, sucursal, etc.)"
              />
              {errors.extra && (
                <p className="mt-1 text-xs text-red-600">{errors.extra}</p>
              )}
            </div>

            {/* Submit Button */}
            <button
              onClick={handleSubmit}
              disabled={loading}
              className="w-full bg-gradient-to-r from-emerald-600 to-emerald-700 hover:from-emerald-700 hover:to-emerald-800 text-white font-medium py-3 px-4 rounded-lg shadow-md transform transition-all duration-200 hover:scale-105 focus:ring-4 focus:ring-emerald-300 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
            >
              {loading ? (
                <div className="flex items-center justify-center">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Creando...
                </div>
              ) : (
                'Crear Medio de Pago'
              )}
            </button>
          </div>

          {/* Footer */}
          <div className="mt-4 text-center text-xs text-gray-500">
            * Campos obligatorios
          </div>
        </div>
      </div>
    </div>
  );
};

export default MPForm;
