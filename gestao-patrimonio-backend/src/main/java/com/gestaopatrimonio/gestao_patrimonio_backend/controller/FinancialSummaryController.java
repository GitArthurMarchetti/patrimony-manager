package com.gestaopatrimonio.gestao_patrimonio_backend.controller;


import com.gestaopatrimonio.gestao_patrimonio_backend.dto.summary.FinancialSummaryResponse;
import com.gestaopatrimonio.gestao_patrimonio_backend.model.ExpenseEntry;
import com.gestaopatrimonio.gestao_patrimonio_backend.model.ProfitEntry;
import com.gestaopatrimonio.gestao_patrimonio_backend.model.User;
import com.gestaopatrimonio.gestao_patrimonio_backend.service.ExpenseEntryService;
import com.gestaopatrimonio.gestao_patrimonio_backend.service.ProfitEntryService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.math.BigDecimal;
import java.util.List;

@RestController
@RequestMapping("/api/summary")
@RequiredArgsConstructor
public class FinancialSummaryController {

private final ProfitEntryService profitEntryService;
private  final ExpenseEntryService expenseEntryService;

    private Long getAuthenticatedUserId() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        if (authentication != null && authentication.getPrincipal() instanceof UserDetails userDetails) {
            if (userDetails instanceof User user) {
                return user.getId();
            }
        }
        throw new IllegalStateException("User not authenticated or ID not available.");
    }

    @GetMapping
    public ResponseEntity<FinancialSummaryResponse> getFinancialSummary() {
        Long userId = getAuthenticatedUserId();

        List<ProfitEntry> profits = profitEntryService.getAllProfitEntriesByUser(userId);
        List<ExpenseEntry> expenses = expenseEntryService.getAllExpenseEntriesByUser(userId);

        BigDecimal totalProfits = profits.stream()
                .map(ProfitEntry::getAmount)
                .reduce(BigDecimal.ZERO, BigDecimal::add);

        BigDecimal totalExpenses = expenses.stream()
                .map(ExpenseEntry::getAmount)
                .reduce(BigDecimal.ZERO, BigDecimal::add);

        BigDecimal netWorth = totalProfits.subtract(totalExpenses);

        FinancialSummaryResponse summary = new FinancialSummaryResponse(totalProfits, totalExpenses, netWorth);
        return ResponseEntity.ok(summary);
    }

}
