import { useState } from 'react';
import { motion } from 'motion/react';
import { Eye, EyeOff, Mail, Lock, ArrowRight, GraduationCap } from 'lucide-react';
import type { User } from './data';
import { MOCK_USERS } from './data';

interface LoginScreenProps {
  onLogin: (user: User) => void;
}

const DEMO_ACCOUNTS = [
  { label: 'Auxiliar',  email: 'auxiliar@colegio.edu', emoji: '👩‍🏫' },
  { label: 'Padre',     email: 'padre@colegio.edu',    emoji: '👨‍👩‍👧' },
  { label: 'Alumno',    email: 'alumno@colegio.edu',   emoji: '🎒' },
];

export function LoginScreen({ onLogin }: LoginScreenProps) {
  const [email, setEmail]           = useState('');
  const [password, setPassword]     = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading]   = useState(false);
  const [error, setError]           = useState('');

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) { setError('Completá todos los campos.'); return; }
    setIsLoading(true); setError('');
    await new Promise(r => setTimeout(r, 700));
    const user = MOCK_USERS.find(u => u.email === email);
    if (!user) { setError('Correo o contraseña incorrectos.'); setIsLoading(false); return; }
    onLogin(user);
  };

  const handleDemoLogin = async (demoEmail: string) => {
    setIsLoading(true);
    await new Promise(r => setTimeout(r, 500));
    const user = MOCK_USERS.find(u => u.email === demoEmail);
    if (user) onLogin(user);
    setIsLoading(false);
  };

  return (
    <div className="flex flex-col h-full">

      {/* ── TOP: colored section ── */}
      <div
        className="relative flex flex-col items-center justify-end px-8 pb-14 flex-shrink-0"
        style={{
          height: 260,
          background: 'linear-gradient(145deg, #6C4FE8 0%, #9B7BFF 100%)',
        }}
      >
        {/* Background circles */}
        <div className="absolute" style={{ width: 260, height: 260, borderRadius: '50%', backgroundColor: 'rgba(255,255,255,0.07)', top: -80, right: -60 }} />
        <div className="absolute" style={{ width: 180, height: 180, borderRadius: '50%', backgroundColor: 'rgba(255,255,255,0.07)', bottom: 20, left: -50 }} />

        {/* Logo */}
        <motion.div
          initial={{ scale: 0.7, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ type: 'spring', stiffness: 240, damping: 18 }}
          className="flex flex-col items-center gap-3 relative z-10"
        >
          <div
            className="w-20 h-20 rounded-3xl flex items-center justify-center"
            style={{ backgroundColor: 'rgba(255,255,255,0.18)', backdropFilter: 'blur(12px)', border: '1.5px solid rgba(255,255,255,0.28)' }}
          >
            <GraduationCap size={40} color="white" strokeWidth={1.8} />
          </div>
          <div className="text-center">
            <h1 style={{ fontWeight: 900, fontSize: 22, color: 'white', letterSpacing: -0.5 }}>
              Agenda Escolar Digital
            </h1>
            <p style={{ color: 'rgba(255,255,255,0.65)', fontSize: 13, fontWeight: 600, marginTop: 2 }}>
              Colegio San Martín
            </p>
          </div>
        </motion.div>
      </div>

      {/* ── BOTTOM: form section ── */}
      <motion.div
        initial={{ y: 40, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.2, type: 'spring', stiffness: 200, damping: 24 }}
        className="flex-1 overflow-y-auto px-6 pt-7 pb-6"
        style={{ backgroundColor: 'var(--card)', borderTopLeftRadius: 32, borderTopRightRadius: 32, marginTop: -28, position: 'relative', zIndex: 1 }}
      >
        <h2 style={{ fontWeight: 900, fontSize: 22, color: 'var(--foreground)', letterSpacing: -0.5, marginBottom: 4 }}>
          Iniciar sesión
        </h2>
        <p className="mb-6 text-sm" style={{ color: 'var(--muted-foreground)' }}>
          Accedé a la agenda de tu sección
        </p>

        <form onSubmit={handleLogin} className="space-y-4">
          {/* Email */}
          <div>
            <label className="block text-sm mb-1.5" style={{ fontWeight: 700, color: 'var(--foreground)' }}>
              Correo electrónico
            </label>
            <div className="relative">
              <Mail size={16} className="absolute left-4 top-1/2 -translate-y-1/2" style={{ color: 'var(--muted-foreground)' }} strokeWidth={1.8} />
              <input
                type="email"
                value={email}
                onChange={e => { setEmail(e.target.value); setError(''); }}
                placeholder="correo@colegio.edu"
                className="w-full pl-10 pr-4 py-3.5 rounded-2xl text-sm outline-none transition-all"
                style={{
                  backgroundColor: 'var(--muted)',
                  color: 'var(--foreground)',
                  border: '1.5px solid var(--border)',
                  fontFamily: 'Nunito, sans-serif',
                }}
              />
            </div>
          </div>

          {/* Password */}
          <div>
            <label className="block text-sm mb-1.5" style={{ fontWeight: 700, color: 'var(--foreground)' }}>
              Contraseña
            </label>
            <div className="relative">
              <Lock size={16} className="absolute left-4 top-1/2 -translate-y-1/2" style={{ color: 'var(--muted-foreground)' }} strokeWidth={1.8} />
              <input
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={e => { setPassword(e.target.value); setError(''); }}
                placeholder="••••••••"
                className="w-full pl-10 pr-12 py-3.5 rounded-2xl text-sm outline-none transition-all"
                style={{
                  backgroundColor: 'var(--muted)',
                  color: 'var(--foreground)',
                  border: '1.5px solid var(--border)',
                  fontFamily: 'Nunito, sans-serif',
                }}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-4 top-1/2 -translate-y-1/2"
                style={{ color: 'var(--muted-foreground)' }}
              >
                {showPassword ? <EyeOff size={16} strokeWidth={1.8} /> : <Eye size={16} strokeWidth={1.8} />}
              </button>
            </div>
          </div>

          {error && (
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-center text-xs py-2.5 px-4 rounded-xl"
              style={{ color: '#FF5C72', backgroundColor: 'rgba(255,92,114,0.08)' }}
            >
              {error}
            </motion.p>
          )}

          <div className="flex justify-end -mt-1">
            <button type="button" className="text-sm" style={{ color: 'var(--primary)', fontWeight: 700 }}>
              ¿Olvidaste tu contraseña?
            </button>
          </div>

          {/* Submit */}
          <motion.button
            type="submit"
            disabled={isLoading}
            whileTap={{ scale: 0.97 }}
            className="w-full py-4 rounded-2xl flex items-center justify-center gap-2.5 disabled:opacity-60"
            style={{
              background: 'linear-gradient(135deg, #6C4FE8 0%, #B47FFF 100%)',
              color: '#ffffff',
              fontWeight: 800,
              fontSize: 16,
              boxShadow: '0 8px 24px rgba(108,79,232,0.30)',
            }}
          >
            {isLoading
              ? <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              : <><span>Ingresar</span><ArrowRight size={18} strokeWidth={2.5} /></>
            }
          </motion.button>
        </form>

        {/* Divider */}
        <div className="flex items-center gap-3 my-5">
          <div className="flex-1 h-px" style={{ backgroundColor: 'var(--border)' }} />
          <span className="text-[11px]" style={{ color: 'var(--muted-foreground)', fontWeight: 700, letterSpacing: 0.5 }}>ACCESO RÁPIDO</span>
          <div className="flex-1 h-px" style={{ backgroundColor: 'var(--border)' }} />
        </div>

        {/* Demo pills */}
        <div className="grid grid-cols-3 gap-2.5">
          {DEMO_ACCOUNTS.map(acc => (
            <motion.button
              key={acc.email}
              onClick={() => handleDemoLogin(acc.email)}
              whileTap={{ scale: 0.93 }}
              className="flex flex-col items-center gap-2 py-4 rounded-2xl"
              style={{
                backgroundColor: 'var(--muted)',
                border: '1px solid var(--border)',
              }}
            >
              <span style={{ fontSize: 24 }}>{acc.emoji}</span>
              <span className="text-xs" style={{ color: 'var(--foreground)', fontWeight: 800 }}>{acc.label}</span>
            </motion.button>
          ))}
        </div>

        <p className="text-center text-xs mt-5" style={{ color: 'var(--muted-foreground)' }}>
          ¿Problemas para acceder?{' '}
          <span style={{ color: 'var(--primary)', fontWeight: 700 }}>Contactá al admin</span>
        </p>
      </motion.div>
    </div>
  );
}
