import { useState } from 'react';
import { motion } from 'motion/react';
import { ChevronLeft, Lock, Eye, EyeOff, Check, CircleAlert } from 'lucide-react';
import { CTA_GRADIENT, CTA_SHADOW } from './uiStyles';

interface CambiarContrasenaProps {
  onClose: () => void;
}

function PasswordField({
  label,
  value,
  onChange,
  placeholder,
  error,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  error?: string;
}) {
  const [visible, setVisible] = useState(false);

  return (
    <div>
      <label className="block text-sm mb-2" style={{ fontWeight: 800, color: 'var(--foreground)' }}>
        {label}
      </label>
      <div className="relative">
        <Lock
          size={16}
          className="absolute left-4 top-1/2 -translate-y-1/2"
          style={{ color: 'var(--muted-foreground)' }}
          strokeWidth={1.8}
        />
        <input
          type={visible ? 'text' : 'password'}
          value={value}
          onChange={e => onChange(e.target.value)}
          placeholder={placeholder ?? '••••••••'}
          className="w-full pl-10 pr-12 py-3.5 rounded-2xl text-sm outline-none"
          style={{
            backgroundColor: 'var(--card)',
            color: 'var(--foreground)',
            border: error ? '2px solid #FF5C72' : '1.5px solid var(--border)',
            boxShadow: '0 2px 12px rgba(26,23,64,0.06)',
            fontFamily: 'Nunito, sans-serif',
            fontWeight: 600,
          }}
        />
        <button
          type="button"
          onClick={() => setVisible(v => !v)}
          className="absolute right-4 top-1/2 -translate-y-1/2"
          style={{ color: 'var(--muted-foreground)' }}
          aria-label={visible ? 'Ocultar contraseña' : 'Mostrar contraseña'}
        >
          {visible ? <EyeOff size={16} strokeWidth={1.8} /> : <Eye size={16} strokeWidth={1.8} />}
        </button>
      </div>
      {error && <p className="text-xs mt-1" style={{ color: '#FF5C72' }}>{error}</p>}
    </div>
  );
}

export function CambiarContrasena({ onClose }: CambiarContrasenaProps) {
  const [current, setCurrent] = useState('');
  const [next, setNext] = useState('');
  const [confirm, setConfirm] = useState('');
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [saved, setSaved] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const validate = () => {
    const nextErrors: Record<string, string> = {};
    if (!current.trim()) nextErrors.current = 'Ingresá tu contraseña actual.';
    if (!next.trim()) nextErrors.next = 'Ingresá la nueva contraseña.';
    else if (next.length < 8) nextErrors.next = 'Mínimo 8 caracteres.';
    if (!confirm.trim()) nextErrors.confirm = 'Confirmá la nueva contraseña.';
    else if (next !== confirm) nextErrors.confirm = 'Las contraseñas no coinciden.';
    if (current && next && current === next) nextErrors.next = 'Debe ser distinta a la actual.';
    setErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validate()) return;
    setIsLoading(true);
    await new Promise(r => setTimeout(r, 900));
    setIsLoading(false);
    setSaved(true);
    setTimeout(onClose, 1200);
  };

  if (saved) {
    return (
      <div className="flex flex-col h-full items-center justify-center px-8" style={{ backgroundColor: 'var(--background)' }}>
        <motion.div
          initial={{ scale: 0.6, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="w-20 h-20 rounded-3xl flex items-center justify-center mb-5"
          style={{ background: CTA_GRADIENT, boxShadow: CTA_SHADOW }}
        >
          <Check size={44} className="text-white" />
        </motion.div>
        <h2 style={{ fontWeight: 900, fontSize: 24, color: 'var(--foreground)' }}>¡Contraseña actualizada!</h2>
        <p className="mt-2 text-sm text-center" style={{ color: 'var(--muted-foreground)' }}>
          Usá la nueva contraseña la próxima vez que ingreses.
        </p>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full overflow-hidden" style={{ backgroundColor: 'var(--background)' }}>
      <div
        className="px-5 pt-12 pb-4 flex-shrink-0"
        style={{ backgroundColor: 'var(--card)', borderBottom: '1px solid var(--border)', boxShadow: '0 2px 16px rgba(26,23,64,0.05)' }}
      >
        <div className="flex items-center gap-3 min-w-0">
          <button
            type="button"
            onClick={onClose}
            className="w-10 h-10 rounded-2xl flex items-center justify-center flex-shrink-0"
            style={{ backgroundColor: 'var(--muted)' }}
          >
            <ChevronLeft size={20} style={{ color: 'var(--muted-foreground)' }} />
          </button>
          <h1 className="truncate" style={{ fontWeight: 900, fontSize: 20, color: 'var(--foreground)' }}>
            Cambiar contraseña
          </h1>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto">
        <div className="px-5 py-5 space-y-5">
          <div className="flex items-start gap-2.5">
            <CircleAlert
              size={18}
              strokeWidth={1.75}
              style={{ color: 'var(--muted-foreground)', flexShrink: 0, marginTop: 2 }}
            />
            <p className="text-sm leading-relaxed" style={{ color: 'var(--muted-foreground)', fontWeight: 600 }}>
              La contraseña debe tener al menos 8 caracteres, incluir una mayúscula, un número y no contener espacios.
            </p>
          </div>

          <div className="mt-3">
          <PasswordField
            label="Contraseña actual"
            value={current}
            onChange={v => { setCurrent(v); setErrors(p => ({ ...p, current: '' })); }}
            error={errors.current}
          />
          </div>
          <PasswordField
            label="Nueva contraseña"
            value={next}
            onChange={v => { setNext(v); setErrors(p => ({ ...p, next: '' })); }}
            error={errors.next}
          />
          <PasswordField
            label="Confirmar nueva contraseña"
            value={confirm}
            onChange={v => { setConfirm(v); setErrors(p => ({ ...p, confirm: '' })); }}
            error={errors.confirm}
          />
        </div>
      </div>

      <div className="flex-shrink-0 px-5 pb-10 pt-2">
        <motion.button
          type="button"
          whileTap={{ scale: 0.97 }}
          onClick={() => void handleSubmit()}
          disabled={isLoading}
          className="w-full py-4 rounded-2xl text-white flex items-center justify-center gap-2.5 disabled:opacity-60"
          style={{ background: CTA_GRADIENT, fontWeight: 800, fontSize: 16, boxShadow: CTA_SHADOW }}
        >
          {isLoading ? (
            <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
          ) : (
            <>
              <Check size={20} />
              Guardar contraseña
            </>
          )}
        </motion.button>
      </div>
    </div>
  );
}
