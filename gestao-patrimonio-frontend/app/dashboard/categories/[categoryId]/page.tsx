'use client';

import React, { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';

import Link from 'next/link';
import { useAuth } from '@/app/lib/auth-context';
import { EntryResponse } from '@/app/lib/types';
import { getAllCategories } from '@/app/lib/api/categories';
import { getProfitsByCategoryId } from '@/app/lib/api/profits';
import { getExpensesByCategoryId } from '@/app/lib/api/expense';


export default function CategoryHistoryPage() {
  const { isAuthenticated, loading, token } = useAuth();
  const router = useRouter();
  const params = useParams();
  const categoryId = params.categoryId ? Number(params.categoryId) : null;
  const [entries, setEntries] = useState<EntryResponse[]>([]);
  const [dataLoading, setDataLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [categoryName, setCategoryName] = useState<string>('Category');

  useEffect(() => {
    if (loading) {
      return;
    }

    if (!isAuthenticated) {
      router.replace('/login');
      return;
    }

    if (!categoryId) {
      setError('Category ID is missing in the URL.');
      setDataLoading(false);
      return;
    }

    const fetchCategoryHistory = async () => {
      if (!token) {
        setError('Authentication token is missing. Please log in again.');
        setDataLoading(false);
        return;
      }
      setDataLoading(true);
      try {
        // CORREÇÃO: Chamar getAllCategories diretamente sem importação dinâmica e caminho relativo
        const allCategories = await getAllCategories();
        const currentCategory = allCategories.find(cat => cat.id === categoryId);

        if (!currentCategory) {
            setError('Category not found.');
            setDataLoading(false);
            return;
        }
        setCategoryName(currentCategory.name);

        let fetchedEntries: EntryResponse[] = [];
        if (currentCategory.type === 'PROFIT') {
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
    };

    fetchCategoryHistory();
  }, [isAuthenticated, loading, router, categoryId, token]);

  if (loading || dataLoading) {
    return <div className="min-h-screen flex items-center justify-center text-gray-800">Loading history...</div>;
  }

  if (error) {
    return <div className="min-h-screen flex flex-col items-center justify-center text-red-600 bg-gray-50 p-4">Error: {error}</div>;
  }

  return (
    <div className="min-h-screen flex flex-col items-center bg-white text-gray-900 p-4 font-sans antialiased">
      <div className="w-full max-w-4xl mx-auto flex justify-between items-center mb-6">
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">History for {categoryName}</h1>
        <Link href="/dashboard" className="py-2 px-4 bg-gray-900 text-white rounded-md hover:bg-black transition-colors duration-200 text-base shadow-md">
          Back to Dashboard
        </Link>
      </div>

      {entries.length === 0 ? (
        <p className="text-lg text-gray-600 mt-8">No entries found for this category.</p>
      ) : (
        <div className="w-full max-w-md mx-auto mt-4 space-y-4">
          {entries.map((entry) => (
            <div key={entry.id} className="p-4 bg-gray-50 rounded-lg shadow-sm border border-gray-200">
              <p className="text-sm text-gray-800 font-semibold">{entry.description}</p>
              <p className="text-sm text-gray-600">Amount: ${entry.amount.toFixed(2)}</p>
              <p className="text-sm text-gray-600">Date: {entry.date}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}