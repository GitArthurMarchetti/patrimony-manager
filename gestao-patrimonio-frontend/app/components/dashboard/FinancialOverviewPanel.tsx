// app/dashboard/components/dashboard/FinancialOverviewPanel.tsx
'use client';

import React, { useCallback, useEffect, useState } from 'react';
import { XIcon } from 'lucide-react';
import { FinancialSummaryResponse, EntryResponse } from '@/app/lib/types';
import { getAllProfits } from '@/app/lib/api/profits';
import { getAllExpenses } from '@/app/lib/api/expense';
import { useAuth } from '@/app/lib/auth-context';

interface FinancialOverviewPanelProps {
    summary: FinancialSummaryResponse | null;
    onClose: () => void;
}

export default function FinancialOverviewPanel({ summary, onClose }: FinancialOverviewPanelProps) {
    const { token } = useAuth();
    const [allEntries, setAllEntries] = useState<EntryResponse[]>([]);
    const [dataLoading, setDataLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const fetchAllEntries = useCallback(async () => {
        if (!token) {
            setError('Authentication token is missing.');
            setDataLoading(false);
            return;
        }
        setDataLoading(true);
        try {
            const profits = await getAllProfits();
            const expenses = await getAllExpenses();

            const combinedEntries = [
                ...profits,
                ...expenses
            ].sort((a, b) => {
                const dateA = new Date(a.date);
                const dateB = new Date(b.date);
                return dateB.getTime() - dateA.getTime(); 
            });

            setAllEntries(combinedEntries);
        } catch (err: unknown) {
            console.error("Failed to fetch all entries:", err);
            setError(err instanceof Error ? err.message : 'Failed to load all financial entries.');
        } finally {
            setDataLoading(false);
        }
    }, [token]); 

    useEffect(() => {
        fetchAllEntries();
    }, [fetchAllEntries]); 

    if (dataLoading) {
        return (
            <div className="flex flex-col items-center justify-center h-full text-gray-800 dark:text-gray-200">
                Carregando todas as entradas...
            </div>
        );
    }

    if (error) {
        return (
            <div className="flex flex-col items-center justify-center h-full text-red-600 dark:text-red-400 p-4">
                Erro: {error}
            </div>
        );
    }

    if (!summary) {
        return (
            <div className="flex flex-col items-center justify-center h-full text-gray-600 dark:text-gray-400">
                Dados do sumário financeiro não disponíveis.
            </div>
        );
    }

    return (
        <div className="h-full flex flex-col p-4 rounded-lg  overflow-y-auto">
            <div className="w-full flex justify-between items-center mb-4 sticky top-0 bg-inherit pb-2 z-10">
                <h1 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-gray-100">Visão Geral Financeira</h1>
                <button onClick={onClose} className="text-gray-600 hover:text-gray-800 transition-colors dark:text-gray-400 dark:hover:text-gray-200">
                    <XIcon className="h-6 w-6" />
                </button>
            </div>

            <div className="mb-6 grid grid-cols-1 md:grid-cols-3 gap-4 text-center">
                <div className="p-4 bg-white dark:bg-gray-700 rounded-lg shadow-sm border border-gray-200 dark:border-gray-600">
                    <p className="text-sm text-gray-600 dark:text-gray-400">Patrimônio Líquido</p>
                    <p className="text-lg font-bold text-gray-900 dark:text-gray-100">${summary.netWorth.toFixed(2)}</p>
                </div>
                <div className="p-4 bg-white dark:bg-gray-700 rounded-lg shadow-sm border border-green-500 dark:border-green-400">
                    <p className="text-sm text-gray-600 dark:text-gray-400">Total de Lucros</p>
                    <p className="text-lg font-bold text-green-600 dark:text-green-400">${summary.totalProfits.toFixed(2)}</p>
                </div>
                <div className="p-4 bg-white dark:bg-gray-700 rounded-lg shadow-sm border border-red-500 dark:border-red-400">
                    <p className="text-sm text-gray-600 dark:text-gray-400">Total de Despesas</p>
                    <p className="text-lg font-bold text-red-600 dark:text-red-400">${summary.totalExpenses.toFixed(2)}</p>
                </div>
            </div>

            <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100 mb-4">Histórico Completo</h2>

            {allEntries.length === 0 ? (
                <p className="text-base text-gray-600 dark:text-gray-400 mt-4 text-center">Nenhuma entrada encontrada.</p>
            ) : (
                <div className="flex-1 overflow-y-auto mt-2 space-y-3">
                    {allEntries.map((entry) => {
                        const isProfit = entry.category.type === 'PROFIT';
                        const itemBorderColorClass = isProfit ? 'border-green-500 dark:border-green-400' : 'border-red-500 dark:border-red-400';
                        const itemTextColorClass = isProfit ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400';

                        const uniqueKey = `${entry.category.type}_${entry.id}`;

                        return (
                            <div
                                key={uniqueKey} 
                                className={`p-3 bg-white dark:bg-gray-700 rounded-lg shadow-sm border-2 ${itemBorderColorClass} flex justify-between items-center`}
                            >
                                <div>
                                    <p className="text-sm text-gray-800 dark:text-gray-200 font-semibold">{entry.description}</p>
                                    <p className="text-xs text-gray-600 dark:text-gray-400">
                                        Categoria: {entry.category.name} {/* <--- NOME DA CATEGORIA CORRIGIDO AQUI */}
                                    </p>
                                    <p className="text-xs text-gray-600 dark:text-gray-400">Data: {entry.date}</p>
                                </div>
                                <p className={`text-base font-bold ${itemTextColorClass}`}>${entry.amount.toFixed(2)}</p>
                            </div>
                        );
                    })}
                </div>
            )}
        </div>
    );
}