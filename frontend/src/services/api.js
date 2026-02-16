import axios from 'axios';

const API_BASE = import.meta.env.VITE_API_URL || '';

const api = axios.create({
  baseURL: `${API_BASE}/api`,
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// Auth
export const login = (email, password) => api.post('/auth/login', { email, password });
export const getMe = () => api.get('/auth/me');

// Tasks
export const getTasks = (params) => api.get('/tasks', { params });
export const getTask = (id) => api.get(`/tasks/${id}`);
export const createTask = (data) => api.post('/tasks', data);
export const updateTask = (id, data) => api.put(`/tasks/${id}`, data);
export const deleteTask = (id) => api.delete(`/tasks/${id}`);
export const togglePin = (id) => api.patch(`/tasks/${id}/pin`);
export const getCalendarTasks = (params) => api.get('/tasks/calendar', { params });

// Subtasks
export const addSubtask = (taskId, data) => api.post(`/tasks/${taskId}/subtasks`, data);
export const updateSubtask = (taskId, subtaskId, data) => api.put(`/tasks/${taskId}/subtasks/${subtaskId}`, data);
export const deleteSubtask = (taskId, subtaskId) => api.delete(`/tasks/${taskId}/subtasks/${subtaskId}`);

// Comments
export const getComments = (taskId) => api.get(`/tasks/${taskId}/comments`);
export const addComment = (taskId, content) => api.post(`/tasks/${taskId}/comments`, { content });

// Attachments
export const uploadAttachment = (taskId, file) => {
  const formData = new FormData();
  formData.append('file', file);
  return api.post(`/tasks/${taskId}/attachments`, formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
};
export const downloadAttachment = (id) => api.get(`/attachments/${id}/download`, { responseType: 'blob' });
export const deleteAttachment = (id) => api.delete(`/attachments/${id}`);

// Notifications
export const getNotifications = () => api.get('/notifications');
export const markNotificationRead = (id) => api.patch(`/notifications/${id}/read`);
export const markAllNotificationsRead = () => api.patch('/notifications/read-all');

// Activity
export const getActivity = (taskId) => api.get(`/tasks/${taskId}/activity`);

// Recurring Tasks
export const getRecurringTasks = () => api.get('/recurring-tasks');
export const createRecurringTask = (data) => api.post('/recurring-tasks', data);
export const updateRecurringTask = (id, data) => api.put(`/recurring-tasks/${id}`, data);
export const deleteRecurringTask = (id) => api.delete(`/recurring-tasks/${id}`);

// Dashboard
export const getDashboardStats = () => api.get('/dashboard/stats');
export const getInspiration = () => api.get('/dashboard/inspiration');

export default api;
