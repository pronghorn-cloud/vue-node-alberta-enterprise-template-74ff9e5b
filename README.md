# Vue.js + Node.js Alberta Enterprise Template

[![TypeScript](https://img.shields.io/badge/TypeScript-5.3-blue)](https://www.typescriptlang.org/)
[![Vue 3](https://img.shields.io/badge/Vue-3.4-green)](https://vuejs.org/)
[![Node 24](https://img.shields.io/badge/Node-24.x-green)](https://nodejs.org/)
[![GoA Design System](https://img.shields.io/badge/GoA-Design%20System-blue)](https://design.alberta.ca/)
[![Status](https://img.shields.io/badge/Status-Production%20Ready-success)](https://github.com)

**Production-ready, enterprise-grade monorepo template** for Alberta Government applications with official GoA Design System web components, dual authentication (SAML + MS Entra ID), TypeScript throughout, and Docker containerization.

> **✅ Template Status**: Fully documented and ready for production use. All core features implemented and tested.

## 🎯 Features

### Core Stack
- ✅ **Monorepo Structure** - npm workspaces with shared packages
- ✅ **TypeScript Everywhere** - Strict mode, type-safe configuration
- ✅ **Vue 3 + Vite** - Modern frontend with hot module replacement
- ✅ **Express 5 + TypeScript** - Backend API with full type safety
- ✅ **Node.js Native Watch** - Proper signal handling and graceful shutdown

### Authentication & Security
- ✅ **Dual Authentication** - SAML (external) + MS Entra ID (internal) + Mock (local dev)
- ✅ **Security Hardened** - Helmet CSP, CORS, rate limiting, CSRF protection
- ✅ **Session Management** - PostgreSQL-backed sessions with connection pooling
- ✅ **Azure Compliance** - Follows Azure PostgreSQL and App Service standards

### Design & Frontend
- ✅ **GoA Design System** - Official @abgov/web-components integration
- ✅ **Vue Wrapper Components** - v-model support for GoA components
- ✅ **TypeScript Declarations** - Full IDE autocomplete for all components

### Infrastructure & Deployment
- ✅ **Docker Ready** - Multi-stage Dockerfiles and docker-compose
- ✅ **Platform Agnostic** - Azure App Service, OpenShift, Kubernetes support
- ✅ **PostgreSQL** - Connection pooling, health checks, graceful shutdown
- ✅ **Environment Discovery** - Automatic .env loading with find-up

### Quality & Testing
- ✅ **Testing Setup** - Vitest (unit) + Supertest (integration) + Playwright (E2E)
- ✅ **Code Quality** - ESLint, Prettier, TypeScript strict mode
- ✅ **CI/CD Ready** - GitHub Actions workflow templates

### Documentation
- ✅ **Comprehensive Docs** - 8 detailed guides covering all aspects
- ✅ **Template Guide** - Step-by-step customization instructions
- ✅ **Placeholder Pattern** - Consistent {{VARIABLE_NAME}} format (GitHub-safe)

## 📋 Prerequisites

- **Node.js** 24.x or higher (LTS)
- **npm** 10.x or higher
- **PostgreSQL** 16.x or higher (local or Docker)
- **Docker** (optional, for containerized development)

## 🚀 Quick Start

### 1. Install Dependencies

```bash
npm install
```

### 2. Configure Environment

```bash
cp .env.example .env
# Edit .env with your settings (default values work for local dev)
```

### 3. Start Development Servers

**Option A: Local Development** (without Docker)

```bash
# Terminal 1: Start PostgreSQL (if not using Docker)
# (or connect to your existing PostgreSQL instance)

# Terminal 2: Start API
npm run dev:api

# Terminal 3: Start Web
npm run dev:web
```

- **Web App**: http://localhost:5173
- **API**: http://localhost:3000
- **Health Check**: http://localhost:3000/api/v1/health

**Option B: Docker Development**

```bash
# Start all services (postgres + api + web)
npm run docker:up

# View logs
npm run docker:logs

# Stop services
npm run docker:down
```

## 📁 Project Structure

```
vue-node-alberta-enterprise-template/
├── apps/
│   ├── web/                      # Vue 3 + Vite + TypeScript frontend
│   │   ├── src/
│   │   │   ├── components/       # Vue components
│   │   │   │   ├── goa/          # GoA wrapper components
│   │   │   │   └── layout/       # Layout components
│   │   │   ├── views/            # Page views
│   │   │   ├── router/           # Vue Router configuration
│   │   │   ├── stores/           # Pinia state stores
│   │   │   ├── types/            # TypeScript type definitions
│   │   │   ├── assets/           # Static assets
│   │   │   └── main.ts           # Application entry point
│   │   └── vite.config.ts        # Vite configuration
│   │
│   └── api/                      # Express 5 + TypeScript backend
│       ├── src/
│       │   ├── routes/           # API route definitions
│       │   ├── controllers/      # HTTP request handlers
│       │   ├── services/         # Business logic layer
│       │   ├── middleware/       # Express middleware (auth, CSRF, rate limit)
│       │   ├── config/           # Database & environment config
│       │   ├── types/            # TypeScript types
│       │   ├── utils/            # Utility functions
│       │   ├── app.ts            # Express app setup
│       │   └── server.ts         # Server entry point (with graceful shutdown)
│       └── tsconfig.json         # TypeScript configuration
│
├── packages/                     # Shared monorepo packages
│   ├── shared/                   # Shared types & schemas (cross-app)
│   ├── config/                   # Zod configuration validation
│   └── auth/                     # Auth driver implementations
│       ├── drivers/              # MockAuthDriver, SamlAuthDriver, EntraIdAuthDriver
│       └── config/               # Auth-specific configuration
│
├── docker/                       # Docker configuration
│   ├── api.Dockerfile            # Multi-stage Node.js API build
│   ├── web.Dockerfile            # Multi-stage Nginx + Vue build
│   └── nginx.conf                # Nginx configuration for SPA routing
│
├── docs/                         # Comprehensive documentation (12 files)
├── scripts/                      # Utility scripts (migrations, validation)
├── tests/                        # Integration & E2E tests
│   ├── integration/              # API integration tests (Supertest)
│   └── e2e/                      # End-to-end tests (Playwright)
│
├── .env.example                  # Development environment template
├── .env.internal.example         # Internal (Entra ID) template
├── .env.external.example         # External (SAML) template
├── TEMPLATE-GUIDE.md             # Customization guide
├── PLACEHOLDERS.md               # Placeholder pattern reference
└── docker-compose.yml            # Local development orchestration
```

## 🧪 Testing

```bash
# Run all tests
npm test

# Run unit tests
npm run test:unit

# Run E2E tests
npm run test:e2e

# Type checking
npm run typecheck

# Linting
npm run lint
npm run lint:fix

# Formatting
npm run format
npm run format:check
```

## 🔒 Authentication

The template supports three authentication modes:

### Mock Authentication (Local Development)
Set `AUTH_DRIVER=mock` in `.env` - no real IdP required

### SAML (External Users)
Set `AUTH_DRIVER=saml` and configure:
- `SAML_ENTRY_POINT`
- `SAML_ISSUER`
- `SAML_CERT`
- `SAML_PRIVATE_KEY`

### MS Entra ID (Internal Users)
Set `AUTH_DRIVER=entra-id` and configure:
- `ENTRA_TENANT_ID`
- `ENTRA_CLIENT_ID`
- `ENTRA_CLIENT_SECRET`

See [docs/AUTH-SETUP.md](docs/AUTH-SETUP.md) for detailed configuration instructions.

## 🏗️ Building for Production

```bash
# Build all apps
npm run build

# Build specific app
npm run build:api
npm run build:web

# Run production build locally
npm start --workspace=apps/api
```

## 🐳 Docker Production Build

```bash
# Build production images
docker-compose -f docker-compose.yml build

# Run production containers
docker-compose -f docker-compose.yml up
```

## 📚 Documentation

### Essential Guides
| Document | Description | Status |
|----------|-------------|--------|
| [🏗️ ARCHITECTURE.md](docs/ARCHITECTURE.md) | System design, BFF pattern, driver architecture | ✅ Complete |
| [📘 TEMPLATE-GUIDE.md](TEMPLATE-GUIDE.md) | Step-by-step customization instructions | ✅ Complete |
| [🚀 DEVELOPMENT.md](docs/DEVELOPMENT.md) | Development workflow and best practices | ✅ Complete |
| [🔐 AUTH-SETUP.md](docs/AUTH-SETUP.md) | SAML & Entra ID configuration | ✅ Complete |

### Technical Documentation
| Document | Description | Status |
|----------|-------------|--------|
| [🎨 GOA-COMPONENTS.md](docs/GOA-COMPONENTS.md) | GoA Design System integration guide | ✅ Complete |
| [🐳 DEPLOYMENT.md](docs/DEPLOYMENT.md) | Azure, OpenShift, Docker deployment | ✅ Complete |
| [🔒 SECURITY.md](docs/SECURITY.md) | Security features and best practices | ✅ Complete |
| [🧪 TESTING.md](docs/TESTING.md) | Testing strategy (unit/integration/E2E) | ✅ Complete |

### Reference
| Document | Description | Status |
|----------|-------------|--------|
| [📝 PLACEHOLDERS.md](PLACEHOLDERS.md) | Placeholder pattern reference | ✅ Complete |
| [🛠️ TROUBLESHOOTING.md](docs/TROUBLESHOOTING.md) | Common issues and solutions | ✅ Complete |
| [🗄️ AZURE_POSTGRESQL_COMPLIANCE.md](docs/AZURE_POSTGRESQL_COMPLIANCE.md) | Azure PostgreSQL standards | ✅ Complete |
| [🔌 CONNECTION_BUDGET.md](docs/CONNECTION_BUDGET.md) | Database connection management | ✅ Complete |

**Total**: 12 comprehensive documentation files covering all aspects of the template.

## 🎨 GoA Design System

This template uses the official Government of Alberta Design System:

- **Package**: [@abgov/web-components](https://www.npmjs.com/package/@abgov/web-components)
- **Documentation**: [design.alberta.ca](https://design.alberta.ca/)
- **Web Components**: Technology-agnostic custom elements
- **Vue Wrappers**: Thin wrapper layer for v-model support

## 🔧 Configuration

All configuration is managed through environment variables with Zod schema validation:

```bash
# Required
NODE_ENV = development|production
DB_CONNECTION_STRING = {{DATABASE_CONNECTION_STRING}}
SESSION_SECRET = {{GENERATE_WITH_OPENSSL_RAND_BASE64_32}}

# Auth (choose one driver)
AUTH_DRIVER = mock|saml|entra-id

# SAML (if using SAML driver)
SAML_ENTRY_POINT = {{YOUR_SAML_IDP_SSO_URL}}
SAML_CERT = {{YOUR_IDP_CERTIFICATE_BASE64}}

# Entra ID (if using Entra ID driver)
ENTRA_TENANT_ID = {{YOUR_AZURE_TENANT_ID}}
ENTRA_CLIENT_ID = {{YOUR_AZURE_CLIENT_ID}}
ENTRA_CLIENT_SECRET = {{YOUR_AZURE_CLIENT_SECRET}}

# Optional
PORT = 3000
CORS_ORIGIN = http://localhost:5173
LOG_LEVEL = debug|info|warn|error
```

**Placeholder Pattern**: Values in `{{VARIABLE_NAME}}` format are placeholders. Replace with actual values (remove the `{{` `}}` brackets). See [PLACEHOLDERS.md](PLACEHOLDERS.md) for complete reference.

**Configuration Files**:
- [`.env.example`](.env.example) - Development with mock auth
- [`.env.internal.example`](.env.internal.example) - Internal (Entra ID)
- [`.env.external.example`](.env.external.example) - External (SAML)

## 🚀 Getting Started

### For New Projects

1. **Clone the template**
   ```bash
   git clone <repository-url> my-alberta-app
   cd my-alberta-app
   ```

2. **Follow the customization guide**
   - Read [TEMPLATE-GUIDE.md](TEMPLATE-GUIDE.md) for step-by-step instructions
   - Update project metadata (package.json, branding)
   - Configure authentication (SAML or Entra ID)
   - Customize for your use case

3. **Start development**
   ```bash
   npm install
   cp .env.example .env
   npm run dev
   ```

### Template Updates

This template is actively maintained. Key milestones:

- ✅ **Phase 1-2**: Foundation + GoA UI (Complete)
- ✅ **Phase 3**: Mock authentication (Complete)
- ✅ **Phase 4**: SAML & Entra ID drivers (Complete)
- ✅ **Phase 5**: Configuration validation (Complete)
- ✅ **Phase 6**: Security hardening (Complete)
- ✅ **Phase 7**: Testing setup (Complete)
- ✅ **Phase 8**: Documentation (Complete)

**Status**: Production ready for enterprise Alberta Government applications.

## 📄 License

ISC

## 🆘 Support

### Documentation Resources
- [📘 Template Guide](TEMPLATE-GUIDE.md) - Complete customization instructions
- [🛠️ Troubleshooting](docs/TROUBLESHOOTING.md) - Common issues and solutions
- [🏗️ Architecture](docs/ARCHITECTURE.md) - System design and patterns
- [🚀 Development](docs/DEVELOPMENT.md) - Development workflow

### External Resources
- [GoA Design System](https://design.alberta.ca/) - Official design documentation
- [GoA Components](https://components.design.alberta.ca/) - Component library reference
- [Vue 3 Documentation](https://vuejs.org/)
- [TypeScript Documentation](https://www.typescriptlang.org/)

### Getting Help
1. Check [TROUBLESHOOTING.md](docs/TROUBLESHOOTING.md) for common issues
2. Review relevant documentation in [docs/](docs/)
3. Search existing issues in the repository
4. Open a new issue with detailed information

## 📊 Technical Specifications

| Category | Technology | Version |
|----------|-----------|---------|
| **Runtime** | Node.js | 24.x LTS |
| **Package Manager** | npm | 10.x |
| **Frontend Framework** | Vue.js | 3.4.x |
| **Build Tool** | Vite | 5.4.x |
| **Backend Framework** | Express | 5.2.x |
| **Language** | TypeScript | 5.7.x |
| **Database** | PostgreSQL | 16.x |
| **Design System** | @abgov/web-components | Latest |
| **Container Runtime** | Docker | 24.x+ |
| **Testing - Unit** | Vitest | 2.1.x |
| **Testing - E2E** | Playwright | 1.49.x |

## 🎓 Learning Resources

### Template-Specific
- Start with [TEMPLATE-GUIDE.md](TEMPLATE-GUIDE.md) for customization
- Read [ARCHITECTURE.md](docs/ARCHITECTURE.md) to understand the design
- Follow [DEVELOPMENT.md](docs/DEVELOPMENT.md) for daily workflow

### Technology Stack
- **Vue 3**: [Official Guide](https://vuejs.org/guide/introduction.html)
- **TypeScript**: [Handbook](https://www.typescriptlang.org/docs/)
- **GoA Components**: [Storybook](https://components.design.alberta.ca/)
- **Express**: [Documentation](https://expressjs.com/)

## 📝 Recent Updates

### Latest Changes (2026-01-30)
- ✅ Fixed tsx watch signal handling (graceful shutdown)
- ✅ Implemented find-up for .env discovery
- ✅ Created comprehensive documentation (12 files)
- ✅ Standardized placeholder pattern ({{VARIABLE_NAME}})
- ✅ Added PLACEHOLDERS.md reference guide
- ✅ Updated all configuration examples
- ✅ Production-ready status achieved

### Key Features Added
- Node.js native `--watch` mode for proper signal handling
- Automatic .env file discovery (works with monorepos)
- PostgreSQL connection pooling with health checks
- Graceful shutdown with async cleanup
- Platform-agnostic deployment support

---

**Built with ❤️ for Alberta Government**

*Last Updated: 2026-01-30 | Version: 1.0.0 | Status: Production Ready*
