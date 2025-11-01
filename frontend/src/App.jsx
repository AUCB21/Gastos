import React, { useEffect } from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import Login from "./shared/pages/Login";
import Register from "./shared/pages/Register";
import Home from "./shared/pages/Home";
import GastoPage from "./features/gastos/pages/Gasto";
import GastosList from "./features/gastos/pages/GastosList";
import GastoDetail from "./features/gastos/pages/GastoDetail";
import MediosPagoPage from "./features/medios-pago/pages/MediosPago";
import MediosPagoList from "./features/medios-pago/pages/MediosPagoList";
import MediosPagoDetail from "./features/medios-pago/pages/MediosPagoDetail";
import NotFound from "./shared/pages/NotFound";
import ProtectedRoute from "./shared/components/ProtectedRoute";
import DemoBanner from "./shared/components/DemoBanner";
import api from "./api";
import { REFRESH_TOKEN } from "./constants";
import "./styles/App.css";
import GruposPage from "./features/grupos/pages/GruposPage";
import CreateGrupoPage from "./features/grupos/pages/CreateGrupoPage";
import GrupoDetailPage from "./features/grupos/pages/GrupoDetailPage";
import EditGrupoPage from "./features/grupos/pages/EditGrupoPage";

const Logout = () => {
  useEffect(() => {
    const handleLogout = async () => {
      const refreshToken = localStorage.getItem(REFRESH_TOKEN);
      if (refreshToken) {
        try {
          await api.post("/api/logout/", { refresh: refreshToken });
        } catch (error) {
          console.log(
            "Logout error (this is normal if already logged out):",
            error
          );
        }
      }
      localStorage.clear();
      // Small delay to ensure cleanup is complete
      setTimeout(() => {
        window.location.href = "/login";
      }, 500);
    };

    handleLogout();
  }, []);

  return <div>Logging out...</div>;
};

const RegAndLogout = () => {
  localStorage.clear();
  return <Register />;
};

function App() {
  setInterval(() => {
    api.post("/api/cotizaciones/");
  }, 45000); // 45 seconds interval

  return (
    <>
      <BrowserRouter>
        <DemoBanner />
        <Routes>
          <Route
            path="/"
            element={
              <ProtectedRoute>
                <Home />
              </ProtectedRoute>
            }
          />
          <Route
            path="/gastos"
            element={
              <ProtectedRoute>
                <GastosList />
              </ProtectedRoute>
            }
          />
          <Route
            path="/gastos/add"
            element={
              <ProtectedRoute>
                <GastoPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/gastos/:id"
            element={
              <ProtectedRoute>
                <GastoDetail />
              </ProtectedRoute>
            }
          />
          <Route
            path="/medios-pago"
            element={
              <ProtectedRoute>
                <MediosPagoList />
              </ProtectedRoute>
            }
          />
          <Route path="/grupos" element={
            <ProtectedRoute>
              <GruposPage />
            </ProtectedRoute>
          } />
          <Route path="/grupos/create" element={
            <ProtectedRoute>
              <CreateGrupoPage />
            </ProtectedRoute>
          } />
          <Route path="/grupos/:id" element={
            <ProtectedRoute>
              <GrupoDetailPage />
            </ProtectedRoute>
          } />
          <Route path="/grupos/:id/edit" element={
            <ProtectedRoute>
              <EditGrupoPage />
            </ProtectedRoute>
          } />
          <Route
            path="/medios-pago/add"
            element={
              <ProtectedRoute>
                <MediosPagoPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/medios-pago/:id"
            element={
              <ProtectedRoute>
                <MediosPagoDetail />
              </ProtectedRoute>
            }
          />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<RegAndLogout />} />
          <Route path="/logout" element={<Logout />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </>
  );
}

export default App;
