import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ChevronDown } from 'lucide-react';
import type { Child } from './data';
import { selectionStyle, SELECTED_TEXT } from './uiStyles';

interface ChildDropdownProps {
  children: Child[];
  selectedChild: Child;
  onSelectChild: (child: Child) => void;
}

export function ChildDropdown({
  children,
  selectedChild,
  onSelectChild,
}: ChildDropdownProps) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const handleClick = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, [open]);

  return (
    <div ref={ref} className="relative flex-shrink-0">
      <button
        type="button"
        onClick={() => setOpen(!open)}
        className="flex items-center gap-1.5 px-3 py-2 rounded-2xl text-sm"
        style={{
          ...selectionStyle(open),
          fontWeight: 700,
        }}
      >
        {selectedChild.name.split(' ')[0]}
        <ChevronDown
          size={14}
          strokeWidth={2.5}
          style={{
            color: open ? SELECTED_TEXT : 'var(--muted-foreground)',
            transform: open ? 'rotate(180deg)' : 'none',
            transition: 'transform 0.2s ease',
          }}
        />
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: -6, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -6, scale: 0.97 }}
            transition={{ duration: 0.15 }}
            className="absolute left-0 top-full mt-2 z-50 min-w-full overflow-hidden rounded-2xl"
            style={{
              backgroundColor: 'var(--card)',
              border: '1px solid var(--border)',
              boxShadow: '0 8px 32px rgba(26,23,64,0.12)',
            }}
          >
            {children.map(ch => {
              const isSelected = ch.id === selectedChild.id;
              return (
                <button
                  key={ch.id}
                  type="button"
                  onClick={() => {
                    onSelectChild(ch);
                    setOpen(false);
                  }}
                  className="flex w-full items-center gap-2.5 px-3 py-2.5 text-sm text-left transition-colors"
                  style={{
                    ...(isSelected ? selectionStyle(true) : { backgroundColor: 'transparent', color: 'var(--foreground)' }),
                    fontWeight: 800,
                  }}
                >
                  <div
                    className="w-6 h-6 rounded-lg flex items-center justify-center text-white flex-shrink-0"
                    style={{ backgroundColor: ch.color, fontWeight: 900, fontSize: 9 }}
                  >
                    {ch.initials}
                  </div>
                  <span>{ch.name.split(' ')[0]}</span>
                </button>
              );
            })}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
