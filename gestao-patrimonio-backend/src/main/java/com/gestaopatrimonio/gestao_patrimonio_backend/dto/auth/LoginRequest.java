package com.gestaopatrimonio.gestao_patrimonio_backend.dto.auth;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;

@Data
public class LoginRequest {
    @NotBlank(message = "The User name is necessarily")
    private String username;

    @NotBlank(message = "The User password is necessarily.")
    private String password;
}