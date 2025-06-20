// app/dashboard/components/dashboard/CategoryDetailsPanel.tsx
'use client';

import React, { useEffect, useState, useCallback } from 'react';
import { PencilIcon, TrashIcon, XIcon } from 'lucide-react';
import { useAuth } from '@/app/lib/auth-context';
import { EntryResponse, CategoryResponse, CategoryRequest, EntryRequest } from '@/app/lib/types';
import { getAllCategories, updateCategory, deleteCategory } from '@/app/lib/api/categories';
import { getProfitsByCategoryId, updateProfit, deleteProfit } from '@/app/lib/api/profits';
import { getExpensesByCategoryId, updateExpense, deleteExpense } from '@/app/lib/api/expense';
import EntryActionsModal from '../common/EntryActionsModal';
import CategoryActionsModal from '../common/CategoryActionModal';

interface CategoryDetailsPanelProps {
    categoryId: number | null;
    onClose: () => void; // Function to close the panel
    onCategoryDeleted: () => void; // Callback for when a category is deleted
    onEntryModified: () => void; // Callback for when an entry is modified (created/edited/deleted)
}

export default function CategoryDetailsPanel({
    categoryId,
    onClose,
    onCategoryDeleted,
    onEntryModified,
}: CategoryDetailsPanelProps) {
    const { isAuthenticated, loading, token } = useAuth();

    const [entries, setEntries] = useState<EntryResponse[]>([]);
    const [dataLoading, setDataLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [currentCategory, setCurrentCategory] = useState<CategoryResponse | null>(null);

    // Modal states
    const [isEntryModalOpen, setIsEntryModalOpen] = useState(false);
    const [selectedEntry, setSelectedEntry] = useState<EntryResponse | null>(null);
    const [entryActionType, setEntryActionType] = useState<'delete' | 'update'>('delete');

    const [isCategoryModalOpen, setIsCategoryModalOpen] = useState(false);
    const [categoryActionType, setCategoryActionType] = useState<'delete' | 'update'>('delete');

    // --- Data fetching functions ---
    const fetchCategoryHistory = useCallback(async () => {
        if (!token || categoryId === null) {
            setError('Authentication token or category ID is missing.');
            setDataLoading(false);
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
            return;
        }
        if (categoryId !== null) {
            fetchCategoryHistory();
        } else {
            setEntries([]);
            setCurrentCategory(null);
            setError(null);
            setDataLoading(false);
        }
    }, [isAuthenticated, loading, categoryId, fetchCategoryHistory]);


    // --- Functions to OPEN modals ---
    const handleOpenEntryModal = (entry: EntryResponse, type: 'delete' | 'update') => {
        setSelectedEntry(entry);
        setEntryActionType(type);
        setIsEntryModalOpen(true);
    };

    const handleOpenCategoryModal = (type: 'delete' | 'update') => {
        if (currentCategory) {
            setCategoryActionType(type);
            setIsCategoryModalOpen(true);
        } else {
            console.warn("Attempted to open category modal without a loaded category.");
            setError("Category data not available for this action.");
        }
    };

    // --- Functions to CLOSE modals ---
    const handleCloseEntryModal = () => {
        setIsEntryModalOpen(false);
        setSelectedEntry(null);
    };

    const handleCloseCategoryModal = () => {
        setIsCategoryModalOpen(false);
    };

    // --- ACTION functions (now with APIs) ---

    const handleConfirmDeleteEntry = useCallback(async (id: number) => {
        if (!token || !currentCategory) return;
        try {
            if (currentCategory.type === 'PROFIT') {
                await deleteProfit(id);
                console.log(`Profit with ID ${id} deleted.`); 
            } else { // EXPENSE
                await deleteExpense(id);
                console.log(`Expense with ID ${id} deleted.`); 
            }
            fetchCategoryHistory(); // Reload data after deletion
            onEntryModified(); // Notify DashboardPage that an entry was modified
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to delete entry.'); 
            console.error("Error deleting entry:", err); 
        } finally {
            handleCloseEntryModal();
        }
    }, [token, currentCategory, fetchCategoryHistory, onEntryModified]);

    const handleUpdateEntry = useCallback(async (updatedEntry: EntryResponse) => {
        if (!token || !currentCategory) return;
        try {
            const entryRequest: EntryRequest = {
                categoryId: updatedEntry.category.id,
                amount: updatedEntry.amount,
                description: updatedEntry.description,
                date: updatedEntry.date,
            };

            if (currentCategory.type === 'PROFIT') {
                await updateProfit(updatedEntry.id, entryRequest);
                console.log(`Profit with ID ${updatedEntry.id} updated.`); 
            } else { // EXPENSE
                await updateExpense(updatedEntry.id, entryRequest);
                console.log(`Expense with ID ${updatedEntry.id} updated.`); 
            }
            fetchCategoryHistory(); // Reload data after update
            onEntryModified(); // Notify DashboardPage that an entry was modified
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to update entry.'); 
            console.error("Error updating entry:", err); 
        } finally {
            handleCloseEntryModal();
        }
    }, [token, currentCategory, fetchCategoryHistory, onEntryModified]);

    const handleConfirmDeleteCategory = useCallback(async (id: number) => {
        if (!token) return;
        try {
            await deleteCategory(id);
            console.log(`Category with ID ${id} deleted.`); 
            onCategoryDeleted(); // Notify DashboardPage that the category was deleted
            onClose(); // Close panel after deleting category
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to delete category.'); 
            console.error("Error deleting category:", err); 
        } finally {
            handleCloseCategoryModal();
        }
    }, [token, onCategoryDeleted, onClose]);

    const handleUpdateCategory = useCallback(async (updatedCategory: CategoryResponse) => {
        if (!token) return;
        try {
            const categoryRequest: CategoryRequest = {
                name: updatedCategory.name,
                type: updatedCategory.type,
            };
            await updateCategory(updatedCategory.id, categoryRequest);
            console.log(`Category with ID ${updatedCategory.id} updated.`); 
            setCurrentCategory(updatedCategory); // Update local category state
            fetchCategoryHistory(); // Reload data to ensure consistency
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to update category.'); 
            console.error("Error updating category:", err); 
        } finally {
            handleCloseCategoryModal();
        }
    }, [token, fetchCategoryHistory]);


    if (loading || dataLoading) {
        return (
            <div className="flex flex-col items-center justify-center h-full text-gray-800 dark:text-gray-200">
                Loading history... 
            </div>
        );
    }

    if (error) {
        return (
            <div className="flex flex-col items-center justify-center h-full text-red-600 dark:text-red-400 p-4">
                Error: {error} 
            </div>
        );
    }

    if (!currentCategory || categoryId === null) {
        return (
            <div className="flex flex-col items-center justify-center h-full text-gray-600 dark:text-gray-400">
                Select a category on the chart. 
            </div>
        );
    }

    return (
        <div className="h-full flex flex-col p-4  overflow-y-auto">
            <div className="w-full flex justify-between items-center mb-4 sticky top-0 bg-inherit pb-2 z-10">
                <div className="flex items-center gap-3">
                    <h1 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-gray-100">History of {currentCategory.name}</h1> 
                    <button onClick={() => handleOpenCategoryModal('update')} className="text-blue-600 hover:text-blue-800 transition-colors dark:text-blue-400 dark:hover:text-blue-600">
                        <PencilIcon className="h-5 w-5" />
                    </button>
                    <button onClick={() => handleOpenCategoryModal('delete')} className="text-red-600 hover:text-red-800 transition-colors dark:text-red-400 dark:hover:text-red-600">
                        <TrashIcon className="h-5 w-5" />
                    </button>
                </div>
                <button onClick={onClose} className="text-gray-600 hover:text-gray-800 transition-colors dark:text-gray-400 dark:hover:text-gray-200">
                    <XIcon className="h-6 w-6" />
                </button>
            </div>

            {entries.length === 0 ? (
                <p className="text-base text-gray-600 dark:text-gray-400 mt-4 text-center">No entries found for this category.</p>
            ) : (
            <div className="flex-1 overflow-y-auto mt-2 space-y-3">
                {entries.map((entry) => {
                    // The border class is defined HERE, for EACH ITEM, using the current CATEGORY type
                    // We use currentCategory.type because all entries in this view belong to the same category
                    const itemBorderColorClass = currentCategory.type === 'PROFIT' ? 'border-green-500 dark:border-green-400' : 'border-red-500 dark:border-red-400';

                    return (
                        <div
                            key={entry.id}
                            className={`p-3 bg-white dark:bg-gray-700 rounded-lg shadow-sm border-2 ${itemBorderColorClass} flex justify-between items-center`}
                        >
                            <div>
                                <p className="text-sm text-gray-800 dark:text-gray-200 font-semibold">{entry.description}</p>
                                <p className="text-xs text-gray-600 dark:text-gray-400">Amount: ${entry.amount.toFixed(2)}</p> 
                                <p className="text-xs text-gray-600 dark:text-gray-400">Date: {entry.date}</p> 
                            </div>
                            <div className="flex space-x-2">
                                <button
                                    onClick={() => handleOpenEntryModal(entry, 'update')}
                                    className="text-blue-600 hover:text-blue-800 transition-colors dark:text-blue-400 dark:hover:text-blue-600"
                                >
                                    <PencilIcon className="h-4 w-4" />
                                </button>
                                <button
                                    onClick={() => handleOpenEntryModal(entry, 'delete')}
                                    className="text-red-600 hover:text-red-800 transition-colors dark:text-red-400 dark:hover:text-red-600"
                                >
                                    <TrashIcon className="h-4 w-4" />
                                </button>
                            </div>
                        </div>
                    );
                })}
            </div>
            )}

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