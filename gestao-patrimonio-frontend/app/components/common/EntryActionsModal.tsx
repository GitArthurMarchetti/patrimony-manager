// app/components/common/EntryActionsModal.tsx
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { EntryResponse } from '@/app/lib/types';

interface EntryActionsModalProps {
  isOpen: boolean;
  onClose: () => void;
  entry: EntryResponse | null;
  actionType: 'delete' | 'update';
  onConfirmDelete?: (entryId: number) => void;
  onUpdateEntry?: (updatedEntry: EntryResponse) => void;
}

// Reutilizada do EntryForm.tsx
const formatCurrencyInput = (valueInCents: number): string => {
    if (isNaN(valueInCents) || valueInCents === 0) return '0,00';

    let stringValue = valueInCents.toString();
    // Garante que tenha pelo menos 3 dígitos (para 0,00)
    if (stringValue.length < 3) {
        stringValue = stringValue.padStart(3, '0');
    }

    const integerPart = stringValue.substring(0, stringValue.length - 2);
    const decimalPart = stringValue.substring(stringValue.length - 2);

    // Adiciona pontos como separador de milhares
    const formattedIntegerPart = integerPart.replace(/\B(?=(\d{3})+(?!\d))/g, '.');

    return `${formattedIntegerPart},${decimalPart}`;
};


export default function EntryActionsModal({
  isOpen,
  onClose,
  entry,
  actionType,
  onConfirmDelete,
  onUpdateEntry,
}: EntryActionsModalProps) {
  const [description, setDescription] = useState('');
  // Alterado para gerenciar o valor exibido (string) e o valor em centavos (número)
  const [amountDisplay, setAmountDisplay] = useState('0,00');
  const [amountCents, setAmountCents] = useState(0);
  const [date, setDate] = useState('');

  useEffect(() => {
    if (isOpen && entry) {
      setDescription(entry.description);
      // Ao abrir o modal, converte o valor do `entry.amount` (que está em reais/dólares) para centavos,
      // e depois formata para exibição na máscara.
      const initialAmountCents = Math.round(entry.amount * 100);
      setAmountCents(initialAmountCents);
      setAmountDisplay(formatCurrencyInput(initialAmountCents));
      setDate(entry.date);
    } else if (!isOpen) {
        // Limpar estados quando o modal é fechado
        setDescription('');
        setAmountDisplay('0,00');
        setAmountCents(0);
        setDate('');
    }
  }, [isOpen, entry]);

  if (!isOpen || !entry) return null;

  const isDeleting = actionType === 'delete';

  const handleAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const inputValue = e.target.value;
    // Remove tudo que não for dígito
    const digitsOnly = inputValue.replace(/\D/g, '');
    // Converte para inteiro (em centavos)
    const cents = parseInt(digitsOnly || '0', 10);

    // Formata para exibição
    const formattedDisplay = formatCurrencyInput(cents);

    setAmountDisplay(formattedDisplay);
    setAmountCents(cents);
  };

  const handleConfirmAction = () => {
    if (isDeleting && onConfirmDelete) {
      onConfirmDelete(entry.id);
    } else if (!isDeleting && onUpdateEntry) {
      // Usa amountCents para o valor que será enviado para a API (convertido para o valor real depois)
      const amountForApi = amountCents / 100;

      const updatedEntry: EntryResponse = {
        ...entry, // Keep original ID and other properties
        description: description,
        amount: amountForApi, // Usa o valor numérico correto
        date: date,
        category: {
            id: entry.category.id,
            name: entry.category.name,
            type: entry.category.type,
        }
      };
      onUpdateEntry(updatedEntry);
    }
    onClose();
  };

  const formattedDate = date ? new Date(date).toISOString().split('T')[0] : '';

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white p-6 rounded-lg shadow-lg w-full max-w-sm mx-4">
        <h2 className="text-xl font-bold mb-4 text-gray-800">
          {isDeleting ? `Delete Entry` : `Update Entry`}
        </h2>
        
        {isDeleting ? (
          <>
            <p className="mb-4 text-gray-700">
              Are you sure you want to delete entry **{entry.description}** (${entry.amount.toFixed(2)})?
            </p>
            <div className="flex justify-end gap-3">
              <Button onClick={onClose} variant="outline" className="bg-gray-200 hover:bg-gray-300 text-gray-800">
                Cancel
              </Button>
              <Button onClick={handleConfirmAction} className="bg-red-600 hover:bg-red-700 text-white">
                Delete
              </Button>
            </div>
          </>
        ) : (
          <>
            <div className="mb-4">
              <Label htmlFor="entryDescription" className="text-gray-700">Description</Label>
              <Input
                id="entryDescription"
                type="text"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="mt-1"
              />
            </div>
            <div className="mb-4">
              <Label htmlFor="entryAmount" className="text-gray-700">Amount</Label>
              <Input
                id="entryAmount"
                type="text" // Alterado para "text" para permitir máscara
                inputMode="numeric" // Sugere teclado numérico para mobile
                value={amountDisplay} // Bind ao estado da exibição
                onChange={handleAmountChange} // Usa a nova função de máscara
                className="mt-1"
              />
            </div>
            <div className="mb-4">
              <Label htmlFor="entryDate" className="text-gray-700">Date</Label>
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
                Cancel
              </Button>
              <Button onClick={handleConfirmAction} className="bg-blue-600 hover:bg-blue-700 text-white">
                Save Changes
              </Button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}