"use client";

import { createContext, useContext, useState } from "react";
import type { User } from "@/types/auth";

type AuthContextValue = {
  user: User | null;
  isLoggedIn: boolean;
  setUser: (user: User | null) => void;
};

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({
  children,
  initialUser,
}: {
  children: React.ReactNode;
  initialUser: User | null;
}) {
  const [user, setUser] = useState<User | null>(initialUser);

  return (
    <AuthContext.Provider
      value={{
        user,
        isLoggedIn: user !== null,
        setUser,
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
