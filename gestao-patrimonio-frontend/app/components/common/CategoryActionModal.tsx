// app/components/modals/CategoryActionsModal.tsx
import React, { useState, useEffect } from 'react';
import { CategoryResponse } from '@/app/lib/types';
import { Button } from '@/components/ui/button'; // Assumindo Button do shadcn/ui
import { Input } from '@/components/ui/input'; // Assumindo Input do shadcn/ui
import { Label } from '@/components/ui/label'; // Assumindo Label do shadcn/ui

interface CategoryActionsModalProps {
  isOpen: boolean;
  onClose: () => void;
  category: CategoryResponse | null;
  actionType: 'delete' | 'update';
  onConfirmDelete?: (categoryId: number) => void;
  onUpdateCategory?: (updatedCategory: CategoryResponse) => void;
}

export default function CategoryActionsModal({
  isOpen,
  onClose,
  category,
  actionType,
  onConfirmDelete,
  onUpdateCategory,
}: CategoryActionsModalProps) {
  const [categoryName, setCategoryName] = useState('');
  const [categoryType, setCategoryType] = useState<'PROFIT' | 'EXPENSE'>('PROFIT');

  useEffect(() => {
    if (isOpen && category) {
      setCategoryName(category.name);
      setCategoryType(category.type);
    }
  }, [isOpen, category]);

  if (!isOpen || !category) return null;

  const isDeleting = actionType === 'delete';

  const handleConfirmAction = () => {
    if (isDeleting && onConfirmDelete) {
      onConfirmDelete(category.id);
    } else if (!isDeleting && onUpdateCategory) {
      const updatedCategory: CategoryResponse = {
        ...category,
        name: categoryName,
        type: categoryType,
      };
      onUpdateCategory(updatedCategory);
    }
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white p-6 rounded-lg shadow-lg w-full max-w-sm mx-4">
        <h2 className="text-xl font-bold mb-4 text-gray-800">
          {isDeleting ? `Deletar Categoria: ${category.name}` : `Atualizar Categoria: ${category.name}`}
        </h2>
        
        {isDeleting ? (
          <>
            <p className="mb-4 text-gray-700">
              Você tem certeza que deseja deletar a categoria **"{category.name}"**?
              Todas as entradas associadas a ela serão perdidas.
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
              <Label htmlFor="categoryName" className="text-gray-700">Nome da Categoria</Label>
              <Input
                id="categoryName"
                type="text"
                value={categoryName}
                onChange={(e) => setCategoryName(e.target.value)}
                className="mt-1"
              />
            </div>
            <div className="mb-4">
              <Label htmlFor="categoryType" className="text-gray-700">Tipo</Label>
              <select
                id="categoryType"
                value={categoryType}
                onChange={(e) => setCategoryType(e.target.value as 'PROFIT' | 'EXPENSE')}
                className="mt-1 block w-full p-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
              >
                <option value="PROFIT">Lucro</option>
                <option value="EXPENSE">Despesa</option>
              </select>
            </div>
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