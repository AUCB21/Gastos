import React, { useState } from 'react';
import Modal, { EditModal, ConfirmModal } from './Modal';

/**
 * Modal Examples Component - Demonstrates all Modal variants
 * 
 * This component showcases the different modal types available:
 * 1. Basic Modal - General purpose modal
 * 2. EditModal - Specialized for edit forms with save/cancel actions
 * 3. ConfirmModal - For confirmations (delete, warnings, etc.)
 */
const ModalExamples = () => {
  const [basicModalOpen, setBasicModalOpen] = useState(false);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [confirmModalOpen, setConfirmModalOpen] = useState(false);
  const [formData, setFormData] = useState({ name: '', email: '' });

  const handleEditSave = (e) => {
    e.preventDefault();
    console.log('Saving:', formData);
    setEditModalOpen(false);
    // Here you would typically call your API
  };

  const handleDelete = () => {
    console.log('Deleting item...');
    setConfirmModalOpen(false);
    // Here you would typically call your delete API
  };

  return (
    <div className="p-8 space-y-4">
      <h1 className="text-2xl font-bold mb-6">Modal Component Examples</h1>
      
      {/* Trigger Buttons */}
      <div className="space-x-4">
        <button
          onClick={() => setBasicModalOpen(true)}
          className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
        >
          Open Basic Modal
        </button>
        
        <button
          onClick={() => setEditModalOpen(true)}
          className="px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600"
        >
          Open Edit Modal
        </button>
        
        <button
          onClick={() => setConfirmModalOpen(true)}
          className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600"
        >
          Open Confirm Modal
        </button>
      </div>

      {/* Basic Modal Example */}
      <Modal
        isOpen={basicModalOpen}
        onClose={() => setBasicModalOpen(false)}
        title="Basic Modal Example"
      >
        <div className="space-y-4">
          <p>This is a basic modal component with standard functionality:</p>
          <ul className="list-disc list-inside space-y-1 text-gray-600">
            <li>Backdrop click to close</li>
            <li>Escape key support (built-in)</li>
            <li>Customizable width and title</li>
            <li>Clean, minimal design</li>
          </ul>
          <button
            onClick={() => setBasicModalOpen(false)}
            className="w-full px-4 py-2 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300"
          >
            Close Modal
          </button>
        </div>
      </Modal>

      {/* Edit Modal Example */}
      <EditModal
        isOpen={editModalOpen}
        onClose={() => setEditModalOpen(false)}
        onSave={handleEditSave}
        title="Edit User Information"
        saveText="Save Changes"
        cancelText="Cancel"
      >
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Name
            </label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => setFormData({...formData, name: e.target.value})}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
              placeholder="Enter name"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Email
            </label>
            <input
              type="email"
              value={formData.email}
              onChange={(e) => setFormData({...formData, email: e.target.value})}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
              placeholder="Enter email"
            />
          </div>
        </div>
      </EditModal>

      {/* Confirm Modal Example */}
      <ConfirmModal
        isOpen={confirmModalOpen}
        onClose={() => setConfirmModalOpen(false)}
        onConfirm={handleDelete}
        title="Delete Item"
        message="Are you sure you want to delete this item? This action cannot be undone."
        variant="danger"
        confirmText="Delete"
        cancelText="Cancel"
      />
    </div>
  );
};

export default ModalExamples;