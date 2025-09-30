import React, { useState, useEffect } from "react";
import api from "../../../api";
import { getButtonClass, getCardClass, getTextClass, getStatusClass, colors } from "../../../utils/colorSystem";
import {
  Users,
  Calendar,
  DollarSign,
  Settings,
  Edit,
  Share,
  Copy,
  CheckCircle,
  UserPlus,
  MapPin,
  Clock,
  Loader,
  AlertCircle,
  ArrowLeft,
} from "lucide-react";

const GrupoDetail = ({ grupoId, onBack, onEdit }) => {
  const [grupo, setGrupo] = useState(null);
  const [members, setMembers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [inviteLink, setInviteLink] = useState("");
  const [copySuccess, setCopySuccess] = useState(false);
  const [showInviteForm, setShowInviteForm] = useState(false);
  const [inviteEmail, setInviteEmail] = useState("");
  const [inviteLoading, setInviteLoading] = useState(false);

  useEffect(() => {
    if (grupoId) {
      loadGrupoDetail();
      loadMembers();
      // Don't auto-generate invite link to avoid 400 errors
      // generateInviteLink();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [grupoId]);

  const loadGrupoDetail = async () => {
    try {
      const response = await api.get(`/api/grupos/${grupoId}/`);
      setGrupo(response.data);
    } catch (error) {
      console.error("Error loading grupo:", error);
      setError("Error al cargar el grupo");
    } finally {
      setLoading(false);
    }
  };

  const loadMembers = async () => {
    try {
      const response = await api.get(`/api/grupo-memberships/?grupo_id=${grupoId}`);
      setMembers(response.data);
    } catch (error) {
      console.error("Error loading members:", error);
    }
  };

  const generateInviteLink = async () => {
    try {
      const invitationData = {
        grupo: grupoId,
        email: "placeholder@example.com",
        expires_at: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
      };
      
      const response = await api.post("/api/grupo-invitations/", invitationData);
      const token = response.data.invitation_token;
      const baseUrl = window.location.origin;
      setInviteLink(`${baseUrl}/join-grupo/${token}`);
    } catch (error) {
      console.error("Error generating invite link:", error);
      // Don't set error state, just log it - invite links are optional
    }
  };

  const copyInviteLink = async () => {
    try {
      await navigator.clipboard.writeText(inviteLink);
      setCopySuccess(true);
      setTimeout(() => setCopySuccess(false), 2000);
    } catch (error) {
      console.error("Error copying link:", error);
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
      alert(`Invitación enviada a ${inviteEmail}`);
    } catch (error) {
      console.error("Error sending invite:", error);
      alert("Error al enviar la invitación");
    } finally {
      setInviteLoading(false);
    }
  };

  const getGrupoTypeIcon = (type) => {
    switch (type) {
      case "trip":
        return <MapPin className="w-5 h-5" />;
      case "event":
        return <Calendar className="w-5 h-5" />;
      case "grupo":
        return <Users className="w-5 h-5" />;
      default:
        return <DollarSign className="w-5 h-5" />;
    }
  };

  const getGrupoTypeName = (type) => {
    const types = {
      trip: "Viaje",
      grupo: "Grupo",
      event: "Evento",
      shared: "Gastos Compartidos",
    };
    return types[type] || type;
  };

  const formatDate = (dateString) => {
    if (!dateString) return null;
    return new Date(dateString).toLocaleDateString("es-ES", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
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

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className={`flex items-center gap-2 ${getTextClass('light')}`}>
          <Loader className="w-5 h-5 animate-spin" />
          <span>Cargando grupo...</span>
        </div>
      </div>
    );
  }

  if (error || !grupo) {
    return (
      <div className="text-center py-12">
        <div className={`inline-flex items-center justify-center w-16 h-16 ${colors.alert.bgLight} rounded-full mb-4`}>
          <AlertCircle className={`w-8 h-8 ${colors.alert.textDark}`} />
        </div>
        <h3 className={`text-lg font-medium ${colors.text} mb-2`}>
          Error al cargar el grupo
        </h3>
        <p className={`${colors.textMuted} mb-6`}>
          {error || "Grupo no encontrado"}
        </p>
        <button
          onClick={onBack}
          className={getButtonClass('primary')}
        >
          Volver
        </button>
      </div>
    );
  }

  const isExpired = grupo.end_date && new Date(grupo.end_date) < new Date();
  const isExpiringSoon = grupo.end_date && 
    new Date(grupo.end_date) < new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) &&
    !isExpired;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <button
            onClick={onBack}
            className={`p-2 ${colors.textLight} hover:${getTextClass('default')} transition-colors`}
            title="Volver"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <h1 className={`text-2xl font-bold ${colors.text}`}>{grupo.name}</h1>
            <p className={getTextClass('muted')}>{getGrupoTypeName(grupo.grupo_type)}</p>
          </div>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => onEdit?.(grupo)}
            className={getButtonClass('secondary')}
          >
            <Edit className="w-4 h-4" />
            Editar
          </button>
        </div>
      </div>

      {/* Status Alerts */}
      {!grupo.is_active && (
        <div className={getCardClass('info')}>
          <AlertCircle className="w-5 h-5" />
          <span>Este grupo está inactivo</span>
        </div>
      )}
      {isExpired && (
        <div className={`flex items-center ${getStatusClass('expirado')}`}>
          <AlertCircle className="w-5 h-5" />
          <span>Este grupo ha expirado el {formatDate(grupo.end_date)}</span>
        </div>
      )}
      {isExpiringSoon && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 flex items-center gap-2 text-yellow-700">
          <AlertCircle className="w-5 h-5" />
          <span>Este grupo expira el {formatDate(grupo.end_date)}</span>
        </div>
      )}

      {/* Main Info */}
      <div className={`${getCardClass('default')} shadow-md`}>
        <div className="grid md:grid-cols-2 gap-6">
          {/* Left Column */}
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <div className={colors.primary.text}>
                {getGrupoTypeIcon(grupo.grupo_type)}
              </div>
              <div>
                <h3 className={`font-medium ${colors.text}`}>Tipo de Grupo</h3>
                <p className={getTextClass('muted')}>{getGrupoTypeName(grupo.grupo_type)}</p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <DollarSign className={`w-5 h-5 ${colors.success.text}`} />
              <div>
                <h3 className={`font-medium ${colors.text}`}>Moneda</h3>
                <p className={getTextClass('muted')}>{grupo.default_currency}</p>
              </div>
            </div>

            {grupo.description && (
              <div>
                <h3 className={`font-medium ${colors.text} mb-1`}>Descripción</h3>
                <p className={getTextClass('muted')}>{grupo.description}</p>
              </div>
            )}
          </div>

          {/* Right Column */}
          <div className="space-y-4">
            {(grupo.start_date || grupo.end_date) && (
              <div className="flex items-center gap-3">
                <Calendar className={`w-5 h-5 ${colors.primary.text}`} />
                <div>
                  <h3 className={`font-medium ${colors.text}`}>Período</h3>
                  <div className={`${getTextClass('muted')} text-sm space-y-1`}>
                    {grupo.start_date && <p>Inicio: {formatDate(grupo.start_date)}</p>}
                    {grupo.end_date ? (
                      <p className={isExpired ? colors.alert.textDark : isExpiringSoon ? "text-yellow-600" : ""}>
                        Fin: {formatDate(grupo.end_date)}
                        {isExpired && " (Expirado)"}
                        {isExpiringSoon && " (Por expirar)"}
                      </p>
                    ) : (
                      <p>Sin fecha límite</p>
                    )}
                  </div>
                </div>
              </div>
            )}

            <div className="flex items-center gap-3">
              <Settings className={`w-5 h-5 ${getTextClass('muted')}`} />
              <div>
                <h3 className={`font-medium ${colors.text}`}>Configuración</h3>
                <div className={`${getTextClass('muted')} text-sm space-y-1`}>
                  <p>Miembros: {grupo.allow_new_members ? "Permitidos" : "Cerrado"}</p>
                  <p>Estado: {grupo.is_active ? "Activo" : "Inactivo"}</p>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <Clock className={`w-5 h-5 ${getTextClass('muted')}`} />
              <div>
                <h3 className={`font-medium ${colors.text}`}>Creado</h3>
                <p className={`${getTextClass('muted')} text-sm`}>{formatDate(grupo.created_at)}</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className={getCardClass('stats')}>
          <div className={`text-2xl font-bold ${colors.primary.text}`}>{grupo.member_count || 0}</div>
          <div className={`text-sm ${getTextClass('muted')}`}>Miembros</div>
        </div>
        <div className={getCardClass('stats')}>
          <div className={`text-2xl font-bold ${colors.success.text}`}>
            {grupo.default_currency} {grupo.total_expenses?.toLocaleString() || 0}
          </div>
          <div className={`text-sm ${getTextClass('muted')}`}>Gastos Total</div>
        </div>
        <div className={getCardClass('stats')}>
          <div className={`text-2xl font-bold ${colors.primary.text}`}>0</div>
          <div className={`text-sm ${getTextClass('muted')}`}>Pendientes</div>
        </div>
        <div className={getCardClass('stats')}>
          <div className={`text-2xl font-bold ${colors.warning.text}`}>0</div>
          <div className={`text-sm ${getTextClass('muted')}`}>Invitaciones</div>
        </div>
      </div>

      {/* Members */}
      <div className={`${getCardClass('default')} shadow-sm`}>
        <div className={`p-4 ${colors.border} border-b flex items-center justify-between`}>
          <h2 className={`text-lg font-semibold ${colors.text} flex items-center gap-2`}>
            <Users className="w-5 h-5" />
            Miembros ({members.length})
          </h2>
          <button
            onClick={() => setShowInviteForm(!showInviteForm)}
            className={`${getButtonClass('secondary')} gap-2`}
          >
            <UserPlus className="w-4 h-4" />
            Invitar
          </button>
        </div>
        
        {/* Invite Form */}
        {showInviteForm && (
          <div className={`p-4 ${colors.neutral.bg} border-b ${colors.border}`}>
            <div className="flex gap-2">
              <input
                type="email"
                placeholder="Email del nuevo miembro"
                value={inviteEmail}
                onChange={(e) => setInviteEmail(e.target.value)}
                className="flex-1 px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
              <button
                onClick={sendInvite}
                disabled={inviteLoading || !inviteEmail.trim()}
                className={`${getButtonClass('primary')} disabled:opacity-50 disabled:cursor-not-allowed`}
              >
                {inviteLoading ? "Enviando..." : "Enviar"}
              </button>
              <button
                onClick={() => setShowInviteForm(false)}
                className={getButtonClass('secondary')}
              >
                Cancelar
              </button>
            </div>
          </div>
        )}
        
        {/* Members List */}
        <div className="divide-y divide-gray-200">
          {members.length === 0 ? (
            <div className={`p-8 text-center ${getTextClass('light')}`}>
              <Users className={`w-12 h-12 ${getTextClass('light')} mx-auto mb-2`} />
              <p>No hay miembros cargados</p>
            </div>
          ) : (
            members.map((member) => (
              <div key={member.id} className="p-4 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className={`w-10 h-10 ${colors.primary.bgLight} rounded-full flex items-center justify-center`}>
                    <Users className={`w-5 h-5 ${colors.primary.text}`} />
                  </div>
                  <div>
                    <div className={`font-medium ${colors.text}`}>
                      {member.user_info?.username || "Usuario"}
                    </div>
                    <div className={`text-sm ${getTextClass('muted')}`}>
                      {member.user_info?.email || "Sin email"}
                    </div>
                  </div>
                </div>
                <div className="text-right">
                  <div className={`text-sm font-medium ${colors.text}`}>
                    {getRoleName(member.role)}
                  </div>
                  <div className={`text-xs ${getTextClass('light')}`}>
                    {member.is_active ? "Activo" : "Inactivo"}
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Invite Link Generation */}
      <div className={getCardClass('default')}>
        <h2 className={`text-lg font-semibold ${getTextClass('default')} mb-3 flex items-center gap-2`}>
          <Share className="w-5 h-5" />
          Compartir Grupo
        </h2>
        {!inviteLink ? (
          <button
            onClick={generateInviteLink}
            className={`${getButtonClass('primary', 'regular')} gap-2`}
          >
            <Share className="w-4 h-4" />
            Generar Enlace de Invitación
          </button>
        ) : (
          <div className="space-y-3">
            <div className="flex gap-2">
              <input
                type="text"
                value={inviteLink}
                readOnly
                className="flex-1 px-3 py-2 border border-gray-200 rounded-lg bg-gray-50 text-sm"
              />
              <button
                onClick={copyInviteLink}
                className={`px-4 py-2 rounded-lg transition-colors flex items-center justify-center ${
                  copySuccess
                    ? "bg-green-500 text-white"
                    : `${colors.primary.bg} text-white hover:${colors.primary.bgHover}`
                }`}
              >
                {copySuccess ? (
                  <CheckCircle className="w-4 h-4" />
                ) : (
                  <Copy className="w-4 h-4" />
                )}
              </button>
            </div>
            <button
              onClick={generateInviteLink}
              className={`${getButtonClass('minimal')} text-sm`}
            >
              Generar Nuevo Enlace
            </button>
            <p className={`text-xs ${getTextClass('light')}`}>
              Comparte este enlace para que otros puedan unirse al grupo
            </p>
          </div>
        )}
      </div>

      {/* Old invite link section - remove this */}

    </div>
  );
};

export default GrupoDetail;