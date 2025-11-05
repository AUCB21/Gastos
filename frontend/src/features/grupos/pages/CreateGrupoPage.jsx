import React from "react";
import { useNavigate } from "react-router-dom";
import GrupoForm from "../components/GrupoForm";
import { LayoutWrapper } from "../../../shared/components/layout";
import { useUserData } from "../../../hooks/useUserData";

const CreateGrupoPage = () => {
  const { user } = useUserData();
  const navigate = useNavigate();

  const handleGrupoCreated = () => {
    // GrupoForm handles the success state, user can navigate from there
  };

  const handleLogout = () => {
    navigate("/logout");
  };

  return (
    <LayoutWrapper 
      user={user} 
      onLogout={handleLogout} 
      showSidebar={false}
      pageTitle="Crear Grupo"
    >
      <div className="max-w-2xl mx-auto">
        {/* Create Grupo Form */}
        <div className="bg-white rounded-xl shadow-lg p-6">
          <GrupoForm onGrupoCreated={handleGrupoCreated} />
        </div>
      </div>
    </LayoutWrapper>
  );
};

export default CreateGrupoPage;