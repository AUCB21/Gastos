/**
 * Example usage guide for the Color System
 * 
 * This file demonstrates how to use the modular color system
 * across different components in the Gastos application.
 */

import { 
  getButtonClass, 
  getCardClass, 
  getTextClass, 
  colors, 
  componentColors,
  getFeatureColors 
} from '../utils/colorSystem';

// Example 1: Using predefined button classes
const ExampleButtons = () => {
  return (
    <div className="space-y-2">
      {/* Primary button */}
      <button className={getButtonClass('primary')}>
        Guardar
      </button>
      
      {/* Feature-specific button (grupos) */}
      <button className={getButtonClass('grupos')}>
        Crear Grupo
      </button>
      
      {/* Danger button */}
      <button className={getButtonClass('danger')}>
        Eliminar
      </button>
      
      {/* Custom size */}
      <button className={getButtonClass('primary', 'lg')}>
        Botón Grande
      </button>
    </div>
  );
};

// Example 2: Using card classes
const ExampleCards = () => {
  return (
    <div className="space-y-4">
      {/* Default card */}
      <div className={getCardClass('default')}>
        <h3>Información General</h3>
      </div>
      
      {/* Info card */}
      <div className={getCardClass('info')}>
        <p>Este es un mensaje informativo</p>
      </div>
      
      {/* Feature-specific card */}
      <div className={getCardClass('grupos')}>
        <p>Contenido relacionado con grupos</p>
      </div>
    </div>
  );
};

// Example 3: Using text classes
const ExampleText = () => {
  return (
    <div>
      <h1 className={getTextClass('default')}>Título Principal</h1>
      <h2 className={getTextClass('primary')}>Subtítulo</h2>
      <p className={getTextClass('muted')}>Texto secundario</p>
      <span className={getTextClass('light')}>Texto auxiliar</span>
      <p className={getTextClass('danger')}>Mensaje de error</p>
    </div>
  );
};

// Example 4: Using individual color objects
const ExampleCustomStyling = () => {
  const gruposColors = getFeatureColors('grupos');
  
  return (
    <div>
      {/* Using individual color classes */}
      <div className={`p-4 ${colors.background} ${colors.border} border rounded-lg`}>
        <h3 className={colors.text}>Título</h3>
        <p className={colors.textMuted}>Descripción</p>
      </div>
      
      {/* Feature-specific colors */}
      <button className={`px-4 py-2 ${gruposColors.bg} hover:${gruposColors.bgHover} text-white rounded`}>
        Acción de Grupo
      </button>
      
      {/* Alert styling */}
      <div className={`p-3 rounded ${componentColors.alert.error}`}>
        Error message
      </div>
    </div>
  );
};

// Example 5: Icon colors
const ExampleIcons = () => {
  return (
    <div className="flex space-x-4">
      <User className={componentColors.icon.default} />
      <Settings className={componentColors.icon.primary} />
      <AlertTriangle className={componentColors.icon.danger} />
      <CheckCircle className={componentColors.icon.success} />
      <Users className={componentColors.icon.grupos} />
    </div>
  );
};

export default {
  ExampleButtons,
  ExampleCards,
  ExampleText,
  ExampleCustomStyling,
  ExampleIcons
};