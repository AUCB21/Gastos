import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import api from "../../api"; 
import { ACCESS_TOKEN } from "../../constants";
import LayoutWrapper from "../components/wrappers/LayoutWrapper";
import { useUserData } from "../../hooks/useUserData";
import delayedNavigate from "../../hooks/delayedNavigate";
import { formatLocalDate } from "../../utils/dateUtils";
import { getButtonClass, getCardClass, getTextClass, colors } from "../../utils/colorSystem";

const Home = () => {
  const [stats, setStats] = useState({
    totalGastos: 0,
    totalMediosPago: 0,
    gastosRecientes: []
  });
  const { user } = useUserData();
  const navigate = useNavigate();

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      const [gastosResponse, mediosPagoResponse] = await Promise.all([
        api.get("/api/gastos/"),
        api.get("/api/medios-pago/")
      ]);

      const gastos = gastosResponse.data;
      const mediosPago = mediosPagoResponse.data;

      // Get recent gastos (last 5)
      const gastosRecientes = gastos
        .sort((a, b) => new Date(b.fecha_gasto) - new Date(a.fecha_gasto))
        .slice(0, 5);

      setStats({
        totalGastos: gastos.length,
        totalMediosPago: mediosPago.length,
        gastosRecientes
      });
    } catch (error) {
      console.error("Error loading dashboard data:", error);
    }
  };

  const handleLogout = () => {
    navigate("/logout");
  };

  return (
    <LayoutWrapper user={user} onLogout={handleLogout} pageType="home">
      <div className="space-y-10">
        {/* Welcome Section */}
        <div className="text-center">
          <h1 className={`text-4xl font-bold ${colors.text} mb-4`}>
            Bienvenido {user ? `${user.username}.` : "a tu Dashboard"}
          </h1>
          <p className={`text-xl ${getTextClass('muted')}`}>
            Gestiona tus gastos y medios de pago de manera eficiente.
          </p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div 
            className={`${getCardClass('default')} shadow-lg hover:cursor-pointer`}
            onClick={() => delayedNavigate(navigate, "/gastos", 200)}
            >
            <div className="flex items-center justify-between">
              <div>
                <h3 className={`text-lg font-semibold ${colors.text}`}>Tus Gastos</h3>
                <p className={`text-3xl font-bold ${colors.primary.text}`}>{stats.totalGastos}</p>
              </div>
              <div className={`${colors.primary.bgLight} p-3 rounded-full`}>
                <svg className={`w-8 h-8 ${colors.primary.text}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z"></path>
                </svg>
              </div>
            </div>
          </div>

          <div 
            className={`${getCardClass('default')} shadow-lg hover:cursor-pointer`}
            onClick={() => delayedNavigate(navigate, "/medios-pago", 200)}
            >
            <div className="flex items-center justify-between">
              <div>
                <h3 className={`text-lg font-semibold ${colors.text}`}>Tus Medios de Pago</h3>
                <p className={`text-3xl font-bold ${colors.success.text}`}>{stats.totalMediosPago}</p>
              </div>
              <div className={`${colors.success.bgLight} p-3 rounded-full`}>
                <svg className={`w-8 h-8 ${colors.success.text}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z"></path>
                </svg>
              </div>
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className={`${getCardClass('default')} shadow-lg`}>
          <h2 className={`text-2xl font-bold ${colors.text} mb-6`}>Acciones Rápidas</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <button
              onClick={() => delayedNavigate(navigate, "/gastos/add", 500)}
              className={`${getButtonClass('formPrimary', 'form')} space-x-2`}
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6"></path>
              </svg>
              <span>Crear Gasto</span>
            </button>
            
            <button
              onClick={() => delayedNavigate(navigate, "/gastos", 500)}
              className={`${getButtonClass('primary')} space-x-2`}
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 10h16M4 14h16M4 18h16"></path>
              </svg>
              <span>Ver Gastos</span>
            </button>
            
            <button
              onClick={() => delayedNavigate(navigate, "/medios-pago/add", 500)}
              className="bg-gradient-to-r from-emerald-600 to-emerald-700 hover:from-emerald-700 hover:to-emerald-800 text-white font-medium px-6 py-3 rounded-lg shadow-md transition-all duration-200 transform hover:scale-105 flex items-center justify-center space-x-2"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6"></path>
              </svg>
              <span>Agregar Medio de Pago</span>
            </button>
            
            <button
              onClick={() => delayedNavigate(navigate, "/medios-pago", 500)}
              className={`${getButtonClass('success')} space-x-2`}
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z"></path>
              </svg>
              <span>Ver Medios de Pago</span>
            </button>
          </div>
        </div>

        {/* Recent Gastos */}
        {stats.gastosRecientes.length > 0 && (
          <div className={getCardClass('default')}>
            <h2 className={`text-2xl font-bold ${colors.text} mb-6`}>Gastos Recientes</h2>
            <div className="space-y-3">
              {stats.gastosRecientes.map((gasto) => (
                <div key={gasto.id} className={`flex items-center justify-between p-3 ${colors.neutral.bg} rounded-lg`}>
                  <div className="flex-1">
                    <p className={`font-semibold ${colors.text}`}>
                      ${gasto.monto} {gasto.moneda} - {gasto.vendedor}
                    </p>
                    <p className={`text-sm ${getTextClass('light')}`}>
                      {formatLocalDate(gasto.fecha_gasto)} • {gasto.categoria?.name || gasto.categoria}
                    </p>
                  </div>
                </div>
              ))}
            </div>
            <div className="mt-4 text-center">
              <button
                onClick={() => delayedNavigate(navigate, "/gastos", 500)}
                className={`${colors.primary.text} hover:${colors.primary.textDark} font-medium`}
              >
                Ver todos los gastos →
              </button>
            </div>
          </div>
        )}
      </div>
    </LayoutWrapper>
  );
};

export default Home;