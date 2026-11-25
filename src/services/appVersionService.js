import api from './api';

/**
 * Compare two semantic version strings (e.g. "1.2.0" vs "1.10.0").
 * Returns > 0 if v1 > v2, < 0 if v1 < v2, 0 if equal.
 */
export const compareSemver = (v1, v2) => {
  if (!v1 || !v2) return 0;
  const p1 = v1.split('.').map((n) => parseInt(n, 10) || 0);
  const p2 = v2.split('.').map((n) => parseInt(n, 10) || 0);
  for (let i = 0; i < 3; i++) {
    const diff = (p1[i] || 0) - (p2[i] || 0);
    if (diff !== 0) return diff;
  }
  return 0;
};

export const appVersionService = {
  /**
   * Fetches all app versions with optional platform and isActive query filters
   */
  async getAppVersions({ platform, isActive } = {}) {
    const params = new URLSearchParams();
    if (platform && platform !== 'ALL') params.append('platform', platform);
    if (isActive !== undefined && isActive !== 'ALL') params.append('isActive', String(isActive));

    const qs = params.toString();
    const endpoint = `/admin/app-versions${qs ? `?${qs}` : ''}`;
    const response = await apiClient.get(endpoint);
    return response.data || [];
  },

  /**
   * Fetches single app version by ID
   */
  async getAppVersionById(id) {
    const response = await apiClient.get(`/admin/app-versions/${id}`);
    return response.data;
  },

  /**
   * Creates a new application version record
   */
  async createAppVersion(data) {
    const response = await apiClient.post('/admin/app-versions', data);
    return response.data;
  },

  /**
   * Updates an existing application version
   */
  async updateAppVersion(id, data) {
    const response = await apiClient.patch(`/admin/app-versions/${id}`, data);
    return response.data;
  },

  /**
   * Updates active status (true/false) for an application version
   */
  async updateAppVersionStatus(id, isActive) {
    const response = await apiClient.patch(`/admin/app-versions/${id}/status`, { isActive });
    return response.data;
  },

  /**
   * Deletes an application version record
   */
  async deleteAppVersion(id) {
    const response = await apiClient.delete(`/admin/app-versions/${id}`);
    return response;
  },
};

export default appVersionService;
