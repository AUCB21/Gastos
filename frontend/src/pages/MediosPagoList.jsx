import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import api from "../api";
import MediosPago from "../components/MediosPago";
import LayoutWrapper from "../components/wrappers/LayoutWrapper";
import { useUserData } from "../hooks/useUserData";
import delayedNavigate from "../hooks/delayedNavigate";

const MediosPagoList = () => {
  const [mediosPago, setMediosPago] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [tipoFilter, setTipoFilter] = useState("Todos");
  const [groupBy, setGroupBy] = useState(null);
  const [page, setPage] = useState(1);
  const { user } = useUserData();
  const navigate = useNavigate();

  const perPage = 6;

  useEffect(() => {
    getMediosPago();
  }, []);

  const getMediosPago = async () => {
    try {
      setLoading(true);
      const response = await api.get("/api/medios-pago/");
      setMediosPago(response.data);
    } catch (error) {
      console.error("Error fetching medios de pago:", error);
      if (error.response?.status === 401) {
        alert("Authentication error. Please log in again.");
        localStorage.clear();
        window.location.href = "/login";
      }
    } finally {
      setLoading(false);
    }
  };

  // Function to group medios de pago
  const groupMediosPago = (mediosToGroup, groupByValue) => {
    if (!groupByValue) return { "Todos los medios de pago": mediosToGroup };

    const grouped = {};

    mediosToGroup.forEach((medio) => {
      let groupKey;

      switch (groupByValue) {
        case "tipo":
          const tipoNames = {
            TC: "Tarjetas de Crédito",
            TD: "Tarjetas de Débito",
            MP: "Mercado Pago",
            EF: "Efectivo",
            TR: "Transferencia",
          };
          groupKey = tipoNames[medio.tipo] || medio.tipo || "Sin tipo";
          break;
        case "ente_emisor":
          groupKey = medio.ente_emisor || "Sin emisor";
          break;
        default:
          groupKey = "Otros";
      }

      if (!grouped[groupKey]) {
        grouped[groupKey] = [];
      }
      grouped[groupKey].push(medio);
    });

    // Sort groups alphabetically
    const sortedGrouped = {};
    Object.keys(grouped)
      .sort()
      .forEach((key) => {
        sortedGrouped[key] = grouped[key].sort((a, b) =>
          (a.ente_emisor || '').localeCompare(b.ente_emisor || '')
        );
      });

    return sortedGrouped;
  };

  // Filter medios de pago based on search and type
  const filteredMediosPago = mediosPago.filter((medio) => {
    const matchesSearch =
      medio.ente_emisor.toLowerCase().includes(search.toLowerCase()) ||
      (medio.tipo_tarjeta || "").toLowerCase().includes(search.toLowerCase()) ||
      (medio.extra || "").toLowerCase().includes(search.toLowerCase());

    const matchesType = tipoFilter === "Todos" || medio.tipo === tipoFilter;

    return matchesSearch && matchesType;
  });

  // Apply grouping to filtered medios de pago
  const groupedMediosPago = groupMediosPago(filteredMediosPago, groupBy);

  // Calculate stats
  const totalMediosPago = mediosPago.length;
  const tarjetas = mediosPago.filter(
    (m) => m.tipo === "TC" || m.tipo === "TD"
  ).length;
  const otros = mediosPago.filter(
    (m) => m.tipo !== "TC" && m.tipo !== "TD"
  ).length;

  const deleteMedioPago = async (id) => {
    if (
      window.confirm(
        "¿Estás seguro de que quieres eliminar este medio de pago?"
      )
    ) {
      try {
        const res = await api.delete(`/api/medios-pago/${id}/`);
        if (res.status === 204) {
          getMediosPago();
          alert("Medio de Pago eliminado exitosamente.");
        }
      } catch (error) {
        console.error("Error deleting medio de pago:", error);
        alert(`Error: ${error.message}`);
      }
    }
  };

  const handleEditMedioPago = (id) => {
    navigate(`/medios-pago/${id}`);
  };

  const handleLogout = () => {
    navigate("/logout");
  };

  const handleGroupByChange = (newGroupBy) => {
    setGroupBy(newGroupBy);
    setPage(1);
  };

  // Calculate group statistics
  const getGroupStats = (groupItems) => {
    const tipos = {};
    groupItems.forEach((item) => {
      tipos[item.tipo] = (tipos[item.tipo] || 0) + 1;
    });
    return { count: groupItems.length, tipos };
  };

  return (
    <LayoutWrapper
      user={user}
      logout={handleLogout}
      pageType="medios-pago"
      onGroupByChange={handleGroupByChange}
      currentGroupBy={groupBy}
    >
      <div className="p-6">
        {/* Header */}
        <header className="flex justify-between items-center mb-6">
          <div className="flex items-center space-x-4">
            <h1 className="text-2xl font-bold text-gray-800">Medios de Pago</h1>
            {groupBy && (
              <span className="px-3 py-1 bg-green-100 text-green-700 rounded-full text-sm font-medium">
                Agrupado por {groupBy === "tipo" ? "tipo" : "emisor"}
              </span>
            )}
          </div>
          <button
            onClick={() => delayedNavigate(navigate, "/medios-pago/add", 250)}
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-xl shadow"
          >
            + Crear Nuevo Medio
          </button>
        </header>

        {/* Métricas */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
          <div className="bg-white shadow rounded-xl p-4">
            <p className="text-sm text-gray-500">Total</p>
            <p className="text-xl font-bold text-gray-800">{totalMediosPago}</p>
          </div>
          <div className="bg-white shadow rounded-xl p-4">
            <p className="text-sm text-gray-500">Tarjetas</p>
            <p className="text-xl font-bold text-blue-600">{tarjetas}</p>
          </div>
          <div className="bg-white shadow rounded-xl p-4">
            <p className="text-sm text-gray-500">Otros</p>
            <p className="text-xl font-bold text-purple-600">{otros}</p>
          </div>
        </div>

        {/* Buscador + Filtros */}
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 mb-6">
          <input
            type="text"
            placeholder="Buscar medio de pago..."
            className="w-full lg:w-1/3 px-3 py-2 rounded-xl border border-gray-300 focus:ring-2 focus:ring-blue-500 outline-none"
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(1);
            }}
          />

          <div className="flex flex-col sm:flex-row gap-4 w-full lg:w-auto">
            <select
              className="w-full sm:w-auto min-w-[140px] px-3 py-2 rounded-xl border border-gray-300 focus:ring-2 focus:ring-blue-500 outline-none"
              value={tipoFilter}
              onChange={(e) => {
                setTipoFilter(e.target.value);
                setPage(1);
              }}
            >
              <option value="Todos">Todos los tipos</option>
              <option value="TC">Tarjeta de Crédito</option>
              <option value="TD">Tarjeta de Débito</option>
              <option value="MP">Mercado Pago</option>
              <option value="EF">Efectivo</option>
              <option value="TR">Transferencia</option>
            </select>
          </div>
        </div>

        {/* Lista de medios de pago */}
        {loading ? (
          <div className="text-center py-10">
            <p className="text-gray-500">Cargando medios de pago...</p>
          </div>
        ) : (
          <div className="space-y-6">
            {Object.entries(groupedMediosPago).map(
              ([groupName, groupMedios]) => {
                const stats = getGroupStats(groupMedios);

                return (
                  <div
                    key={groupName}
                    className="bg-white rounded-xl shadow-sm border border-gray-200"
                  >
                    {/* Group Header */}
                    {groupBy && (
                      <div className="px-6 py-4 border-b border-gray-200 bg-gray-50 rounded-t-xl">
                        <div className="flex justify-between items-center">
                          <h3 className="text-lg font-semibold text-gray-800">
                            {groupName}
                          </h3>
                          <div className="flex space-x-4 text-sm text-gray-600">
                            <span>{stats.count} medios</span>
                            {Object.entries(stats.tipos).map(
                              ([tipo, count]) => (
                                <span key={tipo} className="text-blue-600">
                                  {count} {tipo}
                                </span>
                              )
                            )}
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Group Content */}
                    <div className="p-6">
                      {groupMedios.length > 0 ? (
                        <div className="space-y-4">
                          {groupMedios.map((medio) => (
                            <MediosPago
                              key={medio.id}
                              medioPago={medio}
                              onDelete={() => deleteMedioPago(medio.id)}
                              onEdit={() => handleEditMedioPago(medio.id)}
                            />
                          ))}
                        </div>
                      ) : (
                        <div className="text-center py-10">
                          <p className="text-gray-500">
                            No hay medios de pago en este grupo.
                          </p>
                        </div>
                      )}
                    </div>
                  </div>
                );
              }
            )}

            {/* Empty state */}
            {Object.keys(groupedMediosPago).length === 0 && (
              <div className="text-center py-20">
                <p className="text-center text-gray-500">
                  {search || tipoFilter !== "Todos"
                    ? "No se encontraron resultados"
                    : "No hay medios de pago para mostrar."}
                </p>
                {!search && tipoFilter === "Todos" && (
                  <button
                    onClick={() =>
                      delayedNavigate(navigate, "/medios-pago/add", 250)
                    }
                    className="bg-blue-500 text-white px-6 py-2 rounded-lg hover:bg-blue-600 transition duration-200 mt-4"
                  >
                    Crear tu primer medio de pago
                  </button>
                )}
              </div>
            )}
          </div>
        )}
      </div>
    </LayoutWrapper>
  );
};

export default MediosPagoList;
