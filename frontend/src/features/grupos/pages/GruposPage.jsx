import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import GrupoList from "../components/GrupoList";
import GrupoForm from "../components/GrupoForm";
import GrupoDetail from "../components/GrupoDetail";
import { LayoutWrapper } from "../../../shared/components/layout";
import { useUserData } from "../../../hooks/useUserData";

const GruposPage = () => {
  const [currentView, setCurrentView] = useState("list"); // list, create, edit, detail
  const [selectedGrupo, setSelectedGrupo] = useState(null);
  const [refreshTrigger, setRefreshTrigger] = useState(0);
  const { user } = useUserData();
  const navigate = useNavigate();

  const handleCreateNew = () => {
    setSelectedGrupo(null);
    setCurrentView("create");
  };

  const handleEditGrupo = (grupo) => {
    setSelectedGrupo(grupo);
    setCurrentView("edit");
  };

  const handleViewGrupo = (grupo) => {
    setSelectedGrupo(grupo);
    setCurrentView("detail");
  };

  const handleGrupoCreated = () => {
    setRefreshTrigger(prev => prev + 1);
    // Keep the success view in GrupoForm
    // setCurrentView("list");
  };

  const handleGrupoUpdated = (grupo) => {
    setRefreshTrigger(prev => prev + 1);
    setCurrentView("detail");
    setSelectedGrupo(grupo);
  };

  const handleBackToList = () => {
    setSelectedGrupo(null);
    setCurrentView("list");
    setRefreshTrigger(prev => prev + 1);
  };

  const handleLogout = () => {
    navigate("/logout");
  };

  const renderCurrentView = () => {
    switch (currentView) {
      case "create":
        return (
          <div className="max-w-2xl mx-auto">
            <div className="bg-white rounded-xl shadow-lg p-6">
              <GrupoForm
                onGrupoCreated={handleGrupoCreated}
              />
            </div>
          </div>
        );
      
      case "edit":
        return (
          <div className="max-w-2xl mx-auto">
            <div className="bg-white rounded-xl shadow-lg p-6">
              <GrupoForm
                initialData={selectedGrupo}
                onGrupoCreated={handleGrupoUpdated}
              />
            </div>
          </div>
        );
      
      case "detail":
        return (
          <GrupoDetail
            grupoId={selectedGrupo?.id}
            onBack={handleBackToList}
            onEdit={handleEditGrupo}
          />
        );
      
      default:
        return (
          <GrupoList
            key={refreshTrigger} // Force refresh
            onCreateNew={handleCreateNew}
            onEditGrupo={handleEditGrupo}
            onViewGrupo={handleViewGrupo}
          />
        );
    }
  };

  return (
    <LayoutWrapper 
      user={user} 
      onLogout={handleLogout} 
      pageType="grupos"
      pageTitle={currentView === "list" ? "Grupos" : currentView === "create" ? "Crear Grupo" : currentView === "edit" ? "Editar Grupo" : "Detalle del Grupo"}
    >
      {renderCurrentView()}
    </LayoutWrapper>
  );
};

export default GruposPage;