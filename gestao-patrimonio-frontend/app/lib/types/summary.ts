import { CategoryResponse } from './categories';

 interface CategorySummaryResponse {
  categoryId: number;
  categoryName: string;
  categoryType: 'PROFIT' | 'EXPENSE';
  totalAmount: number;
}

export interface FinancialSummaryResponse {
  totalProfits: number;
  totalExpenses: number;
  netWorth: number;
  profitsByCategory: CategorySummaryResponse[];
  expensesByCategory: CategorySummaryResponse[];
  allCategories: CategoryResponse[]; // GARANTA QUE ESTE CAMPO ESTÁ AQUI
}