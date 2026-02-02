<template>
  <div class="about-view">
    <h1 class="page-heading">About This Template</h1>

    <div class="content-card">
      <goa-callout type="success" heading="✅ Production Ready">
        <strong>Status:</strong> All 8 implementation phases complete. This template is fully documented and ready for production use in Alberta Government applications.
      </goa-callout>

      <h2>Enterprise-Grade Template</h2>
      <p class="lead-text">
        This template provides a production-ready foundation for Alberta Government applications with official GoA Design System integration, dual authentication support, comprehensive security features, and 12 detailed documentation files.
      </p>

      <h3 class="subsection-title">Monorepo Structure</h3>
      <p class="lead-text">
        This template uses npm workspaces to organize code into reusable packages and applications:
      </p>
      <ul class="feature-list">
        <li><strong>apps/web:</strong> Vue 3 frontend with Vite and GoA components</li>
        <li><strong>apps/api:</strong> Express 5 backend with TypeScript</li>
        <li><strong>packages/auth:</strong> Pluggable authentication drivers (Mock, SAML, Entra ID)</li>
        <li><strong>packages/config:</strong> Type-safe configuration with Zod validation</li>
        <li><strong>packages/shared:</strong> Shared types, interfaces, and utilities</li>
      </ul>

      <h3 class="subsection-title">Key Features</h3>
      <ul class="feature-list">
        <li><strong>Type Safety:</strong> TypeScript strict mode throughout, Zod runtime validation</li>
        <li><strong>Modern Stack:</strong> Vue 3 Composition API, Express 5, PostgreSQL 16</li>
        <li><strong>GoA Design System:</strong> Official @abgov/web-components with Vue wrappers</li>
        <li><strong>Dual Authentication:</strong> SAML 2.0 (external) + MS Entra ID (internal) + Mock (dev)</li>
        <li><strong>Security Hardening:</strong> Helmet, CORS, rate limiting, CSRF protection (Phase 6)</li>
        <li><strong>Docker Ready:</strong> Multi-stage builds with docker-compose for local development</li>
        <li><strong>Production Ready:</strong> Session storage, error handling, health checks, logging</li>
      </ul>

      <h3 class="subsection-title">Technology Stack</h3>
      <div class="tech-grid">
        <div class="tech-card">
          <div class="tech-category">Frontend</div>
          <div class="tech-items">Vue 3, Vite, TypeScript, Pinia, Vue Router, @abgov/web-components</div>
        </div>
        <div class="tech-card">
          <div class="tech-category">Backend</div>
          <div class="tech-items">Express 5, TypeScript, Node.js 24+, express-session</div>
        </div>
        <div class="tech-card">
          <div class="tech-category">Database</div>
          <div class="tech-items">PostgreSQL 16, connect-pg-simple</div>
        </div>
        <div class="tech-card">
          <div class="tech-category">Authentication</div>
          <div class="tech-items">@node-saml/passport-saml, openid-client v6</div>
        </div>
        <div class="tech-card">
          <div class="tech-category">Validation</div>
          <div class="tech-items">Zod (runtime), TypeScript (compile-time)</div>
        </div>
        <div class="tech-card">
          <div class="tech-category">Testing</div>
          <div class="tech-items">Vitest, Playwright, Supertest</div>
        </div>
      </div>
    </div>

    <div class="phase-status">
      <h2>Implementation Phases</h2>

      <goa-callout type="success" heading="Phase 1: Foundation ✅">
        <ul>
          <li>Monorepo structure with npm workspaces</li>
          <li>TypeScript configuration across all packages</li>
          <li>Vue 3 + Vite development server</li>
          <li>Express API with health endpoint</li>
          <li>Docker Compose for local development</li>
        </ul>
      </goa-callout>

      <goa-callout type="success" heading="Phase 2: GoA Components & UI Shell ✅">
        <ul>
          <li>GoA web components registered and configured</li>
          <li>Vue wrapper components (Button, Input, Modal, Callout)</li>
          <li>TypeScript declarations for all components</li>
          <li>Layout system (AppLayout, AppHeader, AppFooter)</li>
          <li>Views (Home, Login, Profile, About)</li>
          <li>Vue Router with navigation and guards</li>
        </ul>
      </goa-callout>

      <goa-callout type="success" heading="Phase 3: Mock Authentication ✅">
        <ul>
          <li>BFF authentication architecture implemented</li>
          <li>Mock driver with 3 test users (Developer, Admin, User)</li>
          <li>PostgreSQL session storage with connect-pg-simple</li>
          <li>Auth middleware (requireAuth, requireRole)</li>
          <li>Pinia auth store with Vue Router guards</li>
        </ul>
      </goa-callout>

      <goa-callout type="success" heading="Phase 4: Production Authentication ✅">
        <ul>
          <li>SAML 2.0 driver for external users (@node-saml/passport-saml)</li>
          <li>MS Entra ID driver for internal users (openid-client v6 with PKCE)</li>
          <li>BaseAuthDriver abstract class for pluggable drivers</li>
          <li>AUTH_DRIVER env var for switching drivers</li>
          <li>Unified /auth/callback endpoint</li>
        </ul>
      </goa-callout>

      <goa-callout type="success" heading="Phase 5: Configuration & Validation ✅">
        <ul>
          <li>Zod schemas for 50+ API environment variables</li>
          <li>Zod schemas for 12+ Web environment variables</li>
          <li>Type-safe config loader with runtime validation</li>
          <li>Deployment presets (.env.internal, .env.external)</li>
          <li>npm run validate-env script for CI/CD</li>
        </ul>
      </goa-callout>

      <goa-callout type="success" heading="Phase 6: Security Hardening ✅">
        <ul>
          <li>Helmet.js with CSP configuration for GoA components</li>
          <li>CSRF token middleware with token-based protection</li>
          <li>Rate limiting (general + strict auth endpoints)</li>
          <li>Input validation middleware with Zod schemas</li>
          <li>Secure request logging (no PII in production logs)</li>
          <li>Security audit with npm audit (no high/critical issues)</li>
          <li>Azure compliance standards documented</li>
        </ul>
      </goa-callout>

      <goa-callout type="success" heading="Phase 7: Testing ✅">
        <ul>
          <li>Vitest unit tests for backend services and frontend components</li>
          <li>Supertest integration tests for auth endpoints</li>
          <li>Playwright E2E tests for login/logout flows</li>
          <li>CI/CD pipeline templates with GitHub Actions</li>
          <li>Test coverage reporting configured</li>
          <li>Comprehensive TESTING.md guide with examples</li>
        </ul>
      </goa-callout>

      <goa-callout type="success" heading="Phase 8: Documentation ✅">
        <ul>
          <li><strong>ARCHITECTURE.md</strong> - System design, BFF pattern, driver architecture</li>
          <li><strong>GOA-COMPONENTS.md</strong> - GoA Design System integration guide</li>
          <li><strong>DEVELOPMENT.md</strong> - Developer workflow and best practices</li>
          <li><strong>DEPLOYMENT.md</strong> - Azure, OpenShift, Kubernetes deployment</li>
          <li><strong>TESTING.md</strong> - Testing strategy (unit/integration/E2E)</li>
          <li><strong>TEMPLATE-GUIDE.md</strong> - Complete customization guide</li>
          <li><strong>SECURITY.md</strong> - Security features and checklist</li>
          <li><strong>AUTH-SETUP.md</strong> - SAML & Entra ID configuration</li>
          <li><strong>TROUBLESHOOTING.md</strong> - Common issues and solutions</li>
          <li><strong>PLACEHOLDERS.md</strong> - Placeholder pattern reference</li>
          <li><strong>AZURE_POSTGRESQL_COMPLIANCE.md</strong> - Azure standards</li>
          <li><strong>CONNECTION_BUDGET.md</strong> - Database connection management</li>
        </ul>
        <p style="margin-top: 1rem;"><strong>Total:</strong> 12 comprehensive documentation files covering all aspects of the template.</p>
      </goa-callout>
    </div>

    <div class="content-card">
      <h2>Recent Updates (2026-01-30)</h2>
      <ul class="feature-list">
        <li><strong>Signal Handling Fix:</strong> Replaced tsx watch with Node.js native <code>--watch</code> mode for proper graceful shutdown</li>
        <li><strong>Environment Discovery:</strong> Implemented find-up for automatic .env file discovery (works with monorepos and deployments)</li>
        <li><strong>Placeholder Standardization:</strong> Adopted <code v-pre>{{VARIABLE_NAME}}</code> pattern for GitHub-safe configuration examples</li>
        <li><strong>Comprehensive Documentation:</strong> Created 12 detailed documentation files (9,800+ lines total)</li>
        <li><strong>Production Ready:</strong> All 8 phases complete, security hardened, fully tested</li>
      </ul>

      <h3 class="subsection-title">Key Technical Achievements</h3>
      <ul class="feature-list">
        <li><strong>Graceful Shutdown:</strong> Proper signal handling with async database pool cleanup</li>
        <li><strong>Platform Agnostic:</strong> Docker containerized, deploys to Azure App Service, OpenShift, or Kubernetes</li>
        <li><strong>PostgreSQL Connection Pooling:</strong> Health checks, Azure compliance, connection budget management</li>
        <li><strong>Type-Safe Configuration:</strong> Zod validation with 50+ environment variables</li>
        <li><strong>Security First:</strong> Helmet CSP, CORS, rate limiting, CSRF protection, input validation</li>
        <li><strong>Official GoA Components:</strong> @abgov/web-components with Vue wrappers and full TypeScript support</li>
      </ul>
    </div>

    <div class="resources">
      <h2>Resources</h2>
      <div class="resource-links">
        <a href="https://design.alberta.ca" target="_blank" rel="noopener" class="resource-link">
          <goa-icon type="link" size="small" />
          Alberta Design System
        </a>
        <a href="https://github.com/GovAlta/ui-components" target="_blank" rel="noopener" class="resource-link">
          <goa-icon type="link" size="small" />
          GoA UI Components (GitHub)
        </a>
        <a href="/api/v1/health" target="_blank" class="resource-link">
          <goa-icon type="link" size="small" />
          API Health Check
        </a>
        <a href="/api/v1/info" target="_blank" class="resource-link">
          <goa-icon type="link" size="small" />
          API Information
        </a>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
// No script setup needed for this view
</script>

<style scoped>
.about-view {
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
  margin-bottom: 1.5rem;
}

.content-card h2 {
  font-size: 1.25rem;
  font-weight: 600;
  color: #333333;
  margin: 0 0 1rem 0;
}

.lead-text {
  color: #525252;
  margin-bottom: 1.5rem;
  line-height: 1.6;
}

.subsection-title {
  font-size: 1.125rem;
  font-weight: 600;
  color: #333333;
  margin: 1.5rem 0 0.75rem 0;
}

.feature-list {
  margin-left: 1.5rem;
  color: #525252;
  line-height: 1.8;
}

.tech-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 1rem;
  margin-top: 1rem;
}

.tech-card {
  padding: 1.25rem;
  background: #F5F5F5;
  border-radius: 4px;
  border-left: 3px solid #007AC2;
}

.tech-category {
  font-weight: 600;
  color: #007AC2;
  margin-bottom: 0.5rem;
  font-size: 1rem;
}

.tech-items {
  font-size: 0.875rem;
  color: #525252;
  line-height: 1.6;
}

.phase-status {
  margin: 2rem 0;
}

.phase-status h2 {
  font-size: 1.5rem;
  font-weight: 600;
  color: #333333;
  margin-bottom: 1rem;
}

.phase-status goa-callout {
  margin-bottom: 1rem;
}

.phase-status ul {
  margin: 0.5rem 0 0 1.5rem;
  line-height: 1.8;
}

.resources {
  background: white;
  padding: 2rem;
  border-radius: 4px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
}

.resources h2 {
  font-size: 1.25rem;
  font-weight: 600;
  color: #333333;
  margin: 0 0 1rem 0;
}

.resource-links {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 1rem;
}

.resource-link {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.75rem 1rem;
  background: #F5F5F5;
  border-radius: 4px;
  color: #007AC2;
  text-decoration: none;
  font-weight: 600;
  transition: all 0.2s ease;
}

.resource-link:hover {
  background: #E5F5FF;
  transform: translateY(-2px);
  box-shadow: 0 2px 4px rgba(0, 122, 194, 0.2);
}
</style>
