import React from 'react';
import { X, Trash2, Edit, Plus } from 'lucide-react';
import { componentStyles, getButtonClass } from '../../utils/colorSystem';

// Base Modal Component
const Modal = ({ 
  isOpen, 
  onClose, 
  title, 
  children, 
  maxWidth = 'max-w-md',
  showCloseButton = true 
}) => {
  if (!isOpen) return null;

  const handleOverlayClick = (e) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  return (
    <div 
      className={`${componentStyles.modal.overlay} flex items-center justify-center`}
      onClick={handleOverlayClick}
    >
      <div className={`${componentStyles.modal.content} ${maxWidth} w-full mx-4 p-6 max-h-[90vh] overflow-y-auto`}>
        {/* Header */}
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-bold text-gray-900">{title}</h2>
          {showCloseButton && (
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          )}
        </div>

        {/* Content */}
        <div>{children}</div>
      </div>
    </div>
  );
};

// Edit Modal Variant
export const EditModal = ({ 
  isOpen, 
  onClose, 
  title, 
  children, 
  onSave, 
  onCancel,
  saveText = "Guardar",
  cancelText = "Cancelar",
  isLoading = false
}) => {
  return (
    <Modal 
      isOpen={isOpen} 
      onClose={onClose} 
      title={
        <div className="flex items-center gap-2">
          <Edit className="w-5 h-5 text-blue-600" />
          {title}
        </div>
      }
      showCloseButton={false}
    >
      <form onSubmit={onSave} className="space-y-4">
        {children}
        
        <div className="flex space-x-3 pt-4 border-t">
          <button
            type="button"
            onClick={onCancel || onClose}
            className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
            disabled={isLoading}
          >
            {cancelText}
          </button>
          <button
            type="submit"
            className={`${getButtonClass('formPrimary', 'form')} flex-1 px-4 py-2`}
            disabled={isLoading}
          >
            {isLoading ? (
              <div className="flex items-center justify-center gap-2">
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                Guardando...
              </div>
            ) : (
              saveText
            )}
          </button>
        </div>
      </form>
    </Modal>
  );
};

// Confirmation Modal Variant
export const ConfirmModal = ({ 
  isOpen, 
  onClose, 
  title, 
  message, 
  onConfirm,
  confirmText = "Confirmar",
  cancelText = "Cancelar",
  variant = "danger" // danger, warning, info
}) => {
  const getVariantStyles = () => {
    switch (variant) {
      case 'danger':
        return {
          icon: <Trash2 className="w-5 h-5 text-red-600" />,
          confirmClass: 'bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg transition-colors'
        };
      case 'warning':
        return {
          icon: <X className="w-5 h-5 text-orange-600" />,
          confirmClass: 'bg-orange-600 hover:bg-orange-700 text-white px-4 py-2 rounded-lg transition-colors'
        };
      default:
        return {
          icon: <Plus className="w-5 h-5 text-blue-600" />,
          confirmClass: getButtonClass('formPrimary', 'form')
        };
    }
  };

  const styles = getVariantStyles();

  return (
    <Modal 
      isOpen={isOpen} 
      onClose={onClose} 
      title={
        <div className="flex items-center gap-2">
          {styles.icon}
          {title}
        </div>
      }
      maxWidth="max-w-sm"
    >
      <div className="text-gray-600 mb-6">
        {message}
      </div>
      
      <div className="flex space-x-3">
        <button
          onClick={onClose}
          className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
        >
          {cancelText}
        </button>
        <button
          onClick={onConfirm}
          className={`flex-1 ${styles.confirmClass}`}
        >
          {confirmText}
        </button>
      </div>
    </Modal>
  );
};

export default Modal;