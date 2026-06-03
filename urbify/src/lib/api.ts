/**
 * Urbify – Production API Client
 * Handles: base URL, auth headers, access-token refresh, error shaping
 */

const API_BASE =
  process.env.NEXT_PUBLIC_API_URL
    ? `${process.env.NEXT_PUBLIC_API_URL}/api/v1`
    : 'http://localhost:3001/api/v1';

// ─── Token storage (browser-safe) ────────────────────────────────────────────

export const tokenStore = {
  getAccess: (): string | null =>
    typeof window !== 'undefined' ? localStorage.getItem('urb_access') : null,
  getRefresh: (): string | null =>
    typeof window !== 'undefined' ? localStorage.getItem('urb_refresh') : null,
  set: (access: string, refresh: string) => {
    if (typeof window === 'undefined') return;
    localStorage.setItem('urb_access', access);
    localStorage.setItem('urb_refresh', refresh);
  },
  clear: () => {
    if (typeof window === 'undefined') return;
    localStorage.removeItem('urb_access');
    localStorage.removeItem('urb_refresh');
    localStorage.removeItem('urb_user');
  },
  setUser: (user: unknown) => {
    if (typeof window === 'undefined') return;
    localStorage.setItem('urb_user', JSON.stringify(user));
  },
  getUser: <T = unknown>(): T | null => {
    if (typeof window === 'undefined') return null;
    try {
      const raw = localStorage.getItem('urb_user');
      return raw ? (JSON.parse(raw) as T) : null;
    } catch {
      return null;
    }
  },
};

// ─── Error type ───────────────────────────────────────────────────────────────

export class ApiError extends Error {
  constructor(
    public readonly status: number,
    public readonly message: string,
    public readonly data?: unknown,
  ) {
    super(message);
    this.name = 'ApiError';
  }
}

// ─── Refresh lock (prevent parallel refresh storms) ───────────────────────────

let refreshPromise: Promise<void> | null = null;

async function refreshTokens(): Promise<void> {
  const refresh = tokenStore.getRefresh();
  if (!refresh) {
    tokenStore.clear();
    throw new ApiError(401, 'Session expired. Please log in again.');
  }

  const res = await fetch(`${API_BASE}/auth/refresh`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${refresh}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({ refreshToken: refresh }),
  });

  if (!res.ok) {
    tokenStore.clear();
    throw new ApiError(401, 'Session expired. Please log in again.');
  }

  const data = await res.json();
  tokenStore.set(data.accessToken, data.refreshToken ?? refresh);
}

// ─── Core fetch wrapper ───────────────────────────────────────────────────────

interface FetchOptions extends RequestInit {
  skipAuth?: boolean;
  /** automatically handle 401 → refresh → retry */
  withRetry?: boolean;
}

export async function apiFetch<T>(path: string, options: FetchOptions = {}): Promise<T> {
  const { skipAuth = false, withRetry = true, ...init } = options;

  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(init.headers as Record<string, string>),
  };

  // Remove Content-Type for multipart (let browser set boundary)
  if (init.body instanceof FormData) {
    delete headers['Content-Type'];
  }

  if (!skipAuth) {
    const token = tokenStore.getAccess();
    if (token) headers['Authorization'] = `Bearer ${token}`;
  }

  const response = await fetch(`${API_BASE}${path}`, { ...init, headers });

  // ── 401: try token refresh once ───────────────────────────────────────────
  if (response.status === 401 && withRetry && !skipAuth) {
    if (!refreshPromise) {
      refreshPromise = refreshTokens().finally(() => {
        refreshPromise = null;
      });
    }
    await refreshPromise;

    // Retry with new token
    const newToken = tokenStore.getAccess();
    if (newToken) headers['Authorization'] = `Bearer ${newToken}`;
    const retryRes = await fetch(`${API_BASE}${path}`, { ...init, headers });

    if (!retryRes.ok) {
      const errBody = await retryRes.json().catch(() => ({}));
      throw new ApiError(
        retryRes.status,
        (errBody as { message?: string }).message ?? retryRes.statusText,
        errBody,
      );
    }

    if (retryRes.status === 204) return undefined as T;
    return retryRes.json() as Promise<T>;
  }

  if (!response.ok) {
    const errBody = await response.json().catch(() => ({}));
    throw new ApiError(
      response.status,
      (errBody as { message?: string }).message ?? response.statusText,
      errBody,
    );
  }

  if (response.status === 204) return undefined as T;
  return response.json() as Promise<T>;
}
