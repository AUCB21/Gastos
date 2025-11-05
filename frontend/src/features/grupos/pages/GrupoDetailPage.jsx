import React from "react";
import { useParams, useNavigate } from "react-router-dom";
import GrupoDetail from "../components/GrupoDetail";
import { LayoutWrapper } from "../../../shared/components/layout";
import { useUserData } from "../../../hooks/useUserData";

const GrupoDetailPage = () => {
  const { id } = useParams();
  const { user } = useUserData();
  const navigate = useNavigate();

  const handleBack = () => {
    navigate('/grupos');
  };

  const handleEdit = (grupo) => {
    navigate(`/grupos/${grupo.id}/edit`);
  };

  const handleLogout = () => {
    navigate("/logout");
  };

  return (
    <LayoutWrapper 
      user={user} 
      onLogout={handleLogout} 
      showSidebar={false}
      pageTitle={`Detalle del Grupo`}
    >
      <GrupoDetail
        grupoId={parseInt(id)}
        onBack={handleBack}
        onEdit={handleEdit}
      />
    </LayoutWrapper>
  );
};

export default GrupoDetailPage;