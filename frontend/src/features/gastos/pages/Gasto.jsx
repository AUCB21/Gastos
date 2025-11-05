import { useNavigate } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import GastoForm from "../components/GastoForm"; 
import api from "../../../api"; 
import { ACCESS_TOKEN } from "../../../constants";
import { LayoutWrapper } from "../../../shared/components/layout";
import { useUserData } from "../../../hooks/useUserData";
import { componentStyles } from "../../../utils/colorSystem";

const GastoPage = () => {
  const { user } = useUserData();
  const navigate = useNavigate();

  const handleCreateGasto = async (formData) => {
    try {
      const token = localStorage.getItem(ACCESS_TOKEN);
      console.log("Current token:", token ? "Present" : "Missing");
      const response = await api.post("/api/gastos/", formData);
      if (response.status === 201) {
        alert("Gasto creado exitosamente.");
      }
    } catch (error) {
      console.error("Error creating gasto:", error);
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
    <LayoutWrapper user={user} onLogout={handleLogout} showSidebar={false}>
      <div className="max-w-2xl mx-auto">
        {/* Back link */}
        <button
          onClick={() => navigate("/gastos")}
          className="mb-4 text-sm text-gray-600 hover:text-blue-600 flex items-center gap-1 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Volver
        </button>

        {/* Gasto Form */}
        <div className={componentStyles.form.container}>
          <GastoForm onGastoCreated={handleCreateGasto} />
        </div>
      </div>
    </LayoutWrapper>
  );
};

export default GastoPage;