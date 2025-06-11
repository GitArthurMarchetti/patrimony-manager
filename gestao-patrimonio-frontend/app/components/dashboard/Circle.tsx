'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { CategoryResponse, CategorySummaryResponse } from '@/app/lib/types';

interface CircleVisualizationProps {
  netWorth: number;
  totalProfits: number; // Precisamos disso aqui agora
  totalExpenses: number; // Precisamos disso aqui agora
  profitsByCategory: CategorySummaryResponse[];
  expensesByCategory: CategorySummaryResponse[];
  allCategories: CategoryResponse[];
}

export default function CircleVisualization({
  netWorth = 0,
  totalProfits = 0, // Adicionado
  totalExpenses = 0, // Adicionado
  profitsByCategory = [],
  expensesByCategory = [],
  allCategories = [],
}: CircleVisualizationProps) {
  const router = useRouter();

  const mainCircleSizeBase = 150;
  const minCategoryCircleSize = 60;
  const maxCategoryCircleSize = 180;
  const netWorthScaleFactor = 0.01;
  const categoryScaleFactor = 0.005;
  const orbitRadiusMultiplier = 0.8;

  const finalNetWorthSize = Math.max(mainCircleSizeBase, Math.min(350, mainCircleSizeBase + Math.abs(netWorth) * netWorthScaleFactor));
  const orbitRadius = finalNetWorthSize * orbitRadiusMultiplier + 80;

  const categoryTotalsMap = new Map<number, { amount: number; type: 'PROFIT' | 'EXPENSE' }>();
  allCategories.forEach(cat => {
    const profitTotal = profitsByCategory.find(p => p.categoryId === cat.id)?.totalAmount || 0;
    const expenseTotal = expensesByCategory.find(e => e.categoryId === cat.id)?.totalAmount || 0;
    categoryTotalsMap.set(cat.id, { amount: cat.type === 'PROFIT' ? profitTotal : expenseTotal, type: cat.type });
  });

  const getCategoryCircleSize = (amount: number) => {
    return Math.max(minCategoryCircleSize, Math.min(maxCategoryCircleSize, minCategoryCircleSize + amount * categoryScaleFactor));
  };

  const getCategoryColorClass = (type: 'PROFIT' | 'EXPENSE') => {
    return type === 'PROFIT' ? 'bg-green-600/60 dark:bg-green-700/60' : 'bg-red-600/60 dark:bg-red-700/60';
  };

  const handleCategoryClick = (categoryId: number) => {
    router.push(`/dashboard/categories/${categoryId}`);
  };

  const numCircles = allCategories.length;
  const angleStep = numCircles > 0 ? (2 * Math.PI) / numCircles : 0;

  return (
    <div
      className="relative flex items-center justify-center rounded-full"
      style={{
        width: `${finalNetWorthSize + orbitRadius * 2}px`,
        height: `${finalNetWorthSize + orbitRadius * 2}px`,
        minWidth: '350px',
        minHeight: '350px',
        maxWidth: '650px',
        maxHeight: '650px',
      }}
    >
      {/* Círculo Central do Patrimônio Líquido com Resumo Financeiro */}
      <div
        className="absolute rounded-full flex flex-col items-center justify-center text-center font-extrabold shadow-2xl transition-all duration-500 ease-in-out backdrop-blur-md border border-white/40 dark:border-gray-700/50 p-4"
        style={{
          width: `${finalNetWorthSize}px`,
          height: `${finalNetWorthSize}px`,
          backgroundColor: netWorth >= 0 ? 'rgba(0, 0, 0, 0.7)' : 'rgba(220, 38, 38, 0.7)',
          color: 'white',
          zIndex: 10,
        }}
      >
        <span className="text-lg md:text-xl mb-1">Patrimônio Líquido:</span>
        <span className="p-2 text-2xl md:text-3xl">${netWorth.toFixed(2)}</span>
        <div className="mt-4 text-center text-sm md:text-base">
          <p className="text-green-300">Lucros: ${totalProfits.toFixed(2)}</p>
          <p className="text-red-300">Despesas: ${totalExpenses.toFixed(2)}</p>
        </div>
      </div>

      {/* Renderizar Círculos de Categoria */}
      {allCategories.map((category, index) => {
        const categoryData = categoryTotalsMap.get(category.id);
        const totalAmount = categoryData ? categoryData.amount : 0;
        const type = categoryData ? categoryData.type : 'PROFIT';

        const circleSize = getCategoryCircleSize(totalAmount);
        const angle = index * angleStep;

        const x = orbitRadius * Math.cos(angle);
        const y = orbitRadius * Math.sin(angle);

        return (
          <div
            key={category.id}
            className={`absolute rounded-full flex items-center justify-center text-center text-white text-xs sm:text-sm font-semibold shadow-xl transition-all duration-300 cursor-pointer backdrop-blur-sm border border-white/30 dark:border-gray-700/40 ${getCategoryColorClass(type)}`}
            style={{
              width: `${circleSize}px`,
              height: `${circleSize}px`,
              left: `calc(50% + ${x}px)`,
              top: `calc(50% + ${y}px)`,
              transform: 'translate(-50%, -50%)',
              zIndex: 5,
              opacity: totalAmount === 0 ? 0.5 : 1,
            }}
            onClick={() => handleCategoryClick(category.id)}
          >
            <span className="p-1 leading-tight overflow-hidden text-ellipsis whitespace-nowrap">{category.name}: ${totalAmount.toFixed(2)}</span>
          </div>
        );
      })}
    </div>
  );
}