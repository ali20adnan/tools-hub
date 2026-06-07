"use client"

import { create } from "zustand"
import { tokenManager } from "@/lib/tokenManager"

// Import types from authTypes
import type { User } from './authTypes';

interface AuthState {
  user: User | null
  isAuthenticated: boolean
  isLoading: boolean
}

interface AuthActions {
  setAuth: (user: User, token: string) => void
  setUser: (user: User) => void
  clearAuth: () => void
  setLoading: (loading: boolean) => void
  checkAuth: () => boolean
}

type AuthStore = AuthState & AuthActions

function normalizeUser(user: User): User {
  return {
    ...user,
    role: typeof user.role === 'string' ? user.role.toLowerCase() : user.role,
  }
}

// Auth state lives in memory only. The token is kept in a cookie (tokenManager),
// and the user is rehydrated from the API (/auth/me) on load — no browser storage.
export const useAuthStore = create<AuthStore>()((set, get) => ({
  user: null,
  isAuthenticated: false,
  isLoading: false,

  setAuth: (user: User, token: string) => {
    tokenManager.setToken(token)
    const normalized = normalizeUser(user)
    set({ user: normalized, isAuthenticated: true, isLoading: false })
  },

  setUser: (user: User) => {
    set({ user: normalizeUser(user), isAuthenticated: true })
  },

  clearAuth: () => {
    tokenManager.removeToken()
    set({ user: null, isAuthenticated: false, isLoading: false })
  },

  setLoading: (loading: boolean) => {
    set({ isLoading: loading })
  },

  checkAuth: () => {
    const hasToken = tokenManager.hasToken()
    const { user } = get()
    const isAuth = hasToken && !!user

    if (isAuth !== get().isAuthenticated) {
      set({ isAuthenticated: isAuth })
    }

    return isAuth
  },
}))
