<template>
  <div class="app-layout">
    <AppHeader
      :service-name="serviceName"
      :user="user"
      :health-status="healthStatus"
      :show-health-status="showHealthStatus"
    />

    <nav v-if="showNavigation" class="app-navigation">
      <div class="nav-container">
        <router-link
          v-for="item in navigationItems"
          :key="item.path"
          :to="item.path"
          class="nav-item"
          :class="{ 'nav-item-active': isActiveRoute(item.path) }"
        >
          {{ item.label }}
        </router-link>
      </div>
    </nav>

    <main class="app-main">
      <slot />
    </main>

    <AppFooter />
  </div>
</template>

<script setup lang="ts">
import { useRoute } from 'vue-router'
import AppHeader from './AppHeader.vue'
import AppFooter from './AppFooter.vue'

interface NavigationItem {
  path: string
  label: string
}

interface User {
  name: string
  email?: string
}

withDefaults(
  defineProps<{
    serviceName?: string
    user?: User | null
    healthStatus?: 'healthy' | 'unhealthy' | 'checking'
    showHealthStatus?: boolean
    showNavigation?: boolean
    navigationItems?: NavigationItem[]
  }>(),
  {
    serviceName: 'Enterprise Template',
    showHealthStatus: true,
    showNavigation: true,
    navigationItems: () => [
      { path: '/', label: 'Home' },
      { path: '/about', label: 'About' }
    ]
  }
)

const route = useRoute()

function isActiveRoute(path: string): boolean {
  return route.path === path
}
</script>

<style scoped>
.app-layout {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  font-family: 'acumin-pro-semi-condensed', 'Acumin Pro SemiCondensed', Arial, sans-serif;
}

.app-navigation {
  background: #F5F5F5;
  border-bottom: 1px solid #D4D4D4;
  position: sticky;
  top: 73px; /* Height of header */
  z-index: 90;
}

.nav-container {
  max-width: 1280px;
  margin: 0 auto;
  padding: 0 2rem;
  display: flex;
}

.nav-item {
  padding: 0.875rem 1.5rem;
  background: transparent;
  border: none;
  border-bottom: 3px solid transparent;
  color: #525252;
  font-size: 1.125rem;
  font-weight: 400;
  text-decoration: none;
  cursor: pointer;
  transition: all 0.2s ease;
}

.nav-item:hover {
  color: #007AC2;
  background: rgba(0, 122, 194, 0.05);
}

.nav-item-active {
  color: #007AC2;
  border-bottom-color: #007AC2;
  font-weight: 600;
}

.app-main {
  flex: 1;
  max-width: 1280px;
  margin: 0 auto;
  width: 100%;
  padding: 2rem;
}
</style>
