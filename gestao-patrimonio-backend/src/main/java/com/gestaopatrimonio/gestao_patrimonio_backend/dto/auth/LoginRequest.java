package com.gestaopatrimonio.gestao_patrimonio_backend.dto.auth;

import lombok.Data;

@Data
public class LoginRequest {

    private String username;
    private String password;
    
}

