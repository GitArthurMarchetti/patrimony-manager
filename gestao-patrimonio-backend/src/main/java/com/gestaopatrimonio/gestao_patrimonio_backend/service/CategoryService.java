package com.gestaopatrimonio.gestao_patrimonio_backend.service;

import com.gestaopatrimonio.gestao_patrimonio_backend.dto.category.CategoryRequest;
import com.gestaopatrimonio.gestao_patrimonio_backend.dto.category.CategoryResponse;
import com.gestaopatrimonio.gestao_patrimonio_backend.model.Category;
import com.gestaopatrimonio.gestao_patrimonio_backend.model.User;
import com.gestaopatrimonio.gestao_patrimonio_backend.repository.CategoryRepository;
import com.gestaopatrimonio.gestao_patrimonio_backend.repository.UserRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
public class CategoryService {

    private final CategoryRepository categoryRepository;
    private final UserRepository userRepository; // NOVO CAMPO INJETADO

    public CategoryService(CategoryRepository categoryRepository, UserRepository userRepository) { // CONSTRUTOR ATUALIZADO
        this.categoryRepository = categoryRepository;
        this.userRepository = userRepository;
    }


    @Transactional
    public CategoryResponse createCategory(CategoryRequest request, Long userId){ // <--- NOVO PARÂMETRO userId
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new IllegalArgumentException("Usuário não encontrado com o ID: " + userId));

        if(categoryRepository.findByNameAndUser(request.getName(), user).isPresent()){ // <--- CORREÇÃO: findByNameAndUser
            throw new IllegalArgumentException("Categoria com o nome: " + request.getName() + ", já existe para este usuário.");
        }
        Category category = new Category(request.getName(), request.getType(), user); // <--- ATUALIZADO: Passa o objeto 'user'
        Category savedCategory = categoryRepository.save(category);
        return new CategoryResponse(savedCategory.getId(), savedCategory.getName(), savedCategory.getType());
    }


    public Optional<CategoryResponse> getCategoryByIdAndUser(Long id, Long userId){ // <--- NOVO PARÂMETRO userId
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new IllegalArgumentException("Usuário não encontrado com o ID: " + userId));

        return categoryRepository.findById(id)
                .filter(category -> category.getUser().getId().equals(userId)) // Garante que a categoria pertence ao usuário
                .map(category -> new CategoryResponse(category.getId(), category.getName(), category.getType())); // Converte para DTO
    }


    public List<CategoryResponse> getAllCategoriesByUserId(Long userId){ // <--- NOVO MÉTODO: getAllCategoriesByUserId
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new IllegalArgumentException("Usuário não encontrado com o ID: " + userId));

        return categoryRepository.findByUserOrderByNameAsc(user).stream() // <--- ATUALIZADO: Usa findByUserOrderByNameAsc
                .map(category -> new CategoryResponse(category.getId(), category.getName(), category.getType()))
                .collect(Collectors.toList());
    }
    @Transactional
    public CategoryResponse updateCategory(Long id, CategoryRequest request, Long userId){ // <--- NOVO PARÂMETRO userId
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new IllegalArgumentException("Usuário não encontrado com o ID: " + userId));

        Category existingCategory = categoryRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Categoria não encontrada com ID: " + id));

        if (!existingCategory.getUser().getId().equals(userId)) {
            throw new IllegalArgumentException("Categoria não pertence ao usuário.");
        }

        Optional<Category> categoryWithSameName = categoryRepository.findByNameAndUser(request.getName(), user);
        if (categoryWithSameName.isPresent() && !categoryWithSameName.get().getId().equals(id)) {
            throw new IllegalArgumentException("Já existe uma categoria com o nome '" + request.getName() + "' para este usuário.");
        }

        existingCategory.setName(request.getName());
        existingCategory.setType(request.getType());

        Category updated = categoryRepository.save(existingCategory);
        return new CategoryResponse(updated.getId(), updated.getName(), updated.getType());
    }

    @Transactional
    public void deleteCategory(Long id, Long userId){ // <--- NOVO PARÂMETRO userId
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new IllegalArgumentException("Usuário não encontrado com o ID: " + userId));

        Category existingCategory = categoryRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Categoria não encontrada com o ID: " + id));

        if (!existingCategory.getUser().getId().equals(userId)) {
            throw new IllegalArgumentException("Categoria não pertence ao usuário.");
        }
        categoryRepository.deleteById(id);
    }
}