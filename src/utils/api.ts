import { safeStorage } from './storage';

export function getAuthHeaders(extraHeaders: Record<string, string> = {}): Record<string, string> {
  const headers: Record<string, string> = { ...extraHeaders };
  
  const token = safeStorage.getItem('auth_token');
  if (token && !headers['Authorization'] && !headers['authorization']) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const userStr = safeStorage.getItem('auth_user');
  if (userStr && !headers['X-Simulated-User'] && !headers['x-simulated-user']) {
    try {
      const u = JSON.parse(userStr);
      const ident = u.id || u.studentId || u.registrationNumber || u.username || (u.role === 'ADMIN' ? 'usr-admin-1' : u.role);
      if (ident) {
        headers['X-Simulated-User'] = ident;
      }
    } catch (_) {}
  }

  // Fallback if neither token nor simulated user header was set
  if (!headers['Authorization'] && !headers['authorization'] && !headers['X-Simulated-User'] && !headers['x-simulated-user']) {
    headers['X-Simulated-User'] = 'usr-admin-1';
  }

  return headers;
}

export async function apiFetch(url: string, options: RequestInit = {}): Promise<Response> {
  const headers = getAuthHeaders((options.headers as Record<string, string>) || {});
  return fetch(url, {
    ...options,
    headers
  });
}

/**
 * Safely parses response JSON without throwing Unexpected token '<' on HTML errors
 */
export async function safeJson<T = any>(res: Response, fallback: T = {} as T): Promise<T> {
  try {
    const contentType = res.headers.get('content-type') || '';
    if (!contentType.includes('application/json')) {
      const text = await res.text();
      try {
        return JSON.parse(text) as T;
      } catch (_) {
        return fallback;
      }
    }
    return (await res.json()) as T;
  } catch (err) {
    return fallback;
  }
}
