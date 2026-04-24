"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from "react";

const ACCESS_KEY = "illustriober_access_token";

export type AuthUser = {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: string;
};

type AuthContextValue = {
  user: AuthUser | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (input: {
    email: string;
    password: string;
    firstName: string;
    lastName: string;
  }) => Promise<void>;
  logout: () => Promise<void>;
  refreshSession: () => Promise<void>;
};

const AuthContext = createContext<AuthContextValue | null>(null);

type AuthSuccessResponse = {
  accessToken: string;
  user: AuthUser;
};

async function readErrorMessage(res: Response): Promise<string> {
  try {
    const data = (await res.json()) as { error?: string; message?: string };
    return data.error || data.message || `Request failed (${res.status})`;
  } catch {
    return `Request failed (${res.status})`;
  }
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [loading, setLoading] = useState(true);
  const accessTokenRef = useRef<string | null>(null);
  const refreshPromiseRef = useRef<Promise<string | null> | null>(null);

  const clearSession = useCallback(() => {
    accessTokenRef.current = null;
    if (typeof window !== "undefined") {
      sessionStorage.removeItem(ACCESS_KEY);
    }
    setUser(null);
  }, []);

  const getStoredAccessToken = useCallback(() => {
    if (typeof window === "undefined") {
      return null;
    }

    if (accessTokenRef.current !== null) {
      return accessTokenRef.current;
    }

    const token = sessionStorage.getItem(ACCESS_KEY);
    accessTokenRef.current = token;
    return token;
  }, []);

  const persistAccess = useCallback((token: string) => {
    accessTokenRef.current = token;
    if (typeof window !== "undefined") {
      sessionStorage.setItem(ACCESS_KEY, token);
    }
  }, []);

  const storeAuth = useCallback(
    (data: AuthSuccessResponse) => {
      persistAccess(data.accessToken);
      setUser(data.user);
    },
    [persistAccess]
  );

  const refreshAccessToken = useCallback(async () => {
    if (typeof window === "undefined") {
      return null;
    }

    if (refreshPromiseRef.current) {
      return refreshPromiseRef.current;
    }

    const refreshRequest = (async () => {
      const res = await fetch("/api/auth/refresh", {
        method: "POST",
        credentials: "include",
      });

      if (!res.ok) {
        clearSession();
        return null;
      }

      const data = (await res.json()) as AuthSuccessResponse;
      storeAuth(data);
      return data.accessToken;
    })().finally(() => {
      refreshPromiseRef.current = null;
    });

    refreshPromiseRef.current = refreshRequest;
    return refreshRequest;
  }, [clearSession, storeAuth]);

  const authFetch = useCallback(
    async (input: RequestInfo | URL, init?: RequestInit) => {
      const requestInit: RequestInit = {
        credentials: "include",
        ...init,
      };

      const send = async (token: string | null) => {
        const headers = new Headers(requestInit.headers);
        if (token) {
          headers.set("Authorization", `Bearer ${token}`);
        }

        return fetch(input, {
          ...requestInit,
          headers,
        });
      };

      const token = getStoredAccessToken();
      let res = await send(token);

      if (res.status !== 401 || !token) {
        return res;
      }

      const refreshedToken = await refreshAccessToken();
      if (!refreshedToken) {
        return res;
      }

      res = await send(refreshedToken);
      return res;
    },
    [getStoredAccessToken, refreshAccessToken]
  );

  const refreshSession = useCallback(async () => {
    if (typeof window === "undefined") {
      return;
    }

    setLoading(true);

    try {
      const token = getStoredAccessToken();
      if (!token) {
        clearSession();
        return;
      }

      const res = await authFetch("/api/auth/me");
      if (!res.ok) {
        clearSession();
        return;
      }

      const data = (await res.json()) as { user: AuthUser };
      setUser(data.user);
    } finally {
      setLoading(false);
    }
  }, [authFetch, clearSession, getStoredAccessToken]);

  useEffect(() => {
    void refreshSession();
  }, [refreshSession]);

  const login = useCallback(
    async (email: string, password: string) => {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ email, password }),
      });
      if (!res.ok) {
        throw new Error(await readErrorMessage(res));
      }
      const data = (await res.json()) as AuthSuccessResponse;
      storeAuth(data);
    },
    [storeAuth]
  );

  const register = useCallback(
    async (input: {
      email: string;
      password: string;
      firstName: string;
      lastName: string;
    }) => {
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(input),
      });
      if (!res.ok) {
        throw new Error(await readErrorMessage(res));
      }
      const data = (await res.json()) as AuthSuccessResponse;
      storeAuth(data);
    },
    [storeAuth]
  );

  const logout = useCallback(async () => {
    clearSession();
    try {
      await fetch("/api/auth/logout", {
        method: "POST",
        credentials: "include",
      });
    } catch {
      // Local session state is already cleared even if the network request fails.
    }
  }, [clearSession]);

  const value = useMemo(
    () => ({
      user,
      loading,
      login,
      register,
      logout,
      refreshSession,
    }),
    [user, loading, login, register, logout, refreshSession]
  );

  return (
    <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
  );
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error("useAuth must be used within AuthProvider");
  }
  return ctx;
}
