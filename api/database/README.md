# Base de datos — Agenda Escolar Digital

PostgreSQL 14+. Esquema versionado con migraciones en [`migrations/`](./migrations/).

## Qué va en cada carpeta

| Ruta | Uso |
|------|-----|
| [`migrations/`](./migrations/) | **Ejecutable** — V1…Vn + `R__triggers.sql` (aplicar con `pnpm db:migrate`) |
| [`seed-dev.sql`](./seed-dev.sql) | **Ejecutable** — datos demo solo desarrollo (`pnpm db:seed:dev`) |
| [`docs/`](./docs/) | **Solo referencia** — no ejecutar en producción |

## Comandos (desde `api/`)

```bash
pnpm db:up          # Postgres local (Docker, puerto 5434)
pnpm db:migrate     # Aplica migraciones
pnpm db:seed:dev    # Seed demo (opcional)
pnpm db:setup       # migrate + seed
```

## Documentación

- [`docs/relaciones.md`](./docs/relaciones.md) — modelo de datos, diagramas ER, políticas entry ↔ calendar_event, mapeo pantallas → tablas
- [`docs/fase2-comentado.sql`](./docs/fase2-comentado.sql) — borrador SQL comentado para fase 2 (cursos, horarios, aulas); **no ejecutar** hasta implementar esas features

## Migraciones actuales

```
migrations/
  V1__extensions_and_types.sql
  V2__tables.sql
  V3__views.sql
  V4__seed_iam.sql
  R__triggers.sql    # repeatable; se reaplica si cambia el archivo
```
