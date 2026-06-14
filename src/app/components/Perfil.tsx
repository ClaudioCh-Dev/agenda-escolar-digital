import { useState } from 'react';
import { motion } from 'motion/react';
import { LogOut, Bell, Moon, Sun, ChevronRight, Shield, GraduationCap, Settings, HelpCircle, BookOpen, Mail, Clock } from 'lucide-react';
import type { User as UserType } from './data';

interface PerfilProps {
  user: UserType;
  darkMode: boolean;
  onToggleDark: () => void;
  onLogout: () => void;
}

const ROLE_LABEL = {
  auxiliar: 'Auxiliar / Docente',
  padre:    'Padre de familia',
  alumno:   'Alumno',
};

export function Perfil({ user, darkMode, onToggleDark, onLogout }: PerfilProps) {
  const [notifications, setNotifications] = useState({ push: true, email: false, reminders: true });

  const Toggle = ({ value, onChange }: { value: boolean; onChange: () => void }) => (
    <button
      onClick={onChange}
      className="w-11 h-6 rounded-full transition-colors relative flex-shrink-0"
      style={{ backgroundColor: value ? 'var(--foreground)' : 'var(--muted)' }}
    >
      <motion.div
        animate={{ x: value ? 22 : 2 }}
        className="absolute top-1 w-4 h-4 rounded-full shadow-sm"
        style={{ backgroundColor: value ? 'var(--primary-foreground)' : 'var(--muted-foreground)' }}
      />
    </button>
  );

  return (
    <div className="flex flex-col h-full overflow-hidden" style={{ backgroundColor: 'var(--background)' }}>
      <div className="flex-1 overflow-y-auto pb-24">

        {/* Avatar + name block */}
        <div className="px-5 pt-12 pb-5">
          <div
            className="p-5 rounded-3xl"
            style={{ backgroundColor: 'var(--card)', boxShadow: '0 2px 16px rgba(26,23,64,0.07)', border: '1px solid var(--border)' }}
          >
            <div className="flex items-center gap-4 mb-5">
              {/* Monochrome avatar */}
              <div
                className="w-16 h-16 rounded-3xl flex items-center justify-center flex-shrink-0"
                style={{ backgroundColor: 'var(--foreground)', color: 'var(--primary-foreground)', fontWeight: 900, fontSize: 22 }}
              >
                {user.initials}
              </div>
              <div className="flex-1 min-w-0">
                <h1 style={{ fontWeight: 900, fontSize: 20, color: 'var(--foreground)', letterSpacing: -0.5, lineHeight: 1.2 }}>
                  {user.name}
                </h1>
                <p className="text-sm mt-0.5" style={{ color: 'var(--muted-foreground)', fontWeight: 600 }}>
                  {user.email}
                </p>
                <span
                  className="inline-block mt-2 px-2.5 py-1 rounded-full text-xs"
                  style={{ backgroundColor: 'var(--muted)', color: 'var(--muted-foreground)', fontWeight: 700 }}
                >
                  {ROLE_LABEL[user.role]}
                </span>
              </div>
            </div>

            {/* Stats row — all same color */}
            <div
              className="grid grid-cols-3 gap-0 pt-4"
              style={{ borderTop: '1px solid var(--border)' }}
            >
              {[
                { label: 'Sección', value: user.role === 'auxiliar' ? '3° A' : user.children?.[0]?.grade.split(' ')[0] || '3°' },
                { label: 'Año', value: '2026' },
                { label: user.children ? 'Hijos' : 'Grado', value: user.children?.length ?? (user.role === 'alumno' ? '3°' : 1) },
              ].map((s, i, arr) => (
                <div
                  key={s.label}
                  className="text-center py-1"
                  style={{ borderRight: i < arr.length - 1 ? '1px solid var(--border)' : 'none' }}
                >
                  <p style={{ fontWeight: 900, fontSize: 20, color: 'var(--foreground)', lineHeight: 1 }}>{s.value}</p>
                  <p className="text-xs mt-1" style={{ color: 'var(--muted-foreground)', fontWeight: 600 }}>{s.label}</p>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Children */}
        {user.children && user.children.length > 0 && (
          <Section label="MIS HIJOS">
            {user.children.map((child, i, arr) => (
              <Row
                key={child.id}
                icon={<BookOpen size={16} strokeWidth={1.8} style={{ color: 'var(--primary)' }} />}
                label={child.name}
                sub={`${child.section} · ${child.grade}`}
                last={i === arr.length - 1}
              />
            ))}
          </Section>
        )}

        {/* Section */}
        {user.section && (
          <Section label="SECCIÓN ASIGNADA">
            <Row
              icon={<GraduationCap size={16} strokeWidth={1.8} style={{ color: 'var(--primary)' }} />}
              label="Sección"
              sub={user.section}
              last
            />
          </Section>
        )}

        {/* Notifications */}
        <Section label="NOTIFICACIONES">
          <ToggleRow
            icon={<Bell size={16} strokeWidth={1.8} style={{ color: 'var(--primary)' }} />}
            label="Notificaciones push"
            sub="Alertas en tiempo real"
            value={notifications.push}
            onChange={() => setNotifications(p => ({ ...p, push: !p.push }))}
          />
          <ToggleRow
            icon={<Mail size={16} strokeWidth={1.8} style={{ color: 'var(--primary)' }} />}
            label="Resumen por email"
            sub="Resumen diario"
            value={notifications.email}
            onChange={() => setNotifications(p => ({ ...p, email: !p.email }))}
          />
          <ToggleRow
            icon={<Clock size={16} strokeWidth={1.8} style={{ color: 'var(--primary)' }} />}
            label="Recordatorios"
            sub="Antes de exámenes y tareas"
            value={notifications.reminders}
            onChange={() => setNotifications(p => ({ ...p, reminders: !p.reminders }))}
            last
          />
        </Section>

        {/* Appearance */}
        <Section label="APARIENCIA">
          <ToggleRow
            icon={darkMode
              ? <Moon size={16} strokeWidth={1.8} style={{ color: 'var(--primary)' }} />
              : <Sun size={16} strokeWidth={1.8} style={{ color: 'var(--primary)' }} />
            }
            label="Modo oscuro"
            sub={darkMode ? 'Activado' : 'Desactivado'}
            value={darkMode}
            onChange={onToggleDark}
            last
          />
        </Section>

        {/* More */}
        <Section label="MÁS">
          <Row icon={<Shield size={16} strokeWidth={1.8} style={{ color: 'var(--primary)' }} />} label="Cambiar contraseña" chevron />
          <Row icon={<Settings size={16} strokeWidth={1.8} style={{ color: 'var(--primary)' }} />} label="Configuración general" chevron />
          <Row icon={<HelpCircle size={16} strokeWidth={1.8} style={{ color: 'var(--primary)' }} />} label="Centro de ayuda" chevron last />
        </Section>

        {/* Version */}
        <p className="text-center text-xs py-2 pb-4" style={{ color: 'var(--primary)' }}>
          Agenda Escolar Digital v1.0.0 · Colegio San Martín 2026
        </p>

        {/* Logout */}
        <div className="px-5 pb-6">
          <motion.button
            whileTap={{ scale: 0.97 }}
            onClick={onLogout}
            className="w-full flex items-center justify-center gap-2.5 py-4 rounded-2xl"
            style={{
              backgroundColor: 'var(--card)',
              color: 'var(--muted-foreground)',
              fontWeight: 700,
              fontSize: 15,
              border: '1px solid var(--border)',
              boxShadow: '0 1px 6px rgba(26,23,64,0.05)',
            }}
          >
            <LogOut size={17} strokeWidth={1.8} />
            Cerrar sesión
          </motion.button>
        </div>
      </div>
    </div>
  );
}

/* ── Small layout helpers ── */

function Section({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="px-5 pb-4">
      <p
        className="text-[11px] mb-2"
        style={{ color: 'var(--muted-foreground)', fontWeight: 800, letterSpacing: 0.6 }}
      >
        {label}
      </p>
      <div
        className="rounded-3xl overflow-hidden"
        style={{ backgroundColor: 'var(--card)', boxShadow: '0 1px 12px rgba(26,23,64,0.06)', border: '1px solid var(--border)' }}
      >
        {children}
      </div>
    </div>
  );
}

function Row({
  icon, label, sub, chevron = false, last = false,
}: {
  icon: React.ReactNode;
  label: string;
  sub?: string;
  chevron?: boolean;
  last?: boolean;
}) {
  return (
    <div
      className="flex items-center gap-3.5 px-4 py-3.5"
      style={{ borderBottom: last ? 'none' : '1px solid var(--border)' }}
    >
      <div
        className="w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0"
        style={{ backgroundColor: 'var(--muted)' }}
      >
        {icon}
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm" style={{ fontWeight: 700, color: 'var(--foreground)' }}>{label}</p>
        {sub && <p className="text-xs" style={{ color: 'var(--muted-foreground)', fontWeight: 500 }}>{sub}</p>}
      </div>
      {chevron && <ChevronRight size={15} strokeWidth={1.8} style={{ color: 'var(--muted-foreground)', flexShrink: 0 }} />}
    </div>
  );
}

function ToggleRow({
  icon, label, sub, value, onChange, last = false,
}: {
  icon: React.ReactNode;
  label: string;
  sub?: string;
  value: boolean;
  onChange: () => void;
  last?: boolean;
}) {
  return (
    <div
      className="flex items-center gap-3.5 px-4 py-3.5"
      style={{ borderBottom: last ? 'none' : '1px solid var(--border)' }}
    >
      <div
        className="w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0"
        style={{ backgroundColor: 'var(--muted)' }}
      >
        {icon}
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm" style={{ fontWeight: 700, color: 'var(--foreground)' }}>{label}</p>
        {sub && <p className="text-xs" style={{ color: 'var(--muted-foreground)', fontWeight: 500 }}>{sub}</p>}
      </div>
      <button
        onClick={onChange}
        className="w-11 h-6 rounded-full transition-colors relative flex-shrink-0"
        style={{ background: value ? 'linear-gradient(135deg, #6C4FE8 0%, #B47FFF 100%)' : 'var(--muted)' }}
      >
        <motion.div
          animate={{ x: value ? 22 : 2 }}
          className="absolute top-1 w-4 h-4 rounded-full shadow-sm"
          style={{ backgroundColor: '#ffffff' }}
        />
      </button>
    </div>
  );
}
