import React, { useState } from "react";

const MPForm = ({ onMPCreated }) => {
  // Use a single state object to manage all form data
  const [formData, setFormData] = useState({
    ente_emisor: "",
    tipo: "",
    tipo_tarjeta: "",
    extra: ""
  });
  const [loading, setLoading] = useState(false);

  const tiposTarjeta = [
    { value: "VISA", label: "Visa" },
    { value: "MASTERCARD", label: "MasterCard" },
    { value: "MAESTRO", label: "Maestro" },
    { value: "AMEX", label: "American Express" },
    { value: "OTROS", label: "Otros" }
  ]

  // Function to handle changes in any form input
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  // Function to handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validate required fields
    const requiredFields = ['ente_emisor', 'tipo', 'extra'];
    const emptyFields = requiredFields.filter(field => !formData[field] || formData[field] === '');
    
    if (emptyFields.length > 0) {
      alert(`Por favor, completa los siguientes campos requeridos: ${emptyFields.join(', ')}`);
      return;
    }
    
    setLoading(true);
    
    try {
      await onMPCreated(formData);
      setFormData({
        ente_emisor: "",
        tipo: "",
        extra: ""
      });
    } catch (error) {
      alert(`Error: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white p-6 rounded-xl shadow-lg w-full max-w-lg mx-auto">
      <h2 className="text-2xl font-bold mb-4 text-center text-gray-800">Medio de Pago</h2>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="flex flex-col">
          <label htmlFor="ente_emisor" className="text-sm font-medium text-gray-600">Entidad Emisora</label>
          <input
            type="text"
            name="ente_emisor"
            value={formData.ente_emisor}
            onChange={handleInputChange}
            placeholder="Entidad Emisora"
            className="p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-gray-400 hover:ring-gray-400 transition duration-200"
            required
          />
        </div>
        <div className="flex flex-col">
          <label htmlFor="tipo" className="text-sm font-medium text-gray-600">Tipo</label>
          <select
            name="tipo"
            value={formData.tipo}
            onChange={handleInputChange}
            className="p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-gray-400 hover:ring-gray-400 transition duration-200"
            required
          >
            <option value="">Selecciona un tipo</option>
            <option value="TC">Tarjeta de Crédito</option>
            <option value="TD">Tarjeta de Débito</option>
            <option value="TR">Transferencia</option>
            <option value="EF">Efectivo</option>

          </select>
        </div>

        <div className="flex flex-col">
          <label htmlFor="tipoTarjeta" className="text-sm font-medium text-gray-600">Tipo Tarjeta</label>
          <select
            name="tipoTarjeta"
            value={formData.tipo_tarjeta}
            onChange={handleInputChange}
            className="p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-gray-400 hover:ring-gray-400 transition duration-200"
            required
          >
            {tiposTarjeta.map((tipo) => (
              <option key={tipo.value} value={tipo.value}>{tipo.label}</option>
            ))}

          </select>
        </div>

        <div className="flex flex-col">
          <label htmlFor="comentarios" className="text-sm font-medium text-gray-600">Comentarios</label>
          <input
            type="text"
            name="extra"
            value={formData.extra}
            onChange={handleInputChange}
            placeholder="Comentarios"
            className="p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-gray-400 hover:ring-gray-400 transition duration-200"
          />
        </div>
        <div className="text-center">
          <button
            type="submit"
            className="w-full bg-blue-400 text-white font-bold py-2 px-4 rounded-md hover:bg-green-500 focus:outline-none focus:ring-2 focus:ring-gray-400 focus:ring-offset-2 transition duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
            disabled={loading}
          >
            {loading ? "Creando..." : "Crear"}
          </button>
        </div>
      </form>
    </div>
  );
};

export default MPForm;
