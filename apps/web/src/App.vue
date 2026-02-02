<template>
  <AppLayout
    service-name="Enterprise Template"
    :user="user"
    :health-status="healthStatus"
    :show-health-status="true"
    :show-navigation="true"
    :navigation-items="navigationItems"
  >
    <router-view />
  </AppLayout>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useAuthStore } from './stores/auth.store'
import AppLayout from './components/layout/AppLayout.vue'

const authStore = useAuthStore()
const healthStatus = ref<'healthy' | 'unhealthy' | 'checking'>('checking')

// Get user from auth store
const user = computed(() => authStore.user)

const navigationItems = [
  { path: '/', label: 'Home' },
  { path: '/about', label: 'About' },
  { path: '/profile', label: 'Profile' }
]

async function checkHealth() {
  try {
    const response = await fetch('/api/v1/health')
    healthStatus.value = response.ok ? 'healthy' : 'unhealthy'
  } catch (error) {
    console.error('Health check failed:', error)
    healthStatus.value = 'unhealthy'
  }
}

onMounted(async () => {
  // Fetch current user from API
  await authStore.fetchUser()

  // Check API health
  checkHealth()
  // Check health every 30 seconds
  setInterval(checkHealth, 30000)
})
</script>
