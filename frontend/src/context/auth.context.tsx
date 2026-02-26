"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
} from "react";
import { api } from "@/lib/api";
import { AxiosError } from "axios";
import type { User } from "@/types/auth";

type AuthContextValue = {
  user: User | null;
  isLoading: boolean;
  isLoggedIn: boolean;
  setUser: (user: User | null) => void;
  refetchUser: () => Promise<void>;
};

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const fetchUser = useCallback(async () => {
    try {
      const { data } = await api.get<User>("/auth/profile");
      setUser(data);
    } catch (err) {
      if (err instanceof AxiosError && err.response?.status === 401) {
        setUser(null);
      }
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchUser();
  }, [fetchUser]);

  return (
    <AuthContext.Provider
      value={{
        user,
        isLoading,
        isLoggedIn: user !== null,
        setUser,
        refetchUser: fetchUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
