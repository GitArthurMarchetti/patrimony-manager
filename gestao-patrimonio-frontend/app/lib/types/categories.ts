export interface CategorySummaryResponse {
  categoryId: number;
  categoryName: string;
  categoryType: 'PROFIT' | 'EXPENSE';
  totalAmount: number;
}

export interface CategoryRequest {
  name: string;
  type: 'PROFIT' | 'EXPENSE';
}

export interface CategoryResponse {
  id: number;
  name: string;
  type: 'PROFIT' | 'EXPENSE';
}