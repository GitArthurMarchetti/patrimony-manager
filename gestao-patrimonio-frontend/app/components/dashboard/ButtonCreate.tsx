// components/ActionButtonsAndModals.tsx
'use client';

import React, { useState } from 'react';
import { CategoryResponse, EntryResponse } from '@/app/lib/types';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import CategoryForm from '../common/CategoryForm';
import EntryForm from '../common/forms/EntryForm';

// React Icons
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

    const getButtonAnimationClasses = (index: number) => {
        const translateY = (index + 1) * 72;

        const baseClasses = `
      transition-all duration-300 ease-out transform
      ${showActionButtons ? 'opacity-100 scale-100' : 'opacity-0 scale-80'}
    `;

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
            {/* Container for secondary buttons */}
            <div className="flex flex-col items-end space-y-4">
                {/* New Category Button */}
                <Button
                    onClick={() => { setShowCategoryModal(true); setShowActionButtons(false); }}
                    size="icon"
                    className={`w-14 h-14 rounded-full bg-white/30 dark:bg-gray-800/40 backdrop-blur-md shadow-lg text-gray-800 dark:text-gray-200 hover:bg-white/50 dark:hover:bg-gray-700/50 ${getButtonAnimationClasses(0)}`}
                    aria-label="New Category"
                    style={{ visibility: showActionButtons || showCategoryModal ? 'visible' : 'hidden' }}
                >
                    <FaTag size={iconSize} />
                </Button>
                {/* New Profit Button */}
                <Button
                    onClick={() => { setShowProfitModal(true); setShowActionButtons(false); }}
                    size="icon"
                    className={`w-14 h-14 rounded-full bg-white/30 dark:bg-gray-800/40 backdrop-blur-md shadow-lg text-green-600 dark:text-green-400 hover:bg-white/50 dark:hover:bg-gray-700/50 ${getButtonAnimationClasses(1)}`}
                    aria-label="New Profit"
                    style={{ visibility: showActionButtons || showProfitModal ? 'visible' : 'hidden' }}
                >
                    <FaMoneyBillWave size={iconSize} />
                </Button>
                {/* New Expense Button */}
                <Button
                    onClick={() => { setShowExpenseModal(true); setShowActionButtons(false); }}
                    size="icon"
                    className={`w-14 h-14 rounded-full bg-white/30 dark:bg-gray-800/40 backdrop-blur-md shadow-lg text-red-600 dark:text-red-400 hover:bg-white/50 dark:hover:bg-gray-700/50 ${getButtonAnimationClasses(2)}`}
                    aria-label="New Expense"
                    style={{ visibility: showActionButtons || showExpenseModal ? 'visible' : 'hidden' }}
                >
                    <FaMinusCircle size={iconSize} />
                </Button>
            </div>

            <Button
                onClick={() => setShowActionButtons(!showActionButtons)}
                size="icon"
                className="w-16 h-16 rounded-full bg-gray-900 text-white shadow-xl hover:bg-black dark:bg-gray-700 dark:hover:bg-gray-600"
                aria-label="Add New Item"
            >
                <FaPlus size={mainIconSize} />
            </Button>

            {/* Form Modals with ShadCN Dialog */}
            <Dialog open={showCategoryModal} onOpenChange={setShowCategoryModal}>
                <DialogContent className="bg-white border border-white/30 dark:border-gray-700/50">
                    <DialogHeader>
                        <DialogTitle className="text-gray-900 dark:text-white">Create New Category</DialogTitle>
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
                        <DialogTitle className="text-gray-900 dark:text-white">Add New Profit</DialogTitle>
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
                        <DialogTitle className="text-gray-900 dark:text-white">Add New Expense</DialogTitle>
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