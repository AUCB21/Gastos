import React, { useState, useEffect } from "react";
import api from "../api";
import {
  Users,
  UserPlus,
  Mail,
  Settings,
  MoreVertical,
  Shield,
  ShieldCheck,
  Eye,
  Crown,
  AlertCircle,
  Loader,
  UserMinus,
  CheckCircle,
  XCircle,
} from "lucide-react";

const GroupMembersList = ({ grupoId, isOwner = false, className = "" }) => {
  const [members, setMembers] = useState([]);
  const [invitations, setInvitations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [showInviteForm, setShowInviteForm] = useState(false);
  const [inviteEmail, setInviteEmail] = useState("");
  const [inviteLoading, setInviteLoading] = useState(false);
  const [actionMenuOpen, setActionMenuOpen] = useState(null);

  useEffect(() => {
    if (grupoId) {
      loadMembers();
      loadInvitations();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [grupoId]);

  const loadMembers = async () => {
    try {
      const response = await api.get(`/api/grupo-memberships/?grupo_id=${grupoId}`);
      setMembers(response.data);
    } catch (error) {
      console.error("Error loading members:", error);
      setError("Error al cargar los miembros");
    }
  };

  const loadInvitations = async () => {
    try {
      const response = await api.get(`/api/grupo-invitations/?grupo_id=${grupoId}`);
      setInvitations(response.data.filter(inv => !inv.is_used && new Date(inv.expires_at) > new Date()));
    } catch (error) {
      console.error("Error loading invitations:", error);
    } finally {
      setLoading(false);
    }
  };

  const sendInvite = async () => {
    if (!inviteEmail.trim()) return;
    
    setInviteLoading(true);
    try {
      const invitationData = {
        grupo: grupoId,
        email: inviteEmail.trim(),
        expires_at: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
      };
      
      await api.post("/api/grupo-invitations/", invitationData);
      setInviteEmail("");
      setShowInviteForm(false);
      loadInvitations(); // Refresh invitations
      alert(`Invitación enviada a ${inviteEmail}`);
    } catch (error) {
      console.error("Error sending invite:", error);
      alert("Error al enviar la invitación");
    } finally {
      setInviteLoading(false);
    }
  };

  const changeRole = async (memberId, newRole) => {
    try {
      await api.patch(`/api/grupo-memberships/${memberId}/`, { role: newRole });
      loadMembers(); // Refresh members
      setActionMenuOpen(null);
    } catch (error) {
      console.error("Error changing role:", error);
      alert("Error al cambiar el rol");
    }
  };

  const removeMember = async (memberId) => {
    if (!confirm("¿Estás seguro de que quieres remover este miembro?")) return;
    
    try {
      await api.delete(`/api/grupo-memberships/${memberId}/`);
      loadMembers(); // Refresh members
      setActionMenuOpen(null);
    } catch (error) {
      console.error("Error removing member:", error);
      alert("Error al remover el miembro");
    }
  };

  const cancelInvitation = async (invitationId) => {
    try {
      await api.delete(`/api/grupo-invitations/${invitationId}/`);
      loadInvitations(); // Refresh invitations
    } catch (error) {
      console.error("Error canceling invitation:", error);
      alert("Error al cancelar la invitación");
    }
  };

  const getRoleIcon = (role) => {
    switch (role) {
      case "owner":
        return <Crown className="w-4 h-4 text-yellow-600" />;
      case "admin":
        return <ShieldCheck className="w-4 h-4 text-purple-600" />;
      case "member":
        return <Shield className="w-4 h-4 text-blue-600" />;
      case "viewer":
        return <Eye className="w-4 h-4 text-gray-600" />;
      default:
        return <Users className="w-4 h-4 text-gray-400" />;
    }
  };

  const getRoleName = (role) => {
    const roles = {
      owner: "Propietario",
      admin: "Administrador",
      member: "Miembro",
      viewer: "Solo Vista",
    };
    return roles[role] || role;
  };

  const canManageMember = (member) => {
    return isOwner && member.role !== "owner";
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString("es-ES", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  if (loading) {
    return (
      <div className={`bg-white rounded-lg shadow-sm border p-6 ${className}`}>
        <div className="flex items-center justify-center h-32">
          <div className="flex items-center gap-2 text-gray-500">
            <Loader className="w-5 h-5 animate-spin" />
            <span>Cargando miembros...</span>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className={`bg-white rounded-lg shadow-sm border p-6 ${className}`}>
        <div className="text-center py-8">
          <AlertCircle className="w-12 h-12 text-red-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">Error</h3>
          <p className="text-gray-600">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className={`bg-white rounded-lg shadow-sm border ${className}`}>
      {/* Header */}
      <div className="p-4 border-b border-gray-200 flex items-center justify-between">
        <h2 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
          <Users className="w-5 h-5" />
          Miembros ({members.length})
        </h2>
        {isOwner && (
          <button
            onClick={() => setShowInviteForm(!showInviteForm)}
            className="flex items-center gap-2 px-3 py-1 text-dodger-blue-600 hover:bg-dodger-blue-50 rounded-lg transition-colors"
          >
            <UserPlus className="w-4 h-4" />
            Invitar
          </button>
        )}
      </div>
      
      {/* Invite Form */}
      {showInviteForm && (
        <div className="p-4 bg-gray-50 border-b border-gray-200">
          <div className="flex gap-2">
            <input
              type="email"
              placeholder="Email del nuevo miembro"
              value={inviteEmail}
              onChange={(e) => setInviteEmail(e.target.value)}
              onKeyPress={(e) => e.key === "Enter" && sendInvite()}
              className="flex-1 px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-dodger-blue-500 focus:border-dodger-blue-500"
            />
            <button
              onClick={sendInvite}
              disabled={inviteLoading || !inviteEmail.trim()}
              className="px-4 py-2 bg-dodger-blue-600 text-white rounded-lg hover:bg-dodger-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {inviteLoading ? "Enviando..." : "Enviar"}
            </button>
            <button
              onClick={() => setShowInviteForm(false)}
              className="px-3 py-2 text-gray-600 hover:text-gray-800 transition-colors"
            >
              Cancelar
            </button>
          </div>
        </div>
      )}
      
      {/* Pending Invitations */}
      {invitations.length > 0 && (
        <div className="p-4 bg-yellow-50 border-b border-gray-200">
          <h3 className="text-sm font-medium text-yellow-800 mb-2 flex items-center gap-2">
            <Mail className="w-4 h-4" />
            Invitaciones Pendientes ({invitations.length})
          </h3>
          <div className="space-y-2">
            {invitations.map((invitation) => (
              <div key={invitation.id} className="flex items-center justify-between bg-white p-2 rounded border">
                <div className="text-sm">
                  <span className="font-medium">{invitation.email}</span>
                  <span className="text-gray-500 ml-2">
                    Expira: {formatDate(invitation.expires_at)}
                  </span>
                </div>
                {isOwner && (
                  <button
                    onClick={() => cancelInvitation(invitation.id)}
                    className="text-red-600 hover:text-red-800 p-1"
                    title="Cancelar invitación"
                  >
                    <XCircle className="w-4 h-4" />
                  </button>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
      
      {/* Members List */}
      <div className="divide-y divide-gray-200">
        {members.length === 0 ? (
          <div className="p-8 text-center text-gray-500">
            <Users className="w-12 h-12 text-gray-300 mx-auto mb-2" />
            <p>No hay miembros en este grupo</p>
          </div>
        ) : (
          members.map((member) => (
            <div key={member.id} className="p-4 flex items-center justify-between hover:bg-gray-50">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-dodger-blue-100 rounded-full flex items-center justify-center">
                  <Users className="w-5 h-5 text-dodger-blue-600" />
                </div>
                <div>
                  <div className="font-medium text-gray-900">
                    {member.user_info?.username || "Usuario"}
                    {member.user_info?.first_name && (
                      <span className="text-gray-600 ml-1">
                        ({member.user_info.first_name} {member.user_info.last_name})
                      </span>
                    )}
                  </div>
                  <div className="text-sm text-gray-600">
                    {member.user_info?.email || "Sin email"}
                  </div>
                  <div className="text-xs text-gray-500">
                    Unió: {formatDate(member.joined_at)}
                  </div>
                </div>
              </div>
              
              <div className="flex items-center gap-3">
                <div className="text-right">
                  <div className="flex items-center gap-2">
                    {getRoleIcon(member.role)}
                    <span className="text-sm font-medium text-gray-900">
                      {getRoleName(member.role)}
                    </span>
                  </div>
                  <div className="flex items-center gap-1 text-xs">
                    {member.is_active ? (
                      <>
                        <CheckCircle className="w-3 h-3 text-green-500" />
                        <span className="text-green-600">Activo</span>
                      </>
                    ) : (
                      <>
                        <XCircle className="w-3 h-3 text-gray-400" />
                        <span className="text-gray-500">Inactivo</span>
                      </>
                    )}
                  </div>
                </div>
                
                {/* Member Actions */}
                {canManageMember(member) && (
                  <div className="relative">
                    <button
                      onClick={() => setActionMenuOpen(
                        actionMenuOpen === member.id ? null : member.id
                      )}
                      className="p-1 text-gray-400 hover:text-gray-600 transition-colors"
                    >
                      <MoreVertical className="w-4 h-4" />
                    </button>
                    
                    {actionMenuOpen === member.id && (
                      <div className="absolute right-0 mt-1 w-48 bg-white rounded-lg shadow-lg border py-1 z-10">
                        <button
                          onClick={() => changeRole(member.id, "admin")}
                          disabled={member.role === "admin"}
                          className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          <ShieldCheck className="w-4 h-4 inline mr-2" />
                          Hacer Administrador
                        </button>
                        <button
                          onClick={() => changeRole(member.id, "member")}
                          disabled={member.role === "member"}
                          className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          <Shield className="w-4 h-4 inline mr-2" />
                          Hacer Miembro
                        </button>
                        <button
                          onClick={() => changeRole(member.id, "viewer")}
                          disabled={member.role === "viewer"}
                          className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          <Eye className="w-4 h-4 inline mr-2" />
                          Solo Vista
                        </button>
                        <hr className="my-1" />
                        <button
                          onClick={() => removeMember(member.id)}
                          className="w-full px-4 py-2 text-left text-sm text-red-600 hover:bg-red-50"
                        >
                          <UserMinus className="w-4 h-4 inline mr-2" />
                          Remover del Grupo
                        </button>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default GroupMembersList;