# Agenda Escolar Digital

App mobile (Expo / React Native) para gestión escolar: anotaciones, calendario, notificaciones y perfil. Incluye datos mock y arquitectura lista para conectar una API real.

**Stack:** Expo SDK 56 · React Native 0.85 · Expo Router · TypeScript · Nunito · Lucide icons

---

## Requisitos

- Node.js 18+
- pnpm (recomendado) o npm
- [Expo Go](https://expo.dev/go) en el teléfono, o emulador Android / iOS

## Inicio rápido

```bash
pnpm install
pnpm start
```

Escaneá el QR con Expo Go, o en la terminal: `a` (Android) · `i` (iOS).

Variables opcionales (copiá `.env.example` → `.env`):

| Variable | Default | Descripción |
|----------|---------|-------------|
| `EXPO_PUBLIC_USE_MOCK` | `true` | Datos en memoria vs API |
| `EXPO_PUBLIC_API_URL` | `https://api.example.com` | Base URL del backend |

---

## Roles y pantallas

| Tab | Auxiliar / docente | Padre | Alumno |
|-----|-------------------|-------|--------|
| **Inicio** | Resumen del día, secciones, accesos rápidos | Dashboard por hijo, banner de lecturas pendientes | Saludo y resumen propio |
| **Agenda** | Crear / editar anotaciones por sección | Solo lectura; confirmar lectura en comunicados | Solo lectura |
| **Calendario** | Crear eventos escolares | Ver eventos | Ver eventos |
| **Perfil** | Ajustes, modo oscuro, cerrar sesión | Idem + selector de hijos en otras pantallas | Idem |

### Flujos clave

- **Confirmar lectura (padre):** banner en Inicio/Agenda → lista guiada → detalle → botón *Confirmo que he leído*.
- **Seguimiento auxiliar:** en un comunicado con acuse, ver cuántos padres confirmaron (lista X/Y).
- **Nueva anotación:** botón flotante en Agenda (auxiliar) → tipos: tarea, comunicado, examen, etc.

> Fecha fija del mock: **13 de junio de 2026** (`TODAY` en `src/constants/config.ts`).

---

## Cuentas demo

Contraseña: **cualquier valor** (el mock no la valida).

| Rol | Email | Notas |
|-----|-------|-------|
| Auxiliar | `auxiliar@colegio.edu` | María García · secciones 3° A y 5° A/B/C |
| Padre | `padre@colegio.edu` | Carlos Rodríguez · hijos Lucas (3° A) y Emma (5° B) · **2 lecturas pendientes** |
| Padre (extra) | `padre2@colegio.edu` | Ana López · Sofía y Mateo |
| Alumno | `alumno@colegio.edu` | Lucas Rodríguez · 3° A |

Para probar listas largas de padres: comunicado `e-002` (30 familias en 3° A, 10 ya confirmaron).

---

## Capturas esenciales

Guardá las fotos en `docs/screenshots/` con el nombre indicado. Cuando las tengas, reemplazá el texto *Pon foto acá…* por la imagen en markdown.

### 1. Login

```
docs/screenshots/01-login.png
```

> **Pon foto acá del login** — email, contraseña y botón de ingreso.

<!-- ![Login](docs/screenshots/01-login.png) -->

---

### 2. Inicio (padre)

```
docs/screenshots/02-inicio-padre.png
```

> **Pon foto acá del inicio padre** — selector de hijo, fecha *Hoy* y banner amarillo de lecturas pendientes (si aparece).

<!-- ![Inicio padre](docs/screenshots/02-inicio-padre.png) -->

---

### 3. Inicio (auxiliar)

```
docs/screenshots/03-inicio-auxiliar.png
```

> **Pon foto acá del inicio auxiliar** — tarjeta del día, stats y accesos rápidos.

<!-- ![Inicio auxiliar](docs/screenshots/03-inicio-auxiliar.png) -->

---

### 4. Agenda

```
docs/screenshots/04-agenda.png
```

> **Pon foto acá de la agenda** — lista de anotaciones del día (ideal con auxiliar logueado y FAB visible).

<!-- ![Agenda](docs/screenshots/04-agenda.png) -->

---

### 5. Calendario

```
docs/screenshots/05-calendario.png
```

> **Pon foto acá del calendario** — mes con día seleccionado y lista de eventos abajo.

<!-- ![Calendario](docs/screenshots/05-calendario.png) -->

---

### 6. Perfil

```
docs/screenshots/06-perfil.png
```

> **Pon foto acá del perfil** — avatar, nombre, rol, stats y toggle de modo oscuro.

<!-- ![Perfil](docs/screenshots/06-perfil.png) -->

---

### 7. Confirmar lectura (padre)

```
docs/screenshots/07-confirmar-lectura.png
docs/screenshots/08-confirmar-lectura-detalle.png
```

> **Pon foto acá del modal Confirmar lectura** — lista numerada de pendientes.

> **Pon foto acá del detalle con el botón** — comunicado abierto y botón *Confirmo que he leído* abajo.

<!-- ![Confirmar lectura](docs/screenshots/07-confirmar-lectura.png) -->
<!-- ![Detalle confirmar](docs/screenshots/08-confirmar-lectura-detalle.png) -->

---

## Estructura del proyecto

```
app/                    # Rutas Expo Router (pantallas delgadas)
src/
  theme/                # Colores, tipografía, spacing, modo oscuro
  types/                # Tipos TypeScript
  constants/            # Config, labels, tipos de anotación
  data/mocks/           # Datos estáticos
  services/
    api/                # Stubs (firmas de endpoints reales)
    mocks/              # Store en memoria
  contexts/             # AuthContext, AppDataContext
  components/
    ui/                 # Button, Modal, TodayDateText, etc.
    features/           # EntryCard, PendingAckGuideModal, etc.
    layout/             # TopBar, HomeTopBar
  features/             # Pantallas por dominio (auth, agenda, profile…)
  utils/                # Fechas, visibilidad, ack de lectura
assets/                 # Iconos, splash, avatares mock
docs/screenshots/       # Capturas para este README
```

Las pantallas **no importan mocks directamente**; usan `useAuth()` y `useAppData()`.

---

## Tema global

Todo el diseño pasa por `src/theme/`:

- `light.ts` / `dark.ts` — paletas claro y oscuro
- `ThemeProvider` + `useTheme()` — persistido en AsyncStorage
- `styles.ts` — helpers (`selectionStyle`, `datePillStyle`, `cardShadow`)

---

## Mock → API

Por defecto `USE_MOCK = true` en `src/constants/config.ts`.

Para API real:

1. Implementar funciones en `src/services/api/*.api.ts`
2. Definir `EXPO_PUBLIC_API_URL` en `.env`
3. Poner `EXPO_PUBLIC_USE_MOCK=false`

| Servicio | Funciones stub | Endpoint |
|----------|----------------|----------|
| auth | login, logout, getSession, changePassword | `/auth/*` |
| entries | CRUD + confirmEntryRead | `/entries` |
| calendar | CRUD eventos | `/calendar/events` |
| notifications | list, markAsRead | `/notifications` |
| chat | conversaciones y mensajes | `/conversations` |
| students | alumnos y padres por sección | `/students`, `/parents` |

---

## Scripts

| Comando | Descripción |
|---------|-------------|
| `pnpm start` | Servidor de desarrollo Expo |
| `pnpm android` | Abrir en Android |
| `pnpm ios` | Abrir en iOS |
| `pnpm lint` | Chequeo TypeScript (`tsc --noEmit`) |

---

## Tips para sacar capturas

1. Usá **padre@colegio.edu** para banner y modales de confirmación.
2. Usá **auxiliar@colegio.edu** para agenda con botón de crear y calendario editable.
3. Modo claro y oscuro: cambialo en **Perfil** antes de fotografiar.
4. En emulador: `Ctrl + S` (Windows) o `Cmd + S` (Mac) suele guardar screenshot; en dispositivo, captura nativa del sistema.
