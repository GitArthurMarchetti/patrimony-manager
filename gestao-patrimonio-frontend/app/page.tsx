// app/dashboard/page.tsx
'use client';

import React, { useEffect, useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { Node, Edge } from 'vis-network/standalone';
import { CategoryResponse, EntryResponse, FinancialSummaryResponse } from './lib/types';
import { useAuth } from './lib/auth-context';
import { getFinancialSummary } from './lib/api/summary';
import GraphView from './components/GraphView';
import { Card, CardContent } from '@/components/ui/card';
import ActionButtonsAndModals from './components/dashboard/ButtonCreate';


export default function DashboardPage() {
  const { isAuthenticated, loading, token } = useAuth();
  const router = useRouter();
  const [summary, setSummary] = useState<FinancialSummaryResponse | null>(null);
  const [dataLoading, setDataLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

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

  const handleCategorySuccess = useCallback((newCategory: CategoryResponse) => {
    console.log("Category created successfully:", newCategory);
  }, []);

  const handleEntrySuccess = useCallback((newEntry: EntryResponse) => {
    console.log("Entry created successfully:", newEntry);
  }, []);

  // --- NOVA FUNÇÃO PARA CLICAR EM CATEGORIA ---
  const handleNodeClick = useCallback((nodeId: string | number) => {
    // Verifique se o nodeId é para uma categoria (já filtrado no GraphView, mas bom para segurança)
    if (typeof nodeId === 'string' && nodeId.startsWith('cat_')) {
      const categoryId = nodeId.replace('cat_', '');
      console.log(`Nó de categoria clicado: ${categoryId}`);
      router.push(`/dashboard/categories/${categoryId}`);
    } else if (nodeId === 'net_worth') {
        console.log("Nó central clicado (Patrimônio Líquido).");
        // Opcional: Adicionar lógica para o clique no nó central, se desejar
        // Por exemplo, router.push('/dashboard/overview');
    }
  }, [router]);
  // ------------------------------------------

  const calculateCenterNodeColor = useCallback((totalProfits: number, totalExpenses: number): string => {
    const total = totalProfits + totalExpenses;

    if (total === 0) {
      return '#ECF0F1';
    }

    const profitRatio = totalProfits / total;
    const expenseRatio = totalExpenses / total;

    const redColor = [231, 76, 60];
    const greenColor = [46, 204, 113];

    const r = Math.round(redColor[0] * expenseRatio + greenColor[0] * profitRatio);
    const g = Math.round(redColor[1] * expenseRatio + greenColor[1] * profitRatio);
    const b = Math.round(redColor[2] * expenseRatio + greenColor[2] * profitRatio);

    return `rgb(${r},${g},${b})`;
  }, []);


  const prepareGraphData = useCallback(() => {
    if (!summary) return { nodes: [], edges: [] };

    const nodes: Node[] = [];
    const edges: Edge[] = [];

    const centerNodeBackgroundColor = calculateCenterNodeColor(summary.totalProfits, summary.totalExpenses);

    // 1. Nó Central: Patrimônio Líquido
    nodes.push({
      id: 'net_worth',
      label: `Valor Líquido:\n$${summary.netWorth.toFixed(2)}`,
      shape: 'dot',
      size: 80,
      font: {
        color: '#2C3E50',
        size: 18,
        align: 'center',
        multi: true,
      },
      color: {
        background: centerNodeBackgroundColor,
        border: summary.netWorth >= 0 ? '#27AE60' : '#C0392B',
        highlight: {
          background: centerNodeBackgroundColor,
          border: summary.netWorth >= 0 ? '#2ECC71' : '#E74C3C',
        }
      },
      fixed: true,
      physics: false,
    });

    // 2. Nós de Categoria
    summary.allCategories.forEach(cat => {
      const profitAmount = summary.profitsByCategory.find(p => p.categoryId === cat.id)?.totalAmount || 0;
      const expenseAmount = summary.expensesByCategory.find(e => e.categoryId === cat.id)?.totalAmount || 0;
      const totalAmount = cat.type === 'PROFIT' ? profitAmount : expenseAmount;

      const categorySize = Math.max(30, Math.min(60, 30 + (totalAmount / (summary.totalProfits + summary.totalExpenses || 1)) * 100));

      nodes.push({
        id: `cat_${cat.id}`, // Garanta que o ID da categoria seja 'cat_ID_DA_CATEGORIA'
        label: `${cat.name}\n$${totalAmount.toFixed(2)}`,
        shape: 'dot',
        size: categorySize,
        font: {
          color: '#2C3E50',
          size: 12,
          align: 'center',
          multi: true,
        },
        color: {
          background: '#FFFFFF',
          border: cat.type === 'PROFIT' ? '#27AE60' : '#C0392B',
          highlight: {
            background: '#F0F0F0',
            border: cat.type === 'PROFIT' ? '#2ECC71' : '#E74C3C',
          }
        },
      });

      // 3. Arestas: Conectar categorias ao nó central
      edges.push({
        from: `cat_${cat.id}`,
        to: 'net_worth',
        color: {
          color: '#B0B0B0',
          highlight: '#7F8C8D',
          inherit: false,
        },
      });
    });

    return { nodes, edges };
  }, [summary, calculateCenterNodeColor]);

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
    <div className="h-screen flex flex-col items-center p-4 font-sans antialiased bg-gradient-to-br from-gray-100 to-gray-300 dark:from-gray-900 dark:to-black text-gray-900 dark:text-gray-100 relative overflow-hidden gap-y-8">

      <Card className="w-full max-w-4xl mx-auto flex-1 bg-white/20 dark:bg-gray-800/30 backdrop-blur-md shadow-lg border border-white/30 dark:border-gray-700/50">
        <CardContent className="p-0 h-full">
          <GraphView
            nodesData={nodes}
            edgesData={edges}
            onNodeClick={handleNodeClick} // <--- PASSANDO A FUNÇÃO AQUI!
          />
        </CardContent>
      </Card>

      {/* Componente encapsulado para botões de ação e modais */}
      <ActionButtonsAndModals
        onCategorySuccess={handleCategorySuccess}
        onEntrySuccess={handleEntrySuccess}
        fetchSummary={fetchSummary}
      />
    </div>
  );
}