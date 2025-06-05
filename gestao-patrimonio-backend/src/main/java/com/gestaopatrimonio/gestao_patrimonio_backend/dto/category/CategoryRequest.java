package com.gestaopatrimonio.gestao_patrimonio_backend.dto.category;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import lombok.Data;

@Data
public class CategoryRequest {
    @NotBlank(message = "The category name is necessarily")
    private String name;

    @NotBlank(message = "The category type is necessarily")
    @Pattern(regexp = "PROFIT|EXPENSE", message = "Type might be 'PROFIT' or 'EXPENSE'")
    private String type;
}