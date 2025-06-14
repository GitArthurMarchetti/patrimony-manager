package com.gestaopatrimonio.gestao_patrimonio_backend.controller;

import com.gestaopatrimonio.gestao_patrimonio_backend.dto.category.CategoryRequest;
import com.gestaopatrimonio.gestao_patrimonio_backend.dto.category.CategoryResponse;
import com.gestaopatrimonio.gestao_patrimonio_backend.model.Category;
import com.gestaopatrimonio.gestao_patrimonio_backend.model.User; // NOVO IMPORT: Importar a entidade User
import com.gestaopatrimonio.gestao_patrimonio_backend.service.CategoryService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication; // NOVO IMPORT
import org.springframework.security.core.context.SecurityContextHolder; // NOVO IMPORT
import org.springframework.security.core.userdetails.UserDetails; // NOVO IMPORT
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/categories")
@RequiredArgsConstructor
public class CategoryController {

    private final CategoryService categoryService;

    private Long getAuthenticatedUserId() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        if (authentication != null && authentication.getPrincipal() instanceof UserDetails userDetails) {
            if (userDetails instanceof User user) {
                return user.getId();
            }
        }
        throw new IllegalStateException("User not authenticated or ID not available.");
    }

    private CategoryResponse mapToResponse(Category category){
        return new CategoryResponse(
                category.getId(),
                category.getName(),
                category.getType()
        );
    }

    @PostMapping
    public ResponseEntity<CategoryResponse> createCategory(
            @Valid
            @RequestBody
            CategoryRequest request){
        try{
            Long userId = getAuthenticatedUserId(); // Obtém o ID do usuário
            CategoryResponse savedCategory = categoryService.createCategory(request, userId); // PASSA O userId
            return ResponseEntity.status(HttpStatus.CREATED).body(savedCategory);
        } catch (IllegalArgumentException e){
            return ResponseEntity.badRequest().build();
        }
    }

    @GetMapping("/{id}")
    public ResponseEntity<CategoryResponse> getCategoryById(@PathVariable Long id){
        Long userId = getAuthenticatedUserId(); // Obtém o ID do usuário
        return categoryService.getCategoryByIdAndUser(id, userId) // CHAMA O MÉTODO COM userId
                .map(ResponseEntity::ok) // mapToResponse já está implícito no retorno do serviço
                .orElse(ResponseEntity.notFound().build());
    }

    @GetMapping
    public ResponseEntity<List<CategoryResponse>> getAllCategories(){
        Long userId = getAuthenticatedUserId(); // Obtém o ID do usuário
        List<CategoryResponse> categories = categoryService.getAllCategoriesByUserId(userId); // CHAMA O MÉTODO COM userId
        return ResponseEntity.ok(categories);
    }

    @PutMapping("/{id}")
    public ResponseEntity<CategoryResponse> updateCategory(
            @PathVariable Long id,
            @Valid @RequestBody CategoryRequest request
    ) {
        try{
            Long userId = getAuthenticatedUserId(); // Obtém o ID do usuário
            CategoryResponse update = categoryService.updateCategory(id, request, userId); // PASSA O userId
            return ResponseEntity.ok(update);
        }
        catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().build();
        }
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteCategory(@PathVariable Long id){
        try{
            Long userId = getAuthenticatedUserId(); // Obtém o ID do usuário
            categoryService.deleteCategory(id, userId); // PASSA O userId
            return ResponseEntity.noContent().build();
        }catch (IllegalArgumentException e){
            return ResponseEntity.badRequest().build();
        }
    }
}