package com.gestaopatrimonio.gestao_patrimonio_backend.dto.entry;

import lombok.Data;

import java.math.BigDecimal;
import java.time.LocalDate;

@Data
public class EntryRequest {

    private String description;

    private BigDecimal amount;

    private LocalDate date;

    private Long categoryId;
}