import React, { useState, useEffect } from "react";
import api from "../api";
import GrupoCard from "./GrupoCard";
import {
  Plus,
  Search,
  Filter,
  Users,
  AlertCircle,
  Loader,
} from "lucide-react";

const GrupoList = ({ onCreateNew, onEditGrupo, onViewGrupo }) => {
  const [grupos, setGrupos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [filterType, setFilterType] = useState("all");
  const [filterActive, setFilterActive] = useState("all");

  // Load grupos
  useEffect(() => {
    loadGrupos();
  }, []);

  const loadGrupos = async () => {
    try {
      setLoading(true);
      const response = await api.get("/api/grupos/");
      setGrupos(response.data);
    } catch (error) {
      console.error("Error loading grupos:", error);
      setError("Error al cargar los grupos");
    } finally {
      setLoading(false);
    }
  };

  // Filter grupos
  const filteredGrupos = grupos.filter(grupo => {
    // Search filter
    const matchesSearch = grupo.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         (grupo.description && grupo.description.toLowerCase().includes(searchTerm.toLowerCase()));
    
    // Type filter
    const matchesType = filterType === "all" || grupo.grupo_type === filterType;
    
    // Active filter
    const matchesActive = filterActive === "all" || 
                         (filterActive === "active" && grupo.is_active) ||
                         (filterActive === "inactive" && !grupo.is_active);
    
    return matchesSearch && matchesType && matchesActive;
  });

  // Get summary stats
  const stats = {
    total: grupos.length,
    active: grupos.filter(g => g.is_active).length,
    totalMembers: grupos.reduce((sum, g) => sum + (g.member_count || 0), 0),
    totalExpenses: grupos.reduce((sum, g) => sum + (g.total_expenses || 0), 0),
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="flex items-center gap-2 text-gray-500">
          <Loader className="w-5 h-5 animate-spin" />
          <span>Cargando grupos...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-start">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">
            Mis Grupos
          </h1>
          <p className="text-gray-600">
            Gestiona tus grupos de gastos compartidos
          </p>
        </div>
        <button
          onClick={() => onCreateNew?.()}
          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-xl shadow transition-colors flex items-center gap-2"
        >
          <Plus className="w-4 h-4" />
          + Nuevo Grupo
        </button>
      </div>

      {/* Stats */}
      {stats.total > 0 && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="bg-white p-4 rounded-lg shadow-sm border">
            <div className="text-2xl font-bold text-gray-900">{stats.total}</div>
            <div className="text-sm text-gray-600">Grupos Total</div>
          </div>
          <div className="bg-white p-4 rounded-lg shadow-sm border">
            <div className="text-2xl font-bold text-green-600">{stats.active}</div>
            <div className="text-sm text-gray-600">Activos</div>
          </div>
          <div className="bg-white p-4 rounded-lg shadow-sm border">
            <div className="text-2xl font-bold text-dodger-blue-600">{stats.totalMembers}</div>
            <div className="text-sm text-gray-600">Miembros</div>
          </div>
          <div className="bg-white p-4 rounded-lg shadow-sm border">
            <div className="text-2xl font-bold text-purple-600">$ {stats.totalExpenses.toLocaleString()}</div>
            <div className="text-sm text-gray-600">Gastos Total</div>
          </div>
        </div>
      )}

      {/* Filters */}
      <div className="bg-white p-4 rounded-lg shadow-sm border">
        <div className="flex flex-col sm:flex-row gap-4">
          {/* Search */}
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <input
                type="text"
                placeholder="Buscar grupos..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-dodger-blue-500 focus:border-dodger-blue-500"
              />
            </div>
          </div>
          
          {/* Type Filter */}
          <div className="min-w-[150px]">
            <select
              value={filterType}
              onChange={(e) => setFilterType(e.target.value)}
              className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-dodger-blue-500 focus:border-dodger-blue-500"
            >
              <option value="all">Todos los tipos</option>
              <option value="trip">Viajes</option>
              <option value="grupo">Grupos</option>
              <option value="event">Eventos</option>
              <option value="shared">Gastos Compartidos</option>
            </select>
          </div>
          
          {/* Active Filter */}
          <div className="min-w-[120px]">
            <select
              value={filterActive}
              onChange={(e) => setFilterActive(e.target.value)}
              className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-dodger-blue-500 focus:border-dodger-blue-500"
            >
              <option value="all">Todos</option>
              <option value="active">Activos</option>
              <option value="inactive">Inactivos</option>
            </select>
          </div>
        </div>
      </div>

      {/* Error State */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex items-center gap-2 text-red-700">
          <AlertCircle className="w-5 h-5" />
          <span>{error}</span>
          <button
            onClick={loadGrupos}
            className="ml-auto text-red-600 hover:text-red-800 underline"
          >
            Reintentar
          </button>
        </div>
      )}

      {/* Empty State */}
      {!loading && !error && grupos.length === 0 && (
        <div className="text-center py-12">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-gray-100 rounded-full mb-4">
            <Users className="w-8 h-8 text-gray-400" />
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            No tienes grupos aún
          </h3>
          <p className="text-gray-600 mb-6 max-w-sm mx-auto">
            Crea tu primer grupo para comenzar a compartir gastos con otros usuarios.
          </p>
          <button
            onClick={() => onCreateNew?.()}
            className="bg-dodger-blue-600 hover:bg-dodger-blue-700 text-white font-medium py-2 px-4 rounded-lg transition-colors"
          >
            Crear Primer Grupo
          </button>
        </div>
      )}

      {/* No Results */}
      {!loading && !error && grupos.length > 0 && filteredGrupos.length === 0 && (
        <div className="text-center py-8">
          <div className="inline-flex items-center justify-center w-12 h-12 bg-gray-100 rounded-full mb-3">
            <Filter className="w-6 h-6 text-gray-400" />
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            No se encontraron grupos
          </h3>
          <p className="text-gray-600">
            Intenta ajustar los filtros de búsqueda
          </p>
        </div>
      )}

      {/* Grupos Grid */}
      {filteredGrupos.length > 0 && (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {filteredGrupos.map((grupo) => (
            <GrupoCard
              key={grupo.id}
              grupo={grupo}
              onEdit={onEditGrupo}
              onView={onViewGrupo}
            />
          ))}
        </div>
      )}

      {/* Results Count */}
      {filteredGrupos.length > 0 && (
        <div className="text-center text-sm text-gray-500">
          Mostrando {filteredGrupos.length} de {grupos.length} grupos
        </div>
      )}
    </div>
  );
};

export default GrupoList;