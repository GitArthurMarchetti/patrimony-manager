package com.gestaopatrimonio.gestao_patrimonio_backend.service;

import com.gestaopatrimonio.gestao_patrimonio_backend.model.ProfitEntry;
import com.gestaopatrimonio.gestao_patrimonio_backend.model.User;
import com.gestaopatrimonio.gestao_patrimonio_backend.model.Category;
import com.gestaopatrimonio.gestao_patrimonio_backend.repository.ProfitEntryRepository;
import com.gestaopatrimonio.gestao_patrimonio_backend.repository.UserRepository;
import com.gestaopatrimonio.gestao_patrimonio_backend.repository.CategoryRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;
import java.util.Optional;
import java.util.Map;
import java.util.stream.Collectors;

import com.gestaopatrimonio.gestao_patrimonio_backend.dto.summary.CategorySummaryResponse; // Import do DTO

@Service
public class ProfitEntryService {

    private final ProfitEntryRepository profitEntryRepository;
    private final UserRepository userRepository;
    private final CategoryRepository categoryRepository;

    public ProfitEntryService(ProfitEntryRepository profitEntryRepository, UserRepository userRepository, CategoryRepository categoryRepository) {
        this.profitEntryRepository = profitEntryRepository;
        this.userRepository = userRepository;
        this.categoryRepository = categoryRepository;
    }

    @Transactional
    public ProfitEntry createProfitEntry(Long userId, Long categoryId, ProfitEntry profitEntry){
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new IllegalArgumentException("Usuário não encontrado com o ID: " + userId));
        Category category = categoryRepository.findById(categoryId)
                .orElseThrow(() -> new IllegalArgumentException("Categoria não encontrada com o ID: " + categoryId));

        profitEntry.setUser(user);
        profitEntry.setCategory(category);
        return profitEntryRepository.save(profitEntry);
    }

    public Optional<ProfitEntry> getProfitEntryByIdAndUser(Long id, Long userId) {
        return profitEntryRepository.findById(id)
                .filter(entry -> entry.getUser().getId().equals(userId));
    }

    public List<ProfitEntry> getAllProfitEntriesByUser(Long userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new IllegalArgumentException("Usuário não encontrado com o ID: " + userId));
        return profitEntryRepository.findByUserOrderByDateDesc(user);
    }

    public List<CategorySummaryResponse> getProfitsSummaryByCategoryAndUser(Long userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new IllegalArgumentException("Usuário não encontrado com o ID: " + userId));

        List<ProfitEntry> userProfits = profitEntryRepository.findByUserOrderByDateDesc(user);

        Map<Category, BigDecimal> profitsByCategoryMap = userProfits.stream()
                .collect(Collectors.groupingBy(
                        ProfitEntry::getCategory,
                        Collectors.reducing(BigDecimal.ZERO, ProfitEntry::getAmount, BigDecimal::add)
                ));

        return profitsByCategoryMap.entrySet().stream()
                .map(entry -> new CategorySummaryResponse(
                        entry.getKey().getId(),
                        entry.getKey().getName(),
                        entry.getKey().getType(),
                        entry.getValue()
                ))
                .collect(Collectors.toList());
    }

    /** NOVO MÉTODO: Obter lucros por ID de categoria e usuário **/
    public List<ProfitEntry> getProfitEntriesByCategoryIdAndUser(Long categoryId, Long userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new IllegalArgumentException("Usuário não encontrado com o ID: " + userId));
        Category category = categoryRepository.findById(categoryId)
                .orElseThrow(() -> new IllegalArgumentException("Categoria não encontrada com o ID: " + categoryId));

        return profitEntryRepository.findByUserAndCategoryOrderByDateDesc(user, category);
    }


    @Transactional
    public ProfitEntry updateProfitEntry(Long id, Long userId, Long categoryId, ProfitEntry updatedProfitEntry) {
        ProfitEntry existingEntry = profitEntryRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Entrada de lucro não encontrada com o ID: " + id));

        if (!existingEntry.getUser().getId().equals(userId)) {
            throw new IllegalArgumentException("Entrada de lucro não pertence ao usuário.");
        }

        if (!existingEntry.getCategory().getId().equals(categoryId)) {
            Category newCategory = categoryRepository.findById(categoryId)
                    .orElseThrow(() -> new IllegalArgumentException("Nova categoria não encontrada com o ID: " + categoryId));
            existingEntry.setCategory(newCategory);
        }

        existingEntry.setDescription(updatedProfitEntry.getDescription());
        existingEntry.setAmount(updatedProfitEntry.getAmount());
        existingEntry.setDate(updatedProfitEntry.getDate());

        return profitEntryRepository.save(existingEntry);
    }

    @Transactional
    public void deleteProfitEntry(Long id, Long userId) {
        ProfitEntry existingEntry = profitEntryRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Entrada de lucro não encontrada com o ID: " + id));

        if (!existingEntry.getUser().getId().equals(userId)) {
            throw new IllegalArgumentException("Entrada de lucro não pertence ao usuário.");
        }
        profitEntryRepository.delete(existingEntry);
    }
}