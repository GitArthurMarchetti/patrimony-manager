package com.gestaopatrimonio.gestao_patrimonio_backend.model;

import jakarta.persistence.CascadeType;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.OneToMany;
import jakarta.persistence.Table;
import java.util.ArrayList;
import java.util.List;
import java.util.Objects;

@Entity
@Table(name = "categories")
public class Category {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String name;

    @Column(nullable = false)
    private String type;

    @ManyToOne
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @OneToMany(mappedBy = "category", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<ProfitEntry> profitEntries = new ArrayList<>();


    @OneToMany(mappedBy = "category", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<ExpenseEntry> expenseEntries = new ArrayList<>();

    public Category() {
    }

    public Category(String name, String type, User user) {
        this.name = name;
        this.type = type;
        this.user = user;
    }

    // --- Getters e Setters ---
    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public String getType() {
        return type;
    }

    public void setType(String type) {
        this.type = type;
    }

    public User getUser() {
        return user;
    }

    public void setUser(User user) {
        this.user = user;
    }

    public List<ProfitEntry> getProfitEntries() {
        return profitEntries;
    }

    public void setProfitEntries(List<ProfitEntry> profitEntries) {
        this.profitEntries = profitEntries;
    }

    public List<ExpenseEntry> getExpenseEntries() {
        return expenseEntries;
    }

    public void setExpenseEntries(List<ExpenseEntry> expenseEntries) {
        this.expenseEntries = expenseEntries;
    }


    public void addProfitEntry(ProfitEntry entry) {
        this.profitEntries.add(entry);
        entry.setCategory(this);
    }

    public void removeProfitEntry(ProfitEntry entry) {
        this.profitEntries.remove(entry);
        entry.setCategory(null);
    }

    public void addExpenseEntry(ExpenseEntry entry) {
        this.expenseEntries.add(entry);
        entry.setCategory(this);
    }

    public void removeExpenseEntry(ExpenseEntry entry) {
        this.expenseEntries.remove(entry);
        entry.setCategory(null);
    }


    @Override
    public boolean equals(Object o) {
        if (this == o) return true;
        if (o == null || getClass() != o.getClass()) return false;
        Category category = (Category) o;
        return id != null && Objects.equals(id, category.id);
    }

    @Override
    public int hashCode() {
        return Objects.hashCode(id);
    }

    @Override
    public String toString() {
        return "Category{" +
                "id=" + id +
                ", name='" + name + '\'' +
                ", type='" + type + '\'' +
                ", user_id=" + (user != null ? user.getId() : "null") + // Adicionei user_id para debug
                '}';
    }
}