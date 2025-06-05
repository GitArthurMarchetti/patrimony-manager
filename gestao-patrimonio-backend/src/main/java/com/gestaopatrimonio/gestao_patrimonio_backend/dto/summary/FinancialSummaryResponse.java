package com.gestaopatrimonio.gestao_patrimonio_backend.dto.summary;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class FinancialSummaryResponse {
    private BigDecimal totalProfits;
    private BigDecimal totalExpenses;
    private BigDecimal netWorth;
}
