import React, { useState } from "react";
import api from "../../../api";
import { getButtonClass, getTextClass, colors, componentStyles } from "../../../utils/colorSystem";
import {
  Calendar,
  Users,
  Globe,
  Settings,
  MessageSquare,
  Link,
  Copy,
  CheckCircle,
  AlertCircle,
} from "lucide-react";

// Group types from backend
const GRUPO_TYPES = {
  trip: { code: "trip", name: "Viaje" },
  grupo: { code: "grupo", name: "Grupo" },
  event: { code: "event", name: "Evento" },
  shared: { code: "shared", name: "Gastos Compartidos" },
};

// Currencies from backend
const CURRENCIES = {
  ARS: { code: "ARS", name: "Peso Argentino" },
  USD: { code: "USD", name: "Dólar Americano" },
  EUR: { code: "EUR", name: "Euro" },
  BRL: { code: "BRL", name: "Real Brasileño" },
  CLP: { code: "CLP", name: "Peso Chileno" },
};

const GrupoForm = ({ onGrupoCreated, initialData = null }) => {
  const isEditing = !!initialData;
  
  // Form state
  const [formData, setFormData] = useState({
    name: initialData?.name || "",
    description: initialData?.description || "",
    grupo_type: initialData?.grupo_type || "shared",
    default_currency: initialData?.default_currency || "ARS",
    start_date: initialData?.start_date || "",
    end_date: initialData?.end_date || "",
    is_active: initialData?.is_active ?? true,
    allow_new_members: initialData?.allow_new_members ?? true,
    never_expires: !initialData?.end_date, // Checkbox state
  });

  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const [createdGrupo, setCreatedGrupo] = useState(null);
  const [invitationLink, setInvitationLink] = useState("");
  const [copySuccess, setCopySuccess] = useState(false);

  // Handle input changes
  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
      // Clear end_date if never_expires is checked
      ...(name === "never_expires" && checked ? { end_date: "" } : {})
    }));

    // Clear error for this field
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: "" }));
    }
  };

  // Validation
  const validateForm = () => {
    const newErrors = {};

    if (!formData.name.trim()) {
      newErrors.name = "El nombre del grupo es obligatorio";
    } else if (formData.name.length > 200) {
      newErrors.name = "El nombre no puede exceder 200 caracteres";
    }

    if (formData.description.length > 500) {
      newErrors.description = "La descripción no puede exceder 500 caracteres";
    }

    if (!formData.grupo_type) {
      newErrors.grupo_type = "Seleccione un tipo de grupo";
    }

    if (!formData.default_currency) {
      newErrors.default_currency = "Seleccione una moneda";
    }

    // Date validation
    if (formData.start_date && formData.end_date && !formData.never_expires) {
      if (new Date(formData.start_date) > new Date(formData.end_date)) {
        newErrors.end_date = "La fecha de fin debe ser posterior a la fecha de inicio";
      }
    }

    return newErrors;
  };

  // Generate invitation link
  const generateInvitationLink = async (grupoId) => {
    try {
      // First create an invitation
      const invitationData = {
        grupo: grupoId,
        email: "placeholder@example.com", // This would be replaced by actual email in real usage
        expires_at: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(), // 30 days from now
      };
      
      const response = await api.post("/api/grupo-invitations/", invitationData);
      const token = response.data.invitation_token;
      const baseUrl = window.location.origin;
      return `${baseUrl}/join-grupo/${token}`;
    } catch (error) {
      console.error("Error generating invitation link:", error);
      return "";
    }
  };

  // Copy invitation link
  const copyInvitationLink = async () => {
    try {
      await navigator.clipboard.writeText(invitationLink);
      setCopySuccess(true);
      setTimeout(() => setCopySuccess(false), 2000);
    } catch (error) {
      console.error("Error copying link:", error);
    }
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();

    const newErrors = validateForm();
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    setLoading(true);

    try {
      // Prepare data for API
      const apiData = {
        ...formData,
        end_date: formData.never_expires ? null : formData.end_date || null,
      };
      
      let response;
      if (isEditing) {
        response = await api.put(`/api/grupos/${initialData.id}/`, apiData);
      } else {
        response = await api.post("/api/grupos/", apiData);
      }

      const grupo = response.data;
      setCreatedGrupo(grupo);
      
      // Generate invitation link for new grupos
      if (!isEditing) {
        const link = await generateInvitationLink(grupo.id);
        setInvitationLink(link);
      }
      
      if (onGrupoCreated) {
        onGrupoCreated(grupo);
      }

      // Reset form for new grupos
      if (!isEditing) {
        setFormData({
          name: "",
          description: "",
          grupo_type: "shared",
          default_currency: "ARS",
          start_date: "",
          end_date: "",
          is_active: true,
          allow_new_members: true,
          never_expires: true,
        });
      }
      
      setErrors({});
    } catch (error) {
      console.error("Error saving grupo:", error);
      if (error.response?.data) {
        setErrors(error.response.data);
      } else {
        alert(`Error: ${error.message}`);
      }
    } finally {
      setLoading(false);
    }
  };

  // Show success message with invitation link after creation
  if (createdGrupo && !isEditing) {
    return (
      <div className="p-4">
        <div className="max-w-xl mx-auto">
          <div className="bg-white rounded-xl shadow-lg p-6">
            {/* Success Header */}
            <div className="text-center mb-6">
              <div className="inline-flex items-center justify-center w-12 h-12 bg-green-100 rounded-full mb-3">
                <CheckCircle className="w-6 h-6 text-green-600" />
              </div>
              <h2 className={`text-2xl font-bold ${getTextClass('default')} mb-1`}>
                ¡Grupo Creado Exitosamente!
              </h2>
              <p className={`${getTextClass('muted')} text-sm`}>
                "{createdGrupo.name}" está listo para usar
              </p>
            </div>

            {/* Group Info */}
            <div className={`${colors.extra.bg} rounded-lg p-4 mb-6`}>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className={`font-medium ${getTextClass('default')}`}>Tipo:</span>
                  <p className={getTextClass('default')}>{GRUPO_TYPES[createdGrupo.grupo_type]?.name}</p>
                </div>
                <div>
                  <span className={`font-medium ${getTextClass('default')}`}>Moneda:</span>
                  <p className={getTextClass('default')}>{createdGrupo.default_currency}</p>
                </div>
              </div>
            </div>

            {/* Invitation Link */}
            {invitationLink && (
              <div className="mb-6">
                <label className={componentStyles.form.label}>
                  <Link className="inline w-4 h-4 mr-1" />
                  Enlace de Invitación
                </label>
                <div className="flex">
                  <input
                    type="text"
                    value={invitationLink}
                    readOnly
                    className={`flex-1 px-3 py-2 border ${colors.border} rounded-l-lg ${colors.neutral.bg} text-sm`}
                  />
                  <button
                    onClick={copyInvitationLink}
                    className={`px-4 py-2 rounded-r-lg border border-l-0 transition-colors ${
                      copySuccess
                        ? "bg-green-500 text-white border-green-500"
                        : `${getButtonClass('primary', 'regular')} rounded-none rounded-r-lg border-l-0`
                    }`}
                  >
                    {copySuccess ? (
                      <CheckCircle className="w-4 h-4" />
                    ) : (
                      <Copy className="w-4 h-4" />
                    )}
                  </button>
                </div>
                <p className={`mt-1 text-xs ${getTextClass('muted')}`}>
                  Comparte este enlace para invitar miembros al grupo
                </p>
              </div>
            )}

            {/* Actions */}
            <div className="flex gap-3">
              <button
                onClick={() => {
                  setCreatedGrupo(null);
                  setInvitationLink("");
                }}
                className={getButtonClass('primary', 'form')}
              >
                Crear Otro Grupo
              </button>
              <button
                onClick={() => window.location.href = '/grupos'}
                className={getButtonClass('secondary', 'form')}
              >
                Ver Mis Grupos
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-4">
      <div className="max-w-xl mx-auto">
        <div className="bg-white rounded-xl shadow-lg p-6">
          {/* Header */}
          <div className="text-center mb-6">
            <div className={`inline-flex items-center justify-center w-12 h-12 ${colors.primary.bg} rounded-full mb-3`}>
              <Users className={`w-6 h-6 ${colors.primary.text}`} />
            </div>
            <h2 className={`text-2xl font-bold ${getTextClass('default')} mb-1`}>
              {isEditing ? "Editar Grupo" : "Crear Nuevo Grupo"}
            </h2>
            <p className={`${getTextClass('muted')} text-sm`}>
              {isEditing ? "Modifica los datos del grupo" : "Complete los campos para crear su grupo"}
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Group Name */}
            <div>
              <label className={componentStyles.form.label}>
                <Users className="inline w-4 h-4 mr-1" />
                Nombre del Grupo *
              </label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleInputChange}
                maxLength={200}
                className={`${componentStyles.form.input} ${
                  errors.name ? "border-red-300 bg-red-50" : ""
                }`}
                placeholder="Mi Grupo de Gastos"
              />
              {errors.name && (
                <p className="mt-1 text-xs text-red-600">{errors.name}</p>
              )}
              <p className="mt-1 text-xs text-gray-500">
                {formData.name.length}/200 caracteres
              </p>
            </div>

            {/* Group Type and Currency */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className={componentStyles.form.label}>
                  Tipo de Grupo *
                </label>
                <select
                  name="grupo_type"
                  value={formData.grupo_type}
                  onChange={handleInputChange}
                  className={`${componentStyles.form.input} ${
                    errors.grupo_type ? "border-red-300 bg-red-50" : ""
                  }`}
                >
                  {Object.values(GRUPO_TYPES).map((type) => (
                    <option key={type.code} value={type.code}>
                      {type.name}
                    </option>
                  ))}
                </select>
                {errors.grupo_type && (
                  <p className="mt-1 text-xs text-red-600">{errors.grupo_type}</p>
                )}
              </div>

              <div>
                <label className={componentStyles.form.label}>
                  <Globe className="inline w-4 h-4 mr-1" />
                  Moneda *
                </label>
                <select
                  name="default_currency"
                  value={formData.default_currency}
                  onChange={handleInputChange}
                  className={`${componentStyles.form.input} ${
                    errors.default_currency ? "border-red-300 bg-red-50" : ""
                  }`}
                >
                  {Object.values(CURRENCIES).map((currency) => (
                    <option key={currency.code} value={currency.code}>
                      {currency.code} - {currency.name}
                    </option>
                  ))}
                </select>
                {errors.default_currency && (
                  <p className="mt-1 text-xs text-red-600">{errors.default_currency}</p>
                )}
              </div>
            </div>

            {/* Description */}
            <div>
              <label className={componentStyles.form.label}>
                <MessageSquare className="inline w-4 h-4 mr-1" />
                Descripción
              </label>
              <textarea
                name="description"
                value={formData.description}
                onChange={handleInputChange}
                rows={3}
                maxLength={500}
                className={`${componentStyles.form.input} resize-none ${
                  errors.description ? "border-red-300 bg-red-50" : ""
                }`}
                placeholder="Describe el propósito del grupo (opcional)"
              />
              {errors.description && (
                <p className="mt-1 text-xs text-red-600">{errors.description}</p>
              )}
              <p className="mt-1 text-xs text-gray-500">
                {formData.description.length}/500 caracteres
              </p>
            </div>

            {/* Date Range */}
            <div className="space-y-3">
              <label className={componentStyles.form.label}>
                <Calendar className="inline w-4 h-4 mr-1" />
                Período de Validez
              </label>
              
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs text-gray-600 mb-1">Fecha de Inicio</label>
                  <input
                    type="date"
                    name="start_date"
                    value={formData.start_date}
                    onChange={handleInputChange}
                    className={componentStyles.form.input}
                  />
                </div>
                
                <div>
                  <label className="block text-xs text-gray-600 mb-1">Fecha de Fin</label>
                  <input
                    type="date"
                    name="end_date"
                    value={formData.end_date}
                    onChange={handleInputChange}
                    disabled={formData.never_expires}
                    className={`${componentStyles.form.input} ${
                      formData.never_expires ? "bg-gray-100 text-gray-400" : ""
                    } ${
                      errors.end_date ? "border-red-300 bg-red-50" : ""
                    }`}
                  />
                  {errors.end_date && (
                    <p className="mt-1 text-xs text-red-600">{errors.end_date}</p>
                  )}
                </div>
              </div>
              
              <div className="flex items-center">
                <input
                  type="checkbox"
                  name="never_expires"
                  id="never_expires"
                  checked={formData.never_expires}
                  onChange={handleInputChange}
                  className={`h-4 w-4 ${colors.primary.text} focus:ring-1 focus:ring-blue-500 border-gray-300 rounded`}
                />
                <label htmlFor="never_expires" className={`ml-2 text-sm ${getTextClass('default')}`}>
                  Este grupo nunca expira
                </label>
              </div>
            </div>

            {/* Settings */}
            <div className="space-y-3">
              <label className={componentStyles.form.label}>
                <Settings className="inline w-4 h-4 mr-1" />
                Configuración
              </label>
              
              <div className="space-y-2">
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    name="allow_new_members"
                    id="allow_new_members"
                    checked={formData.allow_new_members}
                    onChange={handleInputChange}
                    className={`h-4 w-4 ${colors.primary.text} focus:ring-1 focus:ring-blue-500 border-gray-300 rounded`}
                  />
                  <label htmlFor="allow_new_members" className={`ml-2 text-sm ${getTextClass('default')}`}>
                    Permitir que se unan nuevos miembros
                  </label>
                </div>
                
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    name="is_active"
                    id="is_active"
                    checked={formData.is_active}
                    onChange={handleInputChange}
                    className={`h-4 w-4 ${colors.primary.text} focus:ring-1 focus:ring-blue-500 border-gray-300 rounded`}
                  />
                  <label htmlFor="is_active" className={`ml-2 text-sm ${getTextClass('default')}`}>
                    Grupo activo
                  </label>
                </div>
              </div>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading}
              className={`w-full ${getButtonClass('primary', 'form')} disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none`}
            >
              {loading ? (
                <div className="flex items-center justify-center">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  {isEditing ? "Actualizando..." : "Creando..."}
                </div>
              ) : (
                isEditing ? "Actualizar Grupo" : "Crear Grupo"
              )}
            </button>
          </form>

          {/* Footer */}
          <div className={`mt-4 text-center text-xs ${getTextClass('muted')}`}>
            * Campos obligatorios
          </div>
        </div>
      </div>
    </div>
  );
};

export default GrupoForm;