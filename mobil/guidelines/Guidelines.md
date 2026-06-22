# Guidelines — Agenda Escolar Digital

Reglas para mantener coherencia visual y de código en este proyecto. Basadas en lo que ya existe en el repo.

---

## General

- **Stack:** Expo SDK 56, React Native, Expo Router, TypeScript, **Zustand**, **TanStack Query**.
- **Rutas delgadas:** `app/` solo enruta; la lógica vive en `src/features/`.
- **Estado de sesión:** `useAuth()` desde `@/store/useAuth` (Zustand + persist).
- **Estado del servidor:** hooks en `@/queries/` (TanStack Query). No usar Context para datos de API.
- **Servicios:** importar desde `@/services` (facades). No importar mocks directamente desde pantallas.
- **Idioma UI:** español rioplatense cuando encaje (*Revisá*, *Confirmá*, *Completá*).
- **Layouts:** flexbox por defecto; evitar posicionamiento absoluto salvo decoración (`pointerEvents="none"`) o overlays.
- **Truncado:** en filas flex, usar `flex: 1, minWidth: 0` + `numberOfLines` donde haga falta.

---

## Tema y colores

Siempre `useTheme()` desde `@/theme`. **No hardcodear** colores de marca salvo `#fff` sobre gradientes/primary.

| Token | Uso |
|-------|-----|
| `background` | Fondo de pantalla (lavanda claro) |
| `card` | Tarjetas, modales, tab bar |
| `foreground` | Títulos y texto principal |
| `muted` / `mutedForeground` | Fondos suaves y texto secundario |
| `primary` | Acentos, selección, links, día *Hoy* |
| `primaryMuted` | Fondo de ítem/filtro activo |
| `primaryMutedText` | Labels pequeños sobre fondo activo |
| `border` | Bordes sutiles de tarjetas |
| `destructive` | Eliminar, errores graves |
| `overlay` | Fondo de modales |

Modo claro/oscuro: `ThemeProvider` persiste en AsyncStorage. Probar ambos modos al tocar UI nueva.

---

## Tipografía (Nunito)

| Peso | Token | Uso típico |
|------|-------|------------|
| Regular | `fontFamily` | Cuerpo largo (poco usado inline) |
| SemiBold | `fontFamilyMedium` | Subtítulos, metadata, hints |
| Bold | `fontFamilyBold` | Labels, botones secundarios, filtros |
| Black | `fontFamilyBlack` | Títulos de pantalla, números destacados, tab activo |

Tamaños frecuentes: **10** (micro label), **12–13** (secundario), **14–16** (cuerpo/títulos de tarjeta), **18** (título de modal), **20+** (hero/nombre).

---

## Gradientes

Dos gradientes oficiales en el tema. **No inventar otros** para CTAs.

### `ctaGradient` — acciones principales

Teal → teal claro (`#0D9488` → `#5EEAD4` en light).

Usar en:
- `Button` variant `primary`
- FAB y botones flotantes de crear (Agenda, Calendario)
- CTAs compactos en dashboard auxiliar
- `PendingAckBanner` (banner de lecturas pendientes)
- Acciones destacadas en Perfil (ej. cerrar sesión con gradiente)

Dirección habitual: `start={{ x: 0, y: 0 }}` `end={{ x: 1, y: 1 }}`.  
Texto e iconos encima: **blanco** (`#fff`).

### `heroGradient` — solo hero de login

Variante más profunda para el bloque superior del login. **No reutilizar** como botón suelto.

---

## Botones

Usar `@/components/ui/Button` cuando sea un botón de formulario/modal.

| Variant | Cuándo | Estilo |
|---------|--------|--------|
| `primary` | Acción principal (1 por sección) | Gradiente `ctaGradient`, texto blanco, `borderRadius: 16` |
| `secondary` | Alternativa | Fondo `muted` |
| `destructive` | Eliminar | Fondo `destructive`, texto blanco |
| `ghost` | Poco relevante | Transparente |

Acciones tipo “Cerrar sesión” / outline: helper `mutedOutlineButtonStyle(theme)` — card + borde + sombra opcional.

CTAs inline pequeños (ej. “Agregar evento”): `LinearGradient` + `ctaGradient` + `borderRadius: 12`, padding compacto.

Estados: `opacity: 0.9` pressed, `0.5` disabled.

---

## Tarjetas y sombras

Patrón estándar de tarjeta:

```tsx
{
  backgroundColor: theme.colors.card,
  borderRadius: theme.radii.xl,  // 24 — tarjetas grandes
  borderWidth: 1,
  borderColor: theme.colors.border,
  overflow: 'hidden',
  ...cardShadow(theme),
}
```

- **`cardShadow(theme)`** en listas y pantallas scrollables.
- **Dentro de modales:** preferir **borde** sin sombra (en Android, sombra + `borderRadius` sin `overflow: 'hidden'` deja esquinas puntiagudas).
- Radios: `sm` 12 · `md` 16 · `lg` 20 · `xl` 24 · `pill` 999.

Decoración de fondo en tarjetas (ej. perfil): componentes SVG suaves, `pointerEvents="none"`, sin bloquear interacción.

---

## Selección, filtros y fechas

Helpers de `@/theme/styles.ts`:

- **`selectionStyle(theme, active)`** — pills de filtro (activo = `primaryMuted`).
- **`filterPillStyle(theme, active)`** — igual idea para chips.
- **`datePillStyle(theme, selected)`** — días del calendario/semana; seleccionado = borde `primaryDashed`.

Ítem activo en listas: borde `primary` 1.5px + fondo `primaryMuted`.  
Texto activo: `theme.colors.primary` + `fontFamilyBold` o `fontFamilyBlack`.

---

## Modales

- Usar **`AppModal`** (`@/components/ui/Modal`): overlay centrado, `maxWidth: 390`, `borderRadius: 24`, `maxHeight: '80%'`.
- Header de modal: título `fontFamilyBlack` 18, subtítulo `fontFamilyMedium` 13 muted, botón cerrar 32×32 en `muted` circular.
- Padding horizontal interno: **20**.
- Modales largos: altura fija (~72–78% viewport) + `ScrollView` interno.
- Confirmaciones destructivas: `ConfirmDialog`, no alert nativo.

---

## Tab bar

Exactamente **4 tabs**: Inicio, Agenda, Calendario, Perfil.

- Tab activo: icono sobre cuadrado `primary` (`borderRadius: 14`), icono blanco, label `fontFamilyBlack` en `primary`.
- Inactivo: icono `mutedForeground`, label `fontFamilyMedium`.
- Altura tab bar ~78px; fondo `card` con borde superior sutil.

No agregar un quinto tab sin rediseñar la navegación.

---

## Iconos

- Librería: **lucide-react-native**.
- Tamaños comunes: 16–20 UI, 26 banners, 28 accesos rápidos.
- `strokeWidth`: **1.8** reposo, **2.2–2.5** activo/énfasis.

---

## Fechas y “Hoy”

- Helpers en `@/utils/dates`: `formatFullDate`, `formatModalDate`, `formatRelativeDay`.
- Si la fecha incluye **“Hoy”**, solo esa palabra va en **`primary`**: usar `@/components/ui/TodayDateText` (no colorear toda la cadena).
- Formato habitual: `Hoy · martes, 13 de junio` o `Hoy · 13 de junio · 10:00`.
- Mock fijo: `TODAY = '2026-06-13'` en config.

---

## Anotaciones y confirmación de lectura

- Tipos de entrada: `entryTypeConfig` en `@/constants/entryTypes`.
- Tarjetas: `EntryCard`; detalle: `EntryDetailModal`.
- **Acuse de lectura (padre):** solo botón *Confirmo que he leído* — sin preguntas sí/no ni “autorización firmada”.
- `requiresAck` en comunicados; badge “Pendiente” en tarjeta si falta confirmar.
- Flujo padre: `PendingAckBanner` → `PendingAckGuideModal` (lista numerada) → detalle → confirmar.
- Flujo auxiliar: contador X/Y y `ParentAckListModal` para ver padres.

---

## Espaciado y pantallas

- Padding horizontal de pantalla: **20**.
- Gaps frecuentes: **6**, **8**, **12**, **16**.
- Fondo de pantalla: `theme.colors.background` en el root `View` (no transparente sobre decoración).
- Scroll content: `paddingBottom: 100` aprox. para no quedar bajo el tab bar.

---

## Agenda — FAB

- Auxiliar: FAB circular con **`ctaGradient`** para nueva anotación (coexiste con tab bar; es la excepción permitida de acción flotante).
- Padre/alumno: agenda solo lectura; sin FAB de creación.

---

## Qué evitar

- Colores hex sueltos para UI (excepto blanco sobre gradiente).
- Nuevos gradientes decorativos en botones.
- Importar `@/data/mocks` desde features.
- Sombras fuertes dentro de modales.
- Mezclar estilos de selección ad hoc; reutilizar helpers del theme.
- Textos de confirmación legales tipo “autorizo” / “firmo”; el producto usa **confirmación de lectura** nada más.
