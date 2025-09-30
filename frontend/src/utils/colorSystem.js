/**
 * Unified Color System for Gastos App
 * Standardized on blue theme with gradients for forms, minimal approach
 */

// Base color palette - Blue focused with intuitive status colors
export const colors = {
  // Neutral colors (minimal approach)
  background: 'bg-slate-50',
  text: 'text-slate-800',
  textMuted: 'text-slate-600', 
  textLight: 'text-slate-500',
  border: 'border-slate-200',
  
  // Primary blue theme (main project color)
  primary: {
    // Flat colors for stats, icons, etc.
    bg: 'bg-blue-500',
    bgHover: 'bg-blue-600', 
    bgLight: 'bg-blue-50',
    text: 'text-blue-500',
    textDark: 'text-blue-600',
    border: 'border-blue-500',
    
    // Gradients for forms and limited context buttons
    gradient: 'bg-gradient-to-r from-blue-500 to-blue-600',
    gradientHover: 'hover:from-blue-600 hover:to-blue-700',
  },
  
  // Intuitive status colors
  success: {
    bg: 'bg-emerald-500',
    bgHover: 'bg-emerald-600',
    bgLight: 'bg-emerald-50', 
    text: 'text-emerald-500',
    textDark: 'text-emerald-600',
    border: 'border-emerald-500',
  },
  
  alert: {
    bg: 'bg-red-500',
    bgHover: 'bg-red-600',
    bgLight: 'bg-red-50',
    text: 'text-red-500', 
    textDark: 'text-red-600',
    border: 'border-red-500',
  },
  
  warning: {
    bg: 'bg-orange-500',
    bgHover: 'bg-orange-600', 
    bgLight: 'bg-orange-50',
    text: 'text-orange-500',
    textDark: 'text-orange-600',
    border: 'border-orange-500',
  },
  
  // Subtle extra/comment color (replacing violet)
  extra: {
    bg: 'bg-blue-100',
    bgHover: 'bg-blue-200',
    bgLight: 'bg-blue-50', 
    text: 'text-blue-400',
    textDark: 'text-blue-500',
    border: 'border-blue-200',
  },
  
  // Neutral grays for disabled/inactive states
  neutral: {
    bg: 'bg-slate-100',
    bgHover: 'bg-slate-200',
    text: 'text-slate-500',
    textDisabled: 'text-slate-400',
    border: 'border-slate-200',
  }
};

// Component-specific styling
export const componentStyles = {
  // Button variants
  button: {
    // Form buttons (gradient, minimal context)
    formPrimary: `${colors.primary.gradient} ${colors.primary.gradientHover} text-white font-medium px-6 py-3 rounded-lg shadow-md transition-all duration-200 transform hover:scale-105 flex items-center justify-center`,
    formSecondary: `bg-white ${colors.primary.text} ${colors.primary.border} border font-medium px-6 py-3 rounded-lg hover:${colors.primary.bgLight} transition-colors flex items-center justify-center`,
    
    // Regular buttons (flat, for lists, navigation)
    primary: `${colors.primary.bg} hover:${colors.primary.bgHover} text-white font-medium px-4 py-2 rounded-lg transition-colors flex items-center justify-center`,
    secondary: `${colors.primary.text} ${colors.primary.border} border hover:${colors.primary.bgLight} font-medium px-4 py-2 rounded-lg transition-colors flex items-center justify-center`,
    success: `${colors.success.bg} hover:${colors.success.bgHover} text-white font-medium px-4 py-2 rounded-lg transition-colors flex items-center justify-center`,
    alert: `${colors.alert.bg} hover:${colors.alert.bgHover} text-white font-medium px-4 py-2 rounded-lg transition-colors flex items-center justify-center`,
    
    // Minimal button (for less important actions)
    minimal: `${colors.textMuted} hover:${colors.text} font-medium px-2 py-1 rounded transition-colors flex items-center`,
  },
  
  // Status indicators (intuitive colors)
  status: {
    success: `${colors.success.bgLight} ${colors.success.textDark} px-2 py-1 rounded-full text-xs font-medium`,
    alert: `${colors.alert.bgLight} ${colors.alert.textDark} px-2 py-1 rounded-full text-xs font-medium`, 
    warning: `${colors.warning.bgLight} ${colors.warning.textDark} px-2 py-1 rounded-full text-xs font-medium`,
    inactive: `${colors.neutral.bg} ${colors.neutral.text} px-2 py-1 rounded-full text-xs font-medium`,
  },
  
  // Cards (minimal backgrounds)
  card: {
    default: `bg-white ${colors.border} border rounded-lg p-6`,
    minimal: `bg-white rounded-lg p-4`, // No border for cleaner look
    stats: `bg-white rounded-lg p-4 text-center`, // For stats cards
  },
  
  // Forms (minimal approach, no double backgrounds)
  form: {
    container: `bg-white rounded-xl p-8 shadow-sm border border-gray-200`, // Lighter shadow, subtle border
    input: `w-full px-4 py-3 ${colors.border} border rounded-lg focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all`,
    inputError: `w-full px-4 py-3 ${colors.alert.border} ${colors.alert.bgLight} border rounded-lg focus:ring-2 focus:ring-red-500/20 outline-none transition-all`,
    label: `block text-sm font-medium ${colors.textMuted} mb-2`,
    error: `text-xs ${colors.alert.text} mt-1 flex items-center gap-1`,
  },
  
  // Modal (remove double backgrounds)
  modal: {
    overlay: 'fixed inset-0 bg-black/50 backdrop-blur-sm z-50', // Single dark overlay
    container: 'fixed inset-0 z-50 flex items-center justify-center p-4',
    content: 'bg-white rounded-xl shadow-2xl max-w-md w-full', // No extra backgrounds
  }
};

// Utility functions
export const getButtonClass = (variant = 'primary', context = 'regular') => {
  if (context === 'form') {
    return componentStyles.button[`form${variant.charAt(0).toUpperCase() + variant.slice(1)}`] || componentStyles.button.formPrimary;
  }
  return componentStyles.button[variant] || componentStyles.button.primary;
};

export const getCardClass = (variant = 'default') => {
  return componentStyles.card[variant] || componentStyles.card.default;
};

export const getStatusClass = (status) => {
  const statusMap = {
    'paid': 'success',
    'pagado': 'success', 
    'active': 'success',
    'activo': 'success',
    'expired': 'alert',
    'expirado': 'alert',
    'expiring': 'warning',
    'pending': 'warning',
    'pendiente': 'warning',
    'inactive': 'inactive',
    'inactivo': 'inactive',
  };
  
  const mappedStatus = statusMap[status.toLowerCase()] || 'inactive';
  return componentStyles.status[mappedStatus];
};

export const getTextClass = (variant = 'default') => {
  const textVariants = {
    default: colors.text,
    muted: colors.textMuted,
    light: colors.textLight,
    primary: colors.primary.text,
    success: colors.success.text,
    alert: colors.alert.text,
    extra: colors.extra.text, // For subtle comments/extras
  };
  
  return textVariants[variant] || textVariants.default;
};

// Feature colors (unified to blue theme)
export const getFeatureColors = (feature) => {
  // All features now use the primary blue theme
  return {
    ...colors.primary,
    // Subtle variations for different features if needed
    extraBg: feature === 'grupos' ? colors.extra.bg : colors.primary.bgLight,
    extraText: feature === 'grupos' ? colors.extra.text : colors.primary.text,
  };
};

export default colors;