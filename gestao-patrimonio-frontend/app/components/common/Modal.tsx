// Seu arquivo Modal.tsx
'use client';

import React, { ReactNode } from 'react';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  children: ReactNode;
  title: string;
}

export default function Modal({ isOpen, onClose, children, title }: ModalProps) {
  if (!isOpen) {
    return null;
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center p-4 z-50 animate-fade-in"> {/* Fundo mais escuro, animação */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-2xl w-full max-w-md mx-auto relative transform transition-all duration-300 scale-100 opacity-100 animate-scale-up"> {/* Borda mais arredondada, sombra mais forte, tema escuro */}
        <div className="flex justify-between items-center p-5 border-b border-gray-200 dark:border-gray-700"> {/* Padding maior */}
          <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100">{title}</h2> {/* Fonte maior e mais bold */}
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-900 dark:hover:text-gray-100 transition-colors duration-200 text-3xl font-bold leading-none" // Ícone maior, transição
            aria-label="Close modal"
          >
            &times;
          </button>
        </div>
        <div className="p-6"> {/* Padding maior no conteúdo */}
          {children}
        </div>
      </div>
    </div>
  );
}