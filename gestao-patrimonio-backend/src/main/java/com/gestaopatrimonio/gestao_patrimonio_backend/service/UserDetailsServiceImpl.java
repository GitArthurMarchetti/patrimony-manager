package com.gestaopatrimonio.gestao_patrimonio_backend.service;

import com.gestaopatrimonio.gestao_patrimonio_backend.model.User;

import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;


@Service
public class UserDetailsServiceImpl implements UserDetailsService {

    private final UserRepository userRepository;

    public UserDetailsServiceImpl(UserRepository userRepository){
        this.userRepository = userRepository;
    }

    @Override
    public UserDetails loadUserByUsername(String username) throws
            UsernameNotFoundException {
        // Busca o usuário no banco de dados
        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new UsernameNotFoundException("User Not Found: " + username));

        // Retorna o objeto User, que agora implementa UserDetails
        return user;
    }

}