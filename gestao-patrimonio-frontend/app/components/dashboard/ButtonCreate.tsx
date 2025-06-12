// components/ActionButtonsAndModals.tsx
'use client';

import React, { useState } from 'react';
// Removendo imports da Framer Motion
// import { motion, AnimatePresence } from 'framer-motion';
import { CategoryResponse, EntryResponse } from '@/app/lib/types';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import CategoryForm from '../common/CategoryForm';
import EntryForm from '../common/forms/EntryForm';

// Ícones React Icons
import { FaPlus, FaTag, FaMoneyBillWave, FaMinusCircle } from 'react-icons/fa';


interface ActionButtonsAndModalsProps {
    onCategorySuccess: (newCategory: CategoryResponse) => void;
    onEntrySuccess: (newEntry: EntryResponse) => void;
    fetchSummary: () => Promise<void>;
}

export default function ActionButtonsAndModals({
    onCategorySuccess,
    onEntrySuccess,
    fetchSummary,
}: ActionButtonsAndModalsProps) {
    const [showActionButtons, setShowActionButtons] = useState(false);
    const [showCategoryModal, setShowCategoryModal] = useState(false);
    const [showProfitModal, setShowProfitModal] = useState(false);
    const [showExpenseModal, setShowExpenseModal] = useState(false);

    const handleCategoryFormSuccess = (newCategory: CategoryResponse) => {
        setShowCategoryModal(false);
        setShowActionButtons(false);
        onCategorySuccess(newCategory);
        fetchSummary();
    };

    const handleEntryFormSuccess = (newEntry: EntryResponse) => {
        setShowProfitModal(false);
        setShowExpenseModal(false);
        setShowActionButtons(false);
        onEntrySuccess(newEntry);
        fetchSummary();
    };

    const iconSize = 24;
    const mainIconSize = 28;

    // Função auxiliar para classes de animação e atraso
    const getButtonAnimationClasses = (index: number) => {
        // Distância vertical para cada botão. 72px = altura do botão (56px) + space-y-4 (16px)
        const translateY = (index + 1) * 72;

        const baseClasses = `
      transition-all duration-300 ease-out transform
      ${showActionButtons ? 'opacity-100 scale-100' : 'opacity-0 scale-80'}
    `;

        // Adiciona atrasos com base no índice para o efeito cascata
        // Quando aparecendo: 0ms, 50ms, 100ms
        // Quando desaparecendo: 100ms, 50ms, 0ms (inverso)
        let delayClasses = '';
        if (showActionButtons) {
            if (index === 0) delayClasses = 'delay-0';
            if (index === 1) delayClasses = 'delay-50';
            if (index === 2) delayClasses = 'delay-100';
        } else {
            if (index === 0) delayClasses = 'delay-100';
            if (index === 1) delayClasses = 'delay-50';
            if (index === 2) delayClasses = 'delay-0';
        }

        return `
      ${baseClasses}
      ${showActionButtons ? `-translate-y-[${translateY}px]` : ''}
      ${delayClasses}
    `;
    };

    return (
        <div className="fixed bottom-8 right-8 z-40 flex flex-col items-end space-y-4">
            {/* Container dos botões secundários - Removendo AnimatePresence e motion.div */}
            <div className="flex flex-col items-end space-y-4">
                {/* Botão Nova Categoria */}
                <Button
                    onClick={() => { setShowCategoryModal(true); setShowActionButtons(false); }}
                    size="icon"
                    className={`w-14 h-14 rounded-full bg-white/30 dark:bg-gray-800/40 backdrop-blur-md shadow-lg text-gray-800 dark:text-gray-200 hover:bg-white/50 dark:hover:bg-gray-700/50 ${getButtonAnimationClasses(0)}`}
                    aria-label="Nova Categoria"
                    // Exibir/esconder o botão totalmente do DOM quando não estiver visível para evitar cliques indesejados
                    style={{ visibility: showActionButtons || showCategoryModal ? 'visible' : 'hidden' }}
                >
                    <FaTag size={iconSize} />
                </Button>
                {/* Botão Novo Lucro */}
                <Button
                    onClick={() => { setShowProfitModal(true); setShowActionButtons(false); }}
                    size="icon"
                    className={`w-14 h-14 rounded-full bg-white/30 dark:bg-gray-800/40 backdrop-blur-md shadow-lg text-green-600 dark:text-green-400 hover:bg-white/50 dark:hover:bg-gray-700/50 ${getButtonAnimationClasses(1)}`}
                    aria-label="Novo Lucro"
                    style={{ visibility: showActionButtons || showProfitModal ? 'visible' : 'hidden' }}
                >
                    <FaMoneyBillWave size={iconSize} />
                </Button>
                {/* Botão Nova Despesa */}
                <Button
                    onClick={() => { setShowExpenseModal(true); setShowActionButtons(false); }}
                    size="icon"
                    className={`w-14 h-14 rounded-full bg-white/30 dark:bg-gray-800/40 backdrop-blur-md shadow-lg text-red-600 dark:text-red-400 hover:bg-white/50 dark:hover:bg-gray-700/50 ${getButtonAnimationClasses(2)}`}
                    aria-label="Nova Despesa"
                    style={{ visibility: showActionButtons || showExpenseModal ? 'visible' : 'hidden' }}
                >
                    <FaMinusCircle size={iconSize} />
                </Button>
            </div>

            <Button
                onClick={() => setShowActionButtons(!showActionButtons)}
                size="icon"
                className="w-16 h-16 rounded-full bg-gray-900 text-white shadow-xl hover:bg-black dark:bg-gray-700 dark:hover:bg-gray-600"
                aria-label="Adicionar Novo Item"
            >
                <FaPlus size={mainIconSize} />
            </Button>

            {/* Modais de Formulário com Dialog ShadCN (inalterados) */}
            <Dialog open={showCategoryModal} onOpenChange={setShowCategoryModal}>
                <DialogContent className="bg-white border border-white/30 dark:border-gray-700/50">
                    <DialogHeader>
                        <DialogTitle className="text-gray-900 dark:text-white">Criar Nova Categoria</DialogTitle>
                    </DialogHeader>
                    <CategoryForm
                        onSuccess={handleCategoryFormSuccess}
                        onCancel={() => setShowCategoryModal(false)}
                    />
                </DialogContent>
            </Dialog>

            <Dialog open={showProfitModal} onOpenChange={setShowProfitModal}>
                <DialogContent className="bg-white border border-white/30 dark:border-gray-700/50">
                    <DialogHeader>
                        <DialogTitle className="text-gray-900 dark:text-white">Adicionar Novo Lucro</DialogTitle>
                    </DialogHeader>
                    <EntryForm
                        onSuccess={handleEntryFormSuccess}
                        onCancel={() => setShowProfitModal(false)}
                        entryType="PROFIT"
                    />
                </DialogContent>
            </Dialog>

            <Dialog open={showExpenseModal} onOpenChange={setShowExpenseModal}>
                <DialogContent className="bg-white border border-white/30 dark:border-gray-700/50">
                    <DialogHeader>
                        <DialogTitle className="text-gray-900 dark:text-white">Adicionar Nova Despesa</DialogTitle>
                    </DialogHeader>
                    <EntryForm
                        onSuccess={handleEntryFormSuccess}
                        onCancel={() => setShowExpenseModal(false)}
                        entryType="EXPENSE"
                    />
                </DialogContent>
            </Dialog>
        </div>
    );
}