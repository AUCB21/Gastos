import React, { useState, useEffect } from "react";
import api from "../../../api";
import { getTodayDate } from "../../../utils/dateUtils";
import {
  Calendar,
  DollarSign,
  User,
  Tag,
  MessageSquare,
  Receipt,
  CreditCard,
} from "lucide-react";
import { getButtonClass, componentStyles } from "../../../utils/colorSystem";

// Currency enum
const MONEDAS = {
  ARS: { code: "ARS", name: "Peso Argentino" },
  USD: { code: "USD", name: "Dólar Americano" },
};

// Categories enum matching Django model choices
const CATEGORIAS = {
  finanzas: { code: "finanzas", name: "Finanzas" },
  salud: { code: "salud", name: "Salud" },
  transporte: { code: "transporte", name: "Transporte" },
  comida: { code: "comida", name: "Comida" },
  indumentaria: { code: "indumentaria", name: "Indumentaria" },
  tecnologia: { code: "tecnologia", name: "Tecnología" },
  inversiones: { code: "inversiones", name: "Inversiones" },
  otros: { code: "otros", name: "Otros" },
};

const GastoForm = ({ onGastoCreated }) => {
  // Use a single state object to manage all form data
  const [formData, setFormData] = useState({
    monto: "",
    moneda: "ARS", // Default to ARS
    fecha_gasto: getTodayDate(), // Default to today's date
    pagos_realizados: "1",
    pagos_totales: "1",
    medio_pago: "",
    vendedor: "",
    categoria: "",
    comentarios: "",
  });

  const [mediosPago, setMediosPago] = useState([]);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});

  // Load medios de pago when component mounts
  useEffect(() => {
    const loadMediosPago = async () => {
      try {
        const response = await api.get("/api/medios-pago/");
        setMediosPago(response.data);
      } catch (error) {
        console.error("Error loading medios de pago:", error);
      }
    };
    loadMediosPago();
  }, []);

  // Function to handle changes in any form input
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });

    // Clear error for this field when user starts typing
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: "" }));
    }
  };

  // Validation function
  const validateForm = () => {
    const newErrors = {};

    if (!formData.monto || parseFloat(formData.monto) <= 0) {
      newErrors.monto = "Ingrese un monto válido";
    }
    if (!formData.moneda) {
      newErrors.moneda = "Seleccione una moneda";
    }
    if (!formData.fecha_gasto) {
      newErrors.fecha_gasto = "Seleccione una fecha";
    }
    if (!formData.pagos_realizados || parseInt(formData.pagos_realizados) < 0) {
      newErrors.pagos_realizados = "Ingrese un número válido";
    }
    if (!formData.pagos_totales || parseInt(formData.pagos_totales) < 1) {
      newErrors.pagos_totales = "Debe ser al menos 1";
    }
    if (!formData.medio_pago) {
      newErrors.medio_pago = "Seleccione un medio de pago";
    }
    if (!formData.vendedor.trim()) {
      newErrors.vendedor = "Ingrese el vendedor";
    }
    if (!formData.categoria) {
      newErrors.categoria = "Seleccione una categoría";
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

    // Convert numeric strings to numbers
    const processedData = {
      ...formData,
      monto: parseFloat(formData.monto),
      pagos_realizados: parseInt(formData.pagos_realizados),
      pagos_totales: parseInt(formData.pagos_totales),
      medio_pago: parseInt(formData.medio_pago),
    };

    setLoading(true);

    try {
      await onGastoCreated(processedData);
      setFormData({
        monto: "",
        moneda: "ARS", // Reset to default ARS
        fecha_gasto: getTodayDate(), // Reset to today's date
        pagos_realizados: "1",
        pagos_totales: "1",
        medio_pago: "",
        vendedor: "",
        categoria: "",
        comentarios: "",
      });
      setErrors({});
    } catch (error) {
      alert(`Error: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      {/* Header */}
      <div className="text-center mb-6">
        <div className="inline-flex items-center justify-center w-12 h-12 bg-dodger-blue-100 rounded-full mb-3">
          <Receipt className="w-6 h-6 text-dodger-blue-600" />
        </div>
        <h2 className="text-2xl font-bold text-gray-900 mb-1">
          Crea un nuevo Gasto
        </h2>
        <p className="text-gray-600 text-sm">
          Complete los campos para registrar su gasto
        </p>
      </div>

      <div className="space-y-4">
            {/* Amount and Currency Row */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  <DollarSign className="inline w-4 h-4 mr-1" />
                  Monto *
                </label>
                <input
                  type="number"
                  name="monto"
                  step="0.01"
                  value={formData.monto}
                  onChange={handleInputChange}
                  className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-dodger-blue-500 focus:border-dodger-blue-500 transition-colors ${
                    errors.monto
                      ? "border-scarlet-300 bg-scarlet-50"
                      : "border-gray-200"
                  }`}
                  placeholder="0.00"
                />
                {errors.monto && (
                  <p className="mt-1 text-xs text-scarlet-600">
                    {errors.monto}
                  </p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Moneda *
                </label>
                <select
                  name="moneda"
                  value={formData.moneda}
                  onChange={handleInputChange}
                  className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-dodger-blue-500 focus:border-dodger-blue-500 transition-colors ${
                    errors.moneda
                      ? "border-scarlet-300 bg-scarlet-50"
                      : "border-gray-200"
                  }`}
                >
                  <option value="">Moneda</option>
                  {Object.values(MONEDAS).map((moneda) => (
                    <option key={moneda.code} value={moneda.code}>
                      {moneda.code}
                    </option>
                  ))}
                </select>
                {errors.moneda && (
                  <p className="mt-1 text-xs text-scarlet-600">
                    {errors.moneda}
                  </p>
                )}
              </div>
            </div>

            {/* Date */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                <Calendar className="inline w-4 h-4 mr-1" />
                Fecha del Gasto *
              </label>
              <input
                type="date"
                name="fecha_gasto"
                value={formData.fecha_gasto}
                onChange={handleInputChange}
                className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-dodger-blue-500 focus:border-dodger-blue-500 transition-colors ${
                  errors.fecha_gasto
                    ? "border-scarlet-300 bg-scarlet-50"
                    : "border-gray-200"
                }`}
              />
              {errors.fecha_gasto && (
                <p className="mt-1 text-xs text-scarlet-600">
                  {errors.fecha_gasto}
                </p>
              )}
            </div>

            {/* Installments Row */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Cuotas Pagadas *
                </label>
                <input
                  type="number"
                  name="pagos_realizados"
                  min="0"
                  value={formData.pagos_realizados}
                  onChange={handleInputChange}
                  className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-dodger-blue-500 focus:border-dodger-blue-500 transition-colors ${
                    errors.pagos_realizados
                      ? "border-scarlet-300 bg-scarlet-50"
                      : "border-gray-200"
                  }`}
                />
                {errors.pagos_realizados && (
                  <p className="mt-1 text-xs text-scarlet-600">
                    {errors.pagos_realizados}
                  </p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Cuotas Totales *
                </label>
                <input
                  type="number"
                  name="pagos_totales"
                  min="1"
                  value={formData.pagos_totales}
                  onChange={handleInputChange}
                  className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-dodger-blue-500 focus:border-dodger-blue-500 transition-colors ${
                    errors.pagos_totales
                      ? "border-scarlet-300 bg-scarlet-50"
                      : "border-gray-200"
                  }`}
                />
                {errors.pagos_totales && (
                  <p className="mt-1 text-xs text-scarlet-600">
                    {errors.pagos_totales}
                  </p>
                )}
              </div>
            </div>

            {/* Payment Method */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                <CreditCard className="inline w-4 h-4 mr-1" />
                Medio de Pago *
              </label>
              <select
                name="medio_pago"
                value={formData.medio_pago}
                onChange={handleInputChange}
                disabled={mediosPago.length === 0}
                className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-dodger-blue-500 focus:border-dodger-blue-500 transition-colors ${
                  errors.medio_pago || mediosPago.length === 0
                    ? "border-scarlet-300 bg-scarlet-50"
                    : "border-gray-200"
                }`}
              >
                <option value="">
                  {mediosPago.length === 0
                    ? "No hay medios de pago disponibles"
                    : "Selecciona un medio de pago"}
                </option>
                {mediosPago.map((medio) => (
                  <option key={medio.id} value={medio.id}>
                    {medio.ente_emisor} - {medio.tipo}
                  </option>
                ))}
              </select>
              {mediosPago.length === 0 && (
                <p className="mt-1 text-xs text-scarlet-600 text-red-500">
                  Crea al menos 1 <a
                    href="/medios-pago/add"
                    className="hover:text-dodger-blue-600 hover:underline"
                  >
                  medio de pago
                  </a> *
                </p>
              )}
              {errors.medio_pago && mediosPago.length > 0 && (
                <p className="mt-1 text-xs text-scarlet-600">
                  {errors.medio_pago}
                </p>
              )}
            </div>

            {/* Vendor and Category Row */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  <User className="inline w-4 h-4 mr-1" />
                  Vendedor *
                </label>
                <input
                  type="text"
                  name="vendedor"
                  value={formData.vendedor}
                  onChange={handleInputChange}
                  className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-dodger-blue-500 focus:border-dodger-blue-500 transition-colors ${
                    errors.vendedor
                      ? "border-scarlet-300 bg-scarlet-50"
                      : "border-gray-200"
                  }`}
                  placeholder="Nombre del comercio"
                />
                {errors.vendedor && (
                  <p className="mt-1 text-xs text-scarlet-600">
                    {errors.vendedor}
                  </p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  <Tag className="inline w-4 h-4 mr-1" />
                  Categoría *
                </label>
                <select
                  name="categoria"
                  value={formData.categoria}
                  onChange={handleInputChange}
                  className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-dodger-blue-500 focus:border-dodger-blue-500 transition-colors ${
                    errors.categoria
                      ? "border-scarlet-300 bg-scarlet-50"
                      : "border-gray-200"
                  }`}
                >
                  <option value="">Categoría</option>
                  {Object.values(CATEGORIAS).map((categoria) => (
                    <option key={categoria.code} value={categoria.code}>
                      {categoria.name}
                    </option>
                  ))}
                </select>
                {errors.categoria && (
                  <p className="mt-1 text-xs text-scarlet-600">
                    {errors.categoria}
                  </p>
                )}
              </div>
            </div>

            {/* Comments */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                <MessageSquare className="inline w-4 h-4 mr-1" />
                Comentarios
              </label>
              <textarea
                name="comentarios"
                value={formData.comentarios}
                onChange={handleInputChange}
                rows={2}
                className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-dodger-blue-500 focus:border-dodger-blue-500 transition-colors resize-none"
                placeholder="Notas adicionales (opcional)"
              />
            </div>

            {/* Submit Button */}
            <button
              onClick={handleSubmit}
              disabled={loading}
              className={getButtonClass('formPrimary', 'form')}
            >
              {loading ? (
                <div className="flex items-center justify-center">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Creando...
                </div>
              ) : (
                "Crear Gasto"
              )}
            </button>
          </div>

          {/* Footer */}
          <div className="mt-4 text-center text-xs text-gray-500">
            * Campos obligatorios
          </div>
      </div>
  );
};

export default GastoForm;
