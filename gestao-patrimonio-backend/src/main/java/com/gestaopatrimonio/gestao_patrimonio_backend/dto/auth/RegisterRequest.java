package com.gestaopatrimonio.gestao_patrimonio_backend.dto.auth;

import jakarta.validation.constraints.NotBlank; 
import jakarta.validation.constraints.Size;
import lombok.Data;

@Data
public class RegisterRequest {

    @NotBlank(message = "The User name is mandatory.")
    @Size(min = 3, max = 50, message = "Username must be between 3 and 50 characters long.")
    private String username;

    @NotBlank(message = "Password is mandatory")
    @Size(min = 6, message = "Password must be at least 6 characters long")
    private String password;
}