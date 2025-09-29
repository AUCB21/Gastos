import React from "react";
import {
  Users,
  DollarSign,
  TrendingUp,
  Calendar,
  Target,
  AlertTriangle,
  CheckCircle,
  Clock,
} from "lucide-react";

const GrupoStats = ({ grupo, members = [], expenses = [], className = "" }) => {
  const totalExpenses = expenses.reduce((sum, expense) => sum + (expense.amount || 0), 0);
  const avgExpensePerMember = members.length > 0 ? totalExpenses / members.length : 0;
  const activeMembers = members.filter(member => member.is_active).length;
  const recentExpenses = expenses.filter(
    expense => new Date(expense.created_at) > new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
  ).length;

  const formatCurrency = (amount) => {
    return `${grupo?.default_currency || 'USD'} ${amount.toLocaleString()}`;
  };

  const isExpired = grupo?.end_date && new Date(grupo.end_date) < new Date();
  const isExpiringSoon = grupo?.end_date && 
    new Date(grupo.end_date) < new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) &&
    !isExpired;

  const getDaysUntilExpiry = () => {
    if (!grupo?.end_date) return null;
    const today = new Date();
    const endDate = new Date(grupo.end_date);
    const diffTime = endDate - today;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  const daysUntilExpiry = getDaysUntilExpiry();

  const statsCards = [
    {
      title: "Miembros Activos",
      value: activeMembers,
      total: members.length,
      icon: Users,
      color: "text-dodger-blue-600",
      bgColor: "bg-dodger-blue-100",
      description: `${activeMembers} de ${members.length} miembros activos`,
    },
    {
      title: "Gastos Totales",
      value: formatCurrency(totalExpenses),
      icon: DollarSign,
      color: "text-green-600",
      bgColor: "bg-green-100",
      description: `${expenses.length} transacciones registradas`,
    },
    {
      title: "Promedio por Miembro",
      value: formatCurrency(avgExpensePerMember),
      icon: TrendingUp,
      color: "text-purple-600",
      bgColor: "bg-purple-100",
      description: activeMembers > 0 ? "Distribución equitativa" : "Sin miembros activos",
    },
    {
      title: "Actividad Reciente",
      value: recentExpenses,
      icon: Clock,
      color: "text-orange-600",
      bgColor: "bg-orange-100",
      description: "Gastos en los últimos 7 días",
    },
  ];

  return (
    <div className={`space-y-4 ${className}`}>
      {/* Status Alert */}
      {(isExpired || isExpiringSoon || !grupo?.is_active) && (
        <div className="grid gap-2">
          {!grupo?.is_active && (
            <div className="bg-gray-50 border border-gray-200 rounded-lg p-3 flex items-center gap-2">
              <AlertTriangle className="w-5 h-5 text-gray-600" />
              <span className="text-gray-700 text-sm font-medium">Grupo Inactivo</span>
            </div>
          )}
          {isExpired && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-3 flex items-center gap-2">
              <AlertTriangle className="w-5 h-5 text-red-600" />
              <span className="text-red-700 text-sm font-medium">
                Grupo expirado hace {Math.abs(daysUntilExpiry)} días
              </span>
            </div>
          )}
          {isExpiringSoon && (
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3 flex items-center gap-2">
              <Clock className="w-5 h-5 text-yellow-600" />
              <span className="text-yellow-700 text-sm font-medium">
                Expira en {daysUntilExpiry} días
              </span>
            </div>
          )}
        </div>
      )}

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {statsCards.map((stat, index) => {
          const IconComponent = stat.icon;
          return (
            <div key={index} className="bg-white rounded-lg shadow-sm border p-4">
              <div className="flex items-center justify-between mb-2">
                <div className={`p-2 rounded-lg ${stat.bgColor}`}>
                  <IconComponent className={`w-5 h-5 ${stat.color}`} />
                </div>
              </div>
              <div className="space-y-1">
                <h3 className="text-sm font-medium text-gray-600">{stat.title}</h3>
                <div className="text-2xl font-bold text-gray-900">
                  {stat.value}
                  {stat.total && (
                    <span className="text-lg font-normal text-gray-500">/{stat.total}</span>
                  )}
                </div>
                <p className="text-xs text-gray-500">{stat.description}</p>
              </div>
            </div>
          );
        })}
      </div>

      {/* Additional Info */}
      {grupo && (
        <div className="bg-white rounded-lg shadow-sm border p-4">
          <h3 className="text-lg font-semibold text-gray-900 mb-3 flex items-center gap-2">
            <Target className="w-5 h-5" />
            Información del Grupo
          </h3>
          <div className="grid md:grid-cols-2 gap-4">
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <Calendar className="w-4 h-4 text-gray-400" />
                <div className="text-sm">
                  <span className="text-gray-600">Creado:</span>
                  <span className="ml-1 font-medium">
                    {new Date(grupo.created_at).toLocaleDateString("es-ES", {
                      year: "numeric",
                      month: "long",
                      day: "numeric",
                    })}
                  </span>
                </div>
              </div>
              
              {grupo.start_date && (
                <div className="flex items-center gap-2">
                  <Calendar className="w-4 h-4 text-gray-400" />
                  <div className="text-sm">
                    <span className="text-gray-600">Inicio:</span>
                    <span className="ml-1 font-medium">
                      {new Date(grupo.start_date).toLocaleDateString("es-ES", {
                        year: "numeric",
                        month: "long",
                        day: "numeric",
                      })}
                    </span>
                  </div>
                </div>
              )}
              
              {grupo.end_date && (
                <div className="flex items-center gap-2">
                  <Calendar className="w-4 h-4 text-gray-400" />
                  <div className="text-sm">
                    <span className="text-gray-600">Fin:</span>
                    <span className={`ml-1 font-medium ${
                      isExpired ? "text-red-600" : isExpiringSoon ? "text-yellow-600" : ""
                    }`}>
                      {new Date(grupo.end_date).toLocaleDateString("es-ES", {
                        year: "numeric",
                        month: "long",
                        day: "numeric",
                      })}
                      {isExpired && " (Expirado)"}
                      {isExpiringSoon && " (Por expirar)"}
                    </span>
                  </div>
                </div>
              )}
            </div>
            
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <CheckCircle className={`w-4 h-4 ${
                  grupo.is_active ? "text-green-500" : "text-gray-400"
                }`} />
                <div className="text-sm">
                  <span className="text-gray-600">Estado:</span>
                  <span className={`ml-1 font-medium ${
                    grupo.is_active ? "text-green-600" : "text-gray-500"
                  }`}>
                    {grupo.is_active ? "Activo" : "Inactivo"}
                  </span>
                </div>
              </div>
              
              <div className="flex items-center gap-2">
                <Users className="w-4 h-4 text-gray-400" />
                <div className="text-sm">
                  <span className="text-gray-600">Nuevos miembros:</span>
                  <span className={`ml-1 font-medium ${
                    grupo.allow_new_members ? "text-green-600" : "text-gray-500"
                  }`}>
                    {grupo.allow_new_members ? "Permitidos" : "Cerrado"}
                  </span>
                </div>
              </div>
              
              <div className="flex items-center gap-2">
                <DollarSign className="w-4 h-4 text-gray-400" />
                <div className="text-sm">
                  <span className="text-gray-600">Moneda:</span>
                  <span className="ml-1 font-medium">{grupo.default_currency}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default GrupoStats;