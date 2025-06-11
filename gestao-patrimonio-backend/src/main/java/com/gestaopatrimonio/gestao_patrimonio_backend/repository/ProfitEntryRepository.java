package com.gestaopatrimonio.gestao_patrimonio_backend.repository;

import com.gestaopatrimonio.gestao_patrimonio_backend.model.ProfitEntry;
import com.gestaopatrimonio.gestao_patrimonio_backend.model.User;
import com.gestaopatrimonio.gestao_patrimonio_backend.model.Category; // NOVO IMPORT
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface ProfitEntryRepository extends JpaRepository<ProfitEntry, Long> {
    List<ProfitEntry> findByUserOrderByDateDesc(User user);
    List<ProfitEntry> findByUserAndCategoryOrderByDateDesc(User user, Category category);
}