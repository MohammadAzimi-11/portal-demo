// ─────────────────────────────────────────────────────────────────────────────
// api.js — Shared Axios Instance
//
// All requests go through this instance. Without VITE_API_URL it uses the
// local demo adapter, so public demo builds do not call a backend.
//
// Usage:
//   import api from '@/lib/api'
//   const res = await api.get('/api/students', { params: { search: 'ali' } })
// ─────────────────────────────────────────────────────────────────────────────

import axios from 'axios'
import { demoAdapter, isDemoApiEnabled } from './demoApi'

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL ?? '/',
  headers: { 'Content-Type': 'application/json' },
  timeout: 15_000,
  adapter: isDemoApiEnabled() ? demoAdapter : undefined,
})

// ── Request interceptor — attach auth token when present ─────────────────────
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('portal_token')
  if (token) config.headers.Authorization = `Bearer ${token}`
  return config
})

// ── Response interceptor — normalise errors ──────────────────────────────────
api.interceptors.response.use(
  (response) => response,
  (error) => {
    const message =
      error?.response?.data?.message ??
      error?.message ??
      'An unexpected error occurred.'
    return Promise.reject(new Error(message))
  }
)

export default api
