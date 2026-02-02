<template>
  <div class="login-view">
    <div class="login-container">
      <div class="login-header">
        <img src="/assets/alberta-logo.svg" alt="Alberta Government" class="login-logo">
        <h1>Sign In</h1>
        <p class="subtitle">Enterprise Template</p>
      </div>

      <goa-callout type="information" heading="Authentication Options">
        <p>This template supports dual authentication methods for Alberta Government applications:</p>
        <ul>
          <li><strong>SAML:</strong> For external users (citizens, businesses)</li>
          <li><strong>MS Entra ID:</strong> For internal government employees</li>
          <li><strong>Mock:</strong> For local development and testing</li>
        </ul>
      </goa-callout>

      <div class="auth-buttons">
        <GoabButton type="primary" size="normal" @click="handleSamlLogin">
          <goa-icon type="login" size="small" />
          Sign in with SAML
        </GoabButton>

        <GoabButton type="secondary" size="normal" @click="handleEntraIdLogin">
          <goa-icon type="login" size="small" />
          Sign in with MS Entra ID
        </GoabButton>

        <GoabButton type="tertiary" size="normal" @click="handleMockLogin">
          <goa-icon type="person" size="small" />
          Mock Login (Development)
        </GoabButton>
      </div>

      <div class="info-section">
        <h3>Development Mode</h3>
        <p>
          Currently running with mock authentication. The auth package includes:
        </p>
        <ul>
          <li><strong>Mock Driver:</strong> 3 test users (Developer, Admin, User)</li>
          <li><strong>SAML Driver:</strong> For external citizens and businesses</li>
          <li><strong>Entra ID Driver:</strong> For internal government employees</li>
          <li><strong>Session Storage:</strong> PostgreSQL-backed sessions</li>
          <li><strong>Security:</strong> Rate limiting, CSRF protection, secure cookies</li>
        </ul>
        <p class="note">
          <strong>Note:</strong> Switch authentication drivers by setting <code>AUTH_DRIVER</code> in your <code>.env</code> file
          to <code>mock</code>, <code>saml</code>, or <code>entra-id</code>.
        </p>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useAuthStore } from '../stores/auth.store'
import { GoabButton } from '../components/goa'

const authStore = useAuthStore()

/**
 * SAML Login
 * Redirects to API endpoint which initiates SAML authentication flow
 */
function handleSamlLogin() {
  console.log('SAML login initiated')
  // Direct browser redirect to SAML auth endpoint
  window.location.href = '/api/v1/auth/login'
}

/**
 * MS Entra ID Login
 * Redirects to API endpoint which initiates Entra ID OIDC flow
 */
function handleEntraIdLogin() {
  console.log('Entra ID login initiated')
  // Direct browser redirect to Entra ID auth endpoint
  window.location.href = '/api/v1/auth/login'
}

/**
 * Mock Login (Development)
 * Uses mock authentication driver with selectable test users
 * User index: 0=Developer, 1=Admin, 2=User
 */
async function handleMockLogin() {
  console.log('Mock login initiated')
  // Use auth store login method with default user (developer)
  // You can change the userIndex to test different mock users:
  // 0 = Developer (admin + developer + user roles)
  // 1 = Admin (admin + user roles)
  // 2 = Standard User (user role)
  await authStore.login(0)
}
</script>

<style scoped>
.login-view {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: calc(100vh - 300px);
  padding: 2rem 1rem;
}

.login-container {
  max-width: 600px;
  width: 100%;
}

.login-header {
  text-align: center;
  margin-bottom: 2rem;
}

.login-logo {
  height: 48px;
  margin-bottom: 1rem;
}

.login-header h1 {
  font-size: 2rem;
  font-weight: 700;
  color: #333333;
  margin: 0 0 0.5rem 0;
}

.subtitle {
  color: #525252;
  font-size: 1.125rem;
  margin: 0;
}

.auth-buttons {
  display: flex;
  flex-direction: column;
  gap: 1rem;
  margin: 2rem 0;
}

.auth-buttons goa-button {
  width: 100%;
}

.info-section {
  background: #F5F5F5;
  padding: 1.5rem;
  border-radius: 4px;
  margin-top: 2rem;
}

.info-section h3 {
  color: #007AC2;
  margin-top: 0;
  margin-bottom: 0.75rem;
}

.info-section p {
  color: #525252;
  line-height: 1.6;
  margin-bottom: 1rem;
}

.info-section ul {
  margin: 0.5rem 0 0 1.5rem;
  color: #525252;
  line-height: 1.8;
}

.info-section .note {
  margin-top: 1rem;
  padding: 0.75rem;
  background: #FFFFFF;
  border-left: 3px solid #007AC2;
  font-size: 0.9rem;
}

.info-section code {
  background: #E5E5E5;
  padding: 0.125rem 0.375rem;
  border-radius: 3px;
  font-family: 'Courier New', monospace;
  font-size: 0.875rem;
}
</style>
