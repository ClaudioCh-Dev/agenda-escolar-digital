import type { CSSProperties } from 'react';

/** Botones de acción principal (guardar, nueva anotación, +) */
export const CTA_GRADIENT = 'var(--primary-gradient-cta)';
export const CTA_SHADOW = '0 6px 20px var(--primary-shadow)';
export const CTA_SHADOW_SM = '0 4px 12px var(--primary-shadow-sm)';
export const HERO_GRADIENT = 'var(--primary-gradient-hero)';

/** Tarjetas de resumen (dashboard) — superficie sólida, no degradado CTA */
export const SUMMARY_CARD_BG = 'var(--surface-summary-bg)';
export const SUMMARY_CARD_BORDER = '1px solid var(--surface-summary-border)';
export const SUMMARY_CARD_SHADOW = 'var(--surface-summary-shadow)';

/** Chips, fechas, filtros y opciones seleccionadas — sin degradado */
export const SELECTED_BG = 'var(--primary-muted)';
export const SELECTED_BORDER = 'var(--primary)';
export const SELECTED_TEXT = 'var(--primary)';

const PILL_BORDER = '1px solid var(--border)';
const PILL_BORDER_SELECTED = '1px solid var(--primary-soft)';

/** Pills de fecha — mismo fondo; seleccionado con borde primario suave */
export function datePillStyle(selected: boolean): CSSProperties {
  return {
    backgroundColor: 'var(--card)',
    border: selected ? PILL_BORDER_SELECTED : PILL_BORDER,
  };
}

export function selectionStyle(active: boolean): CSSProperties {
  if (active) {
    return {
      backgroundColor: SELECTED_BG,
      color: SELECTED_TEXT,
      border: '1.5px solid transparent',
      boxShadow: 'none',
    };
  }
  return {
    backgroundColor: 'var(--muted)',
    color: 'var(--foreground)',
    border: '1.5px solid transparent',
    boxShadow: 'none',
  };
}

export function filterPillStyle(active: boolean): CSSProperties {
  if (active) {
    return {
      backgroundColor: SELECTED_BG,
      color: SELECTED_TEXT,
      border: '1.5px solid transparent',
      fontWeight: 700,
    };
  }
  return {
    backgroundColor: 'var(--muted)',
    color: 'var(--muted-foreground)',
    border: '1.5px solid transparent',
    fontWeight: 700,
  };
}
