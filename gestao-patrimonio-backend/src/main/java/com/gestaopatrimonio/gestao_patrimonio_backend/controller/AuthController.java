package com.gestaopatrimonio.gestao_patrimonio_backend.controller;


import com.gestaopatrimonio.gestao_patrimonio_backend.dto.auth.AuthResponse;
import com.gestaopatrimonio.gestao_patrimonio_backend.dto.auth.LoginRequest;
import com.gestaopatrimonio.gestao_patrimonio_backend.dto.auth.RegisterRequest;
import com.gestaopatrimonio.gestao_patrimonio_backend.service.AuthService;
import lombok.RequiredArgsConstructor;
import org.apache.coyote.Response;
import org.springframework.http.HttpStatus;
import org.springframework.http.HttpStatusCode;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.AuthenticationException;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import jakarta.validation.Valid; // Para habilitar a validação dos DTOs

@RestController
@RequestMapping("/api/auth")
public class AuthController {

    private final AuthService authService;

    public AuthController(AuthService authService) {
        this.authService = authService;
    }

    @PostMapping("/register")
    public ResponseEntity<AuthResponse> register(@Valid @RequestBody RegisterRequest request){
        try {
            String jwt = authService.register(request.getUsername(),
                    request.getPassword());
            return ResponseEntity.ok(new AuthResponse(jwt));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().build();
        }
    }

    @PostMapping("/login")
    public ResponseEntity<AuthResponse> login(@Valid @RequestBody LoginRequest request){
        try{
            String jwt = authService.login(request.getUsername(),
                    request.getPassword());
            return ResponseEntity.ok(new AuthResponse(jwt));
        } catch (AuthenticationException e){
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
        }
    }

}
