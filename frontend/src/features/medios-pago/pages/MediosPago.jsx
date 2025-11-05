import { useNavigate } from "react-router-dom";
import MPForm from "../components/MPForm";
import api from "@/api";
import { ACCESS_TOKEN } from "@/constants";
import { LayoutWrapper } from "@/shared/components/layout";
import { useUserData } from "@/hooks/useUserData";
import { componentStyles } from "@/utils/colorSystem";const MediosPagoPage = () => {
  const { user } = useUserData();
  const navigate = useNavigate();

  const handleCreateMedioPago = async (formData) => {
    try {
      const token = localStorage.getItem(ACCESS_TOKEN);
      console.log("Current token:", token ? "Present" : "Missing");
      const response = await api.post("/api/medios-pago/", formData);
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
    <LayoutWrapper user={user} onLogout={handleLogout} showSidebar={false}>
      <div className="max-w-2xl mx-auto">
        {/* MedioPago Form */}
        <div className={componentStyles.form.container}>
          <MPForm onMPCreated={handleCreateMedioPago} />
        </div>
      </div>
    </LayoutWrapper>
  );
};

export default MediosPagoPage;