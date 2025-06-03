package com.gestaopatrimonio.gestao_patrimonio_backend.service;

import com.gestaopatrimonio.gestao_patrimonio_backend.model.Category;
import com.gestaopatrimonio.gestao_patrimonio_backend.repository.CategoryRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Optional;

@Service
public class CategoryService {

    private final CategoryRepository categoryRepository;

    public CategoryService(CategoryRepository categoryRepository) {
        this.categoryRepository = categoryRepository;
    }


    @Transactional
    public Category createCategory(Category category){
        if(categoryRepository.findByName(category.getName()).isPresent()){
            throw new IllegalArgumentException("Categoria com o nome: " + category.getName() + ", já existe.");
        }
        return categoryRepository.save(category);
    }


    public Optional<Category> getCategoryById(Long id){
        return categoryRepository.findById(id);
    }

    public List<Category> getAllCategories(){
        return categoryRepository.findAll();
    }

    @Transactional
    public Category updateCategory(Long id, Category updatedCategory){
        Category existingCategory = categoryRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Categoria não encontrada com ID: " + id));

        Optional<Category> categoryWithSameName = categoryRepository.findByName(updatedCategory.getName());
        if (categoryWithSameName.isPresent() && !categoryWithSameName.get().getId().equals(id)) {
            throw new IllegalArgumentException("Já existe uma categoria com o nome '" + updatedCategory.getName() + "'.");
        }

        existingCategory.setName(updatedCategory.getName());
        existingCategory.setType(updatedCategory.getType());

        return categoryRepository.save(existingCategory);
    }

    @Transactional
    public void deleteCategory(Long id){
        if(!categoryRepository.existsById(id)){
            throw new IllegalArgumentException("Categoria não encontrada com o ID: " + id);
        }
        categoryRepository.deleteById(id);
    }
}