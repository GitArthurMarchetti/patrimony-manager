// app/dashboard/components/dashboard/EntryForm.tsx
'use client';

import { getAllCategories } from '@/app/lib/api/categories';
import { createExpense } from '@/app/lib/api/expense';
import { createProfit } from '@/app/lib/api/profits';
import { useAuth } from '@/app/lib/auth-context';
import { CategoryResponse, EntryRequest, EntryResponse } from '@/app/lib/types';
import React, { useState, useEffect, useCallback } from 'react';

// Import Shadcn/ui components
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';

interface EntryFormProps {
    onSuccess: (entry: EntryResponse) => void;
    onCancel: () => void;
    entryType: 'PROFIT' | 'EXPENSE';
}

export default function EntryForm({ onSuccess, onCancel, entryType }: EntryFormProps) {
    const { token, loading: authLoading } = useAuth();
    const [description, setDescription] = useState('');
    const [amountDisplay, setAmountDisplay] = useState('0,00'); // State for what the user sees
    const [amountCents, setAmountCents] = useState(0); // State for the amount in cents (number)
    const [date, setDate] = useState('');
    const [selectedCategoryId, setSelectedCategoryId] = useState<number | ''>('');
    const [categories, setCategories] = useState<CategoryResponse[]>([]);
    const [loading, setLoading] = useState(false);
    const [formError, setFormError] = useState<string | null>(null);
    const [categoriesLoading, setCategoriesLoading] = useState(true);

    const fetchCategories = useCallback(async () => {
        if (!token) {
            setFormError('Authentication token missing for categories. Please log in again.');
            setCategoriesLoading(false);
            return;
        }
        try {
            const fetchedCategories = await getAllCategories();
            const filteredCategories = fetchedCategories.filter(cat => cat.type === entryType);
            setCategories(filteredCategories);
            if (filteredCategories.length > 0) {
                setSelectedCategoryId(filteredCategories[0].id);
            } else {
                setSelectedCategoryId(''); // No category available
            }
        } catch (err: unknown) {
            setFormError((err instanceof Error ? err.message : 'Failed to load categories.'));
        } finally {
            setCategoriesLoading(false);
        }
    }, [token, entryType]);

    useEffect(() => {
        if (token) {
            fetchCategories();
        }
    }, [token, fetchCategories]);

    const formatCurrencyInput = (valueInCents: number): string => {
        if (isNaN(valueInCents) || valueInCents === 0) return '0,00';

        let stringValue = valueInCents.toString();
        if (stringValue.length < 3) {
            stringValue = stringValue.padStart(3, '0');
        }

        const integerPart = stringValue.substring(0, stringValue.length - 2);
        const decimalPart = stringValue.substring(stringValue.length - 2);

        const formattedIntegerPart = integerPart.replace(/\B(?=(\d{3})+(?!\d))/g, '.');

        return `${formattedIntegerPart},${decimalPart}`;
    };

    const handleAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const inputValue = e.target.value;
        const digitsOnly = inputValue.replace(/\D/g, '');
        const cents = parseInt(digitsOnly || '0', 10);

        const formattedDisplay = formatCurrencyInput(cents);

        setAmountDisplay(formattedDisplay);
        setAmountCents(cents);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setFormError(null);
        setLoading(true);

        if (!token) {
            setFormError('Authentication token missing. Please log in again.');
            setLoading(false);
            return;
        }
        if (!selectedCategoryId) {
            setFormError(`Please select a ${entryType.toLowerCase()} category.`);
            setLoading(false);
            return;
        }

        const amountForApi = amountCents / 100;

        if (isNaN(amountForApi) || amountForApi <= 0) {
            setFormError('Amount must be a positive number.');
            setLoading(false);
            return;
        }

        const newEntry: EntryRequest = {
            description,
            amount: amountForApi,
            date,
            categoryId: selectedCategoryId as number,
        };

        try {
            let createdEntry: EntryResponse;
            if (entryType === 'PROFIT') {
                createdEntry = await createProfit(newEntry);
            } else {
                createdEntry = await createExpense(newEntry);
            }
            onSuccess(createdEntry);
            // Clear form after success
            setDescription('');
            setAmountDisplay('0,00');
            setAmountCents(0);
            setDate('');
            // Keep selected category or reset if desired
            if (categories.length > 0) {
                setSelectedCategoryId(categories[0].id);
            } else {
                setSelectedCategoryId('');
            }
        } catch (err: unknown) {
            setFormError((err instanceof Error ? err.message : `Failed to create ${entryType.toLowerCase()} entry.`));
        } finally {
            setLoading(false);
        }
    };

    const isFormDisabled = loading || authLoading || categoriesLoading;

    return (
        <form onSubmit={handleSubmit} className="space-y-5">
            <div className="grid gap-2">
                <Label htmlFor="description">Description</Label> 
                <Input
                    id="description"
                    type="text"
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    required
                    disabled={isFormDisabled}
                    placeholder="Ex: Salary payment, Electricity bill" 
                />
            </div>

            <div className="grid gap-2">
                <Label htmlFor="amount">Amount</Label> 
                <Input
                    id="amount"
                    type="text"
                    inputMode="numeric"
                    value={amountDisplay}
                    onChange={handleAmountChange}
                    placeholder="0,00"
                    required
                    disabled={isFormDisabled}
                />
            </div>

            <div className="grid gap-2">
                <Label htmlFor="date">Date</Label> 
                <Input
                    id="date"
                    type="date"
                    value={date}
                    onChange={(e) => setDate(e.target.value)}
                    required
                    disabled={isFormDisabled}
                />
            </div>

            <div className="grid gap-2">
                <Label htmlFor="categoryId">Category</Label> 
                {categoriesLoading ? (
                    <p className="text-gray-500 dark:text-gray-400">Loading categories...</p> 
                ) : categories.length === 0 ? (
                    <p className="text-red-500 dark:text-red-400">No {entryType.toLowerCase()} category found. Please create one first.</p> 
                ) : (
                    <Select onValueChange={(value) => setSelectedCategoryId(Number(value))} value={String(selectedCategoryId)} disabled={isFormDisabled}>
                        <SelectTrigger id="categoryId">
                            <SelectValue placeholder="Select category" /> 
                        </SelectTrigger>
                        <SelectContent>
                            {categories.map((cat) => (
                                <SelectItem key={cat.id} value={String(cat.id)}>
                                    {cat.name}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                )}
            </div>

            {formError && <p className="text-red-500 dark:text-red-400 text-sm">{formError}</p>}
            
            <div className="flex justify-end gap-3 pt-4">
                <Button
                    type="button"
                    variant="outline"
                    onClick={onCancel}
                    disabled={isFormDisabled}
                >
                    Cancel 
                </Button>
                <Button
                    type="submit"
                    disabled={isFormDisabled || categories.length === 0}
                >
                    {loading ? 'Saving...' : `Save ${entryType === 'PROFIT' ? 'Profit' : 'Expense'}`} 
                </Button>
            </div>
        </form>
    );
}