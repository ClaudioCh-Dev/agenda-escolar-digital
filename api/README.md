# Agenda Escolar Digital — API

API REST en **NestJS** + **PostgreSQL** para la agenda escolar (registros, calendario, adjuntos Cloudinary, auth JWT).

## Requisitos

- Node.js 20+
- pnpm
- Docker (solo para Postgres local)

## Configuración inicial

```bash
cd api
pnpm install
cp .env.example .env
```

Editá `api/.env` si hace falta. Valores por defecto para desarrollo local:

```
DATABASE_URL=postgresql://postgres:postgres@localhost:5434/agenda_escolar
JWT_SECRET=change-me-in-production-use-long-random-string
PORT=3000
```

Para adjuntos y avatares, completá las variables `CLOUDINARY_*` (ver [cloudinary.com](https://cloudinary.com)).

## Base de datos (desarrollo)

Docker levanta **solo Postgres** (puerto **5434** en el host):

```bash
pnpm db:up
```

Las migraciones **no** corren solas al iniciar Docker ni al arrancar la API. Hay que ejecutarlas manualmente:

```bash
pnpm db:migrate
```

| Comando | Descripción |
|---------|-------------|
| `pnpm db:up` | Levanta Postgres (`docker compose up -d postgres`) |
| `pnpm db:migrate` | Aplica migraciones SQL (`scripts/migrate.mjs`) |
| `pnpm db:migrate:flyway` | Alternativa con Flyway CLI o imagen Docker |
| `pnpm db:seed:dev` | Carga datos de demo (opcional, solo dev) |
| `pnpm db:setup` | `db:migrate` + `db:seed:dev` |

### Seed de desarrollo (opcional)

El seed **no es obligatorio** para arrancar la API. Usalo cuando quieras datos de prueba (colegio demo, usuarios, sección, etc.) sin cargarlos a mano:

```bash
pnpm db:seed:dev
```

O migrar y sembrar en un solo paso:

```bash
pnpm db:setup
```

El script es idempotente (`ON CONFLICT DO NOTHING`); podés volver a ejecutarlo sin romper datos existentes.

**Logins de demo** (password `demo123`):

| Código | Rol |
|--------|-----|
| `t10000001` | Auxiliar |
| `p10000001` | Padre |
| `e10000001` | Alumno |

## Arrancar la API

```bash
pnpm start:dev
```

La API escucha en `http://localhost:3000` (o el `PORT` de `.env`).

```bash
pnpm build          # compilar
pnpm start:prod     # producción (dist/)
pnpm lint           # ESLint
pnpm test           # tests unitarios
```

## Documentación adicional

- [Base de datos (migraciones y modelo)](database/README.md)
- [Permisos y endpoints](docs/endpoints-permissions.md)
- [Logging](docs/logging.md)

## Notas

- `docker compose up` no ejecuta migraciones ni seed; en producción suele hacerse en CI/CD o en un job de despliegue.
- El móvil (`mobil/`) apunta a esta API con `EXPO_PUBLIC_API_URL` y `EXPO_PUBLIC_USE_MOCK=false` para usar la API real.
