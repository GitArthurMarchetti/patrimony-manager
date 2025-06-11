/* eslint-disable @typescript-eslint/no-unused-vars */
import { triggerLogout } from "../auth-utils";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:8080/api';

const getAuthToken = (): string | null => {
  if (typeof window !== 'undefined') {
    return localStorage.getItem('jwt_token');
  }
  return null;
};

interface RequestOptions extends RequestInit {
  requireAuth?: boolean;
  token?: string;
}

export async function fetchApi(endpoint: string, options: RequestOptions = {}): Promise<unknown> {
  const { requireAuth = true, token, headers, ...restOptions } = options;
  const url = `${API_BASE_URL}${endpoint}`;

  const finalHeaders: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(headers as Record<string, string> || {}),
  };

  if (requireAuth) {
    const authToken = token || getAuthToken();
    if (!authToken) {
      throw new Error('Authentication token is missing. Please log in.');
    }
    finalHeaders['Authorization'] = `Bearer ${authToken}`;
  }

  const response = await fetch(url, {
    ...restOptions,
    headers: finalHeaders,
  });

  // LÓGICA CHAVE: TRATAMENTO DE ERROS DE AUTENTICAÇÃO E RESPOSTAS NÃO OK
  if (!response.ok) {
    if (response.status === 401 || response.status === 403) {
      triggerLogout();
      throw new Error('Authentication failed or expired. Please log in again.');
    }

    let errorData;
    try {
      errorData = await response.json();
    } catch (_e: unknown) { // CORREÇÃO: tipando _e como unknown
      // Se não conseguiu parsear JSON do erro, usa a mensagem de status da resposta
      errorData = { message: response.statusText || 'An unexpected error occurred.' };
    }
    // Lança um erro com a mensagem do backend ou uma mensagem padrão
    throw new Error(errorData.message || `API request failed with status ${response.status}.`);
  }

  // Tenta retornar JSON; se a resposta for vazia ou não JSON (ex: DELETE 204), retorna null
  try {
    const text = await response.text();
    return text ? JSON.parse(text) : null;
  } catch (_e: unknown) { // CORREÇÃO: tipando _e como unknown
    return null; // CORREÇÃO: Retorna null se não conseguir parsear como JSON (resposta vazia, etc.)
  }
}