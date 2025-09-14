import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import api from "../api";
import NavBar from "../components/NavBar";
import { useUserData } from "../hooks/useUserData";

const MediosPagoList = () => {
  const [mediosPago, setMediosPago] = useState([]);
  const [loading, setLoading] = useState(true);
  const { user } = useUserData();
  const navigate = useNavigate();

  useEffect(() => {
    getMediosPago();
  }, []);

  const getMediosPago = async () => {
    try {
      setLoading(true);
      console.log("Making request to: /api/medios-pago/");
      const response = await api.get("/api/medios-pago/");
      console.log("Response received:", response);
      console.log("Response data:", response.data);
      console.log("Response status:", response.status);
      setMediosPago(response.data);
    } catch (error) {
      console.error("Error fetching medios de pago:", error);
      console.error("Error response:", error.response);
      console.error("Error status:", error.response?.status);
      console.error("Error data:", error.response?.data);
      if (error.response?.status === 401) {
        alert("Authentication error. Please log in again.");
        localStorage.clear();
        window.location.href = "/login";
      }
    } finally {
      setLoading(false);
    }
  };

  const deleteMedioPago = async (id) => {
    if (window.confirm("¿Estás seguro de que quieres eliminar este medio de pago?")) {
      try {
        const res = await api.delete(`/api/medios-pago/${id}/`);
        if (res.status === 204) {
          getMediosPago(); // Refresh the list
          alert("Medio de Pago eliminado exitosamente.");
        }
      } catch (error) {
        console.error("Error deleting medio de pago:", error);
        alert(`Error: ${error.message}`);
      }
    }
  };

  const handleEditMedioPago = (id) => {
    // Navigate to individual medio de pago detail page (to be created)
    navigate(`/medios-pago/${id}`);
  };

  const handleLogout = () => {
    navigate("/logout");
  };

  // Group medios de pago by type for better organization
  const groupedMediosPago = mediosPago.reduce((acc, medio) => {
    if (!acc[medio.tipo]) {
      acc[medio.tipo] = [];
    }
    acc[medio.tipo].push(medio);
    return acc;
  }, {});

  const tipoLabels = {
    'TC': 'Tarjetas de Crédito',
    'TD': 'Tarjetas de Débito', 
    'TR': 'Transferencias',
    'EF': 'Efectivo'
  };

  return (
    <>
      {/* Navigation Bar */}
      <NavBar user={user} logout={handleLogout} />
      
      {/* Main Content */}
      <div className="bg-gray-100 min-h-screen py-10 font-sans">
        <div className="container mx-auto px-4">
          {/* Page Header */}
          <div className="flex justify-between items-center mb-8">
            <h1 className="text-4xl font-bold text-gray-800">Lista de Medios de Pago</h1>
            <button
              onClick={() => navigate("/medios-pago")}
              className="bg-green-500 text-white px-6 py-3 rounded-lg hover:bg-green-600 transition duration-200 flex items-center space-x-2"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6"></path>
              </svg>
              <span>Crear Nuevo Medio de Pago</span>
            </button>
          </div>

          {/* Stats Summary */}
          <div className="bg-white p-6 rounded-xl shadow-lg mb-8">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="text-center">
                <p className="text-2xl font-bold text-blue-600">{mediosPago.length}</p>
                <p className="text-gray-600">Medios de Pago</p>
              </div>
              <div className="text-center">
                <p className="text-2xl font-bold text-green-600">
                  {mediosPago.filter(m => m.tipo.includes('T')).length}
                </p>
                <p className="text-gray-600">Tarjetas</p>
              </div>
              <div className="text-center">
                <p className="text-2xl font-bold text-orange-600">
                  {mediosPago.filter(m => m.tipo !== 'TC' && m.tipo !== 'TD').length}
                </p>
                <p className="text-gray-600">Otros</p>
              </div>
            </div>
          </div>

          {/* Medios de Pago Grid */}
          {loading ? (
            <div className="text-center py-10">
              <p className="text-gray-500">Cargando medios de pago...</p>
            </div>
          ) : (
            <div className="space-y-8">
              {Object.keys(groupedMediosPago).length > 0 ? (
                Object.entries(groupedMediosPago).map(([tipo, medios]) => (
                  <div key={tipo} className="bg-white p-6 rounded-xl shadow-lg">
                    <h2 className="text-2xl font-bold text-gray-800 mb-4">
                      {tipoLabels[tipo] || tipo}
                    </h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                      {medios.map((medio) => (
                        <div
                          key={medio.id}
                          className="bg-gray-50 p-4 rounded-lg border border-gray-200 hover:border-gray-300 transition duration-200"
                        >
                          <div className="flex justify-between items-start mb-3">
                            <div className="flex-1">
                              <h3 className="text-lg font-semibold text-gray-700">
                                <span className="text-blue-600">{medio.ente_emisor}</span>
                              </h3>
                              {medio.tipo_tarjeta && (
                                <p className="text-sm text-gray-500">Tipo: {medio.tipo_tarjeta}</p>
                              )}
                              {medio.extra && (
                                <p className="text-sm text-gray-500 mt-1">
                                  Comentarios: {medio.extra}
                                </p>
                              )}
                            </div>
                          </div>
                          <div className="flex space-x-2 self-center">
                            <button
                              onClick={() => handleEditMedioPago(medio.id)}
                              className="flex-1 bg-blue-500 text-white py-2 px-3 rounded hover:bg-blue-600 transition duration-200 text-sm"
                            >
                              Ver/Editar
                            </button>
                            <button
                              onClick={() => deleteMedioPago(medio.id)}
                              className="bg-red-500 text-white py-2 px-3 rounded hover:bg-red-600 transition duration-200 text-sm"
                            >
                              Eliminar
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-20">
                  <p className="text-gray-500 mb-4">No hay medios de pago para mostrar.</p>
                  <button
                    onClick={() => navigate("/medios-pago")}
                    className="bg-green-500 text-white px-6 py-2 rounded-lg hover:bg-green-600 transition duration-200"
                  >
                    Crear tu primer medio de pago
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </>
  );
};

export default MediosPagoList;