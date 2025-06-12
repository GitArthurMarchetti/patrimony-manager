// app/components/common/EntryActionsModal.tsx
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { EntryResponse } from '@/app/lib/types';

interface EntryActionsModalProps {
  isOpen: boolean;
  onClose: () => void;
  entry: EntryResponse | null; // A entrada selecionada para edição/deleção
  actionType: 'delete' | 'update';
  onConfirmDelete?: (entryId: number) => void;
  onUpdateEntry?: (updatedEntry: EntryResponse) => void;
}

export default function EntryActionsModal({
  isOpen,
  onClose,
  entry,
  actionType,
  onConfirmDelete,
  onUpdateEntry,
}: EntryActionsModalProps) {
  const [description, setDescription] = useState('');
  const [amount, setAmount] = useState<number>(0);
  const [date, setDate] = useState('');

  useEffect(() => {
    if (isOpen && entry) {
      setDescription(entry.description);
      setAmount(entry.amount);
      setDate(entry.date);
    } else if (!isOpen) {
        setDescription('');
        setAmount(0);
        setDate('');
    }
  }, [isOpen, entry]);

  if (!isOpen || !entry) return null;

  const isDeleting = actionType === 'delete';

  const handleConfirmAction = () => {
    if (isDeleting && onConfirmDelete) {
      onConfirmDelete(entry.id);
    } else if (!isDeleting && onUpdateEntry) {
      const updatedEntry: EntryResponse = {
        ...entry, // Manter o ID e outras propriedades originais
        description: description,
        amount: amount,
        date: date,
        // CORRIGIDO: Manter o categoryId original da entrada que está sendo atualizada
        // O categoryId não é editado neste modal, então usamos o categoryId original da entrada
        category: { // Precisamos manter o objeto category completo
            id: entry.category.id,
            name: entry.category.name,
            type: entry.category.type,
        }
      };
      // No caso de atualização, o onUpdateEntry do CategoryDetailsPanel vai receber este updatedEntry.
      // E lá, no handleUpdateEntry, ele constrói o EntryRequest com updatedEntry.category.id.
      onUpdateEntry(updatedEntry);
    }
    onClose();
  };

  const formattedDate = date ? new Date(date).toISOString().split('T')[0] : '';

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white p-6 rounded-lg shadow-lg w-full max-w-sm mx-4">
        <h2 className="text-xl font-bold mb-4 text-gray-800">
          {isDeleting ? `Deletar Entrada` : `Atualizar Entrada`}
        </h2>
        
        {isDeleting ? (
          <>
            <p className="mb-4 text-gray-700">
              Você tem certeza que deseja deletar a entrada **{entry.description}** (R$ {entry.amount.toFixed(2)})?
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
            <div className="mb-4">
              <Label htmlFor="entryDescription" className="text-gray-700">Descrição</Label>
              <Input
                id="entryDescription"
                type="text"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="mt-1"
              />
            </div>
            <div className="mb-4">
              <Label htmlFor="entryAmount" className="text-gray-700">Valor</Label>
              <Input
                id="entryAmount"
                type="number"
                step="0.01"
                value={amount}
                onChange={(e) => setAmount(parseFloat(e.target.value) || 0)}
                className="mt-1"
              />
            </div>
            <div className="mb-4">
              <Label htmlFor="entryDate" className="text-gray-700">Data</Label>
              <Input
                id="entryDate"
                type="date"
                value={formattedDate}
                onChange={(e) => setDate(e.target.value)}
                className="mt-1"
              />
            </div>
            <div className="flex justify-end gap-3">
              <Button onClick={onClose} variant="outline" className="bg-gray-200 hover:bg-gray-300 text-gray-800">
                Cancelar
              </Button>
              <Button onClick={handleConfirmAction} className="bg-blue-600 hover:bg-blue-700 text-white">
                Salvar Alterações
              </Button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}