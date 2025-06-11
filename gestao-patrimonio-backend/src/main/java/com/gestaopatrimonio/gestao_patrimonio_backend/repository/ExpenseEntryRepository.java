package com.gestaopatrimonio.gestao_patrimonio_backend.repository;

import com.gestaopatrimonio.gestao_patrimonio_backend.model.ExpenseEntry;
import com.gestaopatrimonio.gestao_patrimonio_backend.model.User;
import com.gestaopatrimonio.gestao_patrimonio_backend.model.Category; // NOVO IMPORT
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface ExpenseEntryRepository extends JpaRepository<ExpenseEntry, Long> {
    List<ExpenseEntry> findByUserOrderByDateDesc(User user);
    List<ExpenseEntry> findByUserAndCategoryOrderByDateDesc(User user, Category category);
}