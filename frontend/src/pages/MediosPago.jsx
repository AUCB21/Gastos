import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import MPForm from "../components/forms/MPForm"; 
import api from "../api"; 
import { ACCESS_TOKEN } from "../constants";
import NavBar from "../components/NavBar";
import { useUserData } from "../hooks/useUserData";

const MediosPagoPage = () => {
  const [mediosPago, setMediosPago] = useState([]);
  const { user } = useUserData(); // Use the custom hook
  const navigate = useNavigate();

  // useEffect hook to fetch medios de pago on component mount
  useEffect(() => {
    getMediosPago();
  }, []);

  const getMediosPago = async () => {
    try {
      const response = await api.get("/api/medios_pago/");
      setMediosPago(response.data);
    } catch (error) {
      console.error("Error fetching medios de pago:", error);
    }
  };

  const deleteMedioPago = async (id) => {
    try {
      const res = await api.delete(`/api/medios_pago/${id}/`);
      if (res.status === 204) getMediosPago();
    } catch (error) {
      console.error("Error deleting medio de pago:", error);
      alert(`Error: ${error.message}`);
    }
  };

  const handleCreateMedioPago = async (formData) => {
    try {
      const token = localStorage.getItem(ACCESS_TOKEN);
      console.log("Current token:", token ? "Present" : "Missing");
      const response = await api.post("/api/medios_pago/", formData);
      if (response.status === 201) getMediosPago(); // Refresh the list to show the new payment method
    } catch (error) {
      console.error("Error creating medio de pago:", error);
      console.error("Error status:", error.response?.status);
      console.error("Full error response:", error.response);
      console.error("Error details:", error.response?.data);
      
      if (error.response?.status === 401) {
        alert("Authentication error. Please log in again.");
        localStorage.clear();
        window.location.href = "/login";
      } else if (error.response?.status === 400) {
        const errorDetails = error.response.data;
        let errorMessage = "Validation errors:\n";
        
        if (typeof errorDetails === 'object') {
          Object.keys(errorDetails).forEach(field => {
            errorMessage += `${field}: ${Array.isArray(errorDetails[field]) ? errorDetails[field].join(', ') : errorDetails[field]}\n`;
          });
        } else {
          errorMessage = errorDetails.toString();
        }
        
        alert(errorMessage);
      } else {
        alert(`Error ${error.response?.status || 'Unknown'}: ${error.response?.data?.detail || error.message}. Check console for details.`);
      }
    }
  };

  const handleEditMedioPago = (id) => {
    // TODO: Implement edit functionality
    console.log("Edit medio de pago with ID:", id);
    alert("Edit functionality not implemented yet");
  };

  const handleLogout = () => {
    navigate("/logout");
  };

  return (
    <>
      {/* Navigation Bar */}
      <NavBar user={user} logout={handleLogout} />
      
      {/* Main Content */}
      <div className="bg-gray-100 min-h-screen py-10 font-sans">
        <div className="container mx-auto px-4">
          {/* Page Title */}
          <h1 className="text-4xl font-bold text-center text-gray-800 mb-8">Gestión de Medios de Pago</h1>
          
          {/* MedioPago Form */}
          <div className="mb-10">
            <MPForm onMPCreated={handleCreateMedioPago} />
          </div>

          {/* Medios de Pago List */}
          <h2 className="text-3xl font-bold text-center text-gray-800 mt-10 mb-6">Lista de Medios de Pago</h2>
          <div className="space-y-4">
            {mediosPago.length > 0 ? (
              mediosPago.map((medio) => (
                <div
                  key={medio.id}
                  className="bg-white p-4 rounded-lg shadow flex items-center justify-between"
                >
                  <div className="flex-1">
                    <p className="text-lg font-semibold text-gray-700">
                      <span className="text-blue-600">{medio.ente_emisor}</span> - {medio.tipo}
                    </p>
                    {medio.tipo_tarjeta && (
                      <p className="text-gray-500">Tipo: {medio.tipo_tarjeta}</p>
                    )}
                    {medio.extra && (
                      <p className="text-gray-500">Comentarios: {medio.extra}</p>
                    )}
                  </div>
                  <button
                    onClick={() => handleEditMedioPago(medio.id)}
                    className="bg-blue-500 text-white font-bold py-2 px-4 rounded-md hover:bg-blue-600 transition duration-200 mr-2"
                  >
                    Editar
                  </button>
                  <button
                    onClick={() => deleteMedioPago(medio.id)}
                    className="bg-red-500 text-white font-bold py-2 px-4 rounded-md hover:bg-red-600 transition duration-200"
                  >
                    Eliminar
                  </button>
                </div>
              ))
            ) : (
              <p className="text-center text-gray-500">No hay medios de pago para mostrar.</p>
            )}
          </div>
        </div>
      </div>
    </>
  );
};

export default MediosPagoPage;