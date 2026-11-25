import { APP_CONFIG } from '../config/appConfig';

const API_BASE_URL = APP_CONFIG.apiUrl;

/**
 * Compare two version strings. Returns 1 if v1 > v2, -1 if v1 < v2, and 0 if equal.
 */
export function compareVersions(v1, v2) {
  const clean = (v) =>
    (v || '')
      .toString()
      .trim()
      .replace(/^version\s*/i, '')
      .replace(/^v/i, '')
      .trim()
      .split('.')
      .map((n) => parseInt(n, 10) || 0);

  const p1 = clean(v1);
  const p2 = clean(v2);
  const len = Math.max(p1.length, p2.length);

  for (let i = 0; i < len; i++) {
    const num1 = p1[i] ?? 0;
    const num2 = p2[i] ?? 0;
    if (num1 > num2) return 1;
    if (num1 < num2) return -1;
  }
  return 0;
}

/**
 * Universal API request wrapper using native fetch()
 */
export async function apiRequest(endpoint, options = {}) {
  const token =
    localStorage.getItem('token') ||
    localStorage.getItem('admin_token') ||
    localStorage.getItem('accessToken') ||
    'admin-secure-token-session-01';

  const appVersion =
    localStorage.getItem('user_app_version') ||
    APP_CONFIG.version ||
    '1.0.0';

  const headers = {
    'Content-Type': 'application/json',
    'X-App-Version': appVersion,
    ...(token
      ? {
          Authorization: `Bearer ${token}; version=${appVersion}`,
          'x-session-id': token,
        }
      : {}),
    ...(options.headers || {}),
  };

  const url = `${API_BASE_URL}${endpoint}`;

  try {
    const response = await fetch(url, {
      ...options,
      headers,
      body: options.body && typeof options.body === 'object' ? JSON.stringify(options.body) : options.body,
    });

    const data = await response.json().catch(() => null);

    // Intercept optional update notification headers from middleware
    if (response.headers.get('x-update-available') === 'true') {
      const rawLatestVersion = response.headers.get('x-latest-version');
      const latestVersion = (rawLatestVersion || '').replace(/^v/i, '').trim();
      const currentStoredVer = (
        localStorage.getItem('user_app_version') ||
        appVersion ||
        '1.0.0'
      ).replace(/^v/i, '').trim();

      // Only dispatch if latestVersion is strictly greater than current version
      if (compareVersions(latestVersion, currentStoredVer) > 0) {
        const updateType = response.headers.get('x-update-type') || 'OPTIONAL';
        const rawTitle = response.headers.get('x-update-title');
        const rawContent = response.headers.get('x-update-content');
        let title = 'New Update Available';
        let releaseNotes =
          'A new optional patch release is available. You can update now or skip.';
        try {
          if (rawTitle) title = decodeURIComponent(rawTitle);
        } catch {
          if (rawTitle) title = rawTitle;
        }
        try {
          if (rawContent) releaseNotes = decodeURIComponent(rawContent);
        } catch {
          if (rawContent) releaseNotes = rawContent;
        }
        if (typeof window !== 'undefined') {
          window.dispatchEvent(
            new CustomEvent('app:optional_update_available', {
              detail: {
                latestVersion,
                updateType,
                title,
                releaseNotes,
                currentVersion: currentStoredVer,
              },
            }),
          );
        }
      }
    }

    if (!response.ok) {
      // Intercept mandatory upgrade required (HTTP 426) from middleware
      if (response.status === 426) {
        const latestVer = (data?.latestVersion || data?.requiredVersion || '').replace(/^v/i, '').trim();
        const currentStoredVer = (
          localStorage.getItem('user_app_version') ||
          appVersion ||
          '1.0.0'
        ).replace(/^v/i, '').trim();

        if (compareVersions(latestVer, currentStoredVer) > 0) {
          if (typeof window !== 'undefined') {
            window.dispatchEvent(
              new CustomEvent('app:force_update_required', {
                detail: data,
              }),
            );
          }
        }
      }

      const message =
        data?.message ||
        (Array.isArray(data?.message) ? data.message.join(', ') : null) ||
        `Request failed with status ${response.status}`;
      const err = new Error(message);
      err.status = response.status;
      err.data = data;
      throw err;
    }

    return data;
  } catch (err) {
    if (err.status) {
      throw err;
    }
    // Network connectivity or offline error
    const netErr = new Error('Cannot connect to backend server at ' + API_BASE_URL);
    netErr.status = 0;
    throw netErr;
  }
}

export function apiGet(endpoint, options = {}) {
  return apiRequest(endpoint, { ...options, method: 'GET' });
}

export function apiPost(endpoint, body, options = {}) {
  return apiRequest(endpoint, { ...options, method: 'POST', body });
}

export function apiPatch(endpoint, body, options = {}) {
  return apiRequest(endpoint, { ...options, method: 'PATCH', body });
}

export function apiDelete(endpoint, options = {}) {
  return apiRequest(endpoint, { ...options, method: 'DELETE' });
}

const api = {
  apiRequest,
  get: apiGet,
  post: apiPost,
  patch: apiPatch,
  delete: apiDelete,
};

export default api;

