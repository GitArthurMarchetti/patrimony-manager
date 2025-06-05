import { CategoryRequest, CategoryResponse } from '../types';
import { fetchApi } from './client';

export const createCategory = async (data: CategoryRequest): Promise<CategoryResponse> => {
  return fetchApi('/categories', {
    method: 'POST',
    body: JSON.stringify(data),
  }) as Promise<CategoryResponse>;
};

export const getAllCategories = async (): Promise<CategoryResponse[]> => {
  return fetchApi('/categories', {
    method: 'GET',
  }) as Promise<CategoryResponse[]>;
};

export const getCategoryById = async (id: number): Promise<CategoryResponse> => {
  return fetchApi(`/categories/${id}`, {
    method: 'GET',
  }) as Promise<CategoryResponse>;
};

export const updateCategory = async (id: number, data: CategoryRequest): Promise<CategoryResponse> => {
  return fetchApi(`/categories/${id}`, {
    method: 'PUT',
    body: JSON.stringify(data),
  }) as Promise<CategoryResponse>;
};

export const deleteCategory = async (id: number): Promise<void> => {
  return fetchApi(`/categories/${id}`, {
    method: 'DELETE',
  }) as Promise<void>;
};