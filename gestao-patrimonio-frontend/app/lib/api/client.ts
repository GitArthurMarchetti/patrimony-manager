/* eslint-disable @typescript-eslint/no-unused-vars */
import { triggerLogout } from "../auth-utils";

// Remova a variável API_BASE_URL daqui. Ela não é mais necessária,
// pois o sistema de 'rewrites' do Next.js cuidará do direcionamento da URL base.

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

  // --- CORREÇÃO AQUI: Garante que a URL comece com '/api/' ---
  let url = endpoint;
  // Se o endpoint não começar com '/api/' (e não for uma URL absoluta), adicione o prefixo.
  // Isso permite que suas chamadas de API como fetchApi('/summary') sejam reescritas corretamente.
  if (!url.startsWith('/api/') && !url.startsWith('http://') && !url.startsWith('https://')) {
    url = `/api${endpoint}`;
  }
  // -------------------------------------------------------------

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

  const response = await fetch(url, { // 'url' agora sempre terá o '/api/' quando necessário
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
    } catch (_e: unknown) {
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
  } catch (_e: unknown) {
    return null; // Retorna null se não conseguir parsear como JSON (resposta vazia, etc.)
  }
}