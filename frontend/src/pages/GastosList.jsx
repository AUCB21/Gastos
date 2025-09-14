import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import api from "../api";
import Gasto from "../components/Gasto";
import NavBar from "../components/NavBar";
import { useUserData } from "../hooks/useUserData";
import delayedNavigate from "../hooks/delayedNavigate";

const GastosList = () => {
  const [gastos, setGastos] = useState([]);
  const [loading, setLoading] = useState(true);
  const { user } = useUserData();
  const navigate = useNavigate();

  useEffect(() => {
    getGastos();
  }, []);

  const getGastos = async () => {
    try {
      setLoading(true);
      const response = await api.get("/api/gastos/");
      setGastos(response.data);
    } catch (error) {
      console.error("Error fetching gastos:", error);
      if (error.response?.status === 401) {
        alert("Authentication error. Please log in again.");
        localStorage.clear();
        window.location.href = "/login";
      }
    } finally {
      setLoading(false);
    }
  };

  const deleteGasto = async (id) => {
    if (window.confirm("¿Estás seguro de que quieres eliminar este gasto?")) {
      try {
        const res = await api.delete(`/api/gastos/${id}/`);
        if (res.status === 204) {
          getGastos(); // Refresh the list
          alert("Gasto eliminado exitosamente.");
        }
      } catch (error) {
        console.error("Error deleting gasto:", error);
        alert(`Error: ${error.message}`);
      }
    }
  };

  const handleEditGasto = (id) => {
    // Navigate to individual gasto detail page (to be created)
    navigate(`/gastos/${id}`);
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
          {/* Page Header */}
          <div className="flex justify-between items-center mb-8">
            <h1 className="text-4xl font-bold text-gray-800">Lista de Gastos</h1>
            <button
              onClick={() => delayedNavigate(navigate, "/gastos/add", 250)}
              className="bg-blue-500 text-white px-6 py-3 rounded-lg hover:bg-blue-600 transition duration-200 flex items-center space-x-2"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6"></path>
              </svg>
              <span>Crear Nuevo Gasto</span>
            </button>
          </div>

          {/* Stats Summary */}
          <div className="bg-white p-6 rounded-xl shadow-lg mb-8">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="text-center">
                <p className="text-2xl font-bold text-blue-600">{gastos.length}</p>
                <p className="text-gray-600">Total de Gastos</p>
              </div>
              <div className="text-center">
                <p className="text-2xl font-bold text-green-600">
                  {gastos.filter(g => g.pagos_realizados === g.pagos_totales).length}
                </p>
                <p className="text-gray-600">Pagados Completamente</p>
              </div>
              <div className="text-center">
                <p className="text-2xl font-bold text-orange-600">
                  {gastos.filter(g => g.pagos_realizados < g.pagos_totales).length}
                </p>
                <p className="text-gray-600">Pendientes</p>
              </div>
            </div>
          </div>

          {/* Gastos Grid */}
          {loading ? (
            <div className="text-center py-10">
              <p className="text-gray-500">Cargando gastos...</p>
            </div>
          ) : (
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
                <div className="text-center py-20">
                  <p className="text-gray-500 mb-4">No hay gastos para mostrar.</p>
                  <button
                    onClick={() => delayedNavigate(navigate, "/gastos/add", 250)}
                    className="bg-blue-500 text-white px-6 py-2 rounded-lg hover:bg-blue-600 transition duration-200"
                  >
                    Crear tu primer gasto
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

export default GastosList;