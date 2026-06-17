import { motion } from 'motion/react';
import { ChevronLeft } from 'lucide-react';

interface VistaEnConstruccionProps {
  title: string;
  darkMode?: boolean;
  onClose: () => void;
}

export function VistaEnConstruccion({ title, darkMode = false, onClose }: VistaEnConstruccionProps) {
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
            {title}
          </h1>
        </div>
      </div>

      <div className="flex-1 flex flex-col items-center justify-center px-8 text-center">
        <motion.img
          initial={{ scale: 0.94, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          src={darkMode ? '/mock-avatars/oscuro2.svg' : '/mock-avatars/claro2.svg'}
          alt=""
          className="w-full max-w-[300px] mb-6"
          draggable={false}
        />
        <h2 style={{ fontWeight: 900, fontSize: 22, color: 'var(--foreground)' }}>Vista en construcción</h2>
        <p className="mt-2 text-sm leading-relaxed max-w-[260px]" style={{ color: 'var(--muted-foreground)', fontWeight: 600 }}>
          Estamos trabajando en esta sección. Pronto estará disponible.
        </p>
      </div>
    </div>
  );
}
