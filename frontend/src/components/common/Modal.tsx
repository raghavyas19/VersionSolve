import React from 'react';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  children: React.ReactNode;
  centered?: boolean;
}

const Modal: React.FC<ModalProps> = ({ isOpen, onClose, title, children, centered = true }) => {
  if (!isOpen) return null;
  return (
    <div className={`fixed inset-0 z-50 flex ${centered ? 'items-center' : 'items-start'} justify-center bg-black bg-opacity-40`}>
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg max-w-lg w-full p-6 relative animate-fade-in mt-16">
        <button
          className="absolute top-3 right-3 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 text-xl font-bold focus:outline-none"
          onClick={onClose}
          aria-label="Close modal"
        >
          &times;
        </button>
        {title && <h2 className="text-xl font-semibold mb-4 text-gray-900 dark:text-white">{title}</h2>}
        {children}
      </div>
    </div>
  );
};

export default Modal; 