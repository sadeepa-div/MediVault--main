export const AUTH_TOKEN_KEY = 'mv_token';
export const AUTH_USER_KEY = 'mv_user';
export const LEGACY_AUTH_TOKEN_KEY = 'medivault_token';
export const LEGACY_AUTH_USER_KEY = 'medivault_user';

export function readAuthToken() {
  return localStorage.getItem(AUTH_TOKEN_KEY) ?? localStorage.getItem(LEGACY_AUTH_TOKEN_KEY) ?? null;
}

export function readAuthUser() {
  const preferred = localStorage.getItem(AUTH_USER_KEY);
  if (preferred) {
    try {
      return JSON.parse(preferred);
    } catch {
      // fall through to legacy key below
    }
  }

  const legacy = localStorage.getItem(LEGACY_AUTH_USER_KEY);
  if (!legacy) {
    return null;
  }

  try {
    return JSON.parse(legacy);
  } catch {
    return null;
  }
}

export function writeAuthSession(token, user) {
  localStorage.setItem(AUTH_TOKEN_KEY, token);
  localStorage.setItem(AUTH_USER_KEY, JSON.stringify(user));
  localStorage.setItem(LEGACY_AUTH_TOKEN_KEY, token);
  localStorage.setItem(LEGACY_AUTH_USER_KEY, JSON.stringify(user));
}

export function clearAuthSession() {
  localStorage.removeItem(AUTH_TOKEN_KEY);
  localStorage.removeItem(AUTH_USER_KEY);
  localStorage.removeItem(LEGACY_AUTH_TOKEN_KEY);
  localStorage.removeItem(LEGACY_AUTH_USER_KEY);
}
