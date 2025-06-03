package com.gestaopatrimonio.gestao_patrimonio_backend.dto.entry;


import com.gestaopatrimonio.gestao_patrimonio_backend.dto.category.CategoryResponse;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDate;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class EntryResponse {
    private Long id;
    private String description;
    private BigDecimal amount;
    private LocalDate date;
    private CategoryResponse category;
}