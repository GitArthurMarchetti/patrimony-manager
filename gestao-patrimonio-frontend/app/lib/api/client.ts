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

export async function fetchApi(endpoint: string, options: RequestOptions = {}): Promise<unknown> { // CORREÇÃO: Promise<unknown>
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

  if (!response.ok) {
    let errorData;
    try {
      errorData = await response.json();
    } catch (_e) { 
      errorData = { message: response.statusText || 'An unexpected error occurred.' + _e };
    }
    throw new Error(errorData.message || `API request failed with status ${response.status}.`);
  }

  try {
    const text = await response.text();
    return text ? JSON.parse(text) : null;
  } catch (_e) { 
    return _e;
  }
}