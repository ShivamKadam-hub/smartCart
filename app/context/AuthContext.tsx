import AsyncStorage from '@react-native-async-storage/async-storage';
import React, { createContext, useContext, useEffect, useMemo, useState } from 'react';

import { AuthUser, getMe, login as loginRequest, signup as signupRequest } from '@/lib/api';

type Session = {
  user: AuthUser;
  accessToken: string;
  refreshToken: string;
};

type AuthContextValue = {
  user: AuthUser | null;
  accessToken: string | null;
  refreshToken: string | null;
  isLoading: boolean;
  signup: (payload: { name: string; email: string; password: string }) => Promise<void>;
  login: (payload: { email: string; password: string }) => Promise<void>;
  logout: () => Promise<void>;
  refreshSession: () => Promise<void>;
};

const AUTH_STORAGE_KEY = 'smartcart.auth.session';

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [accessToken, setAccessToken] = useState<string | null>(null);
  const [refreshToken, setRefreshToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const persistSession = async (session: Session | null) => {
    if (!session) {
      await AsyncStorage.removeItem(AUTH_STORAGE_KEY);
      setUser(null);
      setAccessToken(null);
      setRefreshToken(null);
      return;
    }

    await AsyncStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(session));
    setUser(session.user);
    setAccessToken(session.accessToken);
    setRefreshToken(session.refreshToken);
  };

  const hydrateSession = async () => {
    try {
      const raw = await AsyncStorage.getItem(AUTH_STORAGE_KEY);
      if (!raw) {
        return;
      }

      const session = JSON.parse(raw) as Session;
      if (!session?.accessToken || !session?.refreshToken) {
        return;
      }

      try {
        const response = await getMe(session.accessToken);
        await persistSession({
          ...session,
          user: response.data,
        });
      } catch {
        await persistSession(null);
      }
    } catch {
      // Storage read failed (corrupt data, etc.) — start fresh
      await persistSession(null).catch(() => {});
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    void hydrateSession();
  }, []);

  const signup = async (payload: { name: string; email: string; password: string }) => {
    const response = await signupRequest(payload);
    await persistSession(response.data);
  };

  const login = async (payload: { email: string; password: string }) => {
    const response = await loginRequest(payload);
    await persistSession(response.data);
  };

  const logout = async () => {
    await persistSession(null);
  };

  const refreshSession = async () => {
    if (!accessToken) {
      return;
    }

    const response = await getMe(accessToken);
    if (accessToken && refreshToken) {
      await persistSession({
        user: response.data,
        accessToken,
        refreshToken,
      });
    }
  };

  const value = useMemo(
    () => ({
      user,
      accessToken,
      refreshToken,
      isLoading,
      signup,
      login,
      logout,
      refreshSession,
    }),
    [user, accessToken, refreshToken, isLoading]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
