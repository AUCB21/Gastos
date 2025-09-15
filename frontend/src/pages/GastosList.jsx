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
  const [search, setSearch] = useState("");
  const [estado, setEstado] = useState("Todos");
  const [page, setPage] = useState(1);
  const { user } = useUserData();
  const navigate = useNavigate();
  
  const perPage = 6; // cantidad de gastos por página

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

  // Filter gastos based on search and status
  const filteredGastos = gastos.filter((gasto) => {
    const matchesSearch = 
      gasto.vendedor.toLowerCase().includes(search.toLowerCase()) ||
      (gasto.categoria.name || gasto.categoria).toLowerCase().includes(search.toLowerCase()) ||
      (gasto.comentarios || '').toLowerCase().includes(search.toLowerCase());
    
    const isPaid = gasto.pagos_realizados === gasto.pagos_totales;
    const matchesStatus = estado === "Todos" || 
      (estado === "Pagado" && isPaid) || 
      (estado === "Pendiente" && !isPaid);
    
    return matchesSearch && matchesStatus;
  });

  // Pagination
  const totalPages = Math.ceil(filteredGastos.length / perPage);
  const start = (page - 1) * perPage;
  const paginatedGastos = filteredGastos.slice(start, start + perPage);

  // Calculate totals
  const totalAmount = gastos.reduce((sum, gasto) => sum + parseFloat(gasto.monto), 0);
  const paidAmount = gastos
    .filter(g => g.pagos_realizados === g.pagos_totales)
    .reduce((sum, gasto) => sum + parseFloat(gasto.monto), 0);
  const pendingAmount = totalAmount - paidAmount;

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
      <div className="min-h-screen bg-gray-100 p-6">
        {/* Header */}
        <header className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold text-gray-800">Lista de Gastos</h1>
          <button 
            onClick={() => delayedNavigate(navigate, "/gastos/add", 250)}
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-xl shadow"
          >
            + Crear Nuevo Gasto
          </button>
        </header>

        {/* Métricas */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
          <div className="bg-white shadow rounded-xl p-4">
            <p className="text-sm text-gray-500">Total</p>
            <p className="text-xl font-bold text-gray-800">${totalAmount.toLocaleString()}</p>
          </div>
          <div className="bg-white shadow rounded-xl p-4">
            <p className="text-sm text-gray-500">Pagados</p>
            <p className="text-xl font-bold text-green-600">${paidAmount.toLocaleString()}</p>
          </div>
          <div className="bg-white shadow rounded-xl p-4">
            <p className="text-sm text-gray-500">Pendientes</p>
            <p className="text-xl font-bold text-orange-500">${pendingAmount.toLocaleString()}</p>
          </div>
        </div>

        {/* Buscador + Filtros */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
          <input
            type="text"
            placeholder="Buscar gasto..."
            className="w-full sm:w-1/3 px-3 py-2 rounded-xl border border-gray-300 focus:ring-2 focus:ring-blue-500 outline-none"
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(1); // reset página al filtrar
            }}
          />
          <select
            className="w-full sm:w-1/4 px-3 py-2 rounded-xl border border-gray-300 focus:ring-2 focus:ring-blue-500 outline-none"
            value={estado}
            onChange={(e) => {
              setEstado(e.target.value);
              setPage(1); // reset página al cambiar filtro
            }}
          >
            <option value="Todos">Todos</option>
            <option value="Pagado">Pagados</option>
            <option value="Pendiente">Pendientes</option>
          </select>
        </div>

        {/* Lista de gastos */}
        {loading ? (
          <div className="text-center py-10">
            <p className="text-gray-500">Cargando gastos...</p>
          </div>
        ) : (
          <div className="space-y-4">
            {paginatedGastos.length > 0 ? (
              paginatedGastos.map((gasto) => (
                <Gasto
                  key={gasto.id}
                  gasto={gasto}
                  onDelete={() => deleteGasto(gasto.id)}
                  onEdit={() => handleEditGasto(gasto.id)}
                />
              ))
            ) : (
              <div className="text-center py-20">
                <p className="text-center text-gray-500">
                  {search || estado !== "Todos" ? "No se encontraron resultados" : "No hay gastos para mostrar."}
                </p>
                {!search && estado === "Todos" && (
                  <button
                    onClick={() => delayedNavigate(navigate, "/gastos/add", 250)}
                    className="bg-blue-500 text-white px-6 py-2 rounded-lg hover:bg-blue-600 transition duration-200 mt-4"
                  >
                    Crear tu primer gasto
                  </button>
                )}
              </div>
            )}
          </div>
        )}

        {/* Controles de paginación */}
        {totalPages > 1 && (
          <div className="flex justify-center items-center gap-2 mt-6">
            <button
              onClick={() => setPage((p) => Math.max(p - 1, 1))}
              disabled={page === 1}
              className="px-3 py-1 rounded-lg border disabled:opacity-50 hover:bg-gray-50"
            >
              ◀
            </button>
            <span className="text-gray-600">
              Página {page} de {totalPages}
            </span>
            <button
              onClick={() => setPage((p) => Math.min(p + 1, totalPages))}
              disabled={page === totalPages}
              className="px-3 py-1 rounded-lg border disabled:opacity-50 hover:bg-gray-50"
            >
              ▶
            </button>
          </div>
        )}
      </div>
    </>
  );
};

export default GastosList;