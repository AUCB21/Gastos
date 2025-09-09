import React from 'react'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import Login from "./pages/Login"
import Register from "./pages/Register"
import Home from "./pages/Home"
import NotFound from "./pages/NotFound"
import ProtectedRoute from './components/ProtectedRoute'
import api from './api'
import { REFRESH_TOKEN } from './constants'
import './styles/App.css'


const Logout = () => {
  const handleLogout = async () => {
    const refreshToken = localStorage.getItem(REFRESH_TOKEN);
    if (refreshToken) {
      try {
        await api.post('/api/logout/', { refresh: refreshToken });
      } catch (error) {
        console.log('Logout error:', error);
      }
    }
    localStorage.clear();
  };
  
  handleLogout();
  return <Navigate to="/login" />;
}

const RegAndLogout = () => {
  localStorage.clear();
  return <Register />;
}

function App() {
  // setTimeout(()=> {
  //   localStorage.clear();
  //   redirect("/login");
  // }, 3600000);
  return (
    <>
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<ProtectedRoute><Home /></ProtectedRoute>} />
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
