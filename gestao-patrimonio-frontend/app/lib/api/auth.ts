import { AuthResponse, LoginRequest, RegisterRequest } from '../types/auth';
import { fetchApi } from './client';

export const registerUser = async (data: RegisterRequest): Promise<AuthResponse> => {
  return fetchApi('/auth/register', {
    method: 'POST',
    body: JSON.stringify(data),
    requireAuth: false,
  }) as Promise<AuthResponse>;
};

export const loginUser = async (data: LoginRequest): Promise<AuthResponse> => {
  return fetchApi('/auth/login', {
    method: 'POST',
    body: JSON.stringify(data),
    requireAuth: false,
  }) as Promise<AuthResponse>;
};