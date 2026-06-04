/**
 * authFetch — drop-in replacement for fetch() that:
 *  1. Adds Authorization: Bearer <token> automatically
 *  2. On 401: tries to refresh the token, then retries once
 *  3. If refresh fails: clears auth + redirects to /auth
 */

async function refreshAccessToken(): Promise<string | null> {
  const refreshToken = localStorage.getItem('urb_refresh');
  if (!refreshToken) return null;
  try {
    const res = await fetch('/api/v1/auth/refresh', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${refreshToken}`,
      },
      body: JSON.stringify({ refreshToken }),
    });
    if (!res.ok) return null;
    const raw = await res.json();
    const data = raw?.data ?? raw;
    if (data?.accessToken) {
      localStorage.setItem('urb_access', data.accessToken);
      if (data.refreshToken) localStorage.setItem('urb_refresh', data.refreshToken);
      return data.accessToken;
    }
  } catch {}
  return null;
}

export async function authFetch(
  url: string,
  options: RequestInit = {}
): Promise<Response> {
  const token = localStorage.getItem('urb_access');

  const makeRequest = (t: string | null) =>
    fetch(url, {
      ...options,
      headers: {
        ...(options.headers || {}),
        ...(t ? { Authorization: `Bearer ${t}` } : {}),
      },
    });

  const res = await makeRequest(token);

  // If unauthorized, try refreshing once
  if (res.status === 401) {
    const newToken = await refreshAccessToken();
    if (newToken) {
      return makeRequest(newToken);
    }
    // Refresh failed — clear auth and redirect
    localStorage.removeItem('urb_access');
    localStorage.removeItem('urb_refresh');
    localStorage.removeItem('urb_user');
    window.location.href = '/auth';
    return res; // unreachable but satisfies TS
  }

  return res;
}
