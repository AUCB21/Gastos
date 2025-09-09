import React, { useState, useEffect } from "react";
import api from "../../api";

// Currency enum
const MONEDAS = {
  ARS: { code: 'ARS', name: 'Peso Argentino' },
  USD: { code: 'USD', name: 'Dólar Americano' }
};

// Categories enum matching Django model choices
const CATEGORIAS = {
  finanzas: { code: 'finanzas', name: 'Finanzas' },
  salud: { code: 'salud', name: 'Salud' },
  transporte: { code: 'transporte', name: 'Transporte' },
  comida: { code: 'comida', name: 'Comida' },
  indumentaria: { code: 'indumentaria', name: 'Indumentaria' },
  tecnologia: { code: 'tecnologia', name: 'Tecnología' },
  inversiones: { code: 'inversiones', name: 'Inversiones' },
  otros: { code: 'otros', name: 'Otros' }
};

const GastoForm = ({ onGastoCreated }) => {
  // Helper function to get today's date in YYYY-MM-DD format
  const getTodayDate = () => {
    const today = new Date();
    return today.toISOString().split('T')[0];
  };

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
  };

  // Function to handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validate required fields
    const requiredFields = ['monto', 'moneda', 'fecha_gasto', 'pagos_realizados', 'pagos_totales', 'medio_pago', 'vendedor', 'categoria'];
    const emptyFields = requiredFields.filter(field => !formData[field] || formData[field] === '');
    
    if (emptyFields.length > 0) {
      alert(`Por favor, completa los siguientes campos requeridos: ${emptyFields.join(', ')}`);
      return;
    }
    
    // Convert numeric strings to numbers
    const processedData = {
      ...formData,
      monto: parseFloat(formData.monto),
      pagos_realizados: parseInt(formData.pagos_realizados),
      pagos_totales: parseInt(formData.pagos_totales),
      medio_pago: parseInt(formData.medio_pago)
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
    } catch (error) {
      alert(`Error: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white p-6 rounded-xl shadow-lg w-full max-w-lg mx-auto">
      <h2 className="text-2xl font-bold mb-4 text-center text-gray-800">Crear Nuevo Gasto</h2>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="flex flex-col">
          <label htmlFor="monto" className="text-sm font-medium text-gray-600">Monto</label>
          <input
            type="number"
            name="monto"
            value={formData.monto}
            onChange={handleInputChange}
            placeholder="Monto"
            className="p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500 transition duration-200"
            required
          />
        </div>
        <div className="flex flex-col">
          <label htmlFor="moneda" className="text-sm font-medium text-gray-600">Moneda</label>
          <select
            name="moneda"
            value={formData.moneda}
            onChange={handleInputChange}
            className="p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500 transition duration-200"
            required
          >
            <option value="">Selecciona una moneda</option>
            {Object.values(MONEDAS).map((moneda) => (
              <option key={moneda.code} value={moneda.code}>
                {moneda.code} - {moneda.name}
              </option>
            ))}
          </select>
        </div>
        <div className="flex flex-col">
          <label htmlFor="fecha_gasto" className="text-sm font-medium text-gray-600">Fecha del Gasto</label>
          <input
            type="date"
            name="fecha_gasto"
            value={formData.fecha_gasto}
            onChange={handleInputChange}
            className="p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500 transition duration-200"
            required
          />
        </div>
        <div className="flex flex-col">
          <label htmlFor="pagos_realizados" className="text-sm font-medium text-gray-600">Pagos Realizados</label>
          <input
            type="number"
            name="pagos_realizados"
            value={formData.pagos_realizados}
            onChange={handleInputChange}
            placeholder="Pagos realizados"
            className="p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500 transition duration-200"
            min="0"
            required
          />
        </div>
        <div className="flex flex-col">
          <label htmlFor="pagos_totales" className="text-sm font-medium text-gray-600">Pagos Totales</label>
          <input
            type="number"
            name="pagos_totales"
            value={formData.pagos_totales}
            onChange={handleInputChange}
            placeholder="Pagos totales"
            className="p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500 transition duration-200"
            min="1"
            required
          />
        </div>
        <div className="flex flex-col">
          <label htmlFor="medio_pago" className="text-sm font-medium text-gray-600">Medio de Pago</label>
          <select
            name="medio_pago"
            value={formData.medio_pago}
            onChange={handleInputChange}
            className="p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500 transition duration-200"
            required
          >
            <option value="">Selecciona un medio de pago</option>
            {mediosPago.map((medio) => (
              <option key={medio.id} value={medio.id}>
                {medio.ente_emisor} - {medio.tipo}
              </option>
            ))}
          </select>
        </div>
        <div className="flex flex-col">
          <label htmlFor="vendedor" className="text-sm font-medium text-gray-600">Vendedor</label>
          <input
            type="text"
            name="vendedor"
            value={formData.vendedor}
            onChange={handleInputChange}
            placeholder="Vendedor"
            className="p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500 transition duration-200"
          />
        </div>
        <div className="flex flex-col">
          <label htmlFor="categoria" className="text-sm font-medium text-gray-600">Categoría</label>
          <select
            name="categoria"
            value={formData.categoria}
            onChange={handleInputChange}
            className="p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500 transition duration-200"
            required
          >
            <option value="">Selecciona una categoría</option>
            {Object.values(CATEGORIAS).map((categoria) => (
              <option key={categoria.code} value={categoria.code}>
                {categoria.name}
              </option>
            ))}
          </select>
        </div>
        <div className="flex flex-col">
          <label htmlFor="comentarios" className="text-sm font-medium text-gray-600">Comentarios</label>
          <input
            type="text"
            name="comentarios"
            value={formData.comentarios}
            onChange={handleInputChange}
            placeholder="Comentarios"
            className="p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500 transition duration-200"
          />
        </div>
        <div className="text-center">
          <button
            type="submit"
            className="w-full bg-purple-600 text-white font-bold py-2 px-4 rounded-md hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2 transition duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
            disabled={loading}
          >
            {loading ? "Creando..." : "Crear Gasto"}
          </button>
        </div>
      </form>
    </div>
  );
};

export default GastoForm;
