# Template Customization Guide

## Overview

This guide helps you transform this enterprise template into your production application. Follow these steps to customize the template for your specific Alberta Government project.

## Quick Start Customization

### 1. Update Project Metadata

**Root package.json** ([package.json:2-7](package.json#L2-L7)):

```json
{
  "name": "your-project-name",
  "version": "1.0.0",
  "description": "Your project description",
  "author": "Your Team Name",
  "license": "ISC"
}
```

**App package.json files**:
- `apps/api/package.json` - Update name to `@yourorg/api`
- `apps/web/package.json` - Update name to `@yourorg/web`

### 2. Update Application Branding

**Environment variables** ([.env](..env)):

```bash
# Update application name
APP_NAME="Your Application Name"

# Update URLs
WEB_URL=https://yourapp.alberta.ca
CORS_ORIGIN=https://yourapp.alberta.ca
AUTH_CALLBACK_URL=https://yourapp.alberta.ca/api/v1/auth/callback
```

**Frontend title** ([apps/web/index.html](apps/web/index.html)):

```html
<title>Your Application Name</title>
<meta name="description" content="Your application description">
```

**API info endpoint** ([apps/api/src/app.ts:176-195](apps/api/src/app.ts#L176-L195)):

```typescript
app.get('/api/v1/info', (_req: Request, res: Response) => {
  res.json({
    success: true,
    data: {
      name: 'Your Application Name',
      version: 'v1',
      description: 'Your application description',
      features: {
        authentication: ['SAML 2.0'], // Or ['MS Entra ID'] or both
        security: ['Helmet CSP', 'CSRF Protection', 'Rate Limiting'],
        design: 'Alberta Government Design System (GoA)'
      }
      // ... customize as needed
    }
  })
})
```

### 3. Configure Authentication

**Choose authentication driver** ([.env](.env)):

```bash
# For internal users (Government of Alberta employees)
AUTH_DRIVER=entra-id
ENTRA_TENANT_ID={{YOUR_AZURE_TENANT_ID}}
ENTRA_CLIENT_ID={{YOUR_AZURE_CLIENT_ID}}
ENTRA_CLIENT_SECRET={{YOUR_AZURE_CLIENT_SECRET}}

# OR for external users (public-facing)
AUTH_DRIVER=saml
SAML_ENTRY_POINT={{YOUR_SAML_IDP_SSO_URL}}
SAML_ISSUER=urn:alberta:yourapp
SAML_CERT={{YOUR_IDP_CERTIFICATE_BASE64}}
SAML_PRIVATE_KEY={{YOUR_SP_PRIVATE_KEY_BASE64}}

# OR mock for development
AUTH_DRIVER=mock
```

See [docs/AUTH-SETUP.md](docs/AUTH-SETUP.md) for detailed IdP configuration.

### 4. Set Up Database

**Create application database**:

```sql
-- Connect to PostgreSQL
psql "postgresql://{{DB_USER}}:{{DB_PASSWORD}}@server:5432/postgres"

-- Create database
CREATE DATABASE yourapp_production;

-- Connect to database
\c yourapp_production

-- Create schema
CREATE SCHEMA app;

-- Create application tables (examples)
CREATE TABLE app.users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(255) NOT NULL,
  email VARCHAR(255) UNIQUE NOT NULL,
  role VARCHAR(50) DEFAULT 'user',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE app.audit_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES app.users(id),
  action VARCHAR(100) NOT NULL,
  resource VARCHAR(255),
  timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  metadata JSONB
);

-- Create indexes
CREATE INDEX idx_users_email ON app.users(email);
CREATE INDEX idx_audit_logs_user_id ON app.audit_logs(user_id);
CREATE INDEX idx_audit_logs_timestamp ON app.audit_logs(timestamp);
```

**Run migrations**:

```bash
# Update DB_CONNECTION_STRING in .env with your actual database credentials
DB_CONNECTION_STRING = postgresql://{{DB_USER}}:{{DB_PASSWORD}}@server:5432/yourapp_production

# Run session table migration
npm run migrate
```

## Feature Development

### Adding a New API Endpoint

**Example: Tasks Resource**

**1. Create types** ([packages/shared/src/types/task.types.ts](packages/shared/src/types/task.types.ts)):

```typescript
export interface Task {
  id: string
  title: string
  description: string
  status: 'todo' | 'in_progress' | 'done'
  assignedTo: string | null
  createdAt: Date
  updatedAt: Date
}

export interface CreateTaskDto {
  title: string
  description: string
  assignedTo?: string
}

export interface UpdateTaskDto {
  title?: string
  description?: string
  status?: 'todo' | 'in_progress' | 'done'
  assignedTo?: string | null
}
```

**2. Create service** ([apps/api/src/services/tasks.service.ts](apps/api/src/services/tasks.service.ts)):

```typescript
import type { Pool } from 'pg'
import type { Task, CreateTaskDto, UpdateTaskDto } from '@template/shared'

let dbPool: Pool

export function setDbPool(pool: Pool) {
  dbPool = pool
}

export const tasksService = {
  async findAll(filters?: { status?: string; assignedTo?: string }): Promise<Task[]> {
    let query = 'SELECT * FROM app.tasks WHERE 1=1'
    const params: any[] = []

    if (filters?.status) {
      params.push(filters.status)
      query += ` AND status = $${params.length}`
    }

    if (filters?.assignedTo) {
      params.push(filters.assignedTo)
      query += ` AND assigned_to = $${params.length}`
    }

    query += ' ORDER BY created_at DESC'

    const result = await dbPool.query(query, params)
    return result.rows
  },

  async findById(id: string): Promise<Task | undefined> {
    const result = await dbPool.query(
      'SELECT * FROM app.tasks WHERE id = $1',
      [id]
    )
    return result.rows[0]
  },

  async create(data: CreateTaskDto): Promise<Task> {
    const result = await dbPool.query(
      `INSERT INTO app.tasks (title, description, assigned_to)
       VALUES ($1, $2, $3)
       RETURNING *`,
      [data.title, data.description, data.assignedTo || null]
    )
    return result.rows[0]
  },

  async update(id: string, data: UpdateTaskDto): Promise<Task | undefined> {
    const fields: string[] = []
    const params: any[] = []

    if (data.title !== undefined) {
      params.push(data.title)
      fields.push(`title = $${params.length}`)
    }

    if (data.description !== undefined) {
      params.push(data.description)
      fields.push(`description = $${params.length}`)
    }

    if (data.status !== undefined) {
      params.push(data.status)
      fields.push(`status = $${params.length}`)
    }

    if (data.assignedTo !== undefined) {
      params.push(data.assignedTo)
      fields.push(`assigned_to = $${params.length}`)
    }

    if (fields.length === 0) {
      return this.findById(id)
    }

    params.push(new Date())
    fields.push(`updated_at = $${params.length}`)

    params.push(id)

    const result = await dbPool.query(
      `UPDATE app.tasks SET ${fields.join(', ')} WHERE id = $${params.length} RETURNING *`,
      params
    )

    return result.rows[0]
  },

  async delete(id: string): Promise<boolean> {
    const result = await dbPool.query('DELETE FROM app.tasks WHERE id = $1', [id])
    return result.rowCount > 0
  }
}
```

**3. Create controller** ([apps/api/src/controllers/tasks.controller.ts](apps/api/src/controllers/tasks.controller.ts)):

```typescript
import type { Request, Response } from 'express'
import { tasksService } from '../services/tasks.service.js'
import { z } from 'zod'

const CreateTaskSchema = z.object({
  title: z.string().min(1).max(255),
  description: z.string().min(1),
  assignedTo: z.string().uuid().optional()
})

const UpdateTaskSchema = z.object({
  title: z.string().min(1).max(255).optional(),
  description: z.string().min(1).optional(),
  status: z.enum(['todo', 'in_progress', 'done']).optional(),
  assignedTo: z.string().uuid().nullable().optional()
})

export const tasksController = {
  async getAll(req: Request, res: Response) {
    try {
      const tasks = await tasksService.findAll({
        status: req.query.status as string,
        assignedTo: req.query.assignedTo as string
      })
      res.json({ success: true, data: tasks })
    } catch (error) {
      res.status(500).json({
        success: false,
        error: { message: error.message, code: 'INTERNAL_ERROR' }
      })
    }
  },

  async getById(req: Request, res: Response) {
    try {
      const task = await tasksService.findById(req.params.id)
      if (!task) {
        return res.status(404).json({
          success: false,
          error: { message: 'Task not found', code: 'NOT_FOUND' }
        })
      }
      res.json({ success: true, data: task })
    } catch (error) {
      res.status(500).json({
        success: false,
        error: { message: error.message, code: 'INTERNAL_ERROR' }
      })
    }
  },

  async create(req: Request, res: Response) {
    try {
      const data = CreateTaskSchema.parse(req.body)
      const task = await tasksService.create(data)
      res.status(201).json({ success: true, data: task })
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({
          success: false,
          error: {
            message: 'Validation failed',
            code: 'VALIDATION_ERROR',
            details: error.errors
          }
        })
      }
      res.status(500).json({
        success: false,
        error: { message: error.message, code: 'INTERNAL_ERROR' }
      })
    }
  },

  async update(req: Request, res: Response) {
    try {
      const data = UpdateTaskSchema.parse(req.body)
      const task = await tasksService.update(req.params.id, data)
      if (!task) {
        return res.status(404).json({
          success: false,
          error: { message: 'Task not found', code: 'NOT_FOUND' }
        })
      }
      res.json({ success: true, data: task })
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({
          success: false,
          error: {
            message: 'Validation failed',
            code: 'VALIDATION_ERROR',
            details: error.errors
          }
        })
      }
      res.status(500).json({
        success: false,
        error: { message: error.message, code: 'INTERNAL_ERROR' }
      })
    }
  },

  async delete(req: Request, res: Response) {
    try {
      const deleted = await tasksService.delete(req.params.id)
      if (!deleted) {
        return res.status(404).json({
          success: false,
          error: { message: 'Task not found', code: 'NOT_FOUND' }
        })
      }
      res.status(204).send()
    } catch (error) {
      res.status(500).json({
        success: false,
        error: { message: error.message, code: 'INTERNAL_ERROR' }
      })
    }
  }
}
```

**4. Create routes** ([apps/api/src/routes/tasks.routes.ts](apps/api/src/routes/tasks.routes.ts)):

```typescript
import { Router } from 'express'
import { tasksController } from '../controllers/tasks.controller.js'
import { requireAuth } from '../middleware/auth.middleware.js'

const router = Router()

router.get('/', requireAuth, tasksController.getAll)
router.get('/:id', requireAuth, tasksController.getById)
router.post('/', requireAuth, tasksController.create)
router.put('/:id', requireAuth, tasksController.update)
router.delete('/:id', requireAuth, tasksController.delete)

export default router
```

**5. Register routes** ([apps/api/src/routes/index.ts](apps/api/src/routes/index.ts)):

```typescript
import tasksRoutes from './tasks.routes.js'

export function registerRoutes(app: Express) {
  // ... existing routes
  app.use('/api/v1/tasks', tasksRoutes)
}
```

### Adding a Frontend Feature

**Example: Tasks Page**

**1. Create Pinia store** ([apps/web/src/stores/tasks.store.ts](apps/web/src/stores/tasks.store.ts)):

```typescript
import { ref, computed } from 'vue'
import { defineStore } from 'pinia'
import type { Task, CreateTaskDto, UpdateTaskDto } from '@template/shared'

export const useTasksStore = defineStore('tasks', () => {
  const tasks = ref<Task[]>([])
  const loading = ref(false)
  const error = ref<string | null>(null)

  const filteredTasks = computed(() => (status?: string) => {
    if (!status) return tasks.value
    return tasks.value.filter(task => task.status === status)
  })

  async function fetchTasks(filters?: { status?: string }) {
    loading.value = true
    error.value = null

    try {
      const queryParams = new URLSearchParams(filters).toString()
      const response = await fetch(`/api/v1/tasks?${queryParams}`)

      if (!response.ok) {
        throw new Error('Failed to fetch tasks')
      }

      const data = await response.json()
      tasks.value = data.data
    } catch (err) {
      error.value = err.message
    } finally {
      loading.value = false
    }
  }

  async function createTask(taskData: CreateTaskDto) {
    loading.value = true
    error.value = null

    try {
      const response = await fetch('/api/v1/tasks', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(taskData)
      })

      if (!response.ok) {
        throw new Error('Failed to create task')
      }

      const data = await response.json()
      tasks.value.push(data.data)
      return data.data
    } catch (err) {
      error.value = err.message
      throw err
    } finally {
      loading.value = false
    }
  }

  async function updateTask(id: string, taskData: UpdateTaskDto) {
    loading.value = true
    error.value = null

    try {
      const response = await fetch(`/api/v1/tasks/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(taskData)
      })

      if (!response.ok) {
        throw new Error('Failed to update task')
      }

      const data = await response.json()
      const index = tasks.value.findIndex(t => t.id === id)
      if (index !== -1) {
        tasks.value[index] = data.data
      }
      return data.data
    } catch (err) {
      error.value = err.message
      throw err
    } finally {
      loading.value = false
    }
  }

  async function deleteTask(id: string) {
    loading.value = true
    error.value = null

    try {
      const response = await fetch(`/api/v1/tasks/${id}`, {
        method: 'DELETE'
      })

      if (!response.ok) {
        throw new Error('Failed to delete task')
      }

      tasks.value = tasks.value.filter(t => t.id !== id)
    } catch (err) {
      error.value = err.message
      throw err
    } finally {
      loading.value = false
    }
  }

  return {
    tasks,
    loading,
    error,
    filteredTasks,
    fetchTasks,
    createTask,
    updateTask,
    deleteTask
  }
})
```

**2. Create view** ([apps/web/src/views/TasksView.vue](apps/web/src/views/TasksView.vue)):

```vue
<template>
  <AppLayout>
    <h1>Tasks</h1>

    <GoabCallout v-if="error" type="emergency">
      {{ error }}
    </GoabCallout>

    <goa-block direction="row" gap="m" alignment="start">
      <GoabButton type="primary" @click="showCreateModal = true">
        Add Task
      </GoabButton>

      <goa-dropdown v-model="statusFilter" @_change="handleFilterChange">
        <goa-dropdown-item value="">All Tasks</goa-dropdown-item>
        <goa-dropdown-item value="todo">To Do</goa-dropdown-item>
        <goa-dropdown-item value="in_progress">In Progress</goa-dropdown-item>
        <goa-dropdown-item value="done">Done</goa-dropdown-item>
      </goa-dropdown>
    </goa-block>

    <goa-table v-if="!loading" width="100%">
      <thead>
        <tr>
          <th>Title</th>
          <th>Status</th>
          <th>Assigned To</th>
          <th>Created</th>
          <th>Actions</th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="task in tasks" :key="task.id">
          <td>{{ task.title }}</td>
          <td>
            <goa-badge :type="getStatusBadgeType(task.status)">
              {{ task.status.replace('_', ' ') }}
            </goa-badge>
          </td>
          <td>{{ task.assignedTo || 'Unassigned' }}</td>
          <td>{{ formatDate(task.createdAt) }}</td>
          <td>
            <goa-block direction="row" gap="s">
              <GoabButton type="tertiary" size="compact" @click="editTask(task)">
                Edit
              </GoabButton>
              <GoabButton
                type="tertiary"
                size="compact"
                variant="destructive"
                @click="confirmDelete(task)"
              >
                Delete
              </GoabButton>
            </goa-block>
          </td>
        </tr>
      </tbody>
    </goa-table>

    <div v-else>Loading tasks...</div>

    <!-- Create/Edit Modal -->
    <TaskFormModal
      :open="showCreateModal || !!editingTask"
      :task="editingTask"
      @close="closeModal"
      @save="handleSave"
    />

    <!-- Delete Confirmation Modal -->
    <GoabModal
      :open="!!deletingTask"
      heading="Delete Task"
      callout-variant="important"
      @close="deletingTask = null"
    >
      <p>Are you sure you want to delete "{{ deletingTask?.title }}"?</p>

      <template #actions>
        <GoabButton type="secondary" @click="deletingTask = null">
          Cancel
        </GoabButton>
        <GoabButton type="primary" variant="destructive" @click="handleDelete">
          Delete
        </GoabButton>
      </template>
    </GoabModal>
  </AppLayout>
</template>

<script setup lang="ts">
import { ref, onMounted, computed } from 'vue'
import { useTasksStore } from '@/stores/tasks.store'
import type { Task } from '@template/shared'
import AppLayout from '@/components/layout/AppLayout.vue'
import { GoabButton, GoabCallout, GoabModal } from '@/components/goa'
import TaskFormModal from '@/components/TaskFormModal.vue'

const tasksStore = useTasksStore()

const statusFilter = ref('')
const showCreateModal = ref(false)
const editingTask = ref<Task | null>(null)
const deletingTask = ref<Task | null>(null)

const tasks = computed(() => tasksStore.filteredTasks(statusFilter.value))
const loading = computed(() => tasksStore.loading)
const error = computed(() => tasksStore.error)

onMounted(() => {
  tasksStore.fetchTasks()
})

function handleFilterChange(e: CustomEvent) {
  statusFilter.value = e.detail.value
  tasksStore.fetchTasks({ status: e.detail.value })
}

function editTask(task: Task) {
  editingTask.value = task
}

function confirmDelete(task: Task) {
  deletingTask.value = task
}

function closeModal() {
  showCreateModal.value = false
  editingTask.value = null
}

async function handleSave() {
  await tasksStore.fetchTasks({ status: statusFilter.value })
  closeModal()
}

async function handleDelete() {
  if (deletingTask.value) {
    await tasksStore.deleteTask(deletingTask.value.id)
    deletingTask.value = null
  }
}

function getStatusBadgeType(status: string) {
  switch (status) {
    case 'done': return 'success'
    case 'in_progress': return 'information'
    default: return 'light'
  }
}

function formatDate(date: Date) {
  return new Date(date).toLocaleDateString('en-CA')
}
</script>
```

**3. Add route** ([apps/web/src/router/index.ts](apps/web/src/router/index.ts)):

```typescript
import TasksView from '@/views/TasksView.vue'

const router = createRouter({
  routes: [
    // ... existing routes
    {
      path: '/tasks',
      name: 'tasks',
      component: TasksView,
      meta: { requiresAuth: true }
    }
  ]
})
```

## Customization Checklist

### Before Development

- [ ] Update project name and metadata
- [ ] Configure authentication (SAML or Entra ID)
- [ ] Set up production database
- [ ] Generate secure secrets (session, CSRF)
- [ ] Configure environment variables
- [ ] Update application branding (name, logo, colors)

### During Development

- [ ] Remove example code (if any)
- [ ] Implement required features
- [ ] Add database migrations for your schema
- [ ] Write unit tests for services
- [ ] Write integration tests for API endpoints
- [ ] Write E2E tests for critical flows
- [ ] Update API documentation
- [ ] Test authentication flows

### Before Deployment

- [ ] Run full test suite (`npm test`)
- [ ] Check TypeScript errors (`npm run typecheck`)
- [ ] Run linting (`npm run lint`)
- [ ] Check formatting (`npm run format:check`)
- [ ] Build production images (`docker build`)
- [ ] Test production build locally
- [ ] Review security checklist (see [docs/SECURITY.md](docs/SECURITY.md))
- [ ] Update documentation for your specific features
- [ ] Configure monitoring and logging
- [ ] Set up CI/CD pipeline

## Removing Template Examples

If the template includes example code (tasks, users, etc.), follow these steps to remove it:

**1. Remove API code**:
```bash
rm apps/api/src/routes/tasks.routes.ts
rm apps/api/src/controllers/tasks.controller.ts
rm apps/api/src/services/tasks.service.ts
```

**2. Remove frontend code**:
```bash
rm apps/web/src/views/TasksView.vue
rm apps/web/src/stores/tasks.store.ts
rm apps/web/src/components/TaskFormModal.vue
```

**3. Remove types**:
```bash
rm packages/shared/src/types/task.types.ts
```

**4. Update route registration**:
Remove task routes from `apps/api/src/routes/index.ts`

**5. Update navigation**:
Remove task links from `apps/web/src/components/layout/AppHeader.vue`

## Advanced Customization

### Adding Role-Based Access Control (RBAC)

**1. Create roles table**:

```sql
CREATE TABLE app.roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(50) UNIQUE NOT NULL,
  description TEXT,
  permissions JSONB NOT NULL DEFAULT '[]'
);

CREATE TABLE app.user_roles (
  user_id UUID REFERENCES app.users(id) ON DELETE CASCADE,
  role_id UUID REFERENCES app.roles(id) ON DELETE CASCADE,
  PRIMARY KEY (user_id, role_id)
);
```

**2. Create RBAC middleware**:

```typescript
// apps/api/src/middleware/rbac.middleware.ts
export function requireRole(...roles: string[]) {
  return (req: Request, res: Response, next: NextFunction) => {
    const userRoles = req.session.user?.roles || []

    if (!roles.some(role => userRoles.includes(role))) {
      return res.status(403).json({
        success: false,
        error: { message: 'Forbidden', code: 'FORBIDDEN' }
      })
    }

    next()
  }
}
```

**3. Use in routes**:

```typescript
router.post('/users', requireAuth, requireRole('admin'), usersController.create)
```

### Adding Audit Logging

**1. Create audit middleware**:

```typescript
// apps/api/src/middleware/audit.middleware.ts
export function auditLog(action: string) {
  return async (req: Request, res: Response, next: NextFunction) => {
    const userId = req.session.user?.id
    const resource = req.path

    await dbPool.query(
      'INSERT INTO app.audit_logs (user_id, action, resource, metadata) VALUES ($1, $2, $3, $4)',
      [userId, action, resource, JSON.stringify({ method: req.method, body: req.body })]
    )

    next()
  }
}
```

**2. Use in routes**:

```typescript
router.post('/users', requireAuth, auditLog('user.create'), usersController.create)
router.delete('/users/:id', requireAuth, auditLog('user.delete'), usersController.delete)
```

## Getting Help

- **Documentation**: Review [docs/](docs/) directory
- **Examples**: See existing code for patterns
- **GoA Design System**: [design.alberta.ca](https://design.alberta.ca/)
- **Issues**: Check [TROUBLESHOOTING.md](docs/TROUBLESHOOTING.md)

---

**Last Updated**: 2026-01-30
