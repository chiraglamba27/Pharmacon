import React, { createContext, useContext, useState, useCallback, useEffect, ReactNode } from 'react';
import { supabase } from '../lib/supabaseClient';
import { api } from '../api/client';

export interface User {
  id: string;
  username: string;
  name: string;
  role: string;
}

interface AuthContextType {
  user: User | null;
  token: string | null;
  login: (username: string, password: string) => Promise<boolean>;
  logout: () => Promise<void>;
  isAuthenticated: boolean;
  isAdmin: boolean;
  isLoading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const loadCurrentUser = useCallback(async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        setToken(null);
        setUser(null);
        return;
      }
      const data = await api.get<{ user: User }>('/auth/me');
      setToken(session.access_token);
      setUser(data.user);
    } catch {
      setToken(null);
      setUser(null);
      await supabase.auth.signOut();
    }
  }, []);

  useEffect(() => {
    loadCurrentUser().finally(() => setIsLoading(false));
    const { data: listener } = supabase.auth.onAuthStateChange((_event, session) => {
      setToken(session?.access_token || null);
      if (!session) {
        setUser(null);
        return;
      }
      setTimeout(() => {
        api.get<{ user: User }>('/auth/me').then((data) => setUser(data.user)).catch(() => setUser(null));
      }, 0);
    });
    return () => listener.subscription.unsubscribe();
  }, [loadCurrentUser]);

  const login = useCallback(async (username: string, password: string): Promise<boolean> => {
    try {
      await api.post<{ token: string; user: User }>('/auth/login', { username, password });
      await loadCurrentUser();
      return true;
    } catch {
      return false;
    }
  }, [loadCurrentUser]);

  const logout = useCallback(async () => {
    await supabase.auth.signOut();
    setToken(null);
    setUser(null);
  }, []);

  const isAdmin = user?.role === 'admin' || user?.role === 'instructor';

  return (
    <AuthContext.Provider value={{ user, token, login, logout, isAuthenticated: !!user, isAdmin, isLoading }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) throw new Error('useAuth must be used within an AuthProvider');
  return context;
}
