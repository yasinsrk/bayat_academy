// src/utils/tokenWatcher.js

/**
 * Decode a JWT payload (no verification — that happens on the server).
 */
export function decodeJwt(token) {
  try {
    const base64Url = token.split('.')[1];
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    const jsonPayload = decodeURIComponent(
      atob(base64)
        .split('')
        .map((c) => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
        .join('')
    );
    return JSON.parse(jsonPayload);
  } catch {
    return null;
  }
}

/**
 * Returns milliseconds until the token expires.
 * Returns 0 or negative if already expired.
 */
export function msUntilExpiry(token) {
  const payload = decodeJwt(token);
  if (!payload || !payload.exp) return -1;
  return payload.exp * 1000 - Date.now();
}