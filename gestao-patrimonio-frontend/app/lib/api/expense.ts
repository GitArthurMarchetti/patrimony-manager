import { EntryRequest, EntryResponse } from '../types';
import { fetchApi } from './client';


export const createExpense = async (data: EntryRequest): Promise<EntryResponse> => {
  return fetchApi('/expenses', {
    method: 'POST',
    body: JSON.stringify(data),
  }) as Promise<EntryResponse>;
};

export const getAllExpenses = async (): Promise<EntryResponse[]> => {
  return fetchApi('/expenses', {
    method: 'GET',
  }) as Promise<EntryResponse[]>;
};

export const getExpenseById = async (id: number): Promise<EntryResponse> => {
  return fetchApi(`/expenses/${id}`, {
    method: 'GET',
  }) as Promise<EntryResponse>;
};

export const updateExpense = async (id: number, data: EntryRequest): Promise<EntryResponse> => {
  return fetchApi(`/expenses/${id}`, {
    method: 'PUT',
    body: JSON.stringify(data),
  }) as Promise<EntryResponse>;
};

export const deleteExpense = async (id: number): Promise<void> => {
  return fetchApi(`/expenses/${id}`, {
    method: 'DELETE',
  }) as Promise<void>;
};