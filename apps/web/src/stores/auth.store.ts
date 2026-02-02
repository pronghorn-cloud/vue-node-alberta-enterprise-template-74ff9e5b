/**
 * Auth Store - Pinia
 *
 * Manages authentication state and provides auth-related actions
 */

import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import axios from 'axios'

const API_BASE = '/api/v1'

export interface User {
  id: string
  email: string
  name: string
  roles: string[]
  attributes: Record<string, any>
}

export const useAuthStore = defineStore('auth', () => {
  // State
  const user = ref<User | null>(null)
  const loading = ref(false)
  const error = ref<string | null>(null)

  // Getters
  const isAuthenticated = computed(() => !!user.value)
  const hasRole = computed(() => (role: string | string[]) => {
    if (!user.value || !user.value.roles) return false
    const requiredRoles = Array.isArray(role) ? role : [role]
    return requiredRoles.some(r => user.value!.roles.includes(r))
  })

  // Actions
  async function fetchUser() {
    try {
      loading.value = true
      error.value = null

      const response = await axios.get(`${API_BASE}/auth/me`, {
        withCredentials: true
      })

      if (response.data.success) {
        user.value = response.data.data.user
        return user.value
      } else {
        user.value = null
        return null
      }
    } catch (err: any) {
      if (err.response?.status === 401) {
        // Not authenticated - this is okay
        user.value = null
      } else {
        error.value = err.response?.data?.error?.message || 'Failed to fetch user'
        console.error('Failed to fetch user:', err)
      }
      return null
    } finally {
      loading.value = false
    }
  }

  async function login(userIndex: number = 0) {
    try {
      loading.value = true
      error.value = null

      // For mock auth, redirect to login endpoint with user selection
      window.location.href = `${API_BASE}/auth/login?user=${userIndex}`
    } catch (err: any) {
      error.value = err.response?.data?.error?.message || 'Failed to login'
      loading.value = false
      throw err
    }
  }

  async function logout() {
    try {
      loading.value = true
      error.value = null

      await axios.post(`${API_BASE}/auth/logout`, {}, {
        withCredentials: true
      })

      user.value = null
    } catch (err: any) {
      error.value = err.response?.data?.error?.message || 'Failed to logout'
      throw err
    } finally {
      loading.value = false
    }
  }

  async function checkStatus() {
    try {
      const response = await axios.get(`${API_BASE}/auth/status`, {
        withCredentials: true
      })

      return response.data.data
    } catch (err) {
      console.error('Failed to check auth status:', err)
      return { authenticated: false }
    }
  }

  return {
    // State
    user,
    loading,
    error,

    // Getters
    isAuthenticated,
    hasRole,

    // Actions
    fetchUser,
    login,
    logout,
    checkStatus
  }
})
