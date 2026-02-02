<template>
  <header class="app-header">
    <div class="header-container">
      <!-- Alberta Logo and Service Name -->
      <router-link to="/" class="logo-container">
        <img
          src="/assets/alberta-logo.svg"
          alt="Alberta Government"
          class="alberta-logo"
        >
        <span class="service-name">{{ serviceName }}</span>
      </router-link>

      <!-- Header Actions -->
      <div class="header-actions">
        <!-- Health Status Indicator -->
        <div v-if="showHealthStatus" class="health-status">
          <div
            class="status-indicator"
            :class="healthStatusClass"
          ></div>
          <span class="status-text">{{ healthStatusText }}</span>
        </div>

        <!-- User Menu (when authenticated) -->
        <div v-if="user" class="user-menu">
          <button class="user-button" @click="toggleUserMenu">
            <goa-icon type="person" size="medium" />
            <span>{{ user.name }}</span>
          </button>

          <div v-if="showUserMenu" class="user-dropdown">
            <router-link to="/profile" class="menu-item" @click="showUserMenu = false">
              Profile
            </router-link>
            <button class="menu-item" @click="handleLogout">
              Sign Out
            </button>
          </div>
        </div>

        <!-- Sign In Button (when not authenticated) -->
        <router-link v-else to="/login" class="sign-in-button">
          Sign In
        </router-link>
      </div>
    </div>
  </header>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '../../stores/auth.store'

interface User {
  name: string
  email?: string
}

const props = withDefaults(
  defineProps<{
    serviceName?: string
    user?: User | null
    healthStatus?: 'healthy' | 'unhealthy' | 'checking'
    showHealthStatus?: boolean
  }>(),
  {
    serviceName: 'Enterprise Template',
    showHealthStatus: true
  }
)

const router = useRouter()
const authStore = useAuthStore()
const showUserMenu = ref(false)

const healthStatusClass = computed(() => {
  switch (props.healthStatus) {
    case 'healthy':
      return 'status-healthy'
    case 'unhealthy':
      return 'status-unhealthy'
    default:
      return 'status-checking'
  }
})

const healthStatusText = computed(() => {
  switch (props.healthStatus) {
    case 'healthy':
      return 'API Online'
    case 'unhealthy':
      return 'API Offline'
    default:
      return 'Checking...'
  }
})

function toggleUserMenu() {
  showUserMenu.value = !showUserMenu.value
}

async function handleLogout() {
  showUserMenu.value = false
  try {
    await authStore.logout()
    router.push('/login')
  } catch (error) {
    console.error('Logout failed:', error)
    // Still redirect to login even if API call fails
    router.push('/login')
  }
}
</script>

<style scoped>
.app-header {
  background: white;
  border-bottom: 1px solid #E5E5E5;
  padding: 1rem 2rem;
  position: sticky;
  top: 0;
  z-index: 100;
}

.header-container {
  max-width: 1280px;
  margin: 0 auto;
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.logo-container {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  text-decoration: none;
  color: inherit;
}

.alberta-logo {
  height: 32px;
  width: auto;
}

.service-name {
  font-family: 'acumin-pro-semi-condensed', 'Acumin Pro SemiCondensed', Arial, sans-serif;
  font-size: 1.25rem;
  font-weight: 600;
  color: #333333;
}

.header-actions {
  display: flex;
  align-items: center;
  gap: 1.5rem;
}

.health-status {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.status-indicator {
  width: 8px;
  height: 8px;
  border-radius: 50%;
}

.status-healthy {
  background-color: #10b981;
}

.status-unhealthy {
  background-color: #ef4444;
}

.status-checking {
  background-color: #9ca3af;
}

.status-text {
  font-size: 0.875rem;
  color: #525252;
}

.user-menu {
  position: relative;
}

.user-button {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.5rem 1rem;
  background: transparent;
  border: 1px solid #D4D4D4;
  border-radius: 4px;
  cursor: pointer;
  font-size: 0.875rem;
  color: #333333;
  transition: background 0.2s ease;
}

.user-button:hover {
  background: #F5F5F5;
}

.user-dropdown {
  position: absolute;
  top: 100%;
  right: 0;
  margin-top: 0.5rem;
  background: white;
  border: 1px solid #D4D4D4;
  border-radius: 4px;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
  min-width: 150px;
  z-index: 1000;
}

.menu-item {
  display: block;
  width: 100%;
  padding: 0.75rem 1rem;
  background: none;
  border: none;
  text-align: left;
  text-decoration: none;
  color: #333333;
  cursor: pointer;
  transition: background 0.2s ease;
}

.menu-item:hover {
  background: #F5F5F5;
}

.sign-in-button {
  padding: 0.5rem 1.5rem;
  background: #007AC2;
  color: white;
  border: none;
  border-radius: 4px;
  font-weight: 600;
  text-decoration: none;
  cursor: pointer;
  transition: background 0.2s ease;
}

.sign-in-button:hover {
  background: #005A8C;
}
</style>
