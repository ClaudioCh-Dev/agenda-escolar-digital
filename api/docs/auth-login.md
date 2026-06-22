# Autenticación — Login, JWT, Guards y dependencias

Documentación del módulo de auth en la API Nest (`api/`).  
Contrato HTTP: [`api-response.md`](./api-response.md) · Logging: [`logging.md`](./logging.md) · Esquema: [`../database/migrations/`](../database/migrations/) · Flyway: `pnpm db:migrate` · seed dev: [`../database/seed-dev.sql`](../database/seed-dev.sql)

---

## Eventos logueados (auth)

Ver tabla completa en [`logging.md`](./logging.md#convención-action). Resumen:

| action | Nivel | Cuándo |
|--------|-------|--------|
| `auth.login.success` | log | Login OK |
| `auth.login.failed` | warn | Usuario inexistente o contraseña incorrecta |
| `auth.login.inactive` | warn | Cuenta inactiva |
| `auth.refresh.success` | log | Refresh rotado OK |
| `auth.refresh.reuse` | warn | Reuso de refresh token (revoca familia) |
| `auth.logout` | log | Logout con refresh válido |
| `auth.password.changed` | log | PATCH `/auth/password` OK |

Nunca se loguean `password`, tokens ni hashes.

---

## Resumen

| Concepto | Implementación |
|----------|----------------|
| Identificador de login | `users.code` único (`e…` alumno, `t…` trabajador, `p…` padre) |
| Body de login | `{ "code", "password" }` — **sin** `schoolSlug` |
| Contraseñas | bcrypt (hash en BD, nunca en claro) |
| Access token | JWT (~15 min), header `Authorization: Bearer` |
| Refresh token | Opaco (~30 días), hash SHA-256 en tabla `refresh_tokens` |
| Rutas protegidas | `JwtAuthGuard` global (`APP_GUARD`) |
| Rutas públicas | Decorador `@Public()` |

---

## Dependencias instaladas

### Auth y JWT

| Paquete | Versión | Uso en el proyecto |
|---------|---------|-------------------|
| `@nestjs/jwt` | ^11.0.2 | Firmar access token (`JwtService.signAsync`) |
| `@nestjs/passport` | ^11.0.5 | `AuthGuard`, `PassportStrategy`, puente Nest ↔ Passport |
| `passport` | ^0.7.0 | Motor de estrategias de autenticación |
| `passport-jwt` | ^4.0.1 | Leer y validar JWT del header Bearer |
| `bcrypt` | ^6.0.0 | `hash` / `compare` de contraseñas |

**Dev (tipos):** `@types/bcrypt` ^6.0.0 · `@types/passport-jwt` ^4.0.1

**Documentación oficial:**
- [NestJS — Authentication](https://docs.nestjs.com/security/authentication)
- [NestJS — JWT](https://docs.nestjs.com/security/authentication#jwt-functionality)
- [passport-jwt](https://www.passportjs.org/packages/passport-jwt/)
- [bcrypt (npm)](https://www.npmjs.com/package/bcrypt)

### Configuración

| Paquete | Versión | Uso |
|---------|---------|-----|
| `@nestjs/config` | ^4.0.4 | `JWT_SECRET`, `JWT_ACCESS_EXPIRES`, `JWT_REFRESH_EXPIRES`, `DATABASE_URL` |

- [NestJS — Configuration](https://docs.nestjs.com/techniques/configuration)

### Base de datos

| Paquete | Versión | Uso |
|---------|---------|-----|
| `@nestjs/typeorm` | ^11.0.2 | Integración TypeORM en Nest |
| `typeorm` | ^0.3.x | Entidades `users`, `refresh_tokens`, relaciones |
| `pg` | ^8.22.0 | Driver PostgreSQL |

- [NestJS — TypeORM](https://docs.nestjs.com/techniques/database)

### Validación de DTOs

| Paquete | Versión | Uso |
|---------|---------|-----|
| `class-validator` | ^0.15.1 | Reglas en `LoginDto`, `RefreshTokenDto`, etc. |
| `class-transformer` | ^0.5.1 | Usado con `ValidationPipe` global |

- [NestJS — Validation](https://docs.nestjs.com/techniques/validation)

### Nest (ya en el proyecto)

| Paquete | Uso en auth |
|---------|-------------|
| `@nestjs/common` | Guards, decorators, pipes, exceptions |
| `@nestjs/core` | `APP_GUARD`, `Reflector` (`@Public()`) |
| `@nestjs/platform-express` | HTTP |

### Node.js nativo (sin instalar)

| Módulo | Uso |
|--------|-----|
| `crypto` | `randomBytes` (refresh opaco), `createHash('sha256')` (guardar refresh) |

### Comando de instalación

```bash
pnpm add @nestjs/config @nestjs/jwt @nestjs/passport passport passport-jwt bcrypt @nestjs/typeorm typeorm pg class-validator class-transformer
pnpm add -D @types/bcrypt @types/passport-jwt
```

---

## Variables de entorno

Copiar [`.env.example`](../.env.example) → `.env`:

```env
DATABASE_URL=postgresql://postgres:postgres@localhost:5432/agenda_escolar
JWT_SECRET=change-me-in-production-use-long-random-string
JWT_ACCESS_EXPIRES=15m
JWT_REFRESH_EXPIRES=30d
PORT=3000
```

---

## Estructura de archivos

```
api/src/
  app.module.ts              → APP_GUARD: JwtAuthGuard (global)
  main.ts                    → ValidationPipe + GlobalExceptionFilter

  auth/
    auth.module.ts           → JwtModule, PassportModule, JwtStrategy
    auth.controller.ts       → POST login/refresh/logout, PATCH password
    auth.service.ts          → login, refresh, logout, bcrypt, tokens
    strategies/jwt.strategy.ts   → valida Bearer en rutas protegidas
    guards/jwt-auth.guard.ts     → @Public + canActivate + handleRequest
    decorators/
      public.decorator.ts    → @Public()
      current-user.decorator.ts  → @CurrentUser()
    dto/
      login.dto.ts           → { code, password }
      refresh-token.dto.ts
      change-password.dto.ts
      auth-response.dto.ts
    interfaces/
      jwt-payload.interface.ts
      authenticated-user.interface.ts

  users/
    users.service.ts         → findByCode, toProfileDto
    users.controller.ts      → GET /users/me
    entities/                → User, RefreshToken, Sede, Section, …

  shared/exception/          → InvalidCredentialsException, UnauthorizedAccessException, …
  shared/filters/            → GlobalExceptionFilter (envelope ApiError)
```

---

## Modelo de usuario y login

### Código único (`users.code`)

| Prefijo | `user_type` | Ejemplo seed | Rol IAM típico |
|---------|-------------|--------------|----------------|
| `e` | `student` | `e10000001` | `alumno` |
| `t` | `staff` | `t10000001` | `auxiliar`, `profesor`, `direccion` |
| `p` | `parent` | `p10000001` | `padre` |

Jerarquía institucional: **colegio → sedes → secciones**. El colegio/sede se deduce del usuario en BD; no va en el body del login.

### Seed de prueba

Tras ejecutar `pnpm db:migrate` + `pnpm db:seed:dev`:

| code | password | Descripción |
|------|----------|-------------|
| `t10000001` | `demo123` | Auxiliar (María) |
| `p10000001` | `demo123` | Padre (Carlos) |
| `e10000001` | `demo123` | Alumno (Lucas) |

---

## Endpoints de auth

Todos retornan envelope `{ success, data, error }`.

| Método | Ruta | Auth | Body | Respuesta |
|--------|------|------|------|-----------|
| POST | `/auth/login` | `@Public()` | `{ code, password }` | `{ accessToken, refreshToken, expiresIn, user }` |
| POST | `/auth/refresh` | `@Public()` | `{ refreshToken }` | tokens rotados |
| POST | `/auth/logout` | `@Public()` | `{ refreshToken }` | `data: null` |
| PATCH | `/auth/password` | JWT | `{ currentPassword, newPassword }` | `data: null` |
| GET | `/users/me` | JWT | — | perfil + roles + sedes/secciones |

Registro de permisos RBAC: [`endpoints-permissions.md`](./endpoints-permissions.md)

---

## Flujo del login (paso a paso)

### 1. Request

```http
POST /auth/login
Content-Type: application/json

{
  "code": "t10000001",
  "password": "demo123"
}
```

### 2. Guard global — `@Public()`

`JwtAuthGuard.canActivate()` lee metadata de `@Public()`. Si es pública → `return true` sin pedir JWT.

### 3. Validación — `LoginDto`

- `code`: string, patrón `^[etp][0-9]+$`
- `password`: mínimo 6 caracteres

### 4. `AuthService.login()`

1. `UsersService.findByCode(code)` → PostgreSQL `users.code`
2. Si no existe → `401 INVALID_CREDENTIALS`
3. Si `is_active = false` → `403 USER_INACTIVE`
4. `bcrypt.compare(password, password_hash)`
5. Si falla → `401 INVALID_CREDENTIALS`
6. `issueTokens()` → JWT + refresh opaco
7. `toProfileDto(user)` → perfil para la app

### 5. Respuesta

```json
{
  "success": true,
  "data": {
    "accessToken": "eyJhbG...",
    "refreshToken": "xK9m...",
    "expiresIn": 900,
    "user": {
      "id": "...",
      "code": "t10000001",
      "userType": "staff",
      "role": "auxiliar",
      "roles": ["auxiliar"],
      "name": "María Auxiliar",
      "sede": "Sede Los Olivos",
      "sections": ["3° A – Primaria"]
    }
  },
  "error": null
}
```

### Diagrama

```mermaid
sequenceDiagram
  participant App
  participant Guard as JwtAuthGuard
  participant Auth as AuthService
  participant DB as PostgreSQL

  App->>Guard: POST /auth/login
  Guard->>Guard: @Public → sin JWT
  App->>Auth: { code, password }
  Auth->>DB: SELECT users WHERE code = ?
  Auth->>Auth: bcrypt.compare
  Auth->>DB: INSERT refresh_tokens (hash)
  Auth-->>App: accessToken + refreshToken + user
```

---

## Tokens

### Access token (JWT)

- **Vida:** `JWT_ACCESS_EXPIRES` (default `15m`)
- **Uso:** header en cada request protegido  
  `Authorization: Bearer <accessToken>`
- **Payload:**

```typescript
{
  sub: string;      // userId
  schoolId: string;
  roles: string[];  // ej. ['auxiliar']
}
```

### Refresh token (opaco)

- **Vida:** `JWT_REFRESH_EXPIRES` (default `30d`)
- **Uso:** solo `POST /auth/refresh` y `POST /auth/logout`
- **BD:** tabla `refresh_tokens`, columna `token_hash` (SHA-256, nunca el token en claro)
- **Rotación:** cada refresh revoca el anterior y emite uno nuevo
- **Reuso detectado:** si se usa un refresh ya revocado → se revocan todos los del usuario

---

## Guards, Passport y `@Public()`

### Guard global

```typescript
// app.module.ts
{ provide: APP_GUARD, useClass: JwtAuthGuard }
```

Todas las rutas exigen JWT **excepto** las marcadas con `@Public()`.

### `@Public()` — qué hace

```typescript
// public.decorator.ts
export const Public = () => SetMetadata('isPublic', true);
```

Pega metadata en el método del controller. El guard la lee con `Reflector`.

### `canActivate` — nombre fijo (Nest)

```typescript
canActivate(context) {
  if (isPublic) return true;           // no JWT
  return super.canActivate(context);   // Passport JWT
}
```

Nest **siempre** llama a este método; no se puede renombrar.

### `handleRequest` — nombre fijo (Passport)

```typescript
handleRequest(err, user, info) {
  if (err || !user) throw new UnauthorizedAccessException();
  return user;  // → request.user
}
```

Solo en rutas **protegidas**. Passport invoca este hook tras validar el JWT.

### Cadena Passport

```
JwtAuthGuard extends AuthGuard('jwt')     ← guards/jwt-auth.guard.ts
  ↓
JwtStrategy extends PassportStrategy      ← strategies/jwt.strategy.ts
  ↓
passport-jwt (Strategy, ExtractJwt)
```

`AuthGuard('jwt')` debe coincidir con `PassportModule.register({ defaultStrategy: 'jwt' })`.

### Rutas protegidas — flujo

1. `canActivate` → no es `@Public()` → `super.canActivate()`
2. `JwtStrategy`: extrae Bearer, verifica firma/exp
3. `validate(payload)`: comprueba usuario activo en BD
4. `handleRequest`: devuelve `{ userId, schoolId, roles }` → `request.user`
5. Controller usa `@CurrentUser()` para leer `request.user`

---

## Códigos de error (auth)

| Código | HTTP | Cuándo |
|--------|------|--------|
| `INVALID_CREDENTIALS` | 401 | code inexistente o contraseña incorrecta |
| `USER_INACTIVE` | 403 | cuenta deshabilitada |
| `INVALID_REFRESH_TOKEN` | 401 | refresh inválido, expirado o reutilizado |
| `UNAUTHORIZED` | 401 | ruta protegida sin token o JWT inválido |
| `INVALID_REQUEST` | 4xx | validación DTO (ValidationPipe) |

Definidos en `src/shared/error/error-code.ts`. Respuesta vía `GlobalExceptionFilter`.

---

## Refresh y logout (resumen)

### Refresh

```http
POST /auth/refresh
{ "refreshToken": "..." }
```

1. Hash del token → buscar en `refresh_tokens`
2. Comprobar no revocado y no expirado
3. Revocar el anterior, insertar nuevo
4. Devolver nuevo `accessToken` + `refreshToken`

### Logout

```http
POST /auth/logout
{ "refreshToken": "..." }
```

Marca `revoked_at` en BD. El access JWT sigue válido hasta expirar (~15 min); en producción se puede acortar o usar blacklist si hace falta.

---

## Tests

| Archivo | Qué cubre |
|---------|-----------|
| `src/auth/auth.service.spec.ts` | login, credenciales inválidas, inactive, refresh, logout |
| `test/auth.e2e-spec.ts` | `@Public`, login envelope, `/users/me` con JWT, refresh |

```bash
pnpm test
pnpm test:e2e
```

---

## Orden sugerido para estudiar el código

1. [`auth/dto/login.dto.ts`](../src/auth/dto/login.dto.ts) — contrato del body
2. [`auth/auth.controller.ts`](../src/auth/auth.controller.ts) — rutas y `@Public()`
3. [`auth/auth.service.ts`](../src/auth/auth.service.ts) — lógica login + tokens
4. [`users/users.service.ts`](../src/users/users.service.ts) — `findByCode`, perfil
5. [`auth/guards/jwt-auth.guard.ts`](../src/auth/guards/jwt-auth.guard.ts) — guard global
6. [`auth/strategies/jwt.strategy.ts`](../src/auth/strategies/jwt.strategy.ts) — validación Bearer
7. [`auth/decorators/public.decorator.ts`](../src/auth/decorators/public.decorator.ts)
8. [`app.module.ts`](../src/app.module.ts) — `APP_GUARD`

---

## Próximos pasos (fuera de este doc)

- `PermissionsGuard` + `@RequirePermission()` (RBAC sobre rutas de negocio)
- Adaptar app móvil: login con `code` + guardar tokens en SecureStore
- Generador de códigos `e/t/p` al crear usuarios (secuencia por tipo)
