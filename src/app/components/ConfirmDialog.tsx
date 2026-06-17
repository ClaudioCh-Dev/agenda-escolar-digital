import { motion, AnimatePresence } from 'motion/react';

interface ConfirmDialogProps {
  open: boolean;
  title: string;
  description: string;
  confirmLabel?: string;
  cancelLabel?: string;
  onConfirm: () => void;
  onOpenChange: (open: boolean) => void;
}

export function ConfirmDialog({
  open,
  title,
  description,
  confirmLabel = 'Eliminar',
  cancelLabel = 'Cancelar',
  onConfirm,
  onOpenChange,
}: ConfirmDialogProps) {
  return (
    <AnimatePresence>
      {open && (
        <>
          <motion.button
            type="button"
            aria-label="Cerrar"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => onOpenChange(false)}
            className="fixed inset-0 z-[70]"
            style={{ backgroundColor: 'rgba(26, 23, 64, 0.55)' }}
          />
          <motion.div
            role="alertdialog"
            aria-modal="true"
            aria-labelledby="confirm-dialog-title"
            aria-describedby="confirm-dialog-desc"
            initial={{ opacity: 0, y: '-42%', scale: 0.96 }}
            animate={{ opacity: 1, y: '-50%', scale: 1 }}
            exit={{ opacity: 0, y: '-45%', scale: 0.98 }}
            transition={{ type: 'spring', stiffness: 320, damping: 28 }}
            className="fixed left-5 right-5 top-1/2 z-[71] mx-auto max-w-[340px] rounded-3xl p-5"
            style={{
              backgroundColor: 'var(--card)',
              border: '1px solid var(--border)',
              boxShadow: '0 24px 64px rgba(26,23,64,0.22)',
            }}
          >
            <h3
              id="confirm-dialog-title"
              style={{ fontWeight: 900, fontSize: 18, color: 'var(--foreground)', lineHeight: 1.3 }}
            >
              {title}
            </h3>
            <p
              id="confirm-dialog-desc"
              className="mt-2 text-sm leading-relaxed"
              style={{ color: 'var(--muted-foreground)', fontWeight: 600 }}
            >
              {description}
            </p>
            <div className="flex gap-2 mt-5">
              <motion.button
                type="button"
                whileTap={{ scale: 0.97 }}
                onClick={() => onOpenChange(false)}
                className="flex-1 py-3 rounded-2xl text-sm"
                style={{
                  backgroundColor: 'var(--muted)',
                  color: 'var(--foreground)',
                  fontWeight: 800,
                }}
              >
                {cancelLabel}
              </motion.button>
              <motion.button
                type="button"
                whileTap={{ scale: 0.97 }}
                onClick={onConfirm}
                className="flex-1 py-3 rounded-2xl text-sm text-white"
                style={{ backgroundColor: '#FF5C72', fontWeight: 800 }}
              >
                {confirmLabel}
              </motion.button>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
