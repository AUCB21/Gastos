import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Loader, AlertCircle } from "lucide-react";
import api from "@/api";
import { getButtonClass } from "@/utils/colorSystem";
import GrupoForm from "../components/GrupoForm";
import { LayoutWrapper } from "@/shared/components/layout";
import { useUserData } from "@/hooks/useUserData";

const EditGrupoPage = () => {
  const { id } = useParams();
  const { user } = useUserData();
  const navigate = useNavigate();
  const [grupo, setGrupo] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    if (id) {
      loadGrupo();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  const loadGrupo = async () => {
    try {
      const response = await api.get(`/api/grupos/${id}/`);
      setGrupo(response.data);
    } catch (error) {
      console.error("Error loading grupo:", error);
      setError("Error al cargar el grupo");
    } finally {
      setLoading(false);
    }
  };

  const handleGrupoUpdated = (updatedGrupo) => {
    // Navigate to the grupo detail page after successful update
    navigate(`/grupos/${updatedGrupo.id}`);
  };

  const handleLogout = () => {
    navigate("/logout");
  };

  const renderContent = () => {
    if (loading) {
      return (
        <div className="flex items-center justify-center h-64">
          <div className="flex items-center gap-2 text-gray-500">
            <Loader className="w-5 h-5 animate-spin" />
            <span>Cargando grupo...</span>
          </div>
        </div>
      );
    }

    if (error || !grupo) {
      return (
        <div className="text-center py-12">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-red-100 rounded-full mb-4">
            <AlertCircle className="w-8 h-8 text-red-600" />
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            Error al cargar el grupo
          </h3>
          <p className="text-gray-600 mb-6">
            {error || "Grupo no encontrado"}
          </p>
          <button
            onClick={() => navigate('/grupos')}
            className={getButtonClass('primary', 'regular')}
          >
            Volver a Grupos
          </button>
        </div>
      );
    }

    return (
      <div className="max-w-2xl mx-auto">
        <div className="bg-white rounded-xl shadow-lg p-6">
          <GrupoForm 
            initialData={grupo}
            onGrupoCreated={handleGrupoUpdated}
          />
        </div>
      </div>
    );
  };

  return (
    <LayoutWrapper 
      user={user} 
      onLogout={handleLogout} 
      showSidebar={false}
      pageTitle={`Editar Grupo${grupo ? ` - ${grupo.name}` : ''}`}
    >
      {renderContent()}
    </LayoutWrapper>
  );
};

export default EditGrupoPage;