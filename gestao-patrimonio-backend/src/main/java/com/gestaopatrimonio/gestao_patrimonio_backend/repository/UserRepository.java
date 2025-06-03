package com.gestaopatrimonio.gestao_patrimonio_backend.repository;

import com.gestaopatrimonio.gestao_patrimonio_backend.model.User;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface UserRepository extends JpaRepository<User, Long> {

    Optional<User> findByUsername(String username);
}
