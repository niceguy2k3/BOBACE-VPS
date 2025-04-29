import React, { useEffect } from 'react';
import { FaTimes } from 'react-icons/fa';

const Modal = ({ isOpen = true, onClose, title, children }) => {
  useEffect(() => {
    const handleEscape = (e) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener('keydown', handleEscape);
      document.body.style.overflow = 'hidden';
    }

    return () => {
      document.removeEventListener('keydown', handleEscape);
      document.body.style.overflow = 'auto';
    };
  }, [isOpen, onClose]);

  if (isOpen === false) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center overflow-auto">
      {/* Overlay */}
      <div 
        className="absolute inset-0 bg-black bg-opacity-50 backdrop-blur-sm transition-opacity duration-300"
        onClick={onClose}
        aria-hidden="true"
      ></div>
      
      {/* Modal content */}
      <div 
        className="relative bg-white rounded-xl shadow-xl max-w-3xl w-full mx-4 max-h-[90vh] overflow-hidden z-[60] animate-fade-in"
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div className="border-b px-6 py-4 flex items-center justify-between sticky top-0 bg-white z-10">
          <h3 className="text-xl font-medium text-gray-800">{title}</h3>
          <button 
            onClick={onClose} 
            className="text-gray-500 hover:text-gray-800 focus:outline-none focus:ring-2 focus:ring-amber-500 focus:ring-offset-2 rounded-full p-1 transition-colors duration-200"
            aria-label="Đóng"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path>
            </svg>
          </button>
        </div>
        
        {/* Body */}
        <div className="overflow-y-auto" style={{ maxHeight: 'calc(90vh - 130px)' }}>
          {children}
        </div>
        
        {/* Footer - Hidden by default, only shown when needed */}
        {false && (
          <div className="border-t px-6 py-5 bg-gray-50 flex justify-end sticky bottom-0">
            <button
              onClick={onClose}
              className="px-4 py-2 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 transition-colors duration-200"
            >
              Đóng
            </button>
          </div>
        )}
      </div>
    </div>
  );
};  

export default Modal;