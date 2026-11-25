import axios from 'axios';
import { API_URL, FILE_URL } from '../config';
import { getToken, clearToken } from './storage';

const api = axios.create({ baseURL: API_URL });

api.interceptors.request.use((cfg) => {
  const token = getToken();
  if (token) cfg.headers.Authorization = `Bearer ${token}`;
  return cfg;
});

api.interceptors.response.use(
  (res) => res,
  (err) => {
    const isLogin = err.config?.url?.includes('/auth/login');
    if (err.response?.status === 401 && !isLogin) {
      clearToken();
      if (window.location.pathname !== '/login') window.location.assign('/login');
    }
    return Promise.reject(err);
  }
);

export const errMsg = (e) =>
  e.response?.data?.message || (e.code === 'ERR_NETWORK' ? 'Cannot reach the server. Is the backend running?' : e.message) || 'Something went wrong';
export const fieldErrors = (e) => e.response?.data?.errors || {};
export const photoUrl = (p) => (p ? (p.startsWith('http') ? p : `${FILE_URL}${p}`) : '');

export const authApi = {
  login: (body) => api.post('/auth/login', body).then((r) => r.data),
  logout: () => api.post('/auth/logout').catch(() => {}),
  me: () => api.get('/auth/me').then((r) => r.data.user),
  changePassword: (body) => api.put('/auth/change-password', body).then((r) => r.data),
};
export const employeeApi = {
  list: (params) => api.get('/employees', { params }).then((r) => r.data),
  get: (id) => api.get(`/employees/${id}`).then((r) => r.data.employee),
  create: (form) => api.post('/employees', form).then((r) => r.data),
  update: (id, form) => api.put(`/employees/${id}`, form).then((r) => r.data.employee),
  remove: (id) => api.delete(`/employees/${id}`).then((r) => r.data),
  resetPassword: (id) => api.post(`/employees/${id}/reset-password`).then((r) => r.data),
};
export const departmentApi = {
  list: () => api.get('/departments').then((r) => r.data.data),
  create: (body) => api.post('/departments', body).then((r) => r.data.department),
  update: (id, body) => api.put(`/departments/${id}`, body).then((r) => r.data.department),
  remove: (id) => api.delete(`/departments/${id}`).then((r) => r.data),
};
export const reportApi = {
  summary: () => api.get('/reports/summary').then((r) => r.data),
  employees: (department) => api.get('/reports/employees', { params: { department } }).then((r) => r.data),
  exportXlsx: (department) =>
    api.get('/reports/employees/export', { params: { department }, responseType: 'blob' }).then((r) => {
      const match = /filename="?([^"]+)"?/.exec(r.headers['content-disposition'] || '');
      return { blob: r.data, filename: match?.[1] || 'teamora-employees.xlsx' };
    }),
};
export default api;
