import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import api from "../api";
import Gasto from "../components/Gasto";
import LayoutWrapper from "../components/wrappers/LayoutWrapper";
import { useUserData } from "../hooks/useUserData";
import delayedNavigate from "../hooks/delayedNavigate";

const GastosList = () => {
  const [gastos, setGastos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [estado, setEstado] = useState("Todos");
  const [groupBy, setGroupBy] = useState(null);
  const [page, setPage] = useState(1);
  const { user } = useUserData();
  const navigate = useNavigate();

  const perPage = 6;

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

  // Function to group gastos
  const groupGastos = (gastosToGroup, groupByValue) => {
    if (!groupByValue) return { "Todos los gastos": gastosToGroup };

    const grouped = {};

    gastosToGroup.forEach((gasto) => {
      let groupKey;

      switch (groupByValue) {
        case "categoria":
          groupKey = gasto.categoria?.name || gasto.categoria || "Sin categoría";
          break;
        case "vendedor":
          groupKey = gasto.vendedor || "Sin vendedor";
          break;
        case "estado":
          groupKey = gasto.pagos_realizados === gasto.pagos_totales ? "Pagado" : "Pendiente";
          break;
        case "mes": {
          const fecha = new Date(gasto.fecha);
          groupKey = fecha.toLocaleDateString('es-ES', { month: 'long', year: 'numeric' });
          break;
        }
        default:
          groupKey = "Sin agrupar";
      }

      if (!grouped[groupKey]) {
        grouped[groupKey] = [];
      }
      grouped[groupKey].push(gasto);
    });

    // Sort groups by name
    const sortedGroupKeys = Object.keys(grouped).sort();
    const sortedGrouped = {};
    sortedGroupKeys.forEach(key => {
      sortedGrouped[key] = grouped[key];
    });

    return sortedGrouped;
  };

  // Filter gastos based on search and status
  const filteredGastos = gastos.filter((gasto) => {
    const matchesSearch = 
      gasto.vendedor.toLowerCase().includes(search.toLowerCase()) ||
      (gasto.categoria?.name || gasto.categoria || '').toLowerCase().includes(search.toLowerCase()) ||
      (gasto.comentarios || '').toLowerCase().includes(search.toLowerCase());
    
    const isPaid = gasto.pagos_realizados === gasto.pagos_totales;
    const matchesStatus = estado === "Todos" || 
      (estado === "Pagado" && isPaid) || 
      (estado === "Pendiente" && !isPaid);
    
    return matchesSearch && matchesStatus;
  });

  // Group the filtered gastos
  const groupedGastos = groupGastos(filteredGastos, groupBy);

  // Flatten for pagination
  const allFilteredGastos = Object.values(groupedGastos).flat();
  const totalPages = Math.ceil(allFilteredGastos.length / perPage);

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
    navigate(`/gastos/${id}`);
  };

  const handleLogout = () => {
    navigate("/logout");
  };

  const renderGroupedGastos = () => {
    if (groupBy) {
      return Object.entries(groupedGastos).map(([groupName, gastosInGroup]) => {
        const start = (page - 1) * perPage;
        const end = start + perPage;
        const paginatedGastosInGroup = gastosInGroup.slice(start, end);

        if (paginatedGastosInGroup.length === 0 && page > 1) return null;

        return (
          <div key={groupName} className="mb-8">
            <h2 className="text-lg font-semibold text-gray-700 mb-4 border-b pb-2">
              {groupName} ({gastosInGroup.length})
            </h2>
            <div className="space-y-4">
              {paginatedGastosInGroup.map((gasto) => (
                <Gasto
                  key={gasto.id}
                  gasto={gasto}
                  onDelete={() => deleteGasto(gasto.id)}
                  onEdit={() => handleEditGasto(gasto.id)}
                />
              ))}
            </div>
          </div>
        );
      });
    } else {
      const start = (page - 1) * perPage;
      const paginatedGastos = allFilteredGastos.slice(start, start + perPage);

      return (
        <div className="space-y-4">
          {paginatedGastos.map((gasto) => (
            <Gasto
              key={gasto.id}
              gasto={gasto}
              onDelete={() => deleteGasto(gasto.id)}
              onEdit={() => handleEditGasto(gasto.id)}
            />
          ))}
        </div>
      );
    }
  };

  return (
    <LayoutWrapper user={user} onLogout={handleLogout}>
      <div className="space-y-6">
        {/* Header */}
        <header className="flex justify-between items-center">
          <h1 className="text-2xl font-bold text-gray-800">Lista de Gastos</h1>
          <button 
            onClick={() => delayedNavigate(navigate, "/gastos/add", 250)}
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-xl shadow transition-colors"
          >
            + Crear Nuevo Gasto
          </button>
        </header>

        {/* Métricas */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
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
        <div className="bg-white rounded-xl shadow p-4">
          <div className="flex flex-col sm:flex-row sm:items-center gap-4">
            <input
              type="text"
              placeholder="Buscar gasto..."
              className="flex-1 px-3 py-2 rounded-xl border border-gray-300 focus:ring-2 focus:ring-blue-500 outline-none"
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setPage(1);
              }}
            />
            <select
              className="px-3 py-2 rounded-xl border border-gray-300 focus:ring-2 focus:ring-blue-500 outline-none"
              value={estado}
              onChange={(e) => {
                setEstado(e.target.value);
                setPage(1);
              }}
            >
              <option value="Todos">Todos</option>
              <option value="Pagado">Pagados</option>
              <option value="Pendiente">Pendientes</option>
            </select>
            <select
              className="px-3 py-2 rounded-xl border border-gray-300 focus:ring-2 focus:ring-blue-500 outline-none"
              value={groupBy || ""}
              onChange={(e) => {
                setGroupBy(e.target.value || null);
                setPage(1);
              }}
            >
              <option value="">Sin agrupar</option>
              <option value="categoria">Agrupar por categoría</option>
              <option value="vendedor">Agrupar por vendedor</option>
              <option value="estado">Agrupar por estado</option>
              <option value="mes">Agrupar por mes</option>
            </select>
          </div>
        </div>

        {/* Lista de gastos */}
        {loading ? (
          <div className="bg-white rounded-xl shadow p-8">
            <p className="text-center text-gray-500">Cargando gastos...</p>
          </div>
        ) : allFilteredGastos.length > 0 ? (
          <div className="bg-white rounded-xl shadow p-6">
            {renderGroupedGastos()}
          </div>
        ) : (
          <div className="bg-white rounded-xl shadow p-8">
            <div className="text-center">
              <p className="text-gray-500 mb-4">
                {search || estado !== "Todos" ? "No se encontraron resultados" : "No hay gastos para mostrar."}
              </p>
              {!search && estado === "Todos" && (
                <button
                  onClick={() => delayedNavigate(navigate, "/gastos/add", 250)}
                  className="bg-blue-500 text-white px-6 py-2 rounded-lg hover:bg-blue-600 transition duration-200"
                >
                  Crear tu primer gasto
                </button>
              )}
            </div>
          </div>
        )}

        {/* Controles de paginación */}
        {totalPages > 1 && (
          <div className="flex justify-center items-center gap-2">
            <button
              onClick={() => setPage((p) => Math.max(p - 1, 1))}
              disabled={page === 1}
              className="px-3 py-1 rounded-lg border disabled:opacity-50 hover:bg-gray-50 transition-colors"
            >
              ◀
            </button>
            <span className="text-gray-600">
              Página {page} de {totalPages}
            </span>
            <button
              onClick={() => setPage((p) => Math.min(p + 1, totalPages))}
              disabled={page === totalPages}
              className="px-3 py-1 rounded-lg border disabled:opacity-50 hover:bg-gray-50 transition-colors"
            >
              ▶
            </button>
          </div>
        )}
      </div>
    </LayoutWrapper>
  );
};

export default GastosList;