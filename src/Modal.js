// src/Modal.js
import React from 'react';
import { FaExclamationTriangle, FaInfoCircle } from 'react-icons/fa';

const Modal = ({ isOpen, onClose, onConfirm, title, children, type = 'alert', confirmText = 'Confirm', confirmColor = 'bg-red-600 hover:bg-red-700' }) => {
  if (!isOpen) return null;

  const isConfirmation = type === 'confirmation';

  // Define base classes for clarity
  const baseButtonClasses = "px-6 py-2 text-white rounded-lg font-semibold transition-all duration-200 transform hover:scale-105";

  return (
    <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4 animate-fade-in">
      <div className="bg-gray-800 rounded-xl shadow-2xl w-full max-w-md p-6 md:p-8 relative border border-gray-700">
        <div className="flex items-center gap-4 mb-4">
          {isConfirmation ? 
            <FaExclamationTriangle className="text-2xl text-yellow-400" /> :
            <FaInfoCircle className="text-2xl text-blue-400" />
          }
          <h2 className="text-xl font-bold text-gray-100">{title}</h2>
        </div>
        
        <div className="text-gray-300 mb-6">
          {children}
        </div>

        <div className="flex justify-end gap-4">
          {isConfirmation && (
            <button 
              onClick={onClose} 
              className={`${baseButtonClasses} bg-gray-600 hover:bg-gray-500`}
            >
              Cancel
            </button>
          )}
          
          {isConfirmation ? (
            <button 
              onClick={onConfirm} 
              className={`${baseButtonClasses} ${confirmColor}`}
            >
              {confirmText}
            </button>
          ) : (
            <button 
              onClick={onClose} 
              className={`${baseButtonClasses} bg-purple-600 hover:bg-purple-700`}
            >
              OK
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default Modal;
