import React, { useState, useEffect } from "react";
import api from "../../../api";
import { Share, Copy, CheckCircle, RefreshCw, Calendar } from "lucide-react";

const InvitationLink = ({ grupoId, className = "" }) => {
  const [inviteLink, setInviteLink] = useState("");
  const [copySuccess, setCopySuccess] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [expiresAt, setExpiresAt] = useState(null);

  useEffect(() => {
    if (grupoId) {
      generateInviteLink();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [grupoId]);

  const generateInviteLink = async () => {
    setLoading(true);
    setError("");
    
    try {
      const expires = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000); // 30 days
      const invitationData = {
        grupo: grupoId,
        email: "public@invitation.link", // Placeholder for public links
        expires_at: expires.toISOString(),
      };
      
      const response = await api.post("/api/grupo-invitations/", invitationData);
      const token = response.data.invitation_token;
      const baseUrl = window.location.origin;
      
      setInviteLink(`${baseUrl}/join-grupo/${token}`);
      setExpiresAt(expires);
    } catch (error) {
      console.error("Error generating invite link:", error);
      setError("Error al generar el enlace de invitación");
    } finally {
      setLoading(false);
    }
  };

  const copyInviteLink = async () => {
    if (!inviteLink) return;
    
    try {
      await navigator.clipboard.writeText(inviteLink);
      setCopySuccess(true);
      setTimeout(() => setCopySuccess(false), 2000);
    } catch (error) {
      console.error("Error copying link:", error);
      // Fallback for older browsers
      const textArea = document.createElement("textarea");
      textArea.value = inviteLink;
      document.body.appendChild(textArea);
      textArea.select();
      try {
        document.execCommand('copy');
        setCopySuccess(true);
        setTimeout(() => setCopySuccess(false), 2000);
      } catch (fallbackError) {
        console.error("Fallback copy failed:", fallbackError);
      }
      document.body.removeChild(textArea);
    }
  };

  const formatExpiryDate = (date) => {
    if (!date) return null;
    return new Date(date).toLocaleDateString("es-ES", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  if (loading) {
    return (
      <div className={`bg-white rounded-lg shadow-sm border p-4 ${className}`}>
        <div className="flex items-center gap-2 text-gray-500">
          <RefreshCw className="w-4 h-4 animate-spin" />
          <span className="text-sm">Generando enlace de invitación...</span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className={`bg-white rounded-lg shadow-sm border p-4 ${className}`}>
        <div className="text-center text-red-600 mb-3">
          <p className="text-sm">{error}</p>
        </div>
        <button
          onClick={generateInviteLink}
          className="w-full px-4 py-2 bg-dodger-blue-600 text-white rounded-lg hover:bg-dodger-blue-700 transition-colors text-sm"
        >
          Reintentar
        </button>
      </div>
    );
  }

  if (!inviteLink) {
    return (
      <div className={`bg-white rounded-lg shadow-sm border p-4 ${className}`}>
        <button
          onClick={generateInviteLink}
          className="w-full px-4 py-2 bg-dodger-blue-600 text-white rounded-lg hover:bg-dodger-blue-700 transition-colors text-sm flex items-center justify-center gap-2"
        >
          <Share className="w-4 h-4" />
          Generar Enlace de Invitación
        </button>
      </div>
    );
  }

  return (
    <div className={`bg-white rounded-lg shadow-sm border p-4 ${className}`}>
      <div className="flex items-center gap-2 mb-3">
        <Share className="w-5 h-5 text-dodger-blue-600" />
        <h3 className="font-semibold text-gray-900">Enlace de Invitación</h3>
      </div>
      
      <div className="space-y-3">
        {/* Link Input */}
        <div className="flex gap-2">
          <input
            type="text"
            value={inviteLink}
            readOnly
            className="flex-1 px-3 py-2 border border-gray-200 rounded-lg bg-gray-50 text-sm focus:outline-none"
            onClick={(e) => e.target.select()}
          />
          <button
            onClick={copyInviteLink}
            className={`px-4 py-2 rounded-lg transition-colors text-sm ${
              copySuccess
                ? "bg-green-500 text-white"
                : "bg-dodger-blue-600 text-white hover:bg-dodger-blue-700"
            }`}
            title={copySuccess ? "Copiado!" : "Copiar enlace"}
          >
            {copySuccess ? (
              <CheckCircle className="w-4 h-4" />
            ) : (
              <Copy className="w-4 h-4" />
            )}
          </button>
        </div>

        {/* Expiry Info */}
        {expiresAt && (
          <div className="flex items-center gap-2 text-sm text-gray-600">
            <Calendar className="w-4 h-4" />
            <span>Expira: {formatExpiryDate(expiresAt)}</span>
          </div>
        )}

        {/* Actions */}
        <div className="flex gap-2">
          <button
            onClick={generateInviteLink}
            className="flex items-center gap-2 px-3 py-1 text-gray-600 hover:text-gray-800 transition-colors text-sm"
            title="Generar nuevo enlace"
          >
            <RefreshCw className="w-4 h-4" />
            Renovar
          </button>
        </div>

        {/* Usage Info */}
        <div className="text-xs text-gray-500 bg-gray-50 p-2 rounded">
          Comparte este enlace para que otros puedan unirse al grupo. El enlace expira automáticamente después de 30 días.
        </div>
      </div>
    </div>
  );
};

export default InvitationLink;