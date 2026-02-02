<template>
  <div class="profile-view">
    <h1 class="page-heading">User Profile</h1>

    <goa-callout v-if="!user" type="important" heading="Not Authenticated">
      <p>You are not currently authenticated. Please <router-link to="/login">sign in</router-link> to view your profile.</p>
    </goa-callout>

    <template v-else>
      <goa-callout type="success" heading="Authenticated">
        <p>Your profile information is retrieved from the authentication provider and cannot be modified here.</p>
      </goa-callout>

      <div class="profile-card">
        <h2>Profile Information</h2>

        <div class="profile-section">
          <div class="info-row">
            <span class="info-label">User ID:</span>
            <span class="info-value">{{ user.id }}</span>
          </div>

          <div class="info-row">
            <span class="info-label">Full Name:</span>
            <span class="info-value">{{ user.name }}</span>
          </div>

          <div class="info-row">
            <span class="info-label">Email Address:</span>
            <span class="info-value">{{ user.email || 'Not provided' }}</span>
          </div>

          <div class="info-row">
            <span class="info-label">Organization:</span>
            <span class="info-value">{{ user.organization || 'Alberta Government' }}</span>
          </div>

          <div class="info-row">
            <span class="info-label">Roles:</span>
            <span class="info-value">
              <span v-for="role in user.roles" :key="role" class="role-badge">
                {{ role }}
              </span>
            </span>
          </div>
        </div>
      </div>
    </template>

    <div v-if="user" class="session-info">
      <h2>Session Information</h2>
      <div class="info-grid">
        <div class="info-item">
          <span class="info-label">Authentication Driver:</span>
          <span class="info-value">{{ authDriver }}</span>
        </div>
        <div class="info-item">
          <span class="info-label">Session Status:</span>
          <span class="info-value status-active">Active</span>
        </div>
        <div class="info-item">
          <span class="info-label">Session Storage:</span>
          <span class="info-value">{{ sessionStore }}</span>
        </div>
      </div>
    </div>

    <div v-if="user" class="authentication-details">
      <h2>Authentication Details</h2>
      <goa-callout type="information" heading="Authentication Drivers">
        <p>This template supports three authentication drivers that can be switched via the <code>AUTH_DRIVER</code> environment variable:</p>
        <ul>
          <li><strong>mock:</strong> Development mode with 3 test users (Developer, Admin, User)</li>
          <li><strong>saml:</strong> SAML 2.0 for external citizens and businesses</li>
          <li><strong>entra-id:</strong> Microsoft Entra ID (formerly Azure AD) for internal government employees</li>
        </ul>
      </goa-callout>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted } from 'vue'
import { useAuthStore } from '../stores/auth.store'

const authStore = useAuthStore()

// Get user from auth store
const user = computed(() => authStore.user)

// Get authentication driver from environment (default to 'mock')
const authDriver = computed(() => {
  return import.meta.env.VITE_AUTH_DRIVER || 'mock'
})

// Get session store type (from backend)
const sessionStore = computed(() => {
  return import.meta.env.VITE_SESSION_STORE || 'memory'
})

// Fetch user data when component mounts (in case it's not already loaded)
onMounted(async () => {
  if (!user.value) {
    await authStore.fetchUser()
  }
})
</script>

<style scoped>
.profile-view {
  max-width: 800px;
}

.page-heading {
  font-size: 1.75rem;
  font-weight: 700;
  color: #333333;
  margin-bottom: 1.5rem;
  padding-bottom: 0.5rem;
  border-bottom: 2px solid #007AC2;
}

.profile-card {
  background: white;
  padding: 2rem;
  border-radius: 4px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
  margin: 1.5rem 0;
}

.profile-card h2 {
  margin-top: 0;
  margin-bottom: 1.5rem;
  color: #333333;
}

.profile-section {
  display: flex;
  flex-direction: column;
  gap: 0;
}

.info-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1rem 0;
  border-bottom: 1px solid #E5E5E5;
}

.info-row:last-child {
  border-bottom: none;
}

.role-badge {
  display: inline-block;
  padding: 0.25rem 0.75rem;
  background: #007AC2;
  color: white;
  border-radius: 12px;
  font-size: 0.875rem;
  font-weight: 600;
  margin-right: 0.5rem;
}

.role-badge:last-child {
  margin-right: 0;
}

.session-info {
  background: #F5F5F5;
  padding: 1.5rem;
  border-radius: 4px;
  margin: 1.5rem 0;
}

.session-info h2 {
  margin-top: 0;
  margin-bottom: 1rem;
  color: #333333;
  font-size: 1.25rem;
}

.info-grid {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.info-item {
  display: flex;
  justify-content: space-between;
  padding: 0.75rem 0;
  border-bottom: 1px solid #D4D4D4;
}

.info-item:last-child {
  border-bottom: none;
}

.info-label {
  font-weight: 600;
  color: #525252;
}

.info-value {
  color: #333333;
  text-transform: capitalize;
}

.status-active {
  color: #10b981;
  font-weight: 600;
}

.authentication-details {
  background: white;
  padding: 2rem;
  border-radius: 4px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
  margin: 1.5rem 0;
}

.authentication-details h2 {
  margin-top: 0;
  margin-bottom: 1rem;
  color: #333333;
  font-size: 1.25rem;
}

.authentication-details ul {
  margin: 0.5rem 0 0 1.5rem;
  line-height: 1.8;
}

.authentication-details code {
  background: #E5E5E5;
  padding: 0.125rem 0.375rem;
  border-radius: 3px;
  font-family: 'Courier New', monospace;
  font-size: 0.875rem;
}
</style>
