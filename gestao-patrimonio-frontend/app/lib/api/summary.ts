import { FinancialSummaryResponse } from '../types';
import { fetchApi } from './client';

export const getFinancialSummary = async (): Promise<FinancialSummaryResponse> => {
  return fetchApi('/summary', {
    method: 'GET',
  }) as Promise<FinancialSummaryResponse>;
};