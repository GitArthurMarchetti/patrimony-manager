// app/dashboard/categories/[categoryId]/page.tsx
'use client';

import React, { useEffect, useState, useCallback } from 'react';
import { useRouter, useParams } from 'next/navigation';
import Link from 'next/link';

// Importando ícones

import { useAuth } from '@/app/lib/auth-context';
import { EntryResponse, CategoryResponse, CategoryRequest } from '@/app/lib/types'; // Importar CategoryRequest
import { getAllCategories, updateCategory, deleteCategory } from '@/app/lib/api/categories'; // Importar updateCategory e deleteCategory
import { getProfitsByCategoryId, updateProfit, deleteProfit } from '@/app/lib/api/profits'; // Importar updateProfit e deleteProfit
import { getExpensesByCategoryId, updateExpense, deleteExpense } from '@/app/lib/api/expense'; // Importar updateExpense e deleteExpense
import { PencilIcon, TrashIcon } from 'lucide-react';
import EntryActionsModal from '@/app/components/common/EntryActionsModal';
import CategoryActionsModal from '@/app/components/common/CategoryActionModal';


export default function CategoryHistoryPage() {
  const { isAuthenticated, loading, token } = useAuth();
  const router = useRouter();
  const params = useParams();
  const categoryId = params.categoryId ? Number(params.categoryId) : null;

  const [entries, setEntries] = useState<EntryResponse[]>([]);
  const [dataLoading, setDataLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentCategory, setCurrentCategory] = useState<CategoryResponse | null>(null);

  // Estados para os modais
  const [isEntryModalOpen, setIsEntryModalOpen] = useState(false);
  const [selectedEntry, setSelectedEntry] = useState<EntryResponse | null>(null);
  const [entryActionType, setEntryActionType] = useState<'delete' | 'update'>('delete');

  const [isCategoryModalOpen, setIsCategoryModalOpen] = useState(false);
  const [categoryActionType, setCategoryActionType] = useState<'delete' | 'update'>('delete');

  // --- Funções de busca de dados ---
  const fetchCategoryHistory = useCallback(async () => {
    if (!token || !categoryId) {
      // Já lida com o erro de token/categoryId missing
      return;
    }
    setDataLoading(true);
    try {
      const allCategories = await getAllCategories();
      const cat = allCategories.find(c => c.id === categoryId);

      if (!cat) {
        setError('Category not found.');
        setDataLoading(false);
        return;
      }
      setCurrentCategory(cat);

      let fetchedEntries: EntryResponse[] = [];
      if (cat.type === 'PROFIT') {
        fetchedEntries = await getProfitsByCategoryId(categoryId);
      } else { // EXPENSE
        fetchedEntries = await getExpensesByCategoryId(categoryId);
      }
      setEntries(fetchedEntries);
    } catch (err: unknown) {
      console.error("Failed to fetch category history:", err);
      setError(err instanceof Error ? err.message : 'Failed to load category history.');
    } finally {
      setDataLoading(false);
    }
  }, [token, categoryId]);

  useEffect(() => {
    if (loading) return;
    if (!isAuthenticated) {
      router.replace('/login');
      return;
    }
    fetchCategoryHistory();
  }, [isAuthenticated, loading, router, fetchCategoryHistory]);


  // --- Funções para ABRIR modais ---
  const handleOpenEntryModal = (entry: EntryResponse, type: 'delete' | 'update') => {
    setSelectedEntry(entry);
    setEntryActionType(type);
    setIsEntryModalOpen(true);
  };

  const handleOpenCategoryModal = (type: 'delete' | 'update') => {
    // Certifica-se de que currentCategory está carregado antes de abrir o modal da categoria
    if (currentCategory) {
      setCategoryActionType(type);
      setIsCategoryModalOpen(true);
    } else {
      console.warn("Attempted to open category modal without a loaded category.");
      setError("Category data not available for this action.");
    }
  };

  // --- Funções para FECHAR modais ---
  const handleCloseEntryModal = () => {
    setIsEntryModalOpen(false);
    setSelectedEntry(null);
  };

  const handleCloseCategoryModal = () => {
    setIsCategoryModalOpen(false);
  };

  // --- Funções de AÇÃO (agora com as APIs) ---

  const handleConfirmDeleteEntry = useCallback(async (id: number) => {
    if (!token || !currentCategory) return;
    try {
      if (currentCategory.type === 'PROFIT') {
        await deleteProfit(id);
        console.log(`Lucro com ID ${id} deletado.`);
      } else { // EXPENSE
        await deleteExpense(id);
        console.log(`Despesa com ID ${id} deletada.`);
      }
      fetchCategoryHistory(); // Recarrega os dados após a deleção
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Falha ao deletar entrada.');
      console.error("Erro ao deletar entrada:", err);
    } finally {
      handleCloseEntryModal();
    }
  }, [token, currentCategory, fetchCategoryHistory]);

  const handleUpdateEntry = useCallback(async (updatedEntry: EntryResponse) => {
    if (!token || !currentCategory) return;
    try {
      const entryRequest: EntryRequest = { // Criar um EntryRequest a partir de EntryResponse
        categoryId: updatedEntry.categoryId,
        amount: updatedEntry.amount,
        description: updatedEntry.description,
        date: updatedEntry.date,
      };

      if (currentCategory.type === 'PROFIT') {
        await updateProfit(updatedEntry.id, entryRequest);
        console.log(`Lucro com ID ${updatedEntry.id} atualizado.`);
      } else { // EXPENSE
        await updateExpense(updatedEntry.id, entryRequest);
        console.log(`Despesa com ID ${updatedEntry.id} atualizada.`);
      }
      fetchCategoryHistory(); // Recarrega os dados após a atualização
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Falha ao atualizar entrada.');
      console.error("Erro ao atualizar entrada:", err);
    } finally {
      handleCloseEntryModal();
    }
  }, [token, currentCategory, fetchCategoryHistory]);

  const handleConfirmDeleteCategory = useCallback(async (id: number) => {
    if (!token) return;
    try {
      await deleteCategory(id);
      console.log(`Categoria com ID ${id} deletada.`);
      router.push('/dashboard'); // Redireciona para o dashboard após deletar a categoria
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Falha ao deletar categoria.');
      console.error("Erro ao deletar categoria:", err);
    } finally {
      handleCloseCategoryModal();
    }
  }, [token, router]);

  const handleUpdateCategory = useCallback(async (updatedCategory: CategoryResponse) => {
    if (!token) return;
    try {
      const categoryRequest: CategoryRequest = { // Criar um CategoryRequest a partir de CategoryResponse
        name: updatedCategory.name,
        type: updatedCategory.type,
      };
      await updateCategory(updatedCategory.id, categoryRequest);
      console.log(`Categoria com ID ${updatedCategory.id} atualizada.`);
      // Atualiza o nome da categoria no estado local se for apenas o nome que mudou
      // Se você atualizar o tipo, pode precisar de uma lógica mais complexa ou redirecionar
      setCurrentCategory(updatedCategory);
      fetchCategoryHistory(); // Recarrega os dados para garantir consistência
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Falha ao atualizar categoria.');
      console.error("Erro ao atualizar categoria:", err);
    } finally {
      handleCloseCategoryModal();
    }
  }, [token, fetchCategoryHistory]);


  if (loading || dataLoading) {
    return <div className="min-h-screen flex items-center justify-center text-gray-800">Carregando histórico...</div>;
  }

  if (error) {
    return <div className="min-h-screen flex flex-col items-center justify-center text-red-600 bg-gray-50 p-4">Erro: {error}</div>;
  }

  if (!currentCategory) {
    return <div className="min-h-screen flex items-center justify-center text-gray-800">Categoria não encontrada.</div>;
  }

  return (
    <div className="min-h-screen flex flex-col items-center bg-white text-gray-900 p-4 font-sans antialiased pb-20">
      <div className="w-full max-w-4xl mx-auto flex justify-between items-center mb-6">
        <div className="flex items-center gap-3">
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Histórico de {currentCategory.name}</h1>
          <button onClick={() => handleOpenCategoryModal('update')} className="text-blue-600 hover:text-blue-800 transition-colors">
            <PencilIcon className="h-6 w-6" />
          </button>
          <button onClick={() => handleOpenCategoryModal('delete')} className="text-red-600 hover:text-red-800 transition-colors">
            <TrashIcon className="h-6 w-6" />
          </button>
        </div>
      </div>

      {entries.length === 0 ? (
        <p className="text-lg text-gray-600 mt-8">Nenhuma entrada encontrada para esta categoria.</p>
      ) : (
        <div className="w-full max-w-md mx-auto mt-4 space-y-4">
          {entries.map((entry) => (
            <div key={entry.id} className="p-4 bg-gray-50 rounded-lg shadow-sm border border-gray-200 flex justify-between items-center">
              <div>
                <p className="text-sm text-gray-800 font-semibold">{entry.description}</p>
                <p className="text-sm text-gray-600">Valor: ${entry.amount.toFixed(2)}</p>
                <p className="text-sm text-gray-600">Data: {entry.date}</p>
              </div>
              <div className="flex space-x-2">
                <button
                  onClick={() => handleOpenEntryModal(entry, 'update')}
                  className="text-blue-600 hover:text-blue-800 transition-colors"
                >
                  <PencilIcon className="h-5 w-5" />
                </button>
                <button
                  onClick={() => handleOpenEntryModal(entry, 'delete')}
                  className="text-red-600 hover:text-red-800 transition-colors"
                >
                  <TrashIcon className="h-5 w-5" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Botão fixado "Voltar para Dashboard" */}
      <div className="fixed bottom-0 left-0 w-full p-4 bg-white border-t border-gray-200 shadow-lg z-50">
        <Link href="/" className="block w-full py-3 bg-gray-900 text-white text-center rounded-md hover:bg-black transition-colors duration-200 text-lg font-semibold shadow-md">
          Voltar para Dashboard
        </Link>
      </div>

      {/* Renderização dos Modais */}
      <EntryActionsModal
        isOpen={isEntryModalOpen}
        onClose={handleCloseEntryModal}
        entry={selectedEntry}
        actionType={entryActionType}
        onConfirmDelete={handleConfirmDeleteEntry}
        onUpdateEntry={handleUpdateEntry}
      />

      <CategoryActionsModal
        isOpen={isCategoryModalOpen}
        onClose={handleCloseCategoryModal}
        category={currentCategory}
        actionType={categoryActionType}
        onConfirmDelete={handleConfirmDeleteCategory}
        onUpdateCategory={handleUpdateCategory}
      />
    </div>
  );
}