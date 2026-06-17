import { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  X, Check, AlertCircle, Paperclip, Download, Image as ImageIcon, Pencil, Trash2,
  BookOpen, Megaphone, Package, Eye, Bell, FileText, Star, User,
} from 'lucide-react';
import type { Entry, EntryType } from './data';
import { entryTypeConfig, getStudentName, shortSectionLabel } from './data';
import { CTA_GRADIENT } from './uiStyles';
import { ConfirmDialog } from './ConfirmDialog';

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

interface EntryDetailModalProps {
  entry: Entry | null;
  userId: string;
  canManage?: boolean;
  isReadOnly?: boolean;
  showAudienceBadge?: boolean;
  onClose: () => void;
  onEdit?: (entry: Entry) => void;
  onDelete?: (entryId: string) => void;
  onConfirmRead?: (entryId: string) => void;
}

export function EntryDetailModal({
  entry,
  userId,
  canManage = false,
  isReadOnly = false,
  showAudienceBadge = false,
  onClose,
  onEdit,
  onDelete,
  onConfirmRead,
}: EntryDetailModalProps) {
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  if (!entry) return null;

  const Icon = ICONS[entry.type];
  const config = entryTypeConfig[entry.type];
  const isRead = entry.readBy.includes(userId);

  const handleDelete = () => {
    onDelete?.(entry.id);
    setShowDeleteConfirm(false);
    onClose();
  };

  return (
    <>
      <AnimatePresence>
        {entry && (
          <>
            <motion.button
              type="button"
              aria-label="Cerrar"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={onClose}
              className="fixed inset-0 z-50"
              style={{ backgroundColor: 'rgba(26, 23, 64, 0.45)' }}
            />
            <motion.div
              initial={{ opacity: 0, y: '-40%', scale: 0.96 }}
              animate={{ opacity: 1, y: '-50%', scale: 1 }}
              exit={{ opacity: 0, y: '-45%', scale: 0.98 }}
              transition={{ type: 'spring', stiffness: 320, damping: 28 }}
              className="fixed left-5 right-5 top-1/2 z-[60] mx-auto max-w-[390px] rounded-3xl overflow-hidden"
              style={{
                backgroundColor: 'var(--card)',
                border: '1px solid var(--border)',
                boxShadow: '0 24px 64px rgba(26,23,64,0.22)',
                maxHeight: 'min(80vh, 560px)',
              }}
            >
              <div className="flex items-start justify-between gap-3 px-5 pt-5 pb-3">
                <div className="flex items-start gap-3 min-w-0">
                  <div
                    className="w-11 h-11 rounded-2xl flex items-center justify-center flex-shrink-0"
                    style={{ backgroundColor: 'var(--muted)' }}
                  >
                    <Icon size={20} strokeWidth={2} style={{ color: 'var(--primary)' }} />
                  </div>
                  <div className="min-w-0 pt-0.5">
                    <div className="flex items-center gap-2 flex-wrap mb-1.5">
                      <span
                        className="text-[10px] px-2 py-0.5 rounded-full inline-block"
                        style={{ color: 'var(--primary)', fontWeight: 700, textTransform: 'uppercase', letterSpacing: 0.4 }}
                      >
                        {config.label}
                      </span>
                      <span className="text-xs" style={{ color: 'var(--muted-foreground)', fontWeight: 600 }}>
                        {entry.time}
                      </span>
                      {entry.isImportant && (
                        <span className="flex items-center gap-0.5 text-[10px]" style={{ color: 'var(--foreground)', fontWeight: 700 }}>
                          <AlertCircle size={10} strokeWidth={2.5} /> Importante
                        </span>
                      )}
                    </div>
                    <h3 className="text-base leading-snug" style={{ fontWeight: 900, color: 'var(--foreground)' }}>
                      {entry.title}
                    </h3>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={onClose}
                  className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0"
                  style={{ backgroundColor: 'var(--muted)' }}
                >
                  <X size={18} style={{ color: 'var(--muted-foreground)' }} />
                </button>
              </div>

              <div className="px-5 pb-5 overflow-y-auto space-y-4" style={{ maxHeight: 'calc(min(80vh, 560px) - 120px)' }}>
                {(showAudienceBadge || entry.type === 'nota_personal') && (
                  <div className="flex flex-wrap gap-2">
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
                  </div>
                )}

                <p className="text-sm leading-relaxed whitespace-pre-wrap" style={{ color: 'var(--foreground)', fontWeight: 600 }}>
                  {entry.description}
                </p>

                {entry.attachments.length > 0 && (
                  <div className="space-y-1.5">
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

                <div className="flex items-center justify-between pt-2" style={{ borderTop: '1px solid var(--border)' }}>
                  <span className="text-[11px]" style={{ color: 'var(--muted-foreground)', fontWeight: 600 }}>
                    {entry.author}
                  </span>
                  {entry.readBy.length > 0 && (
                    <span className="flex items-center gap-1 text-[11px]" style={{ color: 'var(--muted-foreground)', fontWeight: 600 }}>
                      <Check size={11} strokeWidth={2.5} /> {entry.readBy.length} leído{entry.readBy.length !== 1 ? 's' : ''}
                    </span>
                  )}
                </div>

                {isReadOnly && entry.type === 'comunicado' && (
                  <div className="flex justify-end">
                    {isRead ? (
                      <div className="flex items-center gap-1.5 text-xs" style={{ color: 'var(--muted-foreground)', fontWeight: 600 }}>
                        <Check size={12} strokeWidth={2.5} /> Lectura confirmada
                      </div>
                    ) : (
                      <motion.button
                        whileTap={{ scale: 0.96 }}
                        onClick={() => onConfirmRead?.(entry.id)}
                        className="flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-xl"
                        style={{ background: CTA_GRADIENT, color: '#ffffff', fontWeight: 700 }}
                      >
                        <Check size={12} strokeWidth={2.5} /> Confirmar lectura
                      </motion.button>
                    )}
                  </div>
                )}

                {canManage && (
                  <div className="flex gap-2 pt-1">
                    <motion.button
                      type="button"
                      whileTap={{ scale: 0.97 }}
                      onClick={() => onEdit?.(entry)}
                      className="flex-1 flex items-center justify-center gap-2 py-3 rounded-2xl text-sm"
                      style={{ background: CTA_GRADIENT, color: '#ffffff', fontWeight: 800 }}
                    >
                      <Pencil size={16} strokeWidth={2.5} /> Editar
                    </motion.button>
                    <motion.button
                      type="button"
                      whileTap={{ scale: 0.97 }}
                      onClick={() => setShowDeleteConfirm(true)}
                      className="flex items-center justify-center gap-2 px-4 py-3 rounded-2xl text-sm"
                      style={{ backgroundColor: 'var(--muted)', color: '#FF5C72', fontWeight: 800 }}
                    >
                      <Trash2 size={16} strokeWidth={2.5} />
                    </motion.button>
                  </div>
                )}
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      <ConfirmDialog
        open={showDeleteConfirm}
        title="¿Eliminar esta anotación?"
        description="Esta acción no se puede deshacer. La anotación desaparecerá de la agenda."
        onOpenChange={setShowDeleteConfirm}
        onConfirm={handleDelete}
      />
    </>
  );
}
