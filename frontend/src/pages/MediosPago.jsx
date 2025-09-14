import { useNavigate } from "react-router-dom";
import MPForm from "../components/forms/MPForm"; 
import api from "../api"; 
import { ACCESS_TOKEN } from "../constants";
import NavBar from "../components/NavBar";
import { useUserData } from "../hooks/useUserData";

const MediosPagoPage = () => {
  const { user } = useUserData();
  const navigate = useNavigate();

  const handleCreateMedioPago = async (formData) => {
    try {
      const token = localStorage.getItem(ACCESS_TOKEN);
      console.log("Current token:", token ? "Present" : "Missing");
      const response = await api.post("/api/medios_pago/", formData);
      if (response.status === 201) {
        alert("Medio de Pago creado exitosamente.");
      }
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
          <h1 className="text-4xl font-bold text-center text-gray-800 mb-8">Crear Nuevo Medio de Pago</h1>
          
          {/* MedioPago Form */}
          <div className="mb-10">
            <MPForm onMPCreated={handleCreateMedioPago} />
          </div>
        </div>
      </div>
    </>
  );
};

export default MediosPagoPage;