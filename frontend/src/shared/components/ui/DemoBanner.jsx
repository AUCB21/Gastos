import React from 'react';
import { Eye, X } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const DemoBanner = () => {
  const navigate = useNavigate();
  const isDemoMode = localStorage.getItem('demo_mode') === 'true';

  if (!isDemoMode) return null;

  const handleExitDemo = () => {
    localStorage.removeItem('demo_mode');
    localStorage.removeItem('access');
    localStorage.removeItem('refresh');
    navigate('/login');
  };

  return (
    <div className="bg-gradient-to-r from-orange-500 to-red-500 text-white px-4 py-2 text-center relative">
      <div className="flex items-center justify-center gap-2">
        <Eye className="w-4 h-4" />
        <span className="font-medium">
          🎯 Modo Demostración - Los datos mostrados son de ejemplo
        </span>
        <span className="hidden md:inline">
          • Regístrate para acceder a todas las funcionalidades
        </span>
      </div>
      <button
        onClick={handleExitDemo}
        className="absolute right-4 top-1/2 transform -translate-y-1/2 hover:bg-white/20 rounded-full p-1 transition-colors"
        title="Salir del modo demo"
      >
        <X className="w-4 h-4" />
      </button>
    </div>
  );
};

export default DemoBanner;