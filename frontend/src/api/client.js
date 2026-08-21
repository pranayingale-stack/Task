// api/client.js
// Small wrapper around fetch so every call gets the auth header, JSON
// parsing, and consistent error objects without repeating boilerplate.

const BASE_URL = import.meta.env.VITE_API_URL
  ? `${import.meta.env.VITE_API_URL.replace(/\/$/, '')}/api`
  : '/api';

class ApiClientError extends Error {
  constructor(message, status, details) {
    super(message);
    this.status = status;
    this.details = details;
  }
}

let authToken = null;
let onUnauthorized = null;

function setAuthToken(token) {
  authToken = token;
}

function setUnauthorizedHandler(handler) {
  onUnauthorized = handler;
}

async function request(path, { method = 'GET', body, params } = {}) {
  let url = `${BASE_URL}${path}`;
  if (params) {
    const query = new URLSearchParams(
      Object.entries(params).filter(([, v]) => v !== undefined && v !== '')
    ).toString();
    if (query) url += `?${query}`;
  }

  const headers = { 'Content-Type': 'application/json' };
  if (authToken) headers.Authorization = `Bearer ${authToken}`;

  let res;
  try {
    res = await fetch(url, {
      method,
      headers,
      body: body !== undefined ? JSON.stringify(body) : undefined,
    });
  } catch (networkErr) {
    throw new ApiClientError('Could not reach the server. Check your connection and try again.', 0);
  }

  if (res.status === 204) return null;

  let data = null;
  const text = await res.text();
  if (text) {
    try {
      data = JSON.parse(text);
    } catch {
      data = null;
    }
  }

  if (!res.ok) {
    if (res.status === 401 && onUnauthorized) onUnauthorized();
    throw new ApiClientError(data?.error || 'Something went wrong.', res.status, data?.details);
  }

  return data;
}

export const api = {
  get: (path, params) => request(path, { method: 'GET', params }),
  post: (path, body) => request(path, { method: 'POST', body }),
  put: (path, body) => request(path, { method: 'PUT', body }),
  patch: (path, body) => request(path, { method: 'PATCH', body }),
  del: (path) => request(path, { method: 'DELETE' }),
};

export { setAuthToken, setUnauthorizedHandler, ApiClientError };
