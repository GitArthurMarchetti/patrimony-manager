'use client';

import { createCategory } from '@/app/lib/api/categories';
import { useAuth } from '@/app/lib/auth-context';
import { CategoryRequest, CategoryResponse } from '@/app/lib/types';
import React, { useState } from 'react';


interface CategoryFormProps {
  onSuccess: (category: CategoryResponse) => void;
  onCancel: () => void;
  // initialData?: CategoryResponse; // Para futura funcionalidade de edição
}

export default function CategoryForm({ onSuccess, onCancel }: CategoryFormProps) {
  const { token, loading: authLoading } = useAuth(); // Obter token do contexto de autenticação
  const [name, setName] = useState('');
  const [type, setType] = useState<'PROFIT' | 'EXPENSE'>('PROFIT'); // Valor padrão
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    if (!token) {
      setError('Authentication token missing. Please log in again.');
      setLoading(false);
      return;
    }

    try {
      const newCategory: CategoryRequest = { name, type };
      const createdCategory = await createCategory(newCategory); // createCategory agora recebe o token
      onSuccess(createdCategory);
      // Limpar formulário após sucesso (opcional)
      setName('');
      setType('PROFIT');
    } catch (_err: unknown) { // <--- MUDE AQUI PARA '_err: Error' (se não usar o erro)
        return _err;
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label htmlFor="name" className="block text-sm font-medium text-gray-700">
          Category Name
        </label>
        <input
          type="text"
          id="name"
          className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-gray-500 focus:border-gray-500 sm:text-sm"
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
          disabled={loading || authLoading}
        />
      </div>
      <div>
        <label htmlFor="type" className="block text-sm font-medium text-gray-700">
          Type
        </label>
        <select
          id="type"
          className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-gray-500 focus:border-gray-500 sm:text-sm"
          value={type}
          onChange={(e) => setType(e.target.value as 'PROFIT' | 'EXPENSE')}
          required
          disabled={loading || authLoading}
        >
          <option value="PROFIT">Profit</option>
          <option value="EXPENSE">Expense</option>
        </select>
      </div>
      {error && <p className="text-red-500 text-sm">{error}</p>}
      <div className="flex justify-end space-x-2">
        <button
          type="button"
          onClick={onCancel}
          className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-200 rounded-md hover:bg-gray-300"
          disabled={loading || authLoading}
        >
          Cancel
        </button>
        <button
          type="submit"
          className="px-4 py-2 text-sm font-medium text-white bg-gray-900 rounded-md hover:bg-black"
          disabled={loading || authLoading}
        >
          {loading ? 'Saving...' : 'Save Category'}
        </button>
      </div>
    </form>
  );
}