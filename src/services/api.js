import { APP_CONFIG } from '../config/appConfig';

const API_BASE_URL = APP_CONFIG.apiUrl;

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
    ...(token ? { Authorization: `Bearer ${token}`, 'x-session-id': token } : {}),
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
      const latestVersion = response.headers.get('x-latest-version');
      const updateType = response.headers.get('x-update-type');
      if (typeof window !== 'undefined') {
        window.dispatchEvent(
          new CustomEvent('app:optional_update_available', {
            detail: { latestVersion, updateType, currentVersion: appVersion },
          }),
        );
      }
    }

    if (!response.ok) {
      // Intercept mandatory upgrade required (HTTP 426) from middleware
      if (response.status === 426) {
        if (typeof window !== 'undefined') {
          window.dispatchEvent(
            new CustomEvent('app:force_update_required', {
              detail: data,
            }),
          );
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

