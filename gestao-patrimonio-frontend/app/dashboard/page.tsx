// app/dashboard/page.tsx
'use client';

import React, { useEffect, useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { Node, Edge } from 'vis-network/standalone';
import { CategoryResponse, EntryResponse, FinancialSummaryResponse } from '../lib/types';
import { useAuth } from '../lib/auth-context';
import { getFinancialSummary } from '../lib/api/summary';
import GraphView from '../components/GraphView';

// Componentes ShadCN UI
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';

// Ícones SVG para os botões de ação (ainda são úteis para as labels dos botões)
const PlusIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
  </svg>
);
const CategoryIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7.071 7.071A2 2 0 0121 13v3a2 2 0 01-2 2H7a2 2 0 01-2-2V7a2 2 0 012-2z" />
  </svg>
);
const ProfitIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8V9m0 3v2m0 3.929V19M4.118 19.882A4.5 4.5 0 0112 21.5a4.5 4.5 0 017.882-1.618M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
  </svg>
);
const ExpenseIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0zm0 0h.01" />
  </svg>
);

// Importações dos formulários (mantidos como comuns por enquanto, mas podem ser adaptados para ShadCN se desejar)
import CategoryForm from '../components/common/CategoryForm';
import EntryForm from '../components/common/forms/EntryForm';

export default function DashboardPage() {
  const { isAuthenticated, user, loading, logout, token } = useAuth();
  const router = useRouter();
  const [summary, setSummary] = useState<FinancialSummaryResponse | null>(null);
  const [dataLoading, setDataLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showCategoryModal, setShowCategoryModal] = useState(false);
  const [showProfitModal, setShowProfitModal] = useState(false);
  const [showExpenseModal, setShowExpenseModal] = useState(false);
  const [showActionButtons, setShowActionButtons] = useState(false);

  const fetchSummary = useCallback(async () => {
    if (!token) {
      setError('Authentication token is missing. Please log in again.');
      setDataLoading(false);
      return;
    }
    setDataLoading(true);
    try {
      const data = await getFinancialSummary();
      setSummary(data);
    } catch (err: unknown) {
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

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const handleCategorySuccess = (newCategory: CategoryResponse) => {
    setShowCategoryModal(false);
    setShowActionButtons(false);
    fetchSummary();
  };

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const handleEntrySuccess = (newEntry: EntryResponse) => {
    setShowProfitModal(false);
    setShowExpenseModal(false);
    setShowActionButtons(false);
    fetchSummary();
  };

  const prepareGraphData = useCallback(() => {
    if (!summary) return { nodes: [], edges: [] };

    const nodes: Node[] = [];
    const edges: Edge[] = [];

    // Nó Central: Patrimônio Líquido
    nodes.push({
      id: 'net_worth',
      label: `Patrimônio Líquido:\n$${summary.netWorth.toFixed(2)}\nLucros: $${summary.totalProfits.toFixed(2)}\nDespesas: $${summary.totalExpenses.toFixed(2)}`,
      shape: 'dot',
      size: 80,
      font: {
        color: '#FFFFFF',
        size: 16,
        align: 'center'
      },
      color: {
        background: summary.netWorth >= 0 ? '#1A1A1A' : '#B71C1C',
        border: summary.netWorth >= 0 ? '#333333' : '#FF5252',
        highlight: {
          background: summary.netWorth >= 0 ? '#000000' : '#D32F2F',
          border: summary.netWorth >= 0 ? '#555555' : '#FFCDD2',
        }
      },
      fixed: true,
      physics: false,
    });

    // Nós de Categoria
    summary.allCategories.forEach(cat => {
      const profitAmount = summary.profitsByCategory.find(p => p.categoryId === cat.id)?.totalAmount || 0;
      const expenseAmount = summary.expensesByCategory.find(e => e.categoryId === cat.id)?.totalAmount || 0;
      const totalAmount = cat.type === 'PROFIT' ? profitAmount : expenseAmount;

      const categorySize = Math.max(30, Math.min(60, 30 + (totalAmount / (summary.totalProfits + summary.totalExpenses || 1)) * 100));

      nodes.push({
        id: `cat_${cat.id}`,
        label: `${cat.name}\n$${totalAmount.toFixed(2)}`,
        shape: 'dot',
        size: categorySize,
        font: {
          color: '#F0F0F0',
          size: 12,
          align: 'center'
        },
        color: {
          background: cat.type === 'PROFIT' ? '#388E3C' : '#D32F2F',
          border: cat.type === 'PROFIT' ? '#66BB6A' : '#EF5350',
          highlight: {
            background: cat.type === 'PROFIT' ? '#2E7D32' : '#C62828',
            border: cat.type === 'PROFIT' ? '#81C784' : '#E57373',
          }
        },
      });

      // Arestas: Conectar categorias ao nó central
      edges.push({
        from: `cat_${cat.id}`,
        to: 'net_worth',
        color: {
          color: '#CCCCCC',
          highlight: '#999999',
          inherit: 'from',
        },
      });
    });

    return { nodes, edges };
  }, [summary]);

  const { nodes, edges } = prepareGraphData();

  if (loading || dataLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-100 to-gray-300 dark:from-gray-900 dark:to-black text-gray-800 dark:text-gray-200">
        Carregando...
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-gray-100 to-gray-300 dark:from-gray-900 dark:to-black text-red-600 dark:text-red-400">
        Erro: {error}
      </div>
    );
  }

  if (!summary) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-100 to-gray-300 dark:from-gray-900 dark:to-black text-gray-800 dark:text-gray-200">
        Nenhum dado financeiro disponível.
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col items-center p-4 font-sans antialiased bg-gradient-to-br from-gray-100 to-gray-300 dark:from-gray-900 dark:to-black text-gray-900 dark:text-gray-100 relative overflow-hidden">
      {/* Cabeçalho do Dashboard com Card */}
      <Card className="w-full max-w-4xl mx-auto mb-8 bg-white/20 dark:bg-gray-800/30 backdrop-blur-md shadow-lg border border-white/30 dark:border-gray-700/50">
        <CardHeader className="flex flex-row justify-between items-center">
          <CardTitle className="text-2xl sm:text-3xl font-extrabold text-gray-900 dark:text-white">
            Dashboard, {user?.username || 'Usuário'}
          </CardTitle>
          <Button
            onClick={logout}
            variant="ghost" // Estilo fantasma para um visual mais limpo
            className="text-gray-800 dark:text-gray-200 hover:bg-gray-200/50 dark:hover:bg-gray-700/50"
          >
            Sair
          </Button>
        </CardHeader>
        <CardDescription className="text-base sm:text-lg text-gray-800 dark:text-gray-200 px-6 pb-4 text-center">
          Sua visão financeira em um piscar de olhos.
        </CardDescription>
      </Card>

      {/* Container do GraphView com Card */}
      <Card className="w-full max-w-4xl mx-auto mb-8 bg-white/20 dark:bg-gray-800/30 backdrop-blur-md shadow-lg border border-white/30 dark:border-gray-700/50">
        <CardContent className="p-0"> {/* Remove o padding padrão do CardContent */}
          <GraphView nodesData={nodes} edgesData={edges} />
        </CardContent>
      </Card>

      {/* Botões de Ação Flutuantes */}
      <div className="fixed bottom-8 right-8 z-40 flex flex-col items-end space-y-4">
        {showActionButtons && (
          <>
            <Button
              onClick={() => { setShowCategoryModal(true); setShowActionButtons(false); }}
              size="icon" // Botão redondo com ícone
              className="w-14 h-14 rounded-full bg-white/30 dark:bg-gray-800/40 backdrop-blur-md shadow-lg text-gray-800 dark:text-gray-200 hover:bg-white/50 dark:hover:bg-gray-700/50"
              aria-label="Nova Categoria"
            >
              <CategoryIcon />
            </Button>
            <Button
              onClick={() => { setShowProfitModal(true); setShowActionButtons(false); }}
              size="icon"
              className="w-14 h-14 rounded-full bg-white/30 dark:bg-gray-800/40 backdrop-blur-md shadow-lg text-green-600 dark:text-green-400 hover:bg-white/50 dark:hover:bg-gray-700/50"
              aria-label="Novo Lucro"
            >
              <ProfitIcon />
            </Button>
            <Button
              onClick={() => { setShowExpenseModal(true); setShowActionButtons(false); }}
              size="icon"
              className="w-14 h-14 rounded-full bg-white/30 dark:bg-gray-800/40 backdrop-blur-md shadow-lg text-red-600 dark:text-red-400 hover:bg-white/50 dark:hover:bg-gray-700/50"
              aria-label="Nova Despesa"
            >
              <ExpenseIcon />
            </Button>
          </>
        )}
        <Button
          onClick={() => setShowActionButtons(!showActionButtons)}
          size="icon"
          className="w-16 h-16 rounded-full bg-gray-900 text-white shadow-xl hover:bg-black dark:bg-gray-700 dark:hover:bg-gray-600"
          aria-label="Adicionar Novo Item"
        >
          <PlusIcon />
        </Button>
      </div>

      {/* Modais de Formulário com Dialog ShadCN */}
      <Dialog open={showCategoryModal} onOpenChange={setShowCategoryModal}>
        <DialogContent className="bg-white/20 dark:bg-gray-800/30 backdrop-blur-md border border-white/30 dark:border-gray-700/50">
          <DialogHeader>
            <DialogTitle className="text-gray-900 dark:text-white">Criar Nova Categoria</DialogTitle>
          </DialogHeader>
          <CategoryForm
            onSuccess={handleCategorySuccess}
            onCancel={() => setShowCategoryModal(false)}
          />
        </DialogContent>
      </Dialog>

      <Dialog open={showProfitModal} onOpenChange={setShowProfitModal}>
        <DialogContent className="bg-white/20 dark:bg-gray-800/30 backdrop-blur-md border border-white/30 dark:border-gray-700/50">
          <DialogHeader>
            <DialogTitle className="text-gray-900 dark:text-white">Adicionar Novo Lucro</DialogTitle>
          </DialogHeader>
          <EntryForm
            onSuccess={handleEntrySuccess}
            onCancel={() => setShowProfitModal(false)}
            entryType="PROFIT"
          />
        </DialogContent>
      </Dialog>

      <Dialog open={showExpenseModal} onOpenChange={setShowExpenseModal}>
        <DialogContent className="bg-white/20 dark:bg-gray-800/30 backdrop-blur-md border border-white/30 dark:border-gray-700/50">
          <DialogHeader>
            <DialogTitle className="text-gray-900 dark:text-white">Adicionar Nova Despesa</DialogTitle>
          </DialogHeader>
          <EntryForm
            onSuccess={handleEntrySuccess}
            onCancel={() => setShowExpenseModal(false)}
            entryType="EXPENSE"
          />
        </DialogContent>
      </Dialog>
    </div>
  );
}