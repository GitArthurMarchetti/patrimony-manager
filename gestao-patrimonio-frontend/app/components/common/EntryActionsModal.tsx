// app/components/modals/EntryActionsModal.tsx
import React from 'react';
import { EntryResponse } from '@/app/lib/types';
import { Button } from '@/components/ui/button'; // Assumindo que você tem um componente Button do shadcn/ui

interface EntryActionsModalProps {
  isOpen: boolean;
  onClose: () => void;
  entry: EntryResponse | null;
  actionType: 'delete' | 'update';
  onConfirmDelete?: (entryId: number) => void;
  onUpdateEntry?: (updatedEntry: EntryResponse) => void; // Ou um objeto com os campos a serem atualizados
}

export default function EntryActionsModal({
  isOpen,
  onClose,
  entry,
  actionType,
  onConfirmDelete,
  onUpdateEntry,
}: EntryActionsModalProps) {
  if (!isOpen || !entry) return null;

  const isDeleting = actionType === 'delete';

  const handleConfirmAction = () => {
    if (isDeleting && onConfirmDelete) {
      onConfirmDelete(entry.id);
    } else if (!isDeleting && onUpdateEntry) {
      // Aqui você precisaria de um formulário para coletar os novos dados
      // Por simplicidade, vamos apenas logar e fechar
      console.log('Simulando atualização para entrada:', entry.id);
      onUpdateEntry(entry); // Em um cenário real, passaria os dados do formulário
    }
    onClose(); // Fecha o modal após a ação
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white p-6 rounded-lg shadow-lg w-full max-w-sm mx-4">
        <h2 className="text-xl font-bold mb-4 text-gray-800">
          {isDeleting ? `Deletar ${entry.description}` : `Atualizar ${entry.description}`}
        </h2>
        
        {isDeleting ? (
          <>
            <p className="mb-4 text-gray-700">
              Você tem certeza que deseja deletar a entrada **&quot;{entry.description}&quot;** no valor de **${entry.amount.toFixed(2)}**?
            </p>
            <div className="flex justify-end gap-3">
              <Button onClick={onClose} variant="outline" className="bg-gray-200 hover:bg-gray-300 text-gray-800">
                Cancelar
              </Button>
              <Button onClick={handleConfirmAction} className="bg-red-600 hover:bg-red-700 text-white">
                Deletar
              </Button>
            </div>
          </>
        ) : (
          <>
            <p className="mb-4 text-gray-700">
              {/* Aqui você colocaria o formulário para atualizar a entrada */}
              Funcionalidade de atualização da entrada (ID: {entry.id})
              <br />
              <input type="text" placeholder="Nova descrição" className="mt-2 p-2 border rounded w-full" />
              <input type="number" placeholder="Novo valor" className="mt-2 p-2 border rounded w-full" />
            </p>
            <div className="flex justify-end gap-3">
              <Button onClick={onClose} variant="outline" className="bg-gray-200 hover:bg-gray-300 text-gray-800">
                Cancelar
              </Button>
              <Button onClick={handleConfirmAction} className="bg-blue-600 hover:bg-blue-700 text-white">
                Atualizar
              </Button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}