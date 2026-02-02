<template>
  <footer class="app-footer">
    <div class="footer-container">
      <!-- Footer Links -->
      <div class="footer-links">
        <ul>
          <li>
            <a href="https://alberta.ca/services.aspx" target="_blank" rel="noopener">
              Services
            </a>
          </li>
          <li>
            <a href="https://alberta.ca/security-and-privacy.aspx" target="_blank" rel="noopener">
              Privacy
            </a>
          </li>
          <li>
            <a href="https://alberta.ca/accessibility.aspx" target="_blank" rel="noopener">
              Accessibility
            </a>
          </li>
          <li>
            <a href="https://alberta.ca/contact.aspx" target="_blank" rel="noopener">
              Contact
            </a>
          </li>
          <li>
            <a href="https://alberta.ca/terms-of-use.aspx" target="_blank" rel="noopener">
              Terms of Use
            </a>
          </li>
        </ul>
      </div>

      <!-- Alberta Logo and Copyright -->
      <div class="footer-branding">
        <a href="https://alberta.ca" target="_blank" rel="noopener">
          <img
            src="/assets/alberta-logo.svg"
            alt="Government of Alberta"
            class="footer-logo"
          >
        </a>
        <a
          href="https://alberta.ca"
          target="_blank"
          rel="noopener"
          class="copyright"
        >
          &copy; {{ currentYear }} Government of Alberta
        </a>
      </div>
    </div>
  </footer>
</template>

<script setup lang="ts">
import { computed } from 'vue'

const currentYear = computed(() => new Date().getFullYear())
</script>

<style scoped>
.app-footer {
  background: #F5F5F5;
  color: #333333;
  padding: 2rem;
  margin-top: auto;
  border-top: 1px solid #E5E5E5;
}

.footer-container {
  max-width: 1280px;
  margin: 0 auto;
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: 2rem;
  flex-wrap: wrap;
}

.footer-links {
  flex: 1;
  min-width: 250px;
}

.footer-links ul {
  list-style: none;
  padding: 0;
  margin: 0;
  display: flex;
  flex-wrap: wrap;
  gap: 0.75rem 1.5rem;
}

.footer-links a {
  color: #333333;
  text-decoration: underline;
  font-size: 1rem;
  transition: color 0.2s ease;
}

.footer-links a:hover {
  color: #007AC2;
}

.footer-branding {
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  gap: 0.5rem;
}

.footer-logo {
  height: 24px;
  width: auto;
}

.copyright {
  color: #333333;
  text-decoration: none;
  font-size: 0.9375rem;
  transition: color 0.2s ease;
}

.copyright:hover {
  color: #007AC2;
}

@media (max-width: 768px) {
  .footer-container {
    flex-direction: column;
    align-items: center;
  }

  .footer-links ul {
    justify-content: center;
  }

  .footer-branding {
    align-items: center;
  }
}
</style>
