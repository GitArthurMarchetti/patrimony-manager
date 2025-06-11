package com.gestaopatrimonio.gestao_patrimonio_backend.repository;

import com.gestaopatrimonio.gestao_patrimonio_backend.model.Category;
import com.gestaopatrimonio.gestao_patrimonio_backend.model.User;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;
import java.util.Optional;

public interface CategoryRepository extends JpaRepository<Category, Long> {

    Optional<Category> findByNameAndUser(String name, User user);

    List<Category> findByUserOrderByNameAsc(User user);

}