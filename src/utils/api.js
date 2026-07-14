const BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001'

function getToken() {
  return localStorage.getItem('token')
}

async function request(path, options = {}) {
  const token = getToken()
  const res = await fetch(`${BASE_URL}${path}`, {
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    ...options,
  })
  if (res.status === 401) {
    localStorage.removeItem('token')
    localStorage.removeItem('username')
    window.location.hash = '#login'
    throw new Error('未登录')
  }
  if (!res.ok) {
    const err = await res.json().catch(() => ({}))
    throw new Error(err.error || `请求失败 ${res.status}`)
  }
  return res.json()
}

export const api = {
  // 认证
  register: (username, password) => request('/api/auth/register', {
    method: 'POST',
    body: JSON.stringify({ username, password }),
  }),
  login: (username, password) => request('/api/auth/login', {
    method: 'POST',
    body: JSON.stringify({ username, password }),
  }),
  updateUsername: (username) => request('/api/auth/username', {
    method: 'PUT',
    body: JSON.stringify({ username }),
  }),

  // 分类
  getCategories: () => request('/api/categories'),
  addCategory: (name, color) => request('/api/categories', {
    method: 'POST',
    body: JSON.stringify({ name, color }),
  }),
  deleteCategory: (id) => request(`/api/categories/${id}`, { method: 'DELETE' }),

  // 房间
  getRooms: () => request('/api/rooms'),
  addRoom: (name, icon) => request('/api/rooms', {
    method: 'POST',
    body: JSON.stringify({ name, icon }),
  }),
  deleteRoom: (id) => request(`/api/rooms/${id}`, { method: 'DELETE' }),

  // 物品
  getItems: (params = {}) => {
    const qs = new URLSearchParams(
      Object.entries(params).filter(([, v]) => v != null && v !== '')
    ).toString()
    return request(`/api/items${qs ? `?${qs}` : ''}`)
  },
  getItem: (id) => request(`/api/items/${id}`),
  addItem: (item) => request('/api/items', {
    method: 'POST',
    body: JSON.stringify(item),
  }),
  updateItem: (id, item) => request(`/api/items/${id}`, {
    method: 'PUT',
    body: JSON.stringify(item),
  }),
  deleteItem: (id) => request(`/api/items/${id}`, { method: 'DELETE' }),
  toggleFavorite: (id) => request(`/api/items/${id}/favorite`, { method: 'PATCH' }),
  getFavoriteItems: () => request('/api/items?favorite=true'),
}
