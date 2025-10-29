import { useState, useEffect } from 'react';
import { endpoints } from '@/api/endpoints';
import type { User } from '@/types';

export function useAuth() {
  const [user, setUser] = useState<User | null>(() => {
    const raw = localStorage.getItem('user');
    return raw ? JSON.parse(raw) : null;
  });

  const login = async (email: string, password: string) => {
    const res = await endpoints.login(email, password);
    localStorage.setItem('token', res.token);
    localStorage.setItem('user', JSON.stringify(res.user));
    setUser(res.user);
  };

  const signup = async (name: string, email: string, password: string) => {
    const res = await endpoints.signup(name, email, password);
    localStorage.setItem('token', res.token);
    localStorage.setItem('user', JSON.stringify(res.user));
    setUser(res.user);
  };

  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setUser(null);
  };

  useEffect(() => {
    // could validate token on mount
  }, []);

  return { user, login, signup, logout };
}
