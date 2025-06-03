package com.gestaopatrimonio.gestao_patrimonio_backend.service;

import com.gestaopatrimonio.gestao_patrimonio_backend.model.*;
import com.gestaopatrimonio.gestao_patrimonio_backend.repository.*;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

@Service
public class ExpenseEntryService {

    private final ExpenseEntryRepository expenseEntryRepository;
    private final UserRepository userRepository;
    private final CategoryRepository categoryRepository;

    public ExpenseEntryService(ExpenseEntryRepository expenseEntryRepository, UserRepository userRepository, CategoryRepository categoryRepository) {
        this.expenseEntryRepository = expenseEntryRepository;
        this.userRepository = userRepository;
        this.categoryRepository = categoryRepository;
    }

    @Transactional
    public ExpenseEntry createExpenseEntry(Long userId, Long categoryId, ExpenseEntry expenseEntry){
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new IllegalArgumentException("Usuário não encontrado com o ID: " + userId));
        Category category = categoryRepository.findById(categoryId)
                .orElseThrow(() -> new IllegalArgumentException("Categoria não encontrada com o ID: " + categoryId));

        expenseEntry.setUser(user);
        expenseEntry.setCategory(category);
        return expenseEntryRepository.save(expenseEntry);
    }

    public Optional<ExpenseEntry> getExpenseEntryByIdAndUser(Long id, Long userId) {
        return expenseEntryRepository.findById(id)
                .filter(entry -> entry.getUser().getId().equals(userId));
    }

    public List<ExpenseEntry> getAllExpenseEntriesByUser(Long userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new IllegalArgumentException("Usuário não encontrado com o ID: " + userId));
        return expenseEntryRepository.findByUserOrderByDateDesc(user);
    }

    @Transactional
    public ExpenseEntry updateExpenseEntry(Long id, Long userId, Long categoryId, ExpenseEntry updatedExpenseEntry) {
        ExpenseEntry existingEntry = expenseEntryRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Entrada de gasto não encontrada com o ID: " + id));

        if (!existingEntry.getUser().getId().equals(userId)) {
            throw new IllegalArgumentException("Entrada de gasto não pertence ao usuário.");
        }

        if (!existingEntry.getCategory().getId().equals(categoryId)) {
            Category newCategory = categoryRepository.findById(categoryId)
                    .orElseThrow(() -> new IllegalArgumentException("Nova categoria não encontrada com o ID: " + categoryId));
            existingEntry.setCategory(newCategory);
        }

        existingEntry.setDescription(updatedExpenseEntry.getDescription());
        existingEntry.setAmount(updatedExpenseEntry.getAmount());
        existingEntry.setDate(updatedExpenseEntry.getDate());

        return expenseEntryRepository.save(existingEntry);
    }

    @Transactional
    public void deleteExpenseEntry(Long id, Long userId) {
        ExpenseEntry existingEntry = expenseEntryRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Entrada de gasto não encontrada com o ID: " + id));

        if (!existingEntry.getUser().getId().equals(userId)) {
            throw new IllegalArgumentException("Entrada de gasto não pertence ao usuário.");
        }
        expenseEntryRepository.delete(existingEntry);
    }
}