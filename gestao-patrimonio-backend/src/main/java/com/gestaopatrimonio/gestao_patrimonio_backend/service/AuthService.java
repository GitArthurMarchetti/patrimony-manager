package com.gestaopatrimonio.gestao_patrimonio_backend.service;


import com.gestaopatrimonio.gestao_patrimonio_backend.model.User;
import com.gestaopatrimonio.gestao_patrimonio_backend.repository.UserRepository;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import org.springframework.security.core.AuthenticationException;

@Service
public class AuthService {


    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

    private final JwtService jwtService;
    private  final AuthenticationManager authenticationManager;

    public AuthService(UserRepository userRepository, PasswordEncoder passwordEncoder, JwtService jwtService, AuthenticationManager authenticationManager) {
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
        this.jwtService = jwtService;
        this.authenticationManager = authenticationManager;
    }

    public String register(String username, String password){
        if(userRepository.findByUsername(username).isPresent()) {
            throw new IllegalArgumentException("Username já existe: " + username);
        }

        User newUser = new User();


        newUser.setUsername(username);
        newUser.setPassword(passwordEncoder.encode(password));

        userRepository.save(newUser);

        return jwtService.generateToken(newUser);
    }

    public String login(String username, String password) throws AuthenticationException {
        authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(username, password)
        );

        User user = userRepository.findByUsername(username)
            .orElseThrow(() -> new IllegalArgumentException("Usuário não encontrado após autenticação."));

    return jwtService.generateToken(user);
    }

}