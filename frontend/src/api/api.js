const API_BASE = '/api';

async function request(endpoint, options = {}) {
  const token = localStorage.getItem('smartmeal_token');
  const headers = { 'Content-Type': 'application/json', ...options.headers };
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const res = await fetch(`${API_BASE}${endpoint}`, { ...options, headers });

  if (res.status === 204) return null;

  const data = await res.json().catch(() => null);

  if (!res.ok) {
    const msg = data?.message || data?.error || `Request failed (${res.status})`;
    const err = new Error(msg);
    err.status = res.status;
    err.data = data;
    throw err;
  }
  return data;
}

// Auth
export const authAPI = {
  register: (body) => request('/auth/register', { method: 'POST', body: JSON.stringify(body) }),
  login: (body) => request('/auth/login', { method: 'POST', body: JSON.stringify(body) }),
  me: () => request('/auth/me'),
};

// Menus
export const menuAPI = {
  getAll: () => request('/menus'),
  getAvailable: () => request('/menus/available'),
  getByCategory: (cat) => request(`/menus/category/${cat}`),
  getById: (id) => request(`/menus/${id}`),
};

// Slots
export const slotAPI = {
  getAll: () => request('/slots'),
  getByCategory: (cat) => request(`/slots/category/${cat}`),
};

// Orders
export const orderAPI = {
  create: (body) => request('/orders', { method: 'POST', body: JSON.stringify(body) }),
  getMy: () => request('/orders/my'),
  getById: (id) => request(`/orders/${id}`),
  cancel: (id, reason) => request(`/orders/${id}/cancel?reason=${encodeURIComponent(reason || '')}`, { method: 'POST' }),
};

// Payments
export const paymentAPI = {
  initiate: (body) => request('/payments/initiate', { method: 'POST', body: JSON.stringify(body) }),
  simulateSuccess: (id) => request(`/payments/${id}/simulate-success`, { method: 'POST' }),
  getStatus: (id) => request(`/payments/${id}/status`),
  getByOrder: (orderId) => request(`/payments/order/${orderId}`),
};

// Admin
export const adminAPI = {
  dashboard: () => request('/admin/dashboard'),
  getOrders: (params) => {
    const q = params ? '?' + new URLSearchParams(params).toString() : '';
    return request(`/admin/orders${q}`);
  },
  updateOrderStatus: (id, status) => request(`/admin/orders/${id}/status`, { method: 'PUT', body: JSON.stringify({ status }) }),
  createMenu: (body) => request('/admin/menus', { method: 'POST', body: JSON.stringify(body) }),
  updateMenu: (id, body) => request(`/admin/menus/${id}`, { method: 'PUT', body: JSON.stringify(body) }),
  toggleMenu: (id) => request(`/admin/menus/${id}/toggle`, { method: 'PATCH' }),
  deleteMenu: (id) => request(`/admin/menus/${id}`, { method: 'DELETE' }),
  verifyPayment: (id) => request(`/admin/payments/${id}/verify`, { method: 'PUT' }),
  getPendingPayments: () => request('/admin/payments/pending'),
  getWindowStatus: () => request('/admin/settings/window-status'),
  setOverride: (enable) => request(`/admin/settings/override-hours?enable=${enable}`, { method: 'POST' }),
};

// Predictions
export const predictionAPI = {
  getAll: () => request('/predictions'),
  generate: () => request('/predictions/generate', { method: 'POST' }),
};
