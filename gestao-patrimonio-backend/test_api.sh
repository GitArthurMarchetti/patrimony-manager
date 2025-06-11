#!/bin/bash

# --- Configurações ---
BASE_URL="http://localhost:8080/api"
USERNAME="test_auto_$(date +%s)" # Usuário único a cada execução
PASSWORD="password_auto"

echo "--- Iniciando Testes Automatizados do Backend ---"
echo "Usuário a ser usado: $USERNAME"

# --- 1. Registrar Usuário ---
echo -e "\n--- 1. Registrando Usuário ---"
REGISTER_RESPONSE=$(curl -s -X POST "${BASE_URL}/auth/register" \
-H "Content-Type: application/json" \
-d "{\"username\": \"$USERNAME\", \"password\": \"$PASSWORD\"}")

REGISTER_TOKEN=$(echo "$REGISTER_RESPONSE" | grep -o '"token":"[^"]*"' | cut -d':' -f2 | tr -d '"')

if [ -z "$REGISTER_TOKEN" ]; then
    echo "ERRO: Falha ao registrar usuário ou obter token de registro."
    echo "Resposta: $REGISTER_RESPONSE"
    exit 1
fi
echo "Usuário registrado com sucesso. Token de Registro: $REGISTER_TOKEN"

# --- 2. Fazer Login para Obter Token Fresco ---
echo -e "\n--- 2. Fazendo Login ---"
LOGIN_RESPONSE=$(curl -s -X POST "${BASE_URL}/auth/login" \
-H "Content-Type: application/json" \
-d "{\"username\": \"$USERNAME\", \"password\": \"$PASSWORD\"}")

AUTH_TOKEN=$(echo "$LOGIN_RESPONSE" | grep -o '"token":"[^"]*"' | cut -d':' -f2 | tr -d '"')

if [ -z "$AUTH_TOKEN" ]; then
    echo "ERRO: Falha ao fazer login ou obter token de autenticação."
    echo "Resposta: $LOGIN_RESPONSE"
    exit 1
fi
echo "Login bem-sucedido. TOKEN DE AUTENTICAÇÃO FRESCO: $AUTH_TOKEN"

# --- 3. Criar Categorias ---
echo -e "\n--- 3. Criando Categorias ---"

# Categoria Salary (Profit)
SALARY_CATEGORY_RESPONSE=$(curl -s -X POST "${BASE_URL}/categories" \
-H "Content-Type: application/json" \
-H "Authorization: Bearer $AUTH_TOKEN" \
-d '{"name": "Salary", "type": "PROFIT"}')

SALARY_CATEGORY_ID=$(echo "$SALARY_CATEGORY_RESPONSE" | grep -o '"id":[0-9]*' | cut -d':' -f2)

if [ -z "$SALARY_CATEGORY_ID" ]; then
    echo "ERRO: Falha ao criar categoria Salary."
    echo "Resposta: $SALARY_CATEGORY_RESPONSE"
    exit 1
fi
echo "Categoria Salary (ID: $SALARY_CATEGORY_ID) criada."

# Categoria Bills (Expense)
BILLS_CATEGORY_RESPONSE=$(curl -s -X POST "${BASE_URL}/categories" \
-H "Content-Type: application/json" \
-H "Authorization: Bearer $AUTH_TOKEN" \
-d '{"name": "Bills", "type": "EXPENSE"}')

BILLS_CATEGORY_ID=$(echo "$BILLS_CATEGORY_RESPONSE" | grep -o '"id":[0-9]*' | cut -d':' -f2)

if [ -z "$BILLS_CATEGORY_ID" ]; then
    echo "ERRO: Falha ao criar categoria Bills."
    echo "Resposta: $BILLS_CATEGORY_RESPONSE"
    exit 1
fi
echo "Categoria Bills (ID: $BILLS_CATEGORY_ID) criada."

# --- 4. Criar Entradas de Lucro e Gasto ---
echo -e "\n--- 4. Criando Entradas ---"

# Entrada de Lucro
PROFIT_ENTRY_RESPONSE=$(curl -s -X POST "${BASE_URL}/profits" \
-H "Content-Type: application/json" \
-H "Authorization: Bearer $AUTH_TOKEN" \
-d "{\"description\": \"Monthly Pay\", \"amount\": 1000.00, \"date\": \"2025-06-07\", \"categoryId\": $SALARY_CATEGORY_ID}")

PROFIT_ENTRY_ID=$(echo "$PROFIT_ENTRY_RESPONSE" | grep -o '"id":[0-9]*' | cut -d':' -f2)

if [ -z "$PROFIT_ENTRY_ID" ]; then
    echo "ERRO: Falha ao criar entrada de lucro."
    echo "Resposta: $PROFIT_ENTRY_RESPONSE"
    exit 1
fi
echo "Entrada de Lucro (ID: $PROFIT_ENTRY_ID) criada."

# Entrada de Gasto
EXPENSE_ENTRY_RESPONSE=$(curl -s -X POST "${BASE_URL}/expenses" \
-H "Content-Type: application/json" \
-H "Authorization: Bearer $AUTH_TOKEN" \
-d "{\"description\": \"Electricity Bill\", \"amount\": 150.00, \"date\": \"2025-06-07\", \"categoryId\": $BILLS_CATEGORY_ID}")

EXPENSE_ENTRY_ID=$(echo "$EXPENSE_ENTRY_RESPONSE" | grep -o '"id":[0-9]*' | cut -d':' -f2)

if [ -z "$EXPENSE_ENTRY_ID" ]; then
    echo "ERRO: Falha ao criar entrada de gasto."
    echo "Resposta: $EXPENSE_ENTRY_RESPONSE"
    exit 1
fi
echo "Entrada de Gasto (ID: $EXPENSE_ENTRY_ID) criada."


# --- 5. Obter Resumo Financeiro Final ---
echo -e "\n--- 5. Obtendo Resumo Financeiro Final ---"
SUMMARY_RESPONSE=$(curl -s -X GET "${BASE_URL}/summary" \
-H "Authorization: Bearer $AUTH_TOKEN")

echo "Resumo Financeiro: $SUMMARY_RESPONSE"
echo "--- Testes Automatizados Concluídos ---"

# --- Dados para verificação manual ---
echo -e "\n--- Dados para verificação manual ---"
echo "Último Token Válido: $AUTH_TOKEN"
echo "ID da Categoria Salary: $SALARY_CATEGORY_ID"
echo "ID da Categoria Bills: $BILLS_CATEGORY_ID"
echo "ID da Entrada de Lucro: $PROFIT_ENTRY_ID"
echo "ID da Entrada de Gasto: $EXPENSE_ENTRY_ID"