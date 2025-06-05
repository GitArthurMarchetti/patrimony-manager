package com.gestaopatrimonio.gestao_patrimonio_backend.dto.entry;

import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

import java.math.BigDecimal;
import java.time.LocalDate;

@Data
public class EntryRequest {
    @NotBlank(message = "The description is necessarily.")
    private String description;

    @NotNull(message = "The category value is necessarily.")
    @DecimalMin(value = "0.01", message = "Value might be over 0.")
    private BigDecimal amount;

    @NotNull(message = "The Category date is necessarily.")
    private LocalDate date;

    @NotNull(message = "The Category ID is necessarily.")
    private Long categoryId;
}