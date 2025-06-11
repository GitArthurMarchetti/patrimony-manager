package com.gestaopatrimonio.gestao_patrimonio_backend.dto.summary;

import com.gestaopatrimonio.gestao_patrimonio_backend.dto.category.CategoryResponse;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.math.BigDecimal;
import java.util.List;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class FinancialSummaryResponse {
    private BigDecimal totalProfits;
    private BigDecimal totalExpenses;
    private BigDecimal netWorth;
    private List<CategorySummaryResponse> profitsByCategory;
    private List<CategorySummaryResponse> expensesByCategory;
    private List<CategoryResponse> allCategories; // NOVO CAMPO
}