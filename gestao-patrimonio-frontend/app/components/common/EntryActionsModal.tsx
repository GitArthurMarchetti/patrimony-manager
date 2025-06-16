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
  onConfirmDelete?: (entryId: number) => Promise<void>; // <--- ALTERADO
  onUpdateEntry?: (updatedEntry: EntryResponse) => Promise<void>; // <--- ALTERADO
}

const formatCurrencyInput = (valueInCents: number): string => {
    if (isNaN(valueInCents) || valueInCents === 0) return '0,00';

    let stringValue = valueInCents.toString();
    if (stringValue.length < 3) {
        stringValue = stringValue.padStart(3, '0');
    }

    const integerPart = stringValue.substring(0, stringValue.length - 2);
    const decimalPart = stringValue.substring(stringValue.length - 2);

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
  const [amountDisplay, setAmountDisplay] = useState('0,00');
  const [amountCents, setAmountCents] = useState(0);
  const [date, setDate] = useState('');
  const [error, setError] = useState<string | null>(null); // <-- ADICIONADO

  useEffect(() => {
    if (isOpen && entry) {
      setDescription(entry.description);
      const initialAmountCents = Math.round(entry.amount * 100);
      setAmountCents(initialAmountCents);
      setAmountDisplay(formatCurrencyInput(initialAmountCents));
      setDate(entry.date);
      setError(null); // <--- ADICIONADO
    } else if (!isOpen) {
        setDescription('');
        setAmountDisplay('0,00');
        setAmountCents(0);
        setDate('');
        setError(null); // <--- ADICIONADO
    }
  }, [isOpen, entry]);

  if (!isOpen || !entry) return null;

  const isDeleting = actionType === 'delete';

  const handleAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const inputValue = e.target.value;
    const digitsOnly = inputValue.replace(/\D/g, '');
    const cents = parseInt(digitsOnly || '0', 10);

    const formattedDisplay = formatCurrencyInput(cents);

    setAmountDisplay(formattedDisplay);
    setAmountCents(cents);
  };

  const handleConfirmAction = async () => { // <--- ALTERADO
    setError(null); // <--- ADICIONADO

    if (isDeleting && onConfirmDelete) {
      try { // <--- ADICIONADO: Bloco try-catch para deleção
        await onConfirmDelete(entry.id);
        onClose();
      } catch (err: unknown) {
        let errorMessage = 'Failed to delete entry. Please try again.';
        if (err instanceof Error) {
            errorMessage = err.message;
        } else if (typeof err === 'string') {
            errorMessage = err;
        }
        console.error('Error deleting entry:', err);
        setError(errorMessage);
      }
    } else if (!isDeleting && onUpdateEntry) {
      // <--- ADICIONADO: Validação básica no frontend para feedback imediato --->
      if (!description.trim()) {
        setError("Description cannot be empty. Please provide a description.");
        return;
      }
      if (amountCents <= 0) {
          setError("Amount must be greater than zero. Please enter a valid amount.");
          return;
      }
      if (!date) {
          setError("Date cannot be empty. Please select a date.");
          return;
      }
      // <--- FIM DA VALIDAÇÃO --->

      const amountForApi = amountCents / 100;

      const updatedEntry: EntryResponse = {
        ...entry,
        description: description,
        amount: amountForApi,
        date: date,
        category: {
            id: entry.category.id,
            name: entry.category.name,
            type: entry.category.type,
        }
      };

      try {
        await onUpdateEntry(updatedEntry);
        onClose();
      } catch (err: unknown) { // <--- ADICIONADO
        let errorMessage = 'An unexpected error occurred. Please check your input and try again.';
        if (err instanceof Error) {
            errorMessage = err.message;
        } else if (typeof err === 'string') {
            errorMessage = err;
        }
        console.error('Failed to update entry:', err);
        setError(errorMessage);
      }
    }
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
            {error && ( // <--- ADICIONADO
              <p className="text-red-600 text-sm mb-3">{error}</p>
            )}
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
                type="text" 
                inputMode="numeric" 
                value={amountDisplay} 
                onChange={handleAmountChange} 
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