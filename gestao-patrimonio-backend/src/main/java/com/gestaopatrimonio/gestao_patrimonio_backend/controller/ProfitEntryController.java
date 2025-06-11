package com.gestaopatrimonio.gestao_patrimonio_backend.controller;

import com.gestaopatrimonio.gestao_patrimonio_backend.dto.category.CategoryResponse;
import com.gestaopatrimonio.gestao_patrimonio_backend.dto.entry.EntryRequest;
import com.gestaopatrimonio.gestao_patrimonio_backend.dto.entry.EntryResponse;
import com.gestaopatrimonio.gestao_patrimonio_backend.model.ProfitEntry;
import com.gestaopatrimonio.gestao_patrimonio_backend.model.User;
import com.gestaopatrimonio.gestao_patrimonio_backend.service.ProfitEntryService;
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
@RequestMapping("/api/profits")
@RequiredArgsConstructor
public class ProfitEntryController {

    private final ProfitEntryService profitEntryService;

    private EntryResponse mapToResponse(ProfitEntry entry){
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

    private Long getAuthenticationUserId() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        if(authentication != null && authentication.getPrincipal() instanceof UserDetails userDetails){
            if(userDetails instanceof User user){
                return user.getId();
            }
        }
        throw new IllegalArgumentException("User not authenticated or ID not available.");
    }

    @PostMapping
    public ResponseEntity<EntryResponse> createProfitEntry(@Valid @RequestBody EntryRequest request){
        Long userId = getAuthenticationUserId();
        ProfitEntry profitEntry = new ProfitEntry();

        profitEntry.setDescription(request.getDescription());
        profitEntry.setAmount(request.getAmount());
        profitEntry.setDate(request.getDate());

        try {
            ProfitEntry savedEntry = profitEntryService.createProfitEntry(userId, request.getCategoryId(), profitEntry);
            return ResponseEntity.status(HttpStatus.CREATED).body(mapToResponse(savedEntry));
        } catch (IllegalArgumentException e){
            return ResponseEntity.badRequest().body(null);
        }
    }

    @GetMapping("/{id}")
    public ResponseEntity<EntryResponse> getProfitEntryById(@PathVariable Long id){
        Long userId = getAuthenticationUserId();
        return profitEntryService.getProfitEntryByIdAndUser(id, userId)
                .map(this::mapToResponse)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @GetMapping("/byCategory/{categoryId}")
    public ResponseEntity<List<EntryResponse>> getProfitsByCategoryId(@PathVariable Long categoryId) {
        Long userId = getAuthenticationUserId();
        List<ProfitEntry> profitEntries = profitEntryService.getProfitEntriesByCategoryIdAndUser(categoryId, userId);

        List<EntryResponse> responses = profitEntries.stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());

        return ResponseEntity.ok(responses);
    }

    @GetMapping
    public ResponseEntity<List<EntryResponse>> getAllProfitEntries(){
        Long userId = getAuthenticationUserId();
        List<EntryResponse> profitEntries = profitEntryService.getAllProfitEntriesByUser(userId)
                .stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
        return ResponseEntity.ok(profitEntries);
    }

    @PutMapping("/{id}")
    public ResponseEntity<EntryResponse> updateProfitEntry(
            @PathVariable Long id,
            @Valid @RequestBody EntryRequest request) {
        Long userId = getAuthenticationUserId();
        ProfitEntry profitEntry = new ProfitEntry();
        profitEntry.setDescription(request.getDescription());
        profitEntry.setAmount(request.getAmount());
        profitEntry.setDate(request.getDate());

        try {
            ProfitEntry updatedEntry = profitEntryService.updateProfitEntry(id, userId, request.getCategoryId(), profitEntry);
            return ResponseEntity.ok(mapToResponse(updatedEntry));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().build();
        }
    }

    @DeleteMapping("/{id}") // ADDED: delete method
    public ResponseEntity<Void> deleteProfitEntry(@PathVariable Long id) {
        Long userId = getAuthenticationUserId();
        try {
            profitEntryService.deleteProfitEntry(id, userId);
            return ResponseEntity.noContent().build();
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().build();
        }
    }
}