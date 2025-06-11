import { z } from 'zod'; // Importar Zod

// Define o schema de validação para registro
export const RegisterSchema = z.object({
  username: z.string()
    .min(1, { message: 'Username is required.' })
    .max(50, { message: 'Username must be at most 50 characters.' }),
  password: z.string()
    .min(6, { message: 'Password must be at least 6 characters.' }),
});

// Inferir o tipo TypeScript a partir do schema Zod
export type RegisterRequest = z.infer<typeof RegisterSchema>;


// Define o schema de validação para login
export const LoginSchema = z.object({
  username: z.string().min(1, { message: 'Username is required.' }),
  password: z.string().min(1, { message: 'Password is required.' }),
});

// Inferir o tipo TypeScript a partir do schema Zod
export type LoginRequest = z.infer<typeof LoginSchema>;


// Interface para a resposta de autenticação (não precisa de schema de validação aqui)
export interface AuthResponse {
  token: string;
}