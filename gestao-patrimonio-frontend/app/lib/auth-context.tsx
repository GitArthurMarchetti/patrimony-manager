'use client';

import React, { createContext, useState, useEffect, useContext, ReactNode } from 'react';
import { getAuthToken, setAuthToken, removeAuthToken } from './auth-utils';
import { loginUser as apiLoginUser, registerUser as apiRegisterUser } from './api/auth';
import { AuthResponse, LoginRequest, RegisterRequest } from './types';

interface AuthContextType {
  isAuthenticated: boolean;
  token: string | null;
  user: { username: string } | null;
  login: (credentials: LoginRequest) => Promise<void>;
  register: (credentials: RegisterRequest) => Promise<void>;
  logout: () => void;
  loading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [token, setToken] = useState<string | null>(null);
  const [user, setUser] = useState<{ username: string } | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    const storedToken = getAuthToken();
    if (storedToken) {
      setToken(storedToken);
      setIsAuthenticated(true);
      setUser({ username: 'Authenticated User' });
    }
    setLoading(false);
  }, []);

  const login = async (credentials: LoginRequest) => {
    setLoading(true);
    try {
      const res: AuthResponse = await apiLoginUser(credentials);
      setAuthToken(res.token);
      setToken(res.token);
      setIsAuthenticated(true);
      setUser({ username: credentials.username });
    } catch (error: unknown) {
      console.error("Login failed:", error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const register = async (credentials: RegisterRequest) => {
    setLoading(true);
    try {
      const res: AuthResponse = await apiRegisterUser(credentials);
      setAuthToken(res.token);
      setToken(res.token);
      setIsAuthenticated(true);
      setUser({ username: credentials.username });
    } catch (error: unknown) {
      console.error("Registration failed:", error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    removeAuthToken();
    setToken(null);
    setIsAuthenticated(false);
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ isAuthenticated, token, user, login, register, logout, loading }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};