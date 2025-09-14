import React, { useEffect } from 'react'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import Login from "./pages/Login"
import Register from "./pages/Register"
import Home from "./pages/Home"
import GastoPage from "./pages/Gasto"
import GastosList from "./pages/GastosList"
import MediosPagoPage from "./pages/MediosPago"
import MediosPagoList from "./pages/MediosPagoList"
import NotFound from "./pages/NotFound"
import ProtectedRoute from './components/ProtectedRoute'
import api from './api'
import { REFRESH_TOKEN } from './constants'
import './styles/App.css'


const Logout = () => {
  useEffect(() => {
    const handleLogout = async () => {
      const refreshToken = localStorage.getItem(REFRESH_TOKEN);
      if (refreshToken) {
        try {
          await api.post('/api/logout/', { refresh: refreshToken });
        } catch (error) {
          console.log('Logout error (this is normal if already logged out):', error);
        }
      }
      localStorage.clear();
      // Small delay to ensure cleanup is complete
      setTimeout(() => {
        window.location.href = '/login';
      }, 500);
    };
    
    handleLogout();
  }, []);
  
  return <div>Logging out...</div>;
}

const RegAndLogout = () => {
  localStorage.clear();
  return <Register />;
}

function App() {
  return (
    <>
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<ProtectedRoute><Home /></ProtectedRoute>} />
            <Route path="/gastos" element={<ProtectedRoute><GastosList /></ProtectedRoute>} />
            <Route path="/gastos/add" element={<ProtectedRoute><GastoPage /></ProtectedRoute>} />
            <Route path="/medios-pago" element={<ProtectedRoute><MediosPagoList /></ProtectedRoute>} />
            <Route path="/medios-pago/add" element={<ProtectedRoute><MediosPagoPage /></ProtectedRoute>} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<RegAndLogout />} />
            <Route path="/logout" element={<Logout />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        
        </BrowserRouter>
    </>
  )
}

export default App;
