package com.gestaopatrimonio.gestao_patrimonio_backend.controller;

import com.gestaopatrimonio.gestao_patrimonio_backend.dto.category.CategoryResponse;
import com.gestaopatrimonio.gestao_patrimonio_backend.dto.entry.EntryRequest;
import com.gestaopatrimonio.gestao_patrimonio_backend.dto.entry.EntryResponse;
import com.gestaopatrimonio.gestao_patrimonio_backend.model.ExpenseEntry;
import com.gestaopatrimonio.gestao_patrimonio_backend.model.User;
import com.gestaopatrimonio.gestao_patrimonio_backend.service.ExpenseEntryService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/expenses")
@RequiredArgsConstructor
public class ExpenseEntryController {

    private final ExpenseEntryService expenseEntryService;

    private EntryResponse mapToResponse(ExpenseEntry entry){
        CategoryResponse categoryResponse = new CategoryResponse(
                entry.getCategory().getId(),
                entry.getCategory().getName(),
                entry.getCategory().getType()
        );
        return new EntryResponse(
                entry.getId(),
                entry.getDescription(),
                entry.getAmount(),
                entry.getDate(),
                categoryResponse
        );
    }

    private Long getAuthenticatedUserId() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        if (authentication != null && authentication.getPrincipal() instanceof UserDetails userDetails) {
            if (userDetails instanceof User user) {
                return user.getId();
            }
        }
        throw new IllegalArgumentException("User not authenticated or ID not available.");
    }

    @PostMapping
    public ResponseEntity<EntryResponse> createExpenseEntry(@Valid @RequestBody EntryRequest request) {
        Long userId = getAuthenticatedUserId();
        ExpenseEntry expenseEntry = new ExpenseEntry();
        expenseEntry.setDescription(request.getDescription());
        expenseEntry.setAmount(request.getAmount());
        expenseEntry.setDate(request.getDate());

        try {
            ExpenseEntry savedEntry = expenseEntryService.createExpenseEntry(userId, request.getCategoryId(), expenseEntry);
            return ResponseEntity.status(HttpStatus.CREATED).body(mapToResponse(savedEntry));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(null);
        }
    }

    @GetMapping("/{id}")
    public ResponseEntity<EntryResponse> getExpenseEntryById(@PathVariable Long id) {
        Long userId = getAuthenticatedUserId();
        return expenseEntryService.getExpenseEntryByIdAndUser(id, userId)
                .map(this::mapToResponse)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @GetMapping
    public ResponseEntity<List<EntryResponse>> getAllExpenseEntries() {
        Long userId = getAuthenticatedUserId();
        List<EntryResponse> expenseEntries = expenseEntryService.getAllExpenseEntriesByUser(userId)
                .stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
        return ResponseEntity.ok(expenseEntries);
    }

    /** NOVO ENDPOINT: Obter histórico de gastos por ID de categoria **/
    @GetMapping("/byCategory/{categoryId}")
    public ResponseEntity<List<EntryResponse>> getExpensesByCategoryId(@PathVariable Long categoryId) {
        Long userId = getAuthenticatedUserId();
        List<ExpenseEntry> expenses = expenseEntryService.getExpenseEntriesByCategoryIdAndUser(categoryId, userId);
        List<EntryResponse> expenseDTOs = expenses.stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
        return ResponseEntity.ok(expenseDTOs);
    }

    @PutMapping("/{id}")
    public ResponseEntity<EntryResponse> updateExpenseEntry(
            @PathVariable Long id,
            @Valid @RequestBody EntryRequest request) {
        Long userId = getAuthenticatedUserId();
        ExpenseEntry expenseEntry = new ExpenseEntry();
        expenseEntry.setDescription(request.getDescription());
        expenseEntry.setAmount(request.getAmount());
        expenseEntry.setDate(request.getDate());

        try {
            ExpenseEntry updatedEntry = expenseEntryService.updateExpenseEntry(id, userId, request.getCategoryId(), expenseEntry);
            return ResponseEntity.ok(mapToResponse(updatedEntry));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().build();
        }
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteExpenseEntry(@PathVariable Long id) {
        Long userId = getAuthenticatedUserId();
        try {
            expenseEntryService.deleteExpenseEntry(id, userId);
            return ResponseEntity.noContent().build();
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().build();
        }
    }
}