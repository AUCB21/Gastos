import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import api from "../api";
import MediosPago from "../components/MediosPago";
import NavBar from "../components/NavBar";
import { useUserData } from "../hooks/useUserData";
import delayedNavigate from "../hooks/delayedNavigate";

const MediosPagoList = () => {
  const [mediosPago, setMediosPago] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [tipoFilter, setTipoFilter] = useState("Todos");
  const [page, setPage] = useState(1);
  const { user } = useUserData();
  const navigate = useNavigate();
  
  const perPage = 6; // cantidad de medios de pago por página

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

  // Filter medios de pago based on search and type
  const filteredMediosPago = mediosPago.filter((medio) => {
    const matchesSearch = 
      medio.ente_emisor.toLowerCase().includes(search.toLowerCase()) ||
      (medio.tipo_tarjeta || '').toLowerCase().includes(search.toLowerCase()) ||
      (medio.extra || '').toLowerCase().includes(search.toLowerCase());
    
    const matchesType = tipoFilter === "Todos" || medio.tipo === tipoFilter;
    
    return matchesSearch && matchesType;
  });

  // Pagination
  const totalPages = Math.ceil(filteredMediosPago.length / perPage);
  const start = (page - 1) * perPage;
  const paginatedMediosPago = filteredMediosPago.slice(start, start + perPage);

  // Calculate stats
  const totalMediosPago = mediosPago.length;
  const tarjetas = mediosPago.filter(m => m.tipo === 'TC' || m.tipo === 'TD').length;
  const otros = mediosPago.filter(m => m.tipo !== 'TC' && m.tipo !== 'TD').length;

  const deleteMedioPago = async (id) => {
    if (window.confirm("¿Estás seguro de que quieres eliminar este medio de pago?")) {
      try {
        const res = await api.delete(`/api/medios-pago/${id}/`);
        if (res.status === 204) {
          getMediosPago(); // Refresh the list
          alert("Medio de Pago eliminado exitosamente.");
        }
      } catch (error) {
        console.error("Error deleting medio de pago:", error);
        alert(`Error: ${error.message}`);
      }
    }
  };

  const handleEditMedioPago = (id) => {
    // Navigate to individual medio de pago detail page (to be created)
    navigate(`/medios-pago/${id}`);
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
          <h1 className="text-2xl font-bold text-gray-800">Lista de Medios de Pago</h1>
          <button 
            onClick={() => delayedNavigate(navigate, "/medios-pago/add", 250)}
            className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-xl shadow"
          >
            + Crear Nuevo Medio de Pago
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
            <p className="text-xl font-bold text-green-600">{otros}</p>
          </div>
        </div>

        {/* Buscador + Filtros */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
          <input
            type="text"
            placeholder="Buscar medio de pago..."
            className="w-full sm:w-1/3 px-3 py-2 rounded-xl border border-gray-300 focus:ring-2 focus:ring-green-500 outline-none"
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(1); // reset página al filtrar
            }}
          />
          <select
            className="w-full sm:w-1/4 px-3 py-2 rounded-xl border border-gray-300 focus:ring-2 focus:ring-green-500 outline-none"
            value={tipoFilter}
            onChange={(e) => {
              setTipoFilter(e.target.value);
              setPage(1); // reset página al cambiar filtro
            }}
          >
            <option value="Todos">Todos los tipos</option>
            <option value="TC">Tarjetas de Crédito</option>
            <option value="TD">Tarjetas de Débito</option>
            <option value="TR">Transferencias</option>
            <option value="EF">Efectivo</option>
          </select>
        </div>

        {/* Lista de medios de pago */}
        {loading ? (
          <div className="text-center py-10">
            <p className="text-gray-500">Cargando medios de pago...</p>
          </div>
        ) : (
          <div className="space-y-4">
            {paginatedMediosPago.length > 0 ? (
              paginatedMediosPago.map((medio) => (
                <MediosPago
                  key={medio.id}
                  medioPago={medio}
                  onDelete={() => deleteMedioPago(medio.id)}
                  onEdit={() => handleEditMedioPago(medio.id)}
                />
              ))
            ) : (
              <div className="text-center py-20">
                <p className="text-center text-gray-500">
                  {search || tipoFilter !== "Todos" ? "No se encontraron resultados" : "No hay medios de pago para mostrar."}
                </p>
                {!search && tipoFilter === "Todos" && (
                  <button
                    onClick={() => delayedNavigate(navigate, "/medios-pago/add", 250)}
                    className="bg-green-500 text-white px-6 py-2 rounded-lg hover:bg-green-600 transition duration-200 mt-4"
                  >
                    Crear tu primer medio de pago
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

export default MediosPagoList;