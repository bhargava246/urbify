/**
 * Re-export the production-ready apiFetch as the default API client.
 * Import from here for backward compatibility.
 */
export { apiFetch as apiClient, ApiError } from '@/lib/api';
