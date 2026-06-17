import { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { CalendarDays, ChevronLeft, ChevronRight } from 'lucide-react';
import { TODAY } from './data';

const MONTHS_ES = ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio', 'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'];
const DAYS_HEADER = ['D', 'L', 'M', 'X', 'J', 'V', 'S'];

function formatDateLabel(dateStr: string): string {
  const d = new Date(`${dateStr}T12:00:00`);
  const months = ['enero', 'febrero', 'marzo', 'abril', 'mayo', 'junio', 'julio', 'agosto', 'septiembre', 'octubre', 'noviembre', 'diciembre'];
  return `${d.getDate()} de ${months[d.getMonth()]} de ${d.getFullYear()}`;
}

function parseDateParts(dateStr: string) {
  const [y, m] = dateStr.split('-').map(Number);
  return { year: y, month: m - 1 };
}

interface DatePickerFieldProps {
  value: string;
  onChange: (value: string) => void;
  error?: boolean;
  minDate?: string;
}

export function DatePickerField({ value, onChange, error, minDate }: DatePickerFieldProps) {
  const initial = parseDateParts(value || minDate || TODAY);
  const [open, setOpen] = useState(false);
  const [year, setYear] = useState(initial.year);
  const [month, setMonth] = useState(initial.month);

  const prevMonth = () => {
    if (month === 0) {
      setMonth(11);
      setYear(y => y - 1);
    } else {
      setMonth(m => m - 1);
    }
  };

  const nextMonth = () => {
    if (month === 11) {
      setMonth(0);
      setYear(y => y + 1);
    } else {
      setMonth(m => m + 1);
    }
  };

  const firstDay = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const totalCells = Math.ceil((firstDay + daysInMonth) / 7) * 7;

  const getDateStr = (day: number) =>
    `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;

  const minParts = minDate ? parseDateParts(minDate) : null;
  const isBeforeMinDate = (dateStr: string) => minDate != null && dateStr < minDate;
  const canGoPrevMonth = !minParts || year > minParts.year || (year === minParts.year && month > minParts.month);

  const handleSelect = (dateStr: string) => {
    if (isBeforeMinDate(dateStr)) return;
    onChange(dateStr);
    setOpen(false);
  };

  const fieldBorder = error ? '2px solid #FF5C72' : '1.5px solid var(--border)';

  return (
    <div>
      <button
        type="button"
        onClick={() => setOpen(o => !o)}
        className="w-full px-4 py-3.5 rounded-2xl text-sm flex items-center justify-between gap-3"
        style={{
          backgroundColor: 'var(--card)',
          color: 'var(--foreground)',
          border: fieldBorder,
          boxShadow: '0 2px 12px rgba(26,23,64,0.06)',
          fontFamily: 'Nunito, sans-serif',
          fontWeight: 600,
        }}
      >
        <span>{value ? formatDateLabel(value) : 'Seleccioná una fecha'}</span>
        <CalendarDays size={18} style={{ color: 'var(--primary)', flexShrink: 0 }} />
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden"
          >
            <div
              className="mt-3 rounded-3xl p-3"
              style={{
                backgroundColor: 'var(--card)',
                border: '1.5px solid var(--border)',
                boxShadow: '0 4px 24px rgba(26,23,64,0.08)',
              }}
            >
              <div className="flex items-center justify-between mb-3 px-1">
                <button
                  type="button"
                  onClick={prevMonth}
                  disabled={!canGoPrevMonth}
                  className="w-9 h-9 rounded-2xl flex items-center justify-center disabled:opacity-40"
                  style={{ backgroundColor: 'var(--muted)' }}
                >
                  <ChevronLeft size={16} style={{ color: 'var(--muted-foreground)' }} />
                </button>
                <span style={{ fontWeight: 900, fontSize: 15, color: 'var(--foreground)' }}>
                  {MONTHS_ES[month]} {year}
                </span>
                <button
                  type="button"
                  onClick={nextMonth}
                  className="w-9 h-9 rounded-2xl flex items-center justify-center"
                  style={{ backgroundColor: 'var(--muted)' }}
                >
                  <ChevronRight size={16} style={{ color: 'var(--muted-foreground)' }} />
                </button>
              </div>

              <div className="grid grid-cols-7 mb-1">
                {DAYS_HEADER.map(d => (
                  <div
                    key={d}
                    className="text-center py-1"
                    style={{ fontWeight: 800, fontSize: 11, color: 'var(--muted-foreground)' }}
                  >
                    {d}
                  </div>
                ))}
              </div>

              <div className="grid grid-cols-7 gap-y-0.5">
                {Array.from({ length: totalCells }, (_, i) => {
                  const day = i - firstDay + 1;
                  if (day < 1 || day > daysInMonth) return <div key={i} />;

                  const dateStr = getDateStr(day);
                  const isSelected = dateStr === value;
                  const isToday = dateStr === TODAY;
                  const isDisabled = isBeforeMinDate(dateStr);
                  const isWeekend = i % 7 === 0 || i % 7 === 6;

                  return (
                    <motion.button
                      key={i}
                      type="button"
                      disabled={isDisabled}
                      whileTap={isDisabled ? undefined : { scale: 0.85 }}
                      onClick={() => handleSelect(dateStr)}
                      className="flex items-center justify-center py-2 rounded-2xl disabled:cursor-not-allowed"
                      style={{
                        backgroundColor: isDisabled
                          ? 'transparent'
                          : isSelected
                            ? 'var(--primary)'
                            : isToday
                              ? 'var(--muted)'
                              : 'transparent',
                        boxShadow: isSelected && !isDisabled ? '0 4px 12px rgba(26,23,64,0.2)' : 'none',
                        opacity: isDisabled ? 0.35 : 1,
                      }}
                    >
                      <span
                        style={{
                          fontWeight: isToday || isSelected ? 900 : isWeekend ? 500 : 700,
                          fontSize: 14,
                          color: isDisabled
                            ? 'var(--muted-foreground)'
                            : isSelected
                              ? 'white'
                              : isToday
                                ? 'var(--primary)'
                                : isWeekend
                                  ? 'var(--muted-foreground)'
                                  : 'var(--foreground)',
                        }}
                      >
                        {day}
                      </span>
                    </motion.button>
                  );
                })}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
