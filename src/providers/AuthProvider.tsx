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
import { STORAGE_KEYS, SESSION_KEYS, SESSION_EXPIRED_EVENT } from "../api/config";
import { revokeSession } from "../api/auth";
import type { UserRole } from "../types/admin";
import { getSessionDeadlineMs } from "../utils/validators";

/** setTimeout max delay is 2^31-1 ms; longer waits are re-armed. */
const MAX_TIMEOUT_MS = 2 ** 31 - 1;

function sessionEnd(token: string): number {
  const stored = parseInt(localStorage.getItem("sessionDeadline") ?? "", 10);
  if (Number.isFinite(stored)) return stored;
  // Legacy session stored before deadlines existed: derive from loginTime.
  const loginTime = parseInt(localStorage.getItem("loginTime") ?? "0", 10);
  return getSessionDeadlineMs(token, loginTime, SESSION_CONFIG.EXPIRE_MS);
}

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
  /** Revokes the token server-side (best-effort) and clears the local session. */
  logout: () => Promise<void>;
  updateUserName: (name: string) => void;
  isAuthenticated: boolean;
  isFullAdmin: boolean;
  isManagerOrAdmin: boolean;
  isWriterOrAdmin: boolean;
}

const EMPTY_STATE: AuthState = {
  token: null,
  userId: null,
  phone: null,
  userName: null,
  isAdmin: false,
  role: USER_ROLES.USER,
};

const AuthContext = createContext<AuthContextValue | null>(null);

function loadAuthFromStorage(): AuthState {
  if (typeof window === 'undefined') return EMPTY_STATE;

  const token = localStorage.getItem(STORAGE_KEYS.TOKEN);
  const userId = localStorage.getItem(STORAGE_KEYS.USER_ID);
  const phone = localStorage.getItem(STORAGE_KEYS.PHONE);
  const userName = localStorage.getItem(STORAGE_KEYS.USER_NAME);
  const isAdmin = localStorage.getItem('isAdmin') === 'true';
  const role = (localStorage.getItem(STORAGE_KEYS.ROLE) as UserRole) || USER_ROLES.USER;
  if (token) {
    if (Date.now() >= sessionEnd(token)) {
      // Token expired while the tab was closed: revoke best-effort, then clear.
      revokeSession(token).catch(() => undefined);
      SESSION_KEYS.forEach((k) => localStorage.removeItem(k));
      return EMPTY_STATE;
    }
    return { token, userId, phone, userName, isAdmin, role };
  }
  return EMPTY_STATE;
}

/** Loads JWT session from localStorage, auto-expires it, and exposes auth state + actions to the tree. */
export function AuthProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<AuthState>(loadAuthFromStorage);

  useEffect(() => {
    setState(loadAuthFromStorage());
  }, []);

  const logout = useCallback((): Promise<void> => {
    // Send the revoke with the current token first, then clear locally at once;
    // a network/server failure must never keep the user logged in.
    const token = localStorage.getItem(STORAGE_KEYS.TOKEN);
    const revoked = token ? revokeSession(token).catch(() => undefined) : Promise.resolve();
    SESSION_KEYS.forEach((k) => localStorage.removeItem(k));
    setState(EMPTY_STATE);
    return revoked;
  }, []);

  // Session lasts exactly as long as the token: log out when its exp passes.
  // Timer is re-armed for far-off exp; visibility/focus re-check because
  // background tabs throttle timers.
  useEffect(() => {
    const token = state.token;
    if (!token) return;
    let timer: ReturnType<typeof setTimeout>;
    const check = () => {
      clearTimeout(timer);
      const left = sessionEnd(token) - Date.now();
      if (left <= 0) {
        void logout(); // same path as manual logout: revoke best-effort, clear locally
        return;
      }
      timer = setTimeout(check, Math.min(left, MAX_TIMEOUT_MS));
    };
    const onVisible = () => document.visibilityState === "visible" && check();
    check();
    document.addEventListener("visibilitychange", onVisible);
    window.addEventListener("focus", check);
    return () => {
      clearTimeout(timer);
      document.removeEventListener("visibilitychange", onVisible);
      window.removeEventListener("focus", check);
    };
  }, [state.token, logout]);

  // apiFetch already cleared storage on a 401; reset state so guards redirect to login.
  useEffect(() => {
    const onExpired = () => setState(EMPTY_STATE);
    window.addEventListener(SESSION_EXPIRED_EVENT, onExpired);
    return () => window.removeEventListener(SESSION_EXPIRED_EVENT, onExpired);
  }, []);

  const login = useCallback(
    (token: string, userId: string, phone: string, isAdmin = false, userName: string | null = null, role: UserRole = USER_ROLES.USER) => {
      const finalRole = isAdmin ? USER_ROLES.ADMIN : role;
      localStorage.setItem(STORAGE_KEYS.TOKEN, token);
      localStorage.setItem(STORAGE_KEYS.USER_ID, userId);
      localStorage.setItem(STORAGE_KEYS.PHONE, phone);
      localStorage.setItem('isAdmin', String(isAdmin));
      localStorage.setItem(STORAGE_KEYS.ROLE, finalRole);
      const now = Date.now();
      localStorage.setItem('loginTime', String(now));
      // Anchored to local receipt time so a skewed device clock can't end the session early.
      localStorage.setItem('sessionDeadline', String(getSessionDeadlineMs(token, now, SESSION_CONFIG.EXPIRE_MS)));
      if (userName) localStorage.setItem(STORAGE_KEYS.USER_NAME, userName);
      setState({ token, userId, phone, userName, isAdmin, role: finalRole });
    },
    [],
  );

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
        isWriterOrAdmin: state.role === USER_ROLES.ADMIN || state.role === USER_ROLES.MANAGER || state.role === USER_ROLES.WRITER,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

/** Returns the auth context. Must be used inside {@link AuthProvider}. */
export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
