'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { z } from 'zod'; // Importar Zod para usar o método .infer
import { useAuth } from '@/app/lib/auth-context';
import { RegisterSchema } from '@/app/lib/types';

export default function RegisterPage() {
  const { register, isAuthenticated, loading } = useAuth();
  const router = useRouter();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  // NOVO ESTADO: Para erros de validação específicos por campo
  const [fieldErrors, setFieldErrors] = useState<z.ZodIssue[] | null>(null);

  useEffect(() => {
    if (isAuthenticated && !loading) {
      router.replace('/');
    }
  }, [isAuthenticated, loading, router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setFieldErrors(null); // Limpar erros de campo anteriores

    // NOVO: Validação client-side com Zod
    const validationResult = RegisterSchema.safeParse({ username, password });

    if (!validationResult.success) {
      // Se a validação falhar, define os erros de campo e exibe um erro geral se necessário
      setFieldErrors(validationResult.error.issues);
      setError("Please correct the errors in the form.");
      return; // Para não enviar a requisição ao backend
    }

    try {
      await register(validationResult.data); // Envia os dados validados pelo Zod
      // Redirecionamento já tratado pelo useEffect
    } catch (err: unknown) {
      console.error("Registration failed:", err);
      setError(err instanceof Error ? err.message : 'Registration failed. Please try again.');
      // TODO: Para erros do backend (ex: username já existe), parsear o erro e exibir melhor
    }
  };

  if (loading || (isAuthenticated && !loading)) {
    return <div className="min-h-screen flex items-center justify-center text-gray-800">Loading or redirecting...</div>;
  }

  // Função auxiliar para encontrar um erro de campo específico
  const getFieldError = (fieldName: string) => {
    return fieldErrors?.find(issue => issue.path[0] === fieldName)?.message;
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-900">
      <div className="w-full max-w-md p-8 space-y-6 rounded-lg lg:shadow-md">
        <h2 className="text-2xl font-bold text-center text-white">Register</h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="username" className="block text-sm font-medium text-white">
              Username
            </label>
            <input
              id="username"
              name="username"
              type="text"
              className="mt-1 block w-full px-3 py-2 border border-gray-100 text-white rounded-md shadow-sm focus:outline-none focus:ring-gray-500 focus:border-gray-500 sm:text-sm"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
            />
            {getFieldError('username') && <p className="text-red-400 text-xs mt-1">{getFieldError('username')}</p>}
          </div>
          <div>
            <label htmlFor="password" className="block text-sm font-medium text-white">
              Password
            </label>
            <input
              id="password"
              name="password"
              type="password"
              className="mt-1 block w-full px-3 py-2 border border-gray-100 text-white rounded-md shadow-sm focus:outline-none focus:ring-gray-500 focus:border-gray-500 sm:text-sm"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
            {getFieldError('password') && <p className="text-red-400 text-xs mt-1">{getFieldError('password')}</p>}
          </div>
          {error && <p className="text-red-500 text-sm">{error}</p>}
          <button
            type="submit"
            className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-black focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            disabled={loading}
          >
            {loading ? 'Registering...' : 'Register'}
          </button>
        </form>
        <p className="text-center text-sm text-white">
          Already have an account?{' '}
          <Link href="/login" className="font-bold text-white">
            Login here
          </Link>
        </p>
      </div>
    </div>
  );
}