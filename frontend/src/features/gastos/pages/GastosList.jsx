import { useState, useEffect, useMemo, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import api from "../../../api";
import Gasto from "../components/Gasto";
import GastoDetailModal from "../components/GastoDetailModal";
import LayoutWrapper from "../../../shared/components/wrappers/LayoutWrapper";
import { useUserData } from "../../../hooks/useUserData";
import delayedNavigate from "../../../hooks/delayedNavigate";
import { getButtonClass } from "../../../utils/colorSystem";
import Toast from "../../../shared/components/Toast";

const GastosList = () => {
  const [gastos, setGastos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [estado, setEstado] = useState("Todos");
  const [groupBy, setGroupBy] = useState(null);
  const [page, setPage] = useState(1);
  const [toast, setToast] = useState(null);
  const [selectedGasto, setSelectedGasto] = useState(null);
  const [gastoDetailsCache, setGastoDetailsCache] = useState({}); // Cache for full gasto details
  const { user } = useUserData();
  const navigate = useNavigate();

  const showToast = useCallback((message, type = "success") => {
    setToast({ message, type });
  }, []);

  const perPage = 6;

  const getGastos = useCallback(async () => {
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
  }, []);

  useEffect(() => {
    getGastos();
  }, [getGastos]);

  // Memoized filtering logic
  const filteredGastos = useMemo(() => {
    return gastos.filter((gasto) => {
      const matchesSearch =
        gasto.vendedor.toLowerCase().includes(search.toLowerCase()) ||
        (gasto.categoria?.name || gasto.categoria || "")
          .toLowerCase()
          .includes(search.toLowerCase()) ||
        (gasto.comentarios || "").toLowerCase().includes(search.toLowerCase());

      const isPaid = gasto.pagos_realizados === gasto.pagos_totales;
      const matchesStatus =
        estado === "Todos" ||
        (estado === "Pagado" && isPaid) ||
        (estado === "Pendiente" && !isPaid);

      return matchesSearch && matchesStatus;
    });
  }, [gastos, search, estado]);

  // Memoized grouping logic
  const groupedGastos = useMemo(() => {
    if (!groupBy) return { "Todos los gastos": filteredGastos };

    const grouped = {};

    filteredGastos.forEach((gasto) => {
      let groupKey;

      switch (groupBy) {
        case "categoria":
          groupKey =
            gasto.categoria?.name || gasto.categoria || "Sin categoría";
          break;
        case "vendedor":
          groupKey = gasto.vendedor || "Sin vendedor";
          break;
        case "estado":
          groupKey =
            gasto.pagos_realizados === gasto.pagos_totales
              ? "Pagado"
              : "Pendiente";
          break;
        case "mes": {
          const fecha = new Date(gasto.fecha_gasto);
          groupKey = fecha.toLocaleDateString("es-AR", {
            month: "long",
            year: "numeric",
          });
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
    sortedGroupKeys.forEach((key) => {
      sortedGrouped[key] = grouped[key];
    });

    return sortedGrouped;
  }, [filteredGastos, groupBy]);

  // Memoized pagination data
  const { allFilteredGastos, totalPages } = useMemo(() => {
    const all = Object.values(groupedGastos).flat();
    return {
      allFilteredGastos: all,
      totalPages: Math.ceil(all.length / perPage),
    };
  }, [groupedGastos, perPage]);

  // Memoized totals calculation grouped by currency
  const { totalByCurrency, paidByCurrency, pendingByCurrency } = useMemo(() => {
    const totals = {};
    const pending = {};
    const paid = {};

    gastos.forEach((gasto) => {
      const currency = gasto.moneda || 'ARS';
      const montoTotal = parseFloat(gasto.monto);
      
      // Initialize currency if not exists
      if (!totals[currency]) {
        totals[currency] = 0;
        pending[currency] = 0;
        paid[currency] = 0;
      }
      
      // Add to total
      totals[currency] += montoTotal;
      
      // Calculate pending amount for this gasto
      const cuotasPendientes = gasto.pagos_totales - gasto.pagos_realizados;
      const montoPorCuota = montoTotal / gasto.pagos_totales;
      const montoPendienteGasto = montoPorCuota * cuotasPendientes;
      pending[currency] += montoPendienteGasto;
      
      // Calculate paid amount for this gasto
      const cuotasPagadas = gasto.pagos_realizados;
      const montoPagadoGasto = montoPorCuota * cuotasPagadas;
      paid[currency] += montoPagadoGasto;
    });

    return {
      totalByCurrency: totals,
      paidByCurrency: paid,
      pendingByCurrency: pending,
    };
  }, [gastos]);

  // Helper function to render amounts by currency
  const renderAmountsByCurrency = useCallback((amountsByCurrency) => {
    const currencies = Object.keys(amountsByCurrency)
      .filter(currency => amountsByCurrency[currency] > 0)
      .sort(); // Sort currencies alphabetically
    
    return currencies.map((currency, index) => (
      <span key={currency}>
        {currency} ${amountsByCurrency[currency].toLocaleString('es-AR', { 
          minimumFractionDigits: 2, 
          maximumFractionDigits: 2 
        })}
        {index < currencies.length - 1 && <span className="mx-2">|</span>}
      </span>
    ));
  }, []);

  const deleteGasto = useCallback(
    async (id) => {
      if (window.confirm("¿Estás seguro de que quieres eliminar este gasto?")) {
        try {
          const res = await api.delete(`/api/gastos/${id}/`);
          if (res.status === 204) {
            // Clear cached details for this gasto since it's been deleted
            setGastoDetailsCache((prev) => {
              const newCache = { ...prev };
              delete newCache[id];
              return newCache;
            });
            getGastos(); // Refresh the list
            alert("Gasto eliminado exitosamente.");
          }
        } catch (error) {
          console.error("Error deleting gasto:", error);
          alert(`Error: ${error.message}`);
        }
      }
    },
    [getGastos]
  );

  const handleShowDetail = useCallback(
    async (id) => {
      try {
        // Check if we have cached details
        if (gastoDetailsCache[id]) {
          setSelectedGasto(gastoDetailsCache[id]);
          return;
        }

        // If not cached, fetch full gasto details including related medio_pago_info object
        const response = await api.get(`/api/gastos/${id}/`);
        const fullGastoData = response.data;

        // Cache the fetched details
        setGastoDetailsCache((prev) => ({ ...prev, [id]: fullGastoData }));
        setSelectedGasto(fullGastoData);
      } catch (error) {
        console.error("Error fetching gasto details:", error);
        showToast("Error al cargar los detalles del gasto", "error");
      }
    },
    [showToast, gastoDetailsCache]
  );

  const handlePayCuotaFromModal = useCallback(
    async (id) => {
      const gasto = gastos.find((g) => g.id === id);
      if (!gasto) return;

      if (gasto.pagos_realizados >= gasto.pagos_totales) {
        showToast("Este gasto ya está completamente pagado.", "warning");
        return;
      }

      try {
        const updatedGasto = {
          ...gasto,
          pagos_realizados: gasto.pagos_realizados + 1,
        };

        const res = await api.patch(`/api/gastos/${id}/`, {
          pagos_realizados: updatedGasto.pagos_realizados,
        });

        if (res.status === 200) {
          // Clear cached details for this gasto since it's been updated
          setGastoDetailsCache((prev) => {
            const newCache = { ...prev };
            delete newCache[id];
            return newCache;
          });
          getGastos(); // Refresh the list
          showToast(
            `Cuota ${updatedGasto.pagos_realizados} de ${gasto.pagos_totales} pagada exitosamente.`,
            "success"
          );
        }
      } catch (error) {
        console.error("Error paying installment:", error);
        showToast(
          `Error: ${error.response?.data?.detail || error.message}`,
          "error"
        );
      }
    },
    [gastos, showToast, getGastos]
  );

  const handleEditFromModal = useCallback(
    (id) => {
      setSelectedGasto(null);
      navigate(`/gastos/${id}`);
    },
    [navigate]
  );

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
                  onDelete={deleteGasto}
                  onEdit={handleShowDetail}
                  onPayInstallment={handleShowDetail}
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
              onDelete={deleteGasto}
              onEdit={handleShowDetail}
              onPayInstallment={handleShowDetail}
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
            className={getButtonClass("formPrimary", "form")}
          >
            + Crear Nuevo Gasto
          </button>
        </header>

        {/* Métricas */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="bg-white shadow rounded-xl p-4">
            <p className="text-sm text-gray-500">Total</p>
            <p className="text-xl font-bold text-gray-800">
              {renderAmountsByCurrency(totalByCurrency)}
            </p>
          </div>
          <div className="bg-white shadow rounded-xl p-4">
            <p className="text-sm text-gray-500">Pagados</p>
            <p className="text-xl font-bold text-green-600">
              {renderAmountsByCurrency(paidByCurrency)}
            </p>
          </div>
          <div className="bg-white shadow rounded-xl p-4">
            <p className="text-sm text-gray-500">Pendientes</p>
            <p className="text-xl font-bold text-orange-500">
              {renderAmountsByCurrency(pendingByCurrency)}
            </p>
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
                {search || estado !== "Todos"
                  ? "No se encontraron resultados"
                  : "No hay gastos para mostrar."}
              </p>
              {!search && estado === "Todos" && (
                <button
                  onClick={() => delayedNavigate(navigate, "/gastos/add", 250)}
                  className={getButtonClass("formPrimary", "form")}
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

      {/* Gasto Detail Modal */}
      {selectedGasto && (
        <GastoDetailModal
          gasto={selectedGasto}
          onClose={() => setSelectedGasto(null)}
          onPayCuota={handlePayCuotaFromModal}
          onEdit={handleEditFromModal}
        />
      )}

      {/* Toast Notification */}
      {toast && (
        <Toast
          message={toast.message}
          type={toast.type}
          onClose={() => setToast(null)}
        />
      )}
    </LayoutWrapper>
  );
};

export default GastosList;
