package com.gestaopatrimonio.gestao_patrimonio_backend.controller;


import com.gestaopatrimonio.gestao_patrimonio_backend.dto.category.CategoryRequest;
import com.gestaopatrimonio.gestao_patrimonio_backend.dto.category.CategoryResponse;
import com.gestaopatrimonio.gestao_patrimonio_backend.model.Category;
import com.gestaopatrimonio.gestao_patrimonio_backend.service.CategoryService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/categories")
@RequiredArgsConstructor
public class CategoryController {

    private final CategoryService categoryService;

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
            Category category = new Category(request.getName(), request.getType());
            Category savedCategory = categoryService.createCategory(category);
            return ResponseEntity.status(HttpStatus.CREATED).body(mapToResponse(savedCategory));
        } catch (IllegalArgumentException e){
            return ResponseEntity.badRequest().build();
        }
    }

    @GetMapping("/{id}")
    public ResponseEntity<CategoryResponse> getCategoryById(@PathVariable Long id){
        return categoryService.getCategoryById(id)
                .map(this::mapToResponse)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @GetMapping
    public ResponseEntity<List<CategoryResponse>> getAllCategories(){
        List<CategoryResponse> categories =
        categoryService.getAllCategories()
                .stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
        return ResponseEntity.ok(categories);
    }

    @PutMapping("/{id}")
    public ResponseEntity<CategoryResponse> updateCategory(
            @PathVariable Long id,
            @Valid @RequestBody CategoryRequest request
    ) {
        try{
            Category category = new Category(
                    request.getName(),
                    request.getType());
            Category update = categoryService.updateCategory(id, category);
            return ResponseEntity.ok(mapToResponse(update));
        }
        catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().build();
        }
    }


    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteCategory(@PathVariable Long id){
        try{
            categoryService.deleteCategory(id);
            return ResponseEntity.noContent().build();
        }catch (IllegalArgumentException e){
            return ResponseEntity.badRequest().build();
        }
    }
}
