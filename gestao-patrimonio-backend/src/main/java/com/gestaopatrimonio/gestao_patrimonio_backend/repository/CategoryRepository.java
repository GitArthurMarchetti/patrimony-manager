package com.gestaopatrimonio.gestao_patrimonio_backend.repository;

import com.gestaopatrimonio.gestao_patrimonio_backend.model.Category;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface CategoryRepository extends JpaRepository<Category, Long> {

    Optional<Category> findByName(String name);
}
