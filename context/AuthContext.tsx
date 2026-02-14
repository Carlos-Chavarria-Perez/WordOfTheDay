import React, { createContext, useContext, useEffect, useState } from "react";
import { injectTokenGetter } from "@/app/api/apiClient";
type User = {
  user_id: string;
  username: string;
};

type AuthContextType = {
  user: User | null;
  login: (user: User, token: string) => void;
  token: string | null;
  logout: () => void;
};

let globalLogout: (() => void) | null = null;

export const setGlobalLogout = (logoutFn: () => void) => {
  globalLogout = logoutFn;
};

export const triggerLogout = () => {
  if (globalLogout) {
    globalLogout();
  }
};

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);

  const login = (user: User, token: string) => {
    setUser(user);
    setToken(token);
  };

  const logout = () => {
    setUser(null);
    setToken(null);
  };
  useEffect(() => {
    injectTokenGetter(() => token);
  }, [token]);

  // 🔥 Register logout globally
  useEffect(() => {
    setGlobalLogout(logout);
  }, []);

  return (
    <AuthContext.Provider value={{ user, login, token, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used inside AuthProvider");
  return ctx;
}
