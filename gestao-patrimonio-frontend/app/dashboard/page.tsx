'use client';

import { useRouter } from 'next/navigation';
import React, { useEffect, useState } from 'react';
import { useAuth } from '../lib/auth-context';
import { FinancialSummaryResponse } from '../lib/types';
import { getFinancialSummary } from '../lib/api/summary';
import CircleVisualization from '../components/dashboard/Circle';


export default function DashboardPage() {
  // TODOS OS HOOKS DEVEM ESTAR AQUI NO TOPO, ANTES DE QUALQUER 'RETURN' CONDICIONAL
  const { isAuthenticated, user, loading, logout, token } = useAuth();
  const router = useRouter();
  const [summary, setSummary] = useState<FinancialSummaryResponse | null>(null);
  const [dataLoading, setDataLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Lógica de redirecionamento e carregamento
  useEffect(() => {
    if (loading) {
      return;
    }

    if (!isAuthenticated) {
      router.replace('/login');
      return;
    }

    const fetchSummary = async () => {
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
    };

    fetchSummary();
  }, [isAuthenticated, token, loading, router]);

  // Renderização condicional para estados de carregamento ou erro
  if (loading || dataLoading) {
    return <div className="min-h-screen flex items-center justify-center">Loading...</div>;
  }

  if (error) {
    return <div className="min-h-screen flex flex-col items-center justify-center text-red-600">Error: {error}</div>;
  }

  if (!summary) {
    return <div className="min-h-screen flex items-center justify-center">No financial data available.</div>;
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-100 p-4">
      <h1 className="text-3xl font-bold mb-4">Welcome to your Dashboard, {user?.username || 'User'}!</h1>
      <p className="text-lg text-gray-700 mb-8">This is your financial overview.</p>

      <CircleVisualization
        netWorth={summary.netWorth}
        totalProfits={summary.totalProfits}
        totalExpenses={summary.totalExpenses}
      />

      <div className="mt-8 text-center">
        <h2 className="text-2xl font-semibold text-gray-800">Summary Details</h2>
        <p className="text-lg text-green-600">Total Profits: ${summary.totalProfits.toFixed(2)}</p>
        <p className="text-lg text-red-600">Total Expenses: ${summary.totalExpenses.toFixed(2)}</p>
        <p className="text-xl font-bold text-gray-800">Net Worth: ${summary.netWorth.toFixed(2)}</p>
      </div>

      <button
        onClick={logout}
        className="mt-8 py-2 px-4 bg-red-600 text-white rounded-md hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
      >
        Logout
      </button>
    </div>
  );
}