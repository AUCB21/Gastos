import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import GastoForm from "../components/forms/GastoForm"; 
import api from "../api"; 
import Gasto from "../components/Gasto";
import { ACCESS_TOKEN } from "../constants";
import NavBar from "../components/NavBar";
import { useUserData } from "../hooks/useUserData";

const GastoPage = () => {
  const [gastos, setGastos] = useState([]);
  const { user } = useUserData(); // Use the custom hook
  const navigate = useNavigate();

  // useEffect hook to fetch gastos on component mount
  useEffect(() => {
    getGastos();
  }, []);

  const getGastos = async () => {
    try {
      const response = await api.get("/api/gastos/"); // Added trailing slash for consistency
      setGastos(response.data);
      // console.log(response.data);
    } catch (error) {
      console.error("Error fetching gastos:", error);
    }
  };

  const deleteGasto = async (id) => {
    try {
      const res = await api.delete(`/api/gastos/${id}/`);
      if (res.status === 204) getGastos();
    } catch (error) {
      console.error("Error deleting gasto:", error);
      alert(`Error: ${error.message}`);
    }
  };

  const handleCreateGasto = async (formData) => {
    try {
      const token = localStorage.getItem(ACCESS_TOKEN);
      console.log("Current token:", token ? "Present" : "Missing");
      const response = await api.post("/api/gastos/", formData);
      if (response.status === 201) getGastos(); // Refresh the list to show the new expense
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

  const handleEditGasto = (id) => {
    // TODO: Implement edit functionality
    console.log("Edit gasto with ID:", id);
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
          <h1 className="text-4xl font-bold text-center text-gray-800 mb-8">Gestión de Gastos</h1>
          
          {/* Gasto Form */}
          <div className="mb-10">
            <GastoForm onGastoCreated={handleCreateGasto} />
          </div>

          {/* Gastos List */}
          <h2 className="text-3xl font-bold text-center text-gray-800 mt-10 mb-6">Lista de Gastos</h2>
          <div className="space-y-4">
            {gastos.length > 0 ? (
              gastos.map((gasto) => (
                <Gasto
                  key={gasto.id}
                  gasto={gasto}
                  onDelete={() => deleteGasto(gasto.id)}
                  onEdit={() => handleEditGasto(gasto.id)}
                />
              ))
            ) : (
              <p className="text-center text-gray-500">No hay gastos para mostrar.</p>
            )}
          </div>
        </div>
      </div>
    </>
  );
};

export default GastoPage;