export const API_BASE = 'http://localhost:3000/api';

export const api = async (endpoint, options = {}) => {
  const token = localStorage.getItem('token');
  const headers = {
    'Content-Type': 'application/json',
    ...(token ? { 'Authorization': `Bearer ${token}` } : {})
  };
  
  try {
    const res = await fetch(`${API_BASE}${endpoint}`, { ...options, headers });
    const data = await res.json();
    if (!data.ok) throw new Error(data.error || 'API Error');
    return data;
  } catch (err) {
    throw err;
  }
};
