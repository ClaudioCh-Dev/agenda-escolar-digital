# Agenda Escolar Digital (Expo / React Native)

App mobile para gestión de agenda escolar: anotaciones, calendario, notificaciones y perfil. Datos mock incluidos; arquitectura lista para conectar API real.

## Requisitos

- Node.js 18+
- pnpm (recomendado) o npm
- Expo Go en dispositivo, o emulador Android/iOS

## Inicio rápido

```bash
pnpm install
pnpm start
```

Escaneá el QR con Expo Go, o presioná `a` (Android) / `i` (iOS) en la terminal.

## Estructura del proyecto

```
app/                    # Rutas Expo Router (pantallas delgadas)
src/
  theme/                # Tema global (colores, tipografía, spacing)
  types/                # Tipos TypeScript
  constants/            # Config, labels, entry/calendar types
  data/mocks/           # Datos mock estáticos
  services/
    api/                # Stubs vacíos (firmas de endpoints reales)
    mocks/              # Implementación mock con store en memoria
    index.ts            # Factory mock ↔ api
  contexts/             # AuthContext, AppDataContext
  components/
    ui/                 # Primitivos reutilizables
    features/           # EntryCard, DatePicker, etc.
    layout/             # TopBar
  features/             # Pantallas por dominio
  utils/                # Visibilidad, fechas
assets/                 # Iconos, splash, avatares mock
```

## Tema global

Todo el diseño pasa por `src/theme/`:

- `light.ts` / `dark.ts` — paleta migrada del CSS original
- `ThemeProvider` + `useTheme()` — modo claro/oscuro (persistido en AsyncStorage)
- `styles.ts` — helpers (`selectionStyle`, `datePillStyle`, `cardShadow`)

## Mock → API

Por defecto `USE_MOCK = true` en `src/constants/config.ts`.

Para usar API real:

1. Implementar funciones en `src/services/api/*.api.ts`
2. Definir `EXPO_PUBLIC_API_URL` en `.env`
3. Cambiar `EXPO_PUBLIC_USE_MOCK=false` o `USE_MOCK` a `false`

### Mapa servicio → endpoint

| Servicio | Funciones stub | Endpoint |
|----------|----------------|----------|
| auth | login, logout, getSession, changePassword | POST/GET/PATCH `/auth/*` |
| entries | listEntries, getEntry, createEntry, updateEntry, deleteEntry, confirmEntryRead | `/entries` |
| calendar | listEvents, getEvent, createEvent, updateEvent, deleteEvent | `/calendar/events` |
| notifications | listNotifications, markAsRead, markAllAsRead | `/notifications` |
| chat | listConversations, getMessages, sendMessage | `/conversations` |
| students | listStudentsBySection, getStudent, listParents* | `/students`, `/parents` |

Las pantallas **no importan mocks directamente**; usan `useAppData()` y `useAuth()`.

## Cuentas demo

| Rol | Email |
|-----|-------|
| Auxiliar | auxiliar@colegio.edu |
| Padre | padre@colegio.edu |
| Alumno | alumno@colegio.edu |

Contraseña: cualquier valor (mock no valida password).

## Scripts

- `pnpm start` — Expo dev server
- `pnpm android` — Android
- `pnpm ios` — iOS
- `pnpm lint` — TypeScript check
