<template>
  <div class="home-view">
    <h1 class="page-heading">
      🚀 Alberta Government Enterprise Template
    </h1>

    <goa-callout type="success" heading="✅ Production Ready">
      <p><strong>All 8 phases complete.</strong> This template is fully documented and ready for production use in Alberta Government applications.</p>
      <p style="margin-top: 0.5rem;">Visit the <router-link to="/about" style="color: #007AC2; font-weight: 600;">About page</router-link> to see detailed implementation progress and technical achievements.</p>
    </goa-callout>

    <div class="content-card">
      <p class="lead-text">
        Production-ready <strong>Vue.js + Node.js + TypeScript</strong> enterprise template for Alberta Government applications with official GoA Design System, dual authentication (SAML 2.0 + MS Entra ID), and type-safe configuration.
      </p>

      <div class="stats-grid">
        <!-- Stat Box 1 -->
        <div class="stat-box">
          <div class="stat-number">5</div>
          <div class="stat-label">Packages</div>
        </div>

        <!-- Stat Box 2 -->
        <div class="stat-box">
          <div class="stat-number">2</div>
          <div class="stat-label">Applications</div>
        </div>

        <!-- Stat Box 3 -->
        <div class="stat-box">
          <div class="stat-number">100%</div>
          <div class="stat-label">TypeScript</div>
        </div>

        <!-- Stat Box 4 -->
        <div class="stat-box">
          <div class="stat-number">3</div>
          <div class="stat-label">Auth Drivers</div>
        </div>
      </div>
    </div>

    <!-- Quick Links -->
    <div class="quick-links-section">
      <h2 class="section-title">📚 Quick Links</h2>

      <div class="links-grid">
        <div class="link-card">
          <h3>🏗️ Architecture</h3>
          <p>System design, BFF pattern, and driver architecture</p>
          <a href="https://github.com/yourusername/yourrepo/blob/main/docs/ARCHITECTURE.md" target="_blank" class="card-link">View Documentation →</a>
        </div>

        <div class="link-card">
          <h3>🚀 Development</h3>
          <p>Getting started, workflow, and best practices</p>
          <a href="https://github.com/yourusername/yourrepo/blob/main/docs/DEVELOPMENT.md" target="_blank" class="card-link">View Documentation →</a>
        </div>

        <div class="link-card">
          <h3>🔐 Authentication</h3>
          <p>SAML and MS Entra ID setup guide</p>
          <a href="https://github.com/yourusername/yourrepo/blob/main/docs/AUTH-SETUP.md" target="_blank" class="card-link">View Documentation →</a>
        </div>

        <div class="link-card">
          <h3>🐳 Deployment</h3>
          <p>Azure, OpenShift, and Kubernetes guides</p>
          <a href="https://github.com/yourusername/yourrepo/blob/main/docs/DEPLOYMENT.md" target="_blank" class="card-link">View Documentation →</a>
        </div>

        <div class="link-card">
          <h3>🎨 GoA Components</h3>
          <p>Design System integration and usage</p>
          <a href="https://github.com/yourusername/yourrepo/blob/main/docs/GOA-COMPONENTS.md" target="_blank" class="card-link">View Documentation →</a>
        </div>

        <div class="link-card">
          <h3>📘 Template Guide</h3>
          <p>Step-by-step customization instructions</p>
          <a href="https://github.com/yourusername/yourrepo/blob/main/TEMPLATE-GUIDE.md" target="_blank" class="card-link">View Documentation →</a>
        </div>
      </div>
    </div>

    <!-- Key Features -->
    <div class="features-section">
      <h2 class="section-title">⭐ Key Features</h2>

      <div class="features-grid">
        <div class="feature-item">
          <div class="feature-icon">🔒</div>
          <h3>Dual Authentication</h3>
          <p>SAML 2.0 (external) + MS Entra ID (internal) + Mock (development)</p>
        </div>

        <div class="feature-item">
          <div class="feature-icon">🎨</div>
          <h3>GoA Design System</h3>
          <p>Official @abgov/web-components with Vue wrappers and TypeScript support</p>
        </div>

        <div class="feature-item">
          <div class="feature-icon">🔐</div>
          <h3>Security Hardened</h3>
          <p>Helmet CSP, CORS, rate limiting, CSRF protection, input validation</p>
        </div>

        <div class="feature-item">
          <div class="feature-icon">🐳</div>
          <h3>Platform Agnostic</h3>
          <p>Docker containerized, deploys to Azure, OpenShift, or Kubernetes</p>
        </div>

        <div class="feature-item">
          <div class="feature-icon">📝</div>
          <h3>Type-Safe Config</h3>
          <p>Zod validation with 50+ environment variables and runtime checks</p>
        </div>

        <div class="feature-item">
          <div class="feature-icon">🧪</div>
          <h3>Comprehensive Testing</h3>
          <p>Vitest (unit), Supertest (integration), Playwright (E2E)</p>
        </div>
      </div>
    </div>

    <!-- Component Demo -->
    <div class="demo-section">
      <h2 class="section-title">Component Demonstration</h2>

      <div class="demo-grid">
        <!-- Button Demo -->
        <div class="demo-card">
          <h3>Buttons</h3>
          <div class="button-group">
            <GoabButton type="primary">Primary</GoabButton>
            <GoabButton type="secondary">Secondary</GoabButton>
            <GoabButton type="tertiary">Tertiary</GoabButton>
          </div>
        </div>

        <!-- Input Demo -->
        <div class="demo-card">
          <h3>Input Field</h3>
          <goa-form-item label="Email Address" requirement="required">
            <GoabInput
              v-model="demoEmail"
              type="email"
              placeholder="Enter your email"
            />
          </goa-form-item>
          <p v-if="demoEmail" class="demo-value">Value: {{ demoEmail }}</p>
        </div>
      </div>
    </div>

    <!-- Action Buttons -->
    <div class="action-section">
      <GoabButton type="primary" @click="openModal">
        Open Modal Demo
      </GoabButton>
      <a href="/api/v1/health" target="_blank" style="text-decoration: none;">
        <GoabButton type="secondary">
          Test API Health
        </GoabButton>
      </a>
    </div>

    <!-- Modal Demo -->
    <GoabModal
      heading="Modal Demonstration"
      :open="showModal"
      :closable="true"
      @close="showModal = false"
    >
      <p>This is a GoA modal component wrapped in Vue with proper TypeScript support and event handling.</p>
      <div style="margin-top: 1.5rem;">
        <GoabButton type="primary" @click="showModal = false">
          Close Modal
        </GoabButton>
      </div>
    </GoabModal>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { GoabButton, GoabInput, GoabModal } from '../components/goa'

const demoEmail = ref('')
const showModal = ref(false)

function openModal() {
  showModal.value = true
}
</script>

<style scoped>
.home-view {
  max-width: 100%;
}

.page-heading {
  font-size: 1.75rem;
  font-weight: 700;
  color: #333333;
  margin-bottom: 1.5rem;
  padding-bottom: 0.5rem;
  border-bottom: 2px solid #007AC2;
}

.content-card {
  background: white;
  padding: 2rem;
  border-radius: 4px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
  margin: 1.5rem 0;
}

.lead-text {
  color: #525252;
  margin-bottom: 1.5rem;
  font-size: 1rem;
  line-height: 1.6;
}

.stats-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 1rem;
  margin-top: 2rem;
}

.stat-box {
  background: white;
  border-left: 4px solid #007AC2;
  padding: 1.5rem;
  border-radius: 4px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
}

.stat-number {
  font-size: 2.5rem;
  font-weight: 700;
  color: #007AC2;
  line-height: 1;
}

.stat-label {
  font-size: 0.875rem;
  color: #525252;
  margin-top: 0.5rem;
}

.section-title {
  font-size: 1.5rem;
  font-weight: 600;
  color: #333333;
  margin-bottom: 1rem;
}

.quick-links-section {
  margin: 2rem 0;
}

.links-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
  gap: 1rem;
  margin-top: 1rem;
}

.link-card {
  background: white;
  padding: 1.5rem;
  border-radius: 4px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
  border-left: 3px solid #007AC2;
  transition: transform 0.2s ease, box-shadow 0.2s ease;
}

.link-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 8px rgba(0, 122, 194, 0.2);
}

.link-card h3 {
  margin: 0 0 0.5rem 0;
  color: #333333;
  font-size: 1.125rem;
}

.link-card p {
  color: #525252;
  font-size: 0.875rem;
  margin: 0 0 1rem 0;
  line-height: 1.5;
}

.card-link {
  color: #007AC2;
  font-weight: 600;
  text-decoration: none;
  font-size: 0.875rem;
  transition: color 0.2s ease;
}

.card-link:hover {
  color: #005A8C;
  text-decoration: underline;
}

.features-section {
  margin: 2rem 0;
}

.features-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
  gap: 1.5rem;
  margin-top: 1rem;
}

.feature-item {
  background: white;
  padding: 1.5rem;
  border-radius: 4px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
  text-align: center;
}

.feature-icon {
  font-size: 2.5rem;
  margin-bottom: 0.75rem;
}

.feature-item h3 {
  margin: 0 0 0.5rem 0;
  color: #333333;
  font-size: 1rem;
  font-weight: 600;
}

.feature-item p {
  color: #525252;
  font-size: 0.875rem;
  margin: 0;
  line-height: 1.5;
}

.demo-section {
  margin: 2rem 0;
}

.demo-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 1.5rem;
  margin-top: 1rem;
}

.demo-card {
  background: white;
  padding: 1.5rem;
  border-radius: 4px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
}

.demo-card h3 {
  margin-top: 0;
  margin-bottom: 1rem;
  color: #333333;
}

.button-group {
  display: flex;
  gap: 0.75rem;
  flex-wrap: wrap;
}

.demo-value {
  margin-top: 0.75rem;
  font-size: 0.875rem;
  color: #007AC2;
  font-weight: 600;
}

.action-section {
  display: flex;
  gap: 1rem;
  margin: 2rem 0;
  flex-wrap: wrap;
}
</style>
