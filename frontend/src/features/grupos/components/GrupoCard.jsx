import React from "react";
import {
  Users,
  Calendar,
  DollarSign,
  Settings,
  Eye,
  Edit,
  MapPin,
  Clock,
} from "lucide-react";

const GrupoCard = ({ grupo, onEdit, onView }) => {
  const getGrupoTypeIcon = (type) => {
    switch (type) {
      case "trip":
        return <MapPin className="w-4 h-4" />;
      case "event":
        return <Calendar className="w-4 h-4" />;
      case "grupo":
        return <Users className="w-4 h-4" />;
      default:
        return <DollarSign className="w-4 h-4" />;
    }
  };

  const getGrupoTypeName = (type) => {
    const types = {
      trip: "Viaje",
      grupo: "Grupo",
      event: "Evento",
      shared: "Gastos Compartidos",
    };
    return types[type] || type;
  };

  const formatDate = (dateString) => {
    if (!dateString) return null;
    return new Date(dateString).toLocaleDateString("es-ES", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  const isExpired = grupo.end_date && new Date(grupo.end_date) < new Date();
  const isExpiringSoon = grupo.end_date && 
    new Date(grupo.end_date) < new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) &&
    !isExpired;

  return (
    <div className={`bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow duration-200 border-l-4 ${
      !grupo.is_active ? "border-gray-400 opacity-60" :
      isExpired ? "border-red-500" :
      isExpiringSoon ? "border-yellow-500" :
      "border-dodger-blue-500"
    }`}>
      <div className="p-4">
        {/* Header */}
        <div className="flex justify-between items-start mb-3">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-1">
              <div className="text-dodger-blue-600">
                {getGrupoTypeIcon(grupo.grupo_type)}
              </div>
              <h3 className="font-semibold text-gray-900 truncate">
                {grupo.name}
              </h3>
              {!grupo.is_active && (
                <span className="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded-full">
                  Inactivo
                </span>
              )}
              {isExpired && (
                <span className="px-2 py-1 bg-red-100 text-red-600 text-xs rounded-full">
                  Expirado
                </span>
              )}
              {isExpiringSoon && (
                <span className="px-2 py-1 bg-yellow-100 text-yellow-600 text-xs rounded-full">
                  Por expirar
                </span>
              )}
            </div>
            <p className="text-sm text-gray-600 mb-2">
              {getGrupoTypeName(grupo.grupo_type)}
            </p>
          </div>
          <div className="flex gap-1">
            <button
              onClick={() => onView?.(grupo)}
              className="p-1 text-gray-400 hover:text-blue-600 transition-colors"
              title="Ver detalles"
            >
              <Eye className="w-4 h-4" />
            </button>
            <button
              onClick={() => onEdit?.(grupo)}
              className="p-1 text-gray-400 hover:text-blue-600 transition-colors"
              title="Editar grupo"
            >
              <Edit className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Description */}
        {grupo.description && (
          <p className="text-sm text-gray-600 mb-3 line-clamp-2">
            {grupo.description}
          </p>
        )}

        {/* Stats */}
        <div className="grid grid-cols-3 gap-4 mb-3 text-center">
          <div>
            <div className="text-lg font-semibold text-gray-900">
              {grupo.member_count || 0}
            </div>
            <div className="text-xs text-gray-500">Miembros</div>
          </div>
          <div>
            <div className="text-lg font-semibold text-gray-900">
              {grupo.default_currency} {grupo.total_expenses?.toLocaleString() || 0}
            </div>
            <div className="text-xs text-gray-500">Gastos</div>
          </div>
          <div>
            <div className="text-lg font-semibold text-gray-900">
              {grupo.default_currency}
            </div>
            <div className="text-xs text-gray-500">Moneda</div>
          </div>
        </div>

        {/* Date Range */}
        {(grupo.start_date || grupo.end_date) && (
          <div className="flex items-center gap-2 text-xs text-gray-500 mb-2">
            <Calendar className="w-3 h-3" />
            {grupo.start_date && (
              <span>Desde {formatDate(grupo.start_date)}</span>
            )}
            {grupo.start_date && grupo.end_date && <span>•</span>}
            {grupo.end_date ? (
              <span className={isExpired ? "text-red-600 font-medium" : 
                              isExpiringSoon ? "text-yellow-600 font-medium" : ""}>
                Hasta {formatDate(grupo.end_date)}
                {isExpired && " (Expirado)"}
                {isExpiringSoon && " (Por expirar)"}
              </span>
            ) : (
              <span>Sin fecha límite</span>
            )}
          </div>
        )}

        {/* Settings */}
        <div className="flex items-center justify-between text-xs">
          <div className="flex items-center gap-3 text-gray-500">
            <div className="flex items-center gap-1">
              <Users className="w-3 h-3" />
              <span>
                {grupo.allow_new_members ? "Abierto" : "Cerrado"}
              </span>
            </div>
            <div className="flex items-center gap-1">
              <Clock className="w-3 h-3" />
              <span>
                {formatDate(grupo.created_at) || "Reciente"}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default GrupoCard;