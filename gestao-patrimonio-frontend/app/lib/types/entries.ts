import { CategoryResponse } from './categories';

export interface EntryRequest {
  description: string;
  amount: number;
  date: string;
  categoryId: number;
}

export interface EntryResponse {
  id: number;
  description: string;
  amount: number;
  date: string;
  category: CategoryResponse;
}