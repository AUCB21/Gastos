import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import api from "../api"; 
import { ACCESS_TOKEN } from "../constants";
import NavBar from "../components/NavBar";
import { useUserData } from "../hooks/useUserData";

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
        api.get("/api/medios_pago/")
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
    <>
      {/* Navigation Bar */}
      <NavBar user={user} logout={handleLogout} />
      
      {/* Main Content */}
      <div className="bg-gray-100 min-h-screen py-10 font-sans">
        <div className="container mx-auto px-4">
          {/* Welcome Section */}
          <div className="text-center mb-10">
            <h1 className="text-4xl font-bold text-gray-800 mb-4">
              Bienvenido {user ? `${user.username}.` : "a tu Dashboard"}
            </h1>
            <p className="text-xl text-gray-600">
              Gestiona tus gastos y medios de pago de manera eficiente.
            </p>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-10">
            <div className="bg-white p-6 rounded-xl shadow-lg">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-semibold text-gray-700">Tus Gastos</h3>
                  <p className="text-3xl font-bold text-blue-600">{stats.totalGastos}</p>
                </div>
                <div className="bg-blue-100 p-3 rounded-full">
                  <svg className="w-8 h-8 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z"></path>
                  </svg>
                </div>
              </div>
            </div>

            <div className="bg-white p-6 rounded-xl shadow-lg">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-semibold text-gray-700">Tus Medios de Pago</h3>
                  <p className="text-3xl font-bold text-green-600">{stats.totalMediosPago}</p>
                </div>
                <div className="bg-green-100 p-3 rounded-full">
                  <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z"></path>
                  </svg>
                </div>
              </div>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="bg-white p-6 rounded-xl shadow-lg mb-10">
            <h2 className="text-2xl font-bold text-gray-800 mb-6">Acciones Rápidas</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <button
                onClick={() => navigate("/gastos")}
                className="bg-blue-500 text-white p-4 rounded-lg hover:bg-blue-600 transition duration-200 flex items-center justify-center space-x-2"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6"></path>
                </svg>
                <span>Crear Gasto</span>
              </button>
              
              <button
                onClick={() => navigate("/gastos/list")}
                className="bg-blue-600 text-white p-4 rounded-lg hover:bg-blue-700 transition duration-200 flex items-center justify-center space-x-2"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 10h16M4 14h16M4 18h16"></path>
                </svg>
                <span>Ver Gastos</span>
              </button>
              
              <button
                onClick={() => navigate("/medios-pago")}
                className="bg-green-500 text-white p-4 rounded-lg hover:bg-green-600 transition duration-200 flex items-center justify-center space-x-2"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6"></path>
                </svg>
                <span>Crear Medio de Pago</span>
              </button>

              <button
                onClick={() => navigate("/medios-pago/list")}
                className="bg-green-600 text-white p-4 rounded-lg hover:bg-green-700 transition duration-200 flex items-center justify-center space-x-2"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 10h16M4 14h16M4 18h16"></path>
                </svg>
                <span>Ver Medios de Pago</span>
              </button>
            </div>
          </div>

          {/* Recent Gastos */}
          {stats.gastosRecientes.length > 0 && (
            <div className="bg-white p-6 rounded-xl shadow-lg">
              <h2 className="text-2xl font-bold text-gray-800 mb-6">Gastos Recientes</h2>
              <div className="space-y-3">
                {stats.gastosRecientes.map((gasto) => (
                  <div key={gasto.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div className="flex-1">
                      <p className="font-semibold text-gray-700">
                        ${gasto.monto} {gasto.moneda} - {gasto.vendedor}
                      </p>
                      <p className="text-sm text-gray-500">
                        {new Date(gasto.fecha_gasto).toLocaleDateString("es-AR")}
                      </p>
                    </div>
                    <span className="text-sm text-gray-500">
                      {gasto.pagos_realizados}/{gasto.pagos_totales}
                    </span>
                  </div>
                ))}
              </div>
              <div className="mt-4 text-center">
                <button
                  onClick={() => navigate("/gastos")}
                  className="text-blue-600 hover:text-blue-800 font-medium"
                >
                  Ver todos los gastos →
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  );
};

export default Home;
