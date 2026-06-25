# Endpoints — control de permisos RBAC

Registro vivo de rutas de la API Nest y su relación con permisos IAM (`permissions.code` en `database/migrations/V4__seed_iam.sql`). Envelope HTTP: [`api-response.md`](./api-response.md).

**Mantener actualizado** al crear o cambiar cualquier endpoint (regla Cursor: `nest-api-permissions`).

## Leyenda

| Columna | Valores |
|---------|---------|
| **Estado** | `implementado` · `planificado` (stub móvil / diseño) |
| **Guard** | `sí` · `no` · `pendiente` (permiso sugerido pero no aplicado aún) |
| **Permiso** | Código RBAC · `—` (sin permiso) · `público` · `solo auth` |

**Guards de autenticación:** `JwtAuthGuard` + `PermissionsGuard` globales (APP_GUARD). Rutas `@Public()` no exigen JWT. Rutas con `@RequirePermission()` validan contra `v_user_permissions`.

---

## Catálogo de permisos (seed actual)

| Código | Módulo | Uso típico |
|--------|--------|------------|
| `entries.read` | entries | GET listado/detalle agenda |
| `entries.create` | entries | POST entries |
| `entries.update` | entries | PATCH entries |
| `entries.delete` | entries | DELETE entries |
| `entries.ack` | entries | POST confirmar lectura |
| `calendar.read` | calendar | GET eventos |
| `calendar.create` | calendar | POST eventos |
| `calendar.update` | calendar | PATCH eventos |
| `calendar.delete` | calendar | DELETE eventos |
| `notifications.read` | notifications | Bandeja y marcar leídas |
| `chat.read` | chat | Listar conversaciones/mensajes |
| `chat.send` | chat | Enviar mensajes |
| `students.read` | students | Alumnos y padres por sección |
| `sections.read` | sections | Listar secciones |
| `sections.manage` | sections | Alta/edición secciones |
| `users.read` | users | Ver usuarios del colegio |
| `users.manage` | users | CRUD usuarios y roles |
| `schedules.read` | schedules | Horarios (fase 2, tablas comentadas) |
| `schedules.manage` | schedules | Editar horarios (fase 2) |

---

## Endpoints con permiso definido

### Sections

| Método | Ruta | Permiso | Guard RBAC | Estado |
|--------|------|---------|------------|--------|
| GET | `/sections` | `sections.read` | sí | implementado |

### Students / parents

| Método | Ruta | Permiso | Guard RBAC | Estado |
|--------|------|---------|------------|--------|
| GET | `/students` | `students.read` | sí | implementado |
| GET | `/students/:id` | `students.read` | sí | implementado |
| GET | `/parents` | `students.read` | sí | implementado |

### Entries

| Método | Ruta | Permiso | Guard RBAC | Estado |
|--------|------|---------|------------|--------|
| GET | `/entries` | `entries.read` | sí | implementado |
| GET | `/entries/:id` | `entries.read` | sí | implementado |
| POST | `/entries` | `entries.create` | sí | implementado |
| PATCH | `/entries/:id` | `entries.update` | sí | implementado |
| DELETE | `/entries/:id` | `entries.delete` | sí | implementado |
| POST | `/entries/:id/read` | `entries.ack` | sí | implementado |

### Calendar

| Método | Ruta | Permiso | Guard RBAC | Estado |
|--------|------|---------|------------|--------|
| GET | `/calendar/events` | `calendar.read` | sí | implementado |
| GET | `/calendar/events/:id` | `calendar.read` | sí | implementado |
| POST | `/calendar/events` | `calendar.create` | sí | implementado |
| PATCH | `/calendar/events/:id` | `calendar.update` | sí | implementado |
| DELETE | `/calendar/events/:id` | `calendar.delete` | sí | implementado |

### Notifications

| Método | Ruta | Permiso | Guard RBAC | Estado |
|--------|------|---------|------------|--------|
| GET | `/notifications` | `notifications.read` | sí | implementado |
| GET | `/notifications/unread-count` | `notifications.read` | sí | implementado |
| PATCH | `/notifications/:id/read` | `notifications.read` | sí | implementado |
| PATCH | `/notifications/read-all` | `notifications.read` | sí | implementado |

### Chat

| Método | Ruta | Permiso | Guard RBAC | Estado |
|--------|------|---------|------------|--------|
| GET | `/conversations` | `chat.read` | sí | implementado |
| GET | `/conversations/:id/messages` | `chat.read` | sí | implementado |
| POST | `/conversations/:id/messages` | `chat.send` | sí | implementado |
| PATCH | `/conversations/:id/read` | `chat.read` | sí | implementado |

### Users (admin)

| Método | Ruta | Permiso | Guard RBAC | Estado |
|--------|------|---------|------------|--------|
| GET | `/users` | `users.read` | sí | implementado |
| POST | `/users` | `users.manage` | sí | implementado |
| PATCH | `/users/:id` | `users.manage` | sí | implementado |
| DELETE | `/users/:id` | `users.manage` | sí | implementado |

### Attachments (Cloudinary)

| Método | Ruta | Permiso | Guard RBAC | Estado |
|--------|------|---------|------------|--------|
| POST | `/attachments/upload` | `entries.create` o `calendar.create` | sí | implementado |
| DELETE | `/attachments/staging` | `entries.create` o `calendar.create` | sí | implementado |
| DELETE | `/attachments/:id` | `entries.update` o `calendar.update` | sí | implementado |
| POST | `/entries/:id/attachments` | `entries.update` | sí | implementado |
| POST | `/calendar/events/:id/attachments` | `calendar.update` | sí | implementado |

Los adjuntos en body de `POST/PATCH /entries` y `POST/PATCH /calendar/events` se sincronizan con Cloudinary (máx. 10 MB; PDF, imagen, documento).

`POST /entries/:id/attachments`, `POST /calendar/events/:id/attachments` y `DELETE /attachments/:id` aplican las mismas reglas de edición que `PATCH` (autor, o auxiliar/dirección con sección en scope).

---

## Endpoints sin permiso RBAC

Rutas que **no** usan `permissions` (públicas o solo requieren sesión JWT).

| Método | Ruta | Estado | Motivo | Guard auth |
|--------|------|--------|--------|------------|
| GET | `/` | implementado | Health / hello | `@Public()` |

### Auth (solo JWT, sin permiso de catálogo)

| Método | Ruta | Estado | Motivo | Guard auth |
|--------|------|--------|--------|------------|
| POST | `/auth/login` | implementado | Público pre-login | `@Public()` |
| POST | `/auth/refresh` | implementado | Renovar access token | `@Public()` |
| POST | `/auth/logout` | implementado | Revocar refresh token | `@Public()` |
| PATCH | `/auth/password` | implementado | Cambio contraseña propia | JWT |
| GET | `/users/me` | implementado | Perfil del usuario logueado | JWT |
| POST | `/users/me/avatar` | implementado | Subir foto de perfil propia (imagen, máx. 5 MB) | JWT |
| DELETE | `/users/me/avatar` | implementado | Quitar foto de perfil propia | JWT |

---

## Endpoints planificados (fase 2)

### Schedules

| Método | Ruta | Permiso sugerido | Guard RBAC | Estado |
|--------|------|------------------|------------|--------|
| GET | `/schedules` | `schedules.read` | pendiente | planificado |
| PUT/PATCH | `/schedules/:id` | `schedules.manage` | pendiente | planificado |

### Auth planificado (móvil)

| Método | Ruta | Estado | Motivo | Guard auth |
|--------|------|--------|--------|------------|
| GET | `/auth/session` | planificado | Alias de sesión; usar `/users/me` | JWT |

---

## Historial de decisiones "por el momento no"

| Fecha | Endpoint | Permiso sugerido | Motivo |
|-------|----------|------------------|--------|
| 2026-06-19 | Auth endpoints | — | Solo JWT; RBAC en fase siguiente |
| 2026-06-19 | Attachments | — | Upload omitido en esta fase |

---

## Cómo actualizar este archivo

1. Endpoint **nuevo** → añadir fila en la sección que corresponda.
2. Usuario elige **aplicar permiso** → mover a "con permiso definido", Guard RBAC = `sí`.
3. Usuario elige **por el momento no** → permiso sugerido + Guard RBAC = `pendiente`.
4. Endpoint **público o solo auth** → sección "sin permiso RBAC".
5. Permiso **nuevo** no listado en catálogo → añadir fila al catálogo y una nueva migración Flyway (o editar `V4__seed_iam.sql` solo en BD vacía; preferir `V5__…` en producción).
6. **Logging** de dominio en el nuevo módulo → documentar `action` en [`logging.md`](./logging.md).
