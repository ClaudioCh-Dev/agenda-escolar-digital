import { motion } from 'motion/react';
import {
  BookOpen, Megaphone, Package, Eye, Bell, FileText, Star, User,
  Paperclip, AlertCircle, Check, Download, Image as ImageIcon,
} from 'lucide-react';
import type { Entry, EntryType } from './data';
import { entryTypeConfig, getStudentName, shortSectionLabel } from './data';
import { CTA_GRADIENT } from './uiStyles';

const ICONS: Record<EntryType, React.ElementType> = {
  tarea: BookOpen,
  comunicado: Megaphone,
  material: Package,
  observacion: Eye,
  recordatorio: Bell,
  examen: FileText,
  evento: Star,
  nota_personal: User,
  personalizado: User,
};

interface EntryCardProps {
  entry: Entry;
  userId: string;
  onConfirmRead?: (entryId: string) => void;
  onPress?: (entry: Entry) => void;
  isReadOnly?: boolean;
  compact?: boolean;
  showAudienceBadge?: boolean;
}

export function EntryCard({ entry, userId, onConfirmRead, onPress, isReadOnly = false, compact = false, showAudienceBadge = false }: EntryCardProps) {
  const Icon = ICONS[entry.type];
  const isRead = entry.readBy.includes(userId);
  const config = entryTypeConfig[entry.type];

  const cardStyle = {
    backgroundColor: 'var(--card)',
    boxShadow: '0 1px 12px rgba(26,23,64,0.06)',
    border: entry.isImportant
      ? '1.5px solid rgba(26,23,64,0.15)'
      : '1px solid var(--border)',
  };

  const cardContent = (
      <div className="p-4">
        {/* Header */}
        <div className="flex items-start gap-3">
          {/* Icon — neutral, no color */}

          <div className="flex-1 min-w-0">
            {/* Type label + important — minimal */}
            <div className="flex items-center gap-2 mb-1 flex-wrap">
              <span className="text-[11px]" style={{ color: 'var(--primary)', fontWeight: 700, textTransform: 'uppercase', letterSpacing: 0.4 }}>
                {config.label}
              </span>
              {entry.type === 'nota_personal' && (
                <span className="text-[10px] px-2 py-0.5 rounded-full" style={{ backgroundColor: 'var(--muted)', color: 'var(--muted-foreground)', fontWeight: 700 }}>
                  Personal
                </span>
              )}
              {showAudienceBadge && entry.studentId && (
                <span className="text-[10px] px-2 py-0.5 rounded-full" style={{ backgroundColor: 'var(--muted)', color: 'var(--muted-foreground)', fontWeight: 700 }}>
                  Para: {getStudentName(entry.studentId)}
                </span>
              )}
              {showAudienceBadge && !entry.studentId && entry.type !== 'nota_personal' && (
                <span className="text-[10px] px-2 py-0.5 rounded-full" style={{ backgroundColor: 'var(--muted)', color: 'var(--muted-foreground)', fontWeight: 700 }}>
                  {shortSectionLabel(entry.section)}
                </span>
              )}
              {entry.isImportant && (
                <span className="flex items-center gap-0.5 text-[10px]" style={{ color: 'var(--foreground)', fontWeight: 700 }}>
                  <AlertCircle size={10} strokeWidth={2.5} /> Importante
                </span>
              )}
            </div>
            <h3 style={{ fontWeight: 800, fontSize: 14, color: 'var(--foreground)', lineHeight: 1.3 }}>
              {entry.title}
            </h3>
          </div>

          <span className="text-[11px] flex-shrink-0 mt-0.5" style={{ color: 'var(--muted-foreground)', fontWeight: 600 }}>
            {entry.time}
          </span>
        </div>

        {/* Description */}
        <p
          className={`mt-2.5 text-sm leading-relaxed ${compact ? 'line-clamp-2' : ''}`}
          style={{ color: 'var(--muted-foreground)' }}
        >
          {entry.description}
        </p>

        {/* Attachments */}
        {entry.attachments.length > 0 && !compact && (
          <div className="mt-3 space-y-1.5">
            {entry.attachments.map((att, i) => (
              <div
                key={i}
                className="flex items-center gap-2.5 px-3 py-2 rounded-xl"
                style={{ backgroundColor: 'var(--muted)' }}
              >
                {att.fileType === 'image'
                  ? <ImageIcon size={13} style={{ color: 'var(--muted-foreground)', flexShrink: 0 }} strokeWidth={2.5} />
                  : <Paperclip size={13} style={{ color: 'var(--muted-foreground)', flexShrink: 0 }} strokeWidth={2.5} />
                }
                <span className="text-xs flex-1 truncate" style={{ color: 'var(--foreground)', fontWeight: 600 }}>{att.name}</span>
                <span className="text-xs" style={{ color: 'var(--muted-foreground)' }}>{att.size}</span>
                <Download size={12} style={{ color: 'var(--muted-foreground)', flexShrink: 0 }} strokeWidth={2.5} />
              </div>
            ))}
          </div>
        )}

        {/* Confirm read */}
        {isReadOnly && entry.type === 'comunicado' && !compact && (
          <div className="mt-3 flex justify-end">
            {isRead ? (
              <div className="flex items-center gap-1.5 text-xs" style={{ color: 'var(--muted-foreground)', fontWeight: 600 }}>
                <Check size={12} strokeWidth={2.5} /> Lectura confirmada
              </div>
            ) : (
              <motion.button
                whileTap={{ scale: 0.96 }}
                onClick={(e) => { e.stopPropagation(); onConfirmRead?.(entry.id); }}
                className="flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-xl"
                style={{ background: CTA_GRADIENT, color: '#ffffff', fontWeight: 700 }}
              >
                <Check size={12} strokeWidth={2.5} /> Confirmar lectura
              </motion.button>
            )}
          </div>
        )}

        {/* Footer */}
        <div
          className="flex items-center justify-between mt-3 pt-3"
          style={{ borderTop: '1px solid var(--border)' }}
        >
          <span className="text-[11px]" style={{ color: 'var(--muted-foreground)', fontWeight: 600 }}>
            {entry.author}
          </span>
          <div className="flex items-center gap-2">
            {entry.attachments.length > 0 && compact && (
              <span className="flex items-center gap-1 text-[11px]" style={{ color: 'var(--muted-foreground)' }}>
                <Paperclip size={11} strokeWidth={2.5} /> {entry.attachments.length}
              </span>
            )}
            {entry.readBy.length > 0 && !compact && (
              <span className="flex items-center gap-1 text-[11px]" style={{ color: 'var(--muted-foreground)', fontWeight: 600 }}>
                <Check size={11} strokeWidth={2.5} /> {entry.readBy.length} leído{entry.readBy.length !== 1 ? 's' : ''}
              </span>
            )}
          </div>
        </div>
      </div>
  );

  if (onPress) {
    return (
      <motion.button
        type="button"
        initial={{ opacity: 0, y: 6 }}
        animate={{ opacity: 1, y: 0 }}
        whileTap={{ scale: 0.98 }}
        onClick={() => onPress(entry)}
        className="w-full rounded-3xl overflow-hidden text-left"
        style={cardStyle}
      >
        {cardContent}
      </motion.button>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      className="rounded-3xl overflow-hidden"
      style={cardStyle}
    >
      {cardContent}
    </motion.div>
  );
}
