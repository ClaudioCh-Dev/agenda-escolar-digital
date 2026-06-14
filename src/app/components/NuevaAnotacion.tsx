import { useState } from 'react';
import { motion } from 'motion/react';
import { X, AlertCircle, Bell, Paperclip, Check, ChevronLeft } from 'lucide-react';
import type { Entry, EntryType, Screen } from './data';
import { entryTypeConfig } from './data';

interface NuevaAnotacionProps {
  onSubmit: (entry: Omit<Entry, 'id' | 'readBy' | 'author' | 'section'>) => void;
  onNavigate: (screen: Screen) => void;
}

const TYPE_OPTIONS: { type: EntryType; emoji: string }[] = [
  { type: 'tarea', emoji: '📚' },
  { type: 'comunicado', emoji: '📢' },
  { type: 'material', emoji: '🎒' },
  { type: 'observacion', emoji: '👁️' },
  { type: 'recordatorio', emoji: '🔔' },
  { type: 'examen', emoji: '📝' },
  { type: 'evento', emoji: '⭐' },
];

export function NuevaAnotacion({ onSubmit, onNavigate }: NuevaAnotacionProps) {
  const [selectedType, setSelectedType] = useState<EntryType>('tarea');
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [isImportant, setIsImportant] = useState(false);
  const [sendNotification, setSendNotification] = useState(true);
  const [attachments, setAttachments] = useState<string[]>([]);
  const [submitted, setSubmitted] = useState(false);
  const [errors, setErrors] = useState<Record<string,string>>({});

  const config = entryTypeConfig[selectedType];

  const validate = () => {
    const errs: Record<string,string> = {};
    if (!title.trim()) errs.title = 'El título es obligatorio.';
    if (!description.trim()) errs.description = 'La descripción es obligatoria.';
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = async () => {
    if (!validate()) return;
    const now = new Date('2026-06-13T14:30:00');
    const timeStr = `${String(now.getHours()).padStart(2,'0')}:${String(now.getMinutes()).padStart(2,'0')}`;
    onSubmit({
      type: selectedType,
      title: title.trim(),
      description: description.trim(),
      date: '2026-06-13',
      time: timeStr,
      isImportant,
      attachments: attachments.map(name => ({ name, size: '1.0 MB', fileType: 'pdf' as const })),
    });
    setSubmitted(true);
    await new Promise(r => setTimeout(r, 1400));
    onNavigate('agenda');
  };

  const Toggle = ({ value, onChange }: { value: boolean; onChange: () => void }) => (
    <button
      onClick={onChange}
      className="w-12 h-6 rounded-full transition-colors relative flex-shrink-0"
      style={{ background: value ? 'linear-gradient(135deg, #6C4FE8 0%, #B47FFF 100%)' : 'var(--muted)' }}
    >
      <motion.div
        animate={{ x: value ? 24 : 2 }}
        className="absolute top-1 w-4 h-4 bg-white rounded-full shadow-sm"
      />
    </button>
  );

  if (submitted) {
    return (
      <div className="flex flex-col items-center justify-center h-full px-8 text-center" style={{ backgroundColor: 'var(--background)' }}>
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ type: 'spring', stiffness: 200, damping: 15 }}
          className="w-24 h-24 rounded-full flex items-center justify-center mb-6"
          style={{ backgroundColor: '#10CDA0', boxShadow: '0 12px 40px rgba(16,205,160,0.35)' }}
        >
          <Check size={44} className="text-white" />
        </motion.div>
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
          <h2 style={{ fontWeight: 900, fontSize: 24, color: 'var(--foreground)' }}>¡Guardado!</h2>
          <p className="mt-2 text-sm" style={{ color: 'var(--muted-foreground)' }}>
            {sendNotification ? 'Se notificó a todos los padres.' : 'Visible en la agenda del aula.'}
          </p>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full overflow-hidden" style={{ backgroundColor: 'var(--background)' }}>
      {/* Header */}
      <div className="px-5 pt-12 pb-4" style={{ backgroundColor: 'var(--card)', borderBottom: '1px solid var(--border)', boxShadow: '0 2px 16px rgba(26,23,64,0.05)' }}>
        <div className="flex items-center gap-3">
          <button
            onClick={() => onNavigate('agenda')}
            className="w-10 h-10 rounded-2xl flex items-center justify-center"
            style={{ backgroundColor: 'var(--muted)' }}
          >
            <ChevronLeft size={20} style={{ color: 'var(--muted-foreground)' }} />
          </button>
          <h1 style={{ fontWeight: 900, fontSize: 20, color: 'var(--foreground)' }}>Nueva anotación</h1>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto">
        <div className="px-5 py-5 space-y-5">
          {/* Type grid */}
          <div>
            <label className="block text-sm mb-3" style={{ fontWeight: 800, color: 'var(--foreground)' }}>Tipo de registro</label>
            <div className="grid grid-cols-4 gap-2">
              {TYPE_OPTIONS.map(({ type, emoji }) => {
                const cfg = entryTypeConfig[type];
                const isSelected = selectedType === type;
                return (
                  <motion.button
                    key={type}
                    whileTap={{ scale: 0.9 }}
                    onClick={() => setSelectedType(type)}
                    className="flex flex-col items-center gap-1.5 py-3.5 px-1 rounded-2xl transition-all"
                    style={{
                      backgroundColor: isSelected ? 'var(--primary)' : 'var(--card)',
                      boxShadow: isSelected ? '0 6px 20px rgba(108,79,232,0.30)' : '0 1px 6px rgba(26,23,64,0.06)',
                      border: isSelected ? 'none' : '1px solid var(--border)',
                    }}
                  >
                    <span style={{ fontSize: 22 }}>{emoji}</span>
                    <span style={{ fontSize: 10, color: isSelected ? '#ffffff' : 'var(--muted-foreground)', fontWeight: 800, textAlign: 'center', lineHeight: 1.2 }}>
                      {cfg.label}
                    </span>
                  </motion.button>
                );
              })}
            </div>
          </div>

          {/* Selected type pill */}
          <div className="flex items-center gap-2 py-3 px-4 rounded-2xl" style={{ backgroundColor: config.bg }}>
            <span style={{ fontWeight: 800, fontSize: 13, color: config.color }}>Registrando: {config.label}</span>
          </div>

          {/* Title */}
          <div>
            <label className="block text-sm mb-2" style={{ fontWeight: 800, color: 'var(--foreground)' }}>Título *</label>
            <input
              type="text"
              value={title}
              onChange={e => { setTitle(e.target.value); setErrors(p => ({ ...p, title: '' })); }}
              placeholder={selectedType === 'tarea' ? 'Ej: Matemáticas – Página 45' : 'Ej: Reunión de padres'}
              className="w-full px-4 py-4 rounded-2xl text-sm outline-none transition-all"
              style={{
                backgroundColor: 'var(--card)',
                color: 'var(--foreground)',
                border: errors.title ? '2px solid #FF5C72' : '1.5px solid var(--border)',
                boxShadow: '0 2px 12px rgba(26,23,64,0.06)',
                fontFamily: 'Nunito, sans-serif',
              }}
            />
            {errors.title && <p className="text-xs mt-1" style={{ color: '#FF5C72' }}>{errors.title}</p>}
          </div>

          {/* Description */}
          <div>
            <label className="block text-sm mb-2" style={{ fontWeight: 800, color: 'var(--foreground)' }}>Descripción *</label>
            <textarea
              value={description}
              onChange={e => { setDescription(e.target.value); setErrors(p => ({ ...p, description: '' })); }}
              placeholder="Describí la actividad con detalle..."
              rows={4}
              className="w-full px-4 py-4 rounded-2xl text-sm outline-none resize-none leading-relaxed transition-all"
              style={{
                backgroundColor: 'var(--card)',
                color: 'var(--foreground)',
                border: errors.description ? '2px solid #FF5C72' : '1.5px solid var(--border)',
                boxShadow: '0 2px 12px rgba(26,23,64,0.06)',
                fontFamily: 'Nunito, sans-serif',
              }}
            />
            {errors.description && <p className="text-xs mt-1" style={{ color: '#FF5C72' }}>{errors.description}</p>}
          </div>

          {/* Options card */}
          <div
            className="rounded-3xl overflow-hidden"
            style={{ backgroundColor: 'var(--card)', boxShadow: '0 2px 16px rgba(26,23,64,0.07)' }}
          >
            {/* Important */}
            <div className="flex items-center justify-between px-4 py-4" style={{ borderBottom: '1px solid var(--border)' }}>
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-2xl flex items-center justify-center text-lg" style={{ backgroundColor: '#FFF8DC' }}>⚠️</div>
                <div>
                  <p className="text-sm" style={{ fontWeight: 800, color: 'var(--foreground)' }}>Marcar como importante</p>
                  <p className="text-xs" style={{ color: 'var(--muted-foreground)' }}>Se mostrará destacado</p>
                </div>
              </div>
              <Toggle value={isImportant} onChange={() => setIsImportant(!isImportant)} />
            </div>

            {/* Notify */}
            <div className="flex items-center justify-between px-4 py-4" style={{ borderBottom: '1px solid var(--border)' }}>
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-2xl flex items-center justify-center text-lg" style={{ backgroundColor: '#EEECFF' }}>🔔</div>
                <div>
                  <p className="text-sm" style={{ fontWeight: 800, color: 'var(--foreground)' }}>Notificar a padres</p>
                  <p className="text-xs" style={{ color: 'var(--muted-foreground)' }}>Enviar notificación push</p>
                </div>
              </div>
              <Toggle value={sendNotification} onChange={() => setSendNotification(!sendNotification)} />
            </div>

            {/* Attach */}
            <div className="px-4 py-4">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-2xl flex items-center justify-center text-lg" style={{ backgroundColor: '#EDE9FE' }}>📎</div>
                  <div>
                    <p className="text-sm" style={{ fontWeight: 800, color: 'var(--foreground)' }}>Adjuntos</p>
                    <p className="text-xs" style={{ color: 'var(--muted-foreground)' }}>PDF, imagen, documento</p>
                  </div>
                </div>
                <button
                  onClick={() => setAttachments(prev => [...prev, `archivo_${prev.length+1}.pdf`])}
                  className="px-3 py-1.5 rounded-xl text-xs"
                  style={{ backgroundColor: '#EDE9FE', color: '#6C63FF', fontWeight: 800 }}
                >
                  + Agregar
                </button>
              </div>
              {attachments.length > 0 && (
                <div className="space-y-1.5 mt-2">
                  {attachments.map((att, i) => (
                    <div key={i} className="flex items-center gap-2 p-2.5 rounded-xl" style={{ backgroundColor: 'var(--muted)' }}>
                      <span className="text-sm">📄</span>
                      <span className="text-xs flex-1 truncate" style={{ color: 'var(--foreground)', fontWeight: 700 }}>{att}</span>
                      <button onClick={() => setAttachments(prev => prev.filter((_,j) => j!==i))}>
                        <X size={13} style={{ color: 'var(--muted-foreground)' }} />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Submit */}
          <motion.button
            whileTap={{ scale: 0.97 }}
            onClick={handleSubmit}
            className="w-full py-4 rounded-2xl text-white flex items-center justify-center gap-2.5 mb-6"
            style={{
              background: 'linear-gradient(135deg, #6C4FE8 0%, #B47FFF 100%)',
              fontWeight: 800,
              fontSize: 16,
              boxShadow: '0 8px 24px rgba(108,79,232,0.32)',
            }}
          >
            <Check size={20} /> Guardar anotación
          </motion.button>
        </div>
      </div>
    </div>
  );
}
