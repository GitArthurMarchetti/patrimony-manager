'use client';

import React from 'react';

interface CircleVisualizationProps {
  netWorth?: number; // Agora é opcional, pode ser undefined
  totalProfits?: number;
  totalExpenses?: number;
}

export default function CircleVisualization({
  netWorth = 0, // Adiciona 0 como valor padrão se for undefined
  totalProfits = 0,
  totalExpenses = 0,
}: CircleVisualizationProps) {
  // Lógica simplificada para tamanhos dos círculos para visualização inicial
  const netWorthSize = Math.max(100, Math.min(300, Math.abs(netWorth) / 10));
  const profitSize = Math.max(50, Math.min(200, totalProfits / 10));
  const expenseSize = Math.max(50, Math.min(200, totalExpenses / 10));

  return (
    <div className="relative flex items-center justify-center w-full max-w-lg mx-auto my-8">
      <div
        className="absolute rounded-full flex items-center justify-center text-center text-white font-bold transition-all duration-300"
        style={{
          width: `${netWorthSize}px`,
          height: `${netWorthSize}px`,
          backgroundColor: netWorth >= 0 ? '#4CAF50' : '#F44336',
          zIndex: 10,
        }}
      >
        <span className="text-lg md:text-xl">Net Worth: ${netWorth.toFixed(2)}</span>
      </div>

      <div
        className="absolute rounded-full bg-blue-500 flex items-center justify-center text-white text-sm transition-all duration-300"
        style={{
          width: `${profitSize}px`,
          height: `${profitSize}px`,
          top: '10%',
          left: '10%',
          transform: 'translate(-50%, -50%)',
          zIndex: 5,
        }}
      >
        Profits: ${totalProfits.toFixed(2)}
      </div>

      <div
        className="absolute rounded-full bg-orange-500 flex items-center justify-center text-white text-sm transition-all duration-300"
        style={{
          width: `${expenseSize}px`,
          height: `${expenseSize}px`,
          bottom: '10%',
          right: '10%',
          transform: 'translate(50%, 50%)',
          zIndex: 5,
        }}
      >
        Expenses: ${totalExpenses.toFixed(2)}
      </div>
    </div>
  );
}