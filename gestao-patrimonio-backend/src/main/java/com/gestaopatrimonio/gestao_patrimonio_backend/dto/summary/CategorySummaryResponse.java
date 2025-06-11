package com.gestaopatrimonio.gestao_patrimonio_backend.dto.summary;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.math.BigDecimal;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class CategorySummaryResponse {
    private Long categoryId;
    private String categoryName;
    private String categoryType; // PROFIT ou EXPENSE
    private BigDecimal totalAmount;
}