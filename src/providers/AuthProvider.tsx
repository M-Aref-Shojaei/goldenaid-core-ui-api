"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";
import { SESSION_CONFIG, USER_ROLES } from "../utils/constants";
import { STORAGE_KEYS } from "../api/config";
import type { UserRole } from "../types/admin";
import { isSessionExpired } from "../utils/helpers";

interface AuthState {
  token: string | null;
  userId: string | null;
  phone: string | null;
  userName: string | null;
  isAdmin: boolean;
  role: UserRole;
}

interface AuthContextValue extends AuthState {
  login: (token: string, userId: string, phone: string, isAdmin?: boolean, userName?: string | null, role?: UserRole) => void;
  logout: () => void;
  updateUserName: (name: string) => void;
  isAuthenticated: boolean;
  isFullAdmin: boolean;
  isManagerOrAdmin: boolean;
}

const EMPTY_STATE: AuthState = {
  token: null,
  userId: null,
  phone: null,
  userName: null,
  isAdmin: false,
  role: USER_ROLES.USER,
};

const ALL_KEYS = [
  STORAGE_KEYS.TOKEN,
  STORAGE_KEYS.USER_ID,
  STORAGE_KEYS.PHONE,
  STORAGE_KEYS.USER_NAME,
  'isAdmin',
  STORAGE_KEYS.ROLE,
  'loginTime',
];

const AuthContext = createContext<AuthContextValue | null>(null);

function loadAuthFromStorage(): AuthState {
  if (typeof window === 'undefined') return EMPTY_STATE;

  const token = localStorage.getItem(STORAGE_KEYS.TOKEN);
  const userId = localStorage.getItem(STORAGE_KEYS.USER_ID);
  const phone = localStorage.getItem(STORAGE_KEYS.PHONE);
  const userName = localStorage.getItem(STORAGE_KEYS.USER_NAME);
  const isAdmin = localStorage.getItem('isAdmin') === 'true';
  const role = (localStorage.getItem(STORAGE_KEYS.ROLE) as UserRole) || USER_ROLES.USER;
  const loginTime = parseInt(localStorage.getItem('loginTime') ?? '0', 10);

  if (token) {
    if (isSessionExpired(loginTime, SESSION_CONFIG.EXPIRE_MS)) {
      ALL_KEYS.forEach((k) => localStorage.removeItem(k));
      return EMPTY_STATE;
    }
    return { token, userId, phone, userName, isAdmin, role };
  }
  return EMPTY_STATE;
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<AuthState>(loadAuthFromStorage);

  useEffect(() => {
    setState(loadAuthFromStorage());
  }, []);

  useEffect(() => {
    const interval = setInterval(() => {
      const token = localStorage.getItem(STORAGE_KEYS.TOKEN);
      const loginTime = parseInt(localStorage.getItem('loginTime') ?? '0', 10);
      if (token && isSessionExpired(loginTime, SESSION_CONFIG.EXPIRE_MS)) {
        ALL_KEYS.forEach((k) => localStorage.removeItem(k));
        setState(EMPTY_STATE);
      }
    }, SESSION_CONFIG.CHECK_INTERVAL_MS);
    return () => clearInterval(interval);
  }, []);

  const login = useCallback(
    (token: string, userId: string, phone: string, isAdmin = false, userName: string | null = null, role: UserRole = USER_ROLES.USER) => {
      const finalRole = isAdmin ? USER_ROLES.ADMIN : role;
      localStorage.setItem(STORAGE_KEYS.TOKEN, token);
      localStorage.setItem(STORAGE_KEYS.USER_ID, userId);
      localStorage.setItem(STORAGE_KEYS.PHONE, phone);
      localStorage.setItem('isAdmin', String(isAdmin));
      localStorage.setItem(STORAGE_KEYS.ROLE, finalRole);
      localStorage.setItem('loginTime', String(Date.now()));
      if (userName) localStorage.setItem(STORAGE_KEYS.USER_NAME, userName);
      setState({ token, userId, phone, userName, isAdmin, role: finalRole });
    },
    [],
  );

  const logout = useCallback(() => {
    ALL_KEYS.forEach((k) => localStorage.removeItem(k));
    setState(EMPTY_STATE);
  }, []);

  const updateUserName = useCallback((name: string) => {
    localStorage.setItem(STORAGE_KEYS.USER_NAME, name);
    setState((prev) => ({ ...prev, userName: name }));
  }, []);

  return (
    <AuthContext.Provider
      value={{
        ...state,
        login,
        logout,
        updateUserName,
        isAuthenticated: !!state.token,
        isFullAdmin: state.role === USER_ROLES.ADMIN,
        isManagerOrAdmin: state.role === USER_ROLES.ADMIN || state.role === USER_ROLES.MANAGER,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
