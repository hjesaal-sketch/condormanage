'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

interface User {
  id: string;
  email: string;
  name: string;
  role: string;
  tenantId: string;
}

interface AuthState {
  user: User | null;
  token: string | null;
  isLoading: boolean;
  isAuthenticated: boolean;
}

export function useAuth() {
  const router = useRouter();
  const [state, setState] = useState<AuthState>({
    user: null,
    token: null,
    isLoading: true,
    isAuthenticated: false,
  });

  useEffect(() => {
    // Cargar datos del localStorage al montar
    const token = localStorage.getItem('token');
    const userStr = localStorage.getItem('user');

    if (token && userStr) {
      try {
        const user = JSON.parse(userStr);
        setState({
          user,
          token,
          isLoading: false,
          isAuthenticated: true,
        });
      } catch {
        logout();
      }
    } else {
      setState(prev => ({ ...prev, isLoading: false }));
    }
  }, []);

  const login = (token: string, user: User) => {
    localStorage.setItem('token', token);
    localStorage.setItem('user', JSON.stringify(user));
    setState({
      user,
      token,
      isLoading: false,
      isAuthenticated: true,
    });

    // Redirigir según rol
    const roleRedirects: Record<string, string> = {
      ADMIN: '/dashboard/admin',
      RESIDENT: '/dashboard/resident',
      STAFF: '/dashboard/staff',
    };
    const redirectPath = roleRedirects[user.role] || '/dashboard';
    router.push(redirectPath);
  };

  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setState({
      user: null,
      token: null,
      isLoading: false,
      isAuthenticated: false,
    });
    router.push('/login');
  };

  const getRole = (): string | null => {
    return state.user?.role || null;
  };

  const getTenantId = (): string | null => {
    return state.user?.tenantId || null;
  };

  return {
    ...state,
    login,
    logout,
    getRole,
    getTenantId,
  };
}