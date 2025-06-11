'use client';

import React, { useEffect, useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from './lib/auth-context';
import { CategoryResponse, EntryResponse, FinancialSummaryResponse } from './lib/types';
import { getFinancialSummary } from './lib/api/profits';
import CircleVisualization from './components/dashboard/Circle';
import Modal from './components/common/Modal';
import CategoryForm from './components/common/CategoryForm';
import EntryForm from './components/common/forms/EntryForm';

export default function DashboardPage() {
  const { isAuthenticated, user, loading, logout, token } = useAuth();
  const router = useRouter();
  const [summary, setSummary] = useState<FinancialSummaryResponse | null>(null);
  const [dataLoading, setDataLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showCategoryModal, setShowCategoryModal] = useState(false);
  const [showProfitModal, setShowProfitModal] = useState(false);
  const [showExpenseModal, setShowExpenseModal] = useState(false);

  const fetchSummary = useCallback(async () => {
    if (!token) {
      setError('Authentication token is missing. Please log in again.');
      setDataLoading(false);
      return;
    }
    setDataLoading(true);
    try {
      const data = await getFinancialSummary();
      console.log("Fetched summary data:", data);
      setSummary(data);
    } catch (err: unknown) {
      console.error("Failed to fetch financial summary:", err);
      setError(err instanceof Error ? err.message : 'Failed to load financial summary.');
    } finally {
      setDataLoading(false);
    }
  }, [token]);

  useEffect(() => {
    if (loading) {
      return;
    }

    if (!isAuthenticated) {
      router.replace('/login');
      return;
    }

    fetchSummary();
  }, [isAuthenticated, loading, router, fetchSummary]);

  const handleCategorySuccess = (newCategory: CategoryResponse) => {
    console.log("Category created successfully:", newCategory);
    setShowCategoryModal(false);
    fetchSummary();
  };

  const handleEntrySuccess = (newEntry: EntryResponse) => {
    console.log("Entry created successfully:", newEntry);
    setShowProfitModal(false);
    setShowExpenseModal(false);
    fetchSummary();
  };

  if (loading || dataLoading) {
    return <div className="min-h-screen flex items-center justify-center text-gray-800">Loading...</div>;
  }

  if (error) {
    return <div className="min-h-screen flex flex-col items-center justify-center text-red-600 bg-gray-50">Error: {error}</div>;
  }

  if (!summary) {
    return <div className="min-h-screen flex items-center justify-center text-gray-800">No financial data available.</div>;
  }

  return (
    <div className="min-h-screen flex flex-col items-center bg-white text-gray-900 p-4 font-sans antialiased">
      <div className="w-full max-w-4xl mx-auto flex flex-col sm:flex-row justify-between items-center mb-6">
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-4 sm:mb-0">Dashboard, {user?.username || 'User'}</h1>
        <button
          onClick={logout}
          className="py-2 px-4 bg-gray-900 text-white rounded-md hover:bg-black transition-colors duration-200 text-base shadow-md"
        >
          Logout
        </button>
      </div>

      <p className="text-base sm:text-lg text-gray-700 mb-8 text-center max-w-xs sm:max-w-md">Your financial overview at a glance.</p>

      {summary ? (
        <CircleVisualization
          netWorth={summary.netWorth}
          totalProfits={summary.totalProfits}
          totalExpenses={summary.totalExpenses}
          profitsByCategory={summary.profitsByCategory}
          expensesByCategory={summary.expensesByCategory}
          allCategories={summary.allCategories}
        />
      ) : (
        <p className="text-gray-600">No financial data available.</p>
      )}

      <div className="mt-8 text-center bg-gray-50 p-6 rounded-lg shadow-inner w-full max-w-sm sm:max-w-md mx-auto">
        <h2 className="text-xl sm:text-2xl font-semibold mb-4 text-gray-800">Summary Details</h2>
        <p className="text-lg text-green-700 mb-2">Total Profits: ${summary.totalProfits.toFixed(2)}</p>
        <p className="text-lg text-red-700 mb-2">Total Expenses: ${summary.totalExpenses.toFixed(2)}</p>
        <p className="text-2xl font-bold text-gray-900 mt-4">Net Worth: ${summary.netWorth.toFixed(2)}</p>
      </div>

      <div className="mt-8 flex flex-col sm:flex-row space-y-4 sm:space-y-0 sm:space-x-4">
        <button
          onClick={() => setShowCategoryModal(true)}
          className="py-3 px-6 bg-blue-600 text-white rounded-full hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors duration-200 text-lg shadow-md"
        >
          Add Category
        </button>
        <button
          onClick={() => setShowProfitModal(true)}
          className="py-3 px-6 bg-green-600 text-white rounded-full hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 transition-colors duration-200 text-lg shadow-md"
        >
          Add Profit
        </button>
        <button
          onClick={() => setShowExpenseModal(true)}
          className="py-3 px-6 bg-red-600 text-white rounded-full hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 transition-colors duration-200 text-lg shadow-md"
        >
          Add Expense
        </button>
      </div>

      <Modal
        isOpen={showCategoryModal}
        onClose={() => setShowCategoryModal(false)}
        title="Create New Category"
      >
        <CategoryForm
          onSuccess={handleCategorySuccess}
          onCancel={() => setShowCategoryModal(false)}
        />
      </Modal>

      <Modal
        isOpen={showProfitModal}
        onClose={() => setShowProfitModal(false)}
        title="Add New Profit"
      >
        <EntryForm
          onSuccess={handleEntrySuccess}
          onCancel={() => setShowProfitModal(false)}
          entryType="PROFIT"
        />
      </Modal>

      <Modal
        isOpen={showExpenseModal}
        onClose={() => setShowExpenseModal(false)}
        title="Add New Expense"
      >
        <EntryForm
          onSuccess={handleEntrySuccess}
          onCancel={() => setShowExpenseModal(false)}
          entryType="EXPENSE"
        />
      </Modal>
    </div>
  );
}