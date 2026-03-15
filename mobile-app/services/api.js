/**
 * ════════════════════════════════════════════
 * services/api.js — AXIOS HTTP CLIENT
 * ════════════════════════════════════════════
 *
 * WHY AXIOS INTERCEPTORS?
 * - Request interceptor: auto-attach token to EVERY request
 *   (no need to manually add header in every screen)
 * - Response interceptor: handle 401 globally (auto-logout)
 *
 * ⚠️  IMPORTANT: Change BASE_URL to your computer's IP
 *    Run: ipconfig (Windows) | ifconfig (Mac/Linux)
 *    Example: http://192.168.1.100:5000
 */

import axios from "axios";
import AsyncStorage from "@react-native-async-storage/async-storage";

// 🔴 CHANGE THIS to your computer's local IP address
export const BASE_URL = "http://192.168.1.100:5000";

const api = axios.create({
  baseURL: `${BASE_URL}/api`,
  timeout: 30000, // 30 second timeout
});

// ─── Request Interceptor ──────────────────────
// Runs before EVERY request — auto-adds token
api.interceptors.request.use(
  async (config) => {
    const token = await AsyncStorage.getItem("token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// ─── Response Interceptor ────────────────────
// Handle global errors
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (error.response?.status === 401) {
      // Token expired — clear storage (logout handled in AuthContext)
      await AsyncStorage.multiRemove(["token", "user"]);
    }
    return Promise.reject(error);
  }
);

// ─── Auth ─────────────────────────────────────
export const authAPI = {
  register: (data) => api.post("/auth/register", data),
  login: (data) => api.post("/auth/login", data),
  getMe: () => api.get("/auth/me"),
};

// ─── Users ────────────────────────────────────
export const userAPI = {
  getProfile: (id) => api.get(`/users/${id}`),
  getUserPosts: (id) => api.get(`/users/${id}/posts`),
  updateProfile: (data) => api.put("/users/update", data, {
    headers: { "Content-Type": "multipart/form-data" },
  }),
  follow: (id) => api.put(`/users/follow/${id}`),
  unfollow: (id) => api.put(`/users/unfollow/${id}`),
  search: (q) => api.get(`/users/search?q=${q}`),
  getSuggestions: () => api.get("/users/suggestions"),
};

// ─── Posts ────────────────────────────────────
export const postAPI = {
  create: (data) => api.post("/posts/create", data, {
    headers: { "Content-Type": "multipart/form-data" },
  }),
  getFeed: (page = 1) => api.get(`/posts/feed?page=${page}&limit=10`),
  getPost: (id) => api.get(`/posts/${id}`),
  delete: (id) => api.delete(`/posts/${id}`),
  like: (id) => api.put(`/posts/like/${id}`),
  comment: (id, text) => api.post(`/posts/comment/${id}`, { text }),
  save: (id) => api.put(`/posts/save/${id}`),
  getSaved: () => api.get("/posts/saved"),
};

// ─── Stories ──────────────────────────────────
export const storyAPI = {
  create: (data) => api.post("/stories/create", data, {
    headers: { "Content-Type": "multipart/form-data" },
  }),
  getFeed: () => api.get("/stories/feed"),
  view: (id) => api.put(`/stories/view/${id}`),
};

// ─── Reels ────────────────────────────────────
export const reelAPI = {
  create: (data) => api.post("/reels/create", data, {
    headers: { "Content-Type": "multipart/form-data" },
  }),
  getFeed: (page = 1) => api.get(`/reels/feed?page=${page}`),
  like: (id) => api.put(`/reels/like/${id}`),
};

// ─── Messages ─────────────────────────────────
export const messageAPI = {
  send: (data) => api.post("/messages/send", data, {
    headers: { "Content-Type": "multipart/form-data" },
  }),
  getConversations: () => api.get("/messages/conversations"),
  getMessages: (convId) => api.get(`/messages/${convId}`),
};

// ─── Notifications ────────────────────────────
export const notificationAPI = {
  get: () => api.get("/notifications"),
  markAllRead: () => api.put("/notifications/read-all"),
  getUnreadCount: () => api.get("/notifications/unread-count"),
};

export default api;
