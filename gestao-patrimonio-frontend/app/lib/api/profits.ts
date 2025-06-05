import { EntryRequest, EntryResponse } from '../types';
import { fetchApi } from './client';

export const createProfit = async (data: EntryRequest): Promise<EntryResponse> => {
  return fetchApi('/profits', {
    method: 'POST',
    body: JSON.stringify(data),
  }) as Promise<EntryResponse>;
};

export const getAllProfits = async (): Promise<EntryResponse[]> => {
  return fetchApi('/profits', {
    method: 'GET',
  }) as Promise<EntryResponse[]>;
};

export const getProfitById = async (id: number): Promise<EntryResponse> => {
  return fetchApi(`/profits/${id}`, {
    method: 'GET',
  }) as Promise<EntryResponse>;
};

export const updateProfit = async (id: number, data: EntryRequest): Promise<EntryResponse> => {
  return fetchApi(`/profits/${id}`, {
    method: 'PUT',
    body: JSON.stringify(data),
  }) as Promise<EntryResponse>;
};

export const deleteProfit = async (id: number): Promise<void> => {
  return fetchApi(`/profits/${id}`, {
    method: 'DELETE',
  }) as Promise<void>;
};