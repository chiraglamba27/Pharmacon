import React, { createContext, useContext, useState, useCallback, useEffect, ReactNode } from 'react';
import { api, getToken, setToken } from '../api/client';

export interface User {
  email: string;
  id?: string;
  username?: string;
  name: string;
  role: string;
  avatar?: string;
}

interface AuthContextType {
  user: User | null;
  token: string | null;
  login: (emailOrUsername: string, password?: string) => Promise<boolean>;
  loginWithGoogle: (data: { credential?: string; email?: string; name?: string; role?: string; avatar?: string }) => Promise<boolean>;
  logout: () => Promise<void>;
  isAuthenticated: boolean;
  isAdmin: boolean;
  isLoading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [token, setTokenState] = useState<string | null>(getToken());
  const [isLoading, setIsLoading] = useState(true);

  const loadCurrentUser = useCallback(async () => {
    const currentToken = getToken();
    if (!currentToken) {
      setUser(null);
      setTokenState(null);
      return;
    }
    try {
      const data = await api.get<{ user: User }>('/auth/me');
      setUser(data.user);
      setTokenState(currentToken);
    } catch {
      setToken(null);
      setTokenState(null);
      setUser(null);
    }
  }, []);

  useEffect(() => {
    loadCurrentUser().finally(() => setIsLoading(false));
  }, [loadCurrentUser]);

  const login = useCallback(
    async (emailOrUsername: string, password: string = 'admin123'): Promise<boolean> => {
      try {
        const res = await api.post<{ token: string; user: User }>('/auth/login', {
          email: emailOrUsername.includes('@') ? emailOrUsername : undefined,
          username: !emailOrUsername.includes('@') ? emailOrUsername : undefined,
          password,
        });
        if (res?.token && res?.user) {
          setToken(res.token);
          setTokenState(res.token);
          setUser(res.user);
          return true;
        }
        return false;
      } catch {
        return false;
      }
    },
    []
  );

  const loginWithGoogle = useCallback(
    async (data: { credential?: string; email?: string; name?: string; role?: string; avatar?: string }): Promise<boolean> => {
      try {
        const res = await api.post<{ token: string; user: User }>('/auth/google', data);
        if (res?.token && res?.user) {
          setToken(res.token);
          setTokenState(res.token);
          setUser(res.user);
          return true;
        }
        return false;
      } catch {
        return false;
      }
    },
    []
  );

  const logout = useCallback(async () => {
    try {
      await api.post('/auth/logout');
    } catch {}
    setToken(null);
    setTokenState(null);
    setUser(null);
  }, []);

  const isAdmin = user?.role === 'admin' || user?.role === 'instructor';

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        login,
        loginWithGoogle,
        logout,
        isAuthenticated: !!user,
        isAdmin,
        isLoading,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) throw new Error('useAuth must be used within an AuthProvider');
  return context;
}
