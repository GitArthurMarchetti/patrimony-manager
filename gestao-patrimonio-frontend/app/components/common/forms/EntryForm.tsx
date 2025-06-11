'use client';

import { getAllCategories } from '@/app/lib/api/categories';
import { createExpense } from '@/app/lib/api/expense';
import { createProfit } from '@/app/lib/api/profits';
import { useAuth } from '@/app/lib/auth-context';
import { CategoryResponse, EntryRequest, EntryResponse } from '@/app/lib/types';
import React, { useState, useEffect } from 'react';



interface EntryFormProps {
    onSuccess: (entry: EntryResponse) => void;
    onCancel: () => void;
    entryType: 'PROFIT' | 'EXPENSE';
    // initialData?: EntryResponse;
}

export default function EntryForm({ onSuccess, onCancel, entryType }: EntryFormProps) {
    const { token, loading: authLoading } = useAuth();
    const [description, setDescription] = useState('');
    const [amountDisplay, setAmountDisplay] = useState('0,00'); // Estado para o que o usuário vê
    const [amountCents, setAmountCents] = useState(0); // Estado para o valor em centavos (número)
    const [date, setDate] = useState('');
    const [selectedCategoryId, setSelectedCategoryId] = useState<number | ''>('');
    const [categories, setCategories] = useState<CategoryResponse[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [categoriesLoading, setCategoriesLoading] = useState(true);

    useEffect(() => {
        const fetchCategories = async () => {
            if (!token) {
                setError('Authentication token missing for categories. Please log in again.');
                setCategoriesLoading(false);
                return;
            }
            try {
                const fetchedCategories = await getAllCategories();
                const filteredCategories = fetchedCategories.filter(cat => cat.type === entryType);
                setCategories(filteredCategories);
                if (filteredCategories.length > 0) {
                    setSelectedCategoryId(filteredCategories[0].id);
                }
            } catch (err: unknown) {
                setError((err instanceof Error ? err.message : 'Failed to load categories.'));
            } finally {
                setCategoriesLoading(false);
            }
        };

        if (token) {
            fetchCategories();
        }
    }, [token, entryType]);

    // Fora do componente EntryForm
    const formatCurrencyInput = (valueInCents: number): string => {
        if (isNaN(valueInCents) || valueInCents === 0) return '0,00';

        // Converte centavos para string e preenche com zeros à esquerda se necessário
        let stringValue = valueInCents.toString();

        // Garante que há pelo menos 3 dígitos para formatar (ex: 1 -> 001)
        if (stringValue.length < 3) {
            stringValue = stringValue.padStart(3, '0');
        }

        // Insere a vírgula 2 posições antes do final
        const integerPart = stringValue.substring(0, stringValue.length - 2);
        const decimalPart = stringValue.substring(stringValue.length - 2);

        // Adiciona separador de milhares (pontos) se necessário
        const formattedIntegerPart = integerPart.replace(/\B(?=(\d{3})+(?!\d))/g, '.');

        return `${formattedIntegerPart},${decimalPart}`;
    };

    // Handler para formatar o input do valor monetário com a máscara
    const handleAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const inputValue = e.target.value;

        // Remove tudo que não for dígito do valor de entrada (incluindo vírgulas e pontos)
        const digitsOnly = inputValue.replace(/\D/g, '');

        // Converte a string de dígitos para um número inteiro (representando centavos)
        const cents = parseInt(digitsOnly || '0', 10);

        // Formata o valor em centavos de volta para a string de moeda para exibição
        const formattedDisplay = formatCurrencyInput(cents);

        setAmountDisplay(formattedDisplay); // Atualiza o estado da exibição
        setAmountCents(cents); // Atualiza o estado interno em centavos
    };


    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);
        setLoading(true);

        // Validação de segurança para token e categoria
        if (!token) {
            setError('Authentication token missing. Please log in again.');
            setLoading(false);
            return;
        }
        if (!selectedCategoryId) {
            setError('Please select a category.');
            setLoading(false);
            return;
        }

        // Usar o valor em centavos convertido para o formato esperado pela API (reais com ponto)
        const amountForApi = amountCents / 100;

        if (isNaN(amountForApi) || amountForApi <= 0) {
            setError('Amount must be a positive number.');
            setLoading(false);
            return;
        }

        const newEntry: EntryRequest = {
            description,
            amount: amountForApi, // Usar o valor numérico para a API
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
            // Limpar formulário após sucesso (opcional)
            setDescription('');
            setAmountDisplay('0,00'); // Limpar a máscara
            setAmountCents(0); // Resetar centavos
            setDate('');
        } catch (err: unknown) {
            setError((err instanceof Error ? err.message : `Failed to create ${entryType.toLowerCase()} entry.`));
        } finally {
            setLoading(false);
        }
    };

    const isFormDisabled = loading || authLoading || categoriesLoading;

    return (
        <form onSubmit={handleSubmit} className="space-y-4">
            <div>
                <label htmlFor="description" className="block text-sm font-medium text-gray-700">
                    Description
                </label>
                <input
                    type="text"
                    id="description"
                    className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-gray-500 focus:border-gray-500 sm:text-sm"
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    required
                    disabled={isFormDisabled}
                />
            </div>
            <div>
                <label htmlFor="amount" className="block text-sm font-medium text-gray-700">
                    Amount
                </label>
                <input
                    type="text" // Mantém como type="text"
                    inputMode="numeric" // Sugere teclado numérico para mobile
                    id="amount"
                    className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-gray-500 focus:border-gray-500 sm:text-sm"
                    value={amountDisplay} // Exibe o valor formatado
                    onChange={handleAmountChange} // Usa o novo handler de máscara
                    placeholder="0,00"
                    required
                    disabled={isFormDisabled}
                />
            </div>
            <div>
                <label htmlFor="date" className="block text-sm font-medium text-gray-700">
                    Date
                </label>
                <input
                    type="date"
                    id="date"
                    className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-gray-500 focus:border-gray-500 sm:text-sm"
                    value={date}
                    onChange={(e) => setDate(e.target.value)}
                    required
                    disabled={isFormDisabled}
                />
            </div>
            <div>
                <label htmlFor="categoryId" className="block text-sm font-medium text-gray-700">
                    Category
                </label>
                {categoriesLoading ? (
                    <p className="mt-1 text-sm text-gray-500">Loading categories...</p>
                ) : categories.length === 0 ? (
                    <p className="mt-1 text-sm text-red-500">No {entryType.toLowerCase()} categories found. Please create one first.</p>
                ) : (
                    <select
                        id="categoryId"
                        className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-gray-500 focus:border-gray-500 sm:text-sm"
                        value={selectedCategoryId}
                        onChange={(e) => setSelectedCategoryId(Number(e.target.value))}
                        required
                        disabled={isFormDisabled}
                    >
                        {categories.map((cat) => (
                            <option key={cat.id} value={cat.id}>
                                {cat.name}
                            </option>
                        ))}
                    </select>
                )}
            </div>
            {error && <p className="text-red-500 text-sm">{error}</p>}
            <div className="flex justify-end space-x-2">
                <button
                    type="button"
                    onClick={onCancel}
                    className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-200 rounded-md hover:bg-gray-300"
                    disabled={isFormDisabled}
                >
                    Cancel
                </button>
                <button
                    type="submit"
                    className="px-4 py-2 text-sm font-medium text-white bg-gray-900 rounded-md hover:bg-black"
                    disabled={isFormDisabled || categories.length === 0}
                >
                    {loading ? 'Saving...' : `Save ${entryType === 'PROFIT' ? 'Profit' : 'Expense'}`}
                </button>
            </div>
        </form>
    );
}