import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ChevronLeft, ChevronRight, Plus, SlidersHorizontal, BookOpen, Megaphone, Package, Eye, Bell, FileText, Star, ChevronDown, User as UserIcon } from 'lucide-react';
import type { Child, Entry, User, EntryType, Screen } from './data';
import { entryTypeConfig, isEntryVisible, shortSectionLabel, TODAY } from './data';
import { CTA_GRADIENT, CTA_SHADOW, CTA_SHADOW_SM, datePillStyle, filterPillStyle, selectionStyle, SELECTED_TEXT } from './uiStyles';
import { EntryCard } from './EntryCard';
import { EntryDetailModal } from './EntryDetailModal';
import { SectionDropdown } from './SectionDropdown';
import { ChildDropdown } from './ChildDropdown';

interface AgendaDiariaProps {
  user: User;
  entries: Entry[];
  selectedChild?: Child | null;
  onSelectChild?: (child: Child) => void;
  selectedSection?: string;
  onSelectSection?: (section: string) => void;
  onNavigate: (screen: Screen) => void;
  onConfirmRead: (entryId: string) => void;
  onEditEntry?: (entry: Entry) => void;
  onDeleteEntry?: (entryId: string) => void;
  unreadNotifications: number;
}

const MONTHS_ES = ['enero','febrero','marzo','abril','mayo','junio','julio','agosto','septiembre','octubre','noviembre','diciembre'];
const MONTHS_ES_CAP = MONTHS_ES.map(m => m.charAt(0).toUpperCase() + m.slice(1));
const DAYS_SHORT = ['Dom','Lun','Mar','Mié','Jue','Vie','Sáb'];
const DAYS_FULL = ['domingo','lunes','martes','miércoles','jueves','viernes','sábado'];

const TODAY_DATE = new Date(`${TODAY}T12:00:00`);
const TODAY_YEAR = TODAY_DATE.getFullYear();
const TODAY_MONTH = TODAY_DATE.getMonth();
const YEAR_START = `${TODAY_YEAR}-01-01`;

const ICONS: Record<EntryType, React.ElementType> = {
  tarea: BookOpen, comunicado: Megaphone, material: Package,
  observacion: Eye, recordatorio: Bell, examen: FileText, evento: Star,
  nota_personal: UserIcon,
  personalizado: UserIcon,
};

function addDays(dateStr: string, days: number): string {
  const d = new Date(dateStr + 'T12:00:00');
  d.setDate(d.getDate() + days);
  return d.toISOString().split('T')[0];
}

function formatFullDate(dateStr: string, isToday: boolean): string {
  const d = new Date(`${dateStr}T12:00:00`);
  const dayName = DAYS_FULL[d.getDay()];
  const label = `${dayName.charAt(0).toUpperCase() + dayName.slice(1)}, ${d.getDate()} de ${MONTHS_ES[d.getMonth()]}`;
  return isToday ? `Hoy · ${label}` : label;
}

function getAvailableMonths(): { month: number; label: string }[] {
  return Array.from({ length: TODAY_MONTH + 1 }, (_, month) => ({
    month,
    label: MONTHS_ES_CAP[month],
  }));
}

function getMonthDays(year: number, month: number): string[] {
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const lastDay = month === TODAY_MONTH ? TODAY_DATE.getDate() : daysInMonth;
  return Array.from({ length: lastDay }, (_, i) => {
    const day = i + 1;
    return `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
  });
}

function clampDate(dateStr: string): string {
  if (dateStr < YEAR_START) return YEAR_START;
  if (dateStr > TODAY) return TODAY;
  return dateStr;
}

function setMonthOnDate(currentDate: string, month: number): string {
  const day = TODAY_DATE.getDate();
  const daysInMonth = new Date(TODAY_YEAR, month + 1, 0).getDate();
  const maxDay = month === TODAY_MONTH ? day : daysInMonth;
  const currentDay = new Date(`${currentDate}T12:00:00`).getDate();
  const nextDay = Math.min(currentDay, maxDay);
  return `${TODAY_YEAR}-${String(month + 1).padStart(2, '0')}-${String(nextDay).padStart(2, '0')}`;
}

const ALL_TYPES: EntryType[] = ['tarea','comunicado','material','observacion','recordatorio','examen','evento','nota_personal','personalizado'];

function MonthDropdown({
  selectedDate,
  onSelectMonth,
}: {
  selectedDate: string;
  onSelectMonth: (month: number) => void;
}) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const selectedMonth = new Date(`${selectedDate}T12:00:00`).getMonth();
  const availableMonths = getAvailableMonths();

  useEffect(() => {
    if (!open) return;
    const handleClick = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, [open]);

  return (
    <div ref={ref} className="relative inline-flex">
      <button
        type="button"
        onClick={() => setOpen(!open)}
        className="flex flex-col items-center justify-center px-3 py-2.5 rounded-2xl flex-shrink-0"
        style={{
          ...datePillStyle(open),
          fontWeight: 800,
          fontSize: 11,
          minWidth: 52,
        }}
      >
        <span className="text-[10px]" style={{ color: open ? 'var(--primary-muted-text)' : 'var(--muted-foreground)', fontWeight: 700 }}>
          Mes
        </span>
        <span style={{ fontSize: 13, color: open ? SELECTED_TEXT : 'var(--foreground)', fontWeight: 900 }}>
          {MONTHS_ES_CAP[selectedMonth].slice(0, 3)}
        </span>
        <ChevronDown
          size={12}
          strokeWidth={2.5}
          style={{
            color: open ? SELECTED_TEXT : 'var(--muted-foreground)',
            transform: open ? 'rotate(180deg)' : 'none',
            transition: 'transform 0.2s ease',
            marginTop: 1,
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
            className="absolute left-0 top-full mt-2 z-50 min-w-[140px] overflow-hidden rounded-2xl"
            style={{
              backgroundColor: 'var(--card)',
              border: '1px solid var(--border)',
              boxShadow: '0 8px 32px rgba(26,23,64,0.12)',
            }}
          >
            {availableMonths.map(({ month, label }) => {
              const isSelected = month === selectedMonth;
              return (
                <button
                  key={month}
                  type="button"
                  onClick={() => {
                    onSelectMonth(month);
                    setOpen(false);
                  }}
                  className="flex w-full items-center px-3 py-2.5 text-sm text-left transition-colors"
                  style={{
                    ...(isSelected ? selectionStyle(true) : { backgroundColor: 'transparent', color: 'var(--foreground)' }),
                    fontWeight: 800,
                  }}
                >
                  {label}
                </button>
              );
            })}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export function AgendaDiaria({ user, entries, selectedChild, onSelectChild, selectedSection, onSelectSection, onNavigate, onConfirmRead, onEditEntry, onDeleteEntry, unreadNotifications }: AgendaDiariaProps) {
  const [currentDate, setCurrentDate] = useState(TODAY);
  const [filterType, setFilterType] = useState<EntryType | null>(null);
  const [showFilters, setShowFilters] = useState(false);
  const [selectedEntry, setSelectedEntry] = useState<Entry | null>(null);
  const daysScrollRef = useRef<HTMLDivElement>(null);
  const selectedDayRef = useRef<HTMLButtonElement>(null);

  const isAuxiliar = user.role === 'auxiliar';
  const isPadre = user.role === 'padre';
  const isToday = currentDate === TODAY;
  const isMinDate = currentDate <= YEAR_START;
  const currentMonth = new Date(`${currentDate}T12:00:00`).getMonth();
  const monthDays = getMonthDays(TODAY_YEAR, currentMonth);
  const sections = user.sections ?? [];
  const children = user.children ?? [];
  const child = selectedChild || children[0];

  const visibilityContext = {
    selectedChildId: child?.id,
    selectedSection: isAuxiliar ? selectedSection : undefined,
  };

  const visibleEntries = entries.filter(e => isEntryVisible(e, user, visibilityContext));

  const filteredEntries = visibleEntries
    .filter(e => e.date === currentDate)
    .filter(e => !filterType || e.type === filterType)
    .sort((a, b) => a.time.localeCompare(b.time));

  const typeCounts = visibleEntries.filter(e => e.date === currentDate).reduce<Record<string, number>>((acc, e) => {
    acc[e.type] = (acc[e.type] || 0) + 1;
    return acc;
  }, {});

  useEffect(() => {
    const container = daysScrollRef.current;
    const button = selectedDayRef.current;
    if (!container || !button) return;

    requestAnimationFrame(() => {
      const maxScroll = container.scrollWidth - container.clientWidth;
      const pillLeft = button.offsetLeft;
      const pillRight = pillLeft + button.offsetWidth;
      const selectedIndex = monthDays.indexOf(currentDate);
      const isNearEnd = selectedIndex >= monthDays.length - 4;

      let target: number;
      if (isNearEnd) {
        target = pillRight - container.clientWidth;
      } else {
        const contextDaysBefore = 4;
        const startIndex = Math.max(0, selectedIndex - contextDaysBefore);
        const startPill = container.children[startIndex] as HTMLElement | undefined;
        target = startPill
          ? startPill.offsetLeft
          : pillLeft - (container.clientWidth - button.offsetWidth) / 2;
      }

      container.scrollTo({
        left: Math.min(maxScroll, Math.max(0, target)),
        behavior: 'smooth',
      });
    });
  }, [currentDate, currentMonth, monthDays]);

  return (
    <div className="flex flex-col h-full overflow-hidden" style={{ backgroundColor: 'var(--background)' }}>
      <div
        className="px-5 pt-12 pb-5"
        style={{
          backgroundColor: 'var(--card)',
          borderBottom: '1px solid var(--border)',
          boxShadow: '0 2px 16px rgba(26,23,64,0.05)',
        }}
      >
        <div className="flex items-center justify-between mb-5">
          <div className="flex items-center gap-2 min-w-0">
            <h1 style={{ fontWeight: 900, fontSize: 22, color: 'var(--foreground)', letterSpacing: -0.5 }}>Agenda</h1>
            {isAuxiliar && sections.length > 0 && onSelectSection && selectedSection && (
              <SectionDropdown
                sections={sections}
                selectedSection={selectedSection}
                onSelectSection={onSelectSection}
              />
            )}
            {isPadre && children.length > 1 && child && onSelectChild && (
              <ChildDropdown
                children={children}
                selectedChild={child}
                onSelectChild={onSelectChild}
              />
            )}
          </div>
          <button
            type="button"
            onClick={() => onNavigate('notificaciones')}
            aria-label="Notificaciones"
            className="relative w-10 h-10 rounded-2xl flex items-center justify-center flex-shrink-0"
            style={{ backgroundColor: 'var(--muted)' }}
          >
            <Bell size={20} strokeWidth={1.8} style={{ color: 'var(--muted-foreground)' }} />
            {unreadNotifications > 0 && (
              <span
                className="absolute -top-1 -right-1 min-w-[18px] h-[18px] px-1 rounded-full flex items-center justify-center border-2 border-card"
                style={{ backgroundColor: 'var(--destructive)', fontSize: 9, fontWeight: 800, color: '#ffffff' }}
              >
                {unreadNotifications > 9 ? '9+' : unreadNotifications}
              </span>
            )}
          </button>
        </div>

        <div className="flex items-center gap-3 mb-5 py-0.5">
          <button
            onClick={() => setCurrentDate(prev => clampDate(addDays(prev, -1)))}
            disabled={isMinDate}
            className="w-10 h-10 rounded-2xl flex items-center justify-center"
            style={{ backgroundColor: 'var(--muted)', opacity: isMinDate ? 0.35 : 1 }}
          >
            <ChevronLeft size={18} style={{ color: 'var(--muted-foreground)' }} strokeWidth={1.8} />
          </button>
          <div className="flex-1 text-center min-w-0">
            <p style={{ fontWeight: 800, fontSize: 15, color: 'var(--foreground)' }}>
              {formatFullDate(currentDate, isToday)}
            </p>
            {isAuxiliar && !isToday && (
              <p className="text-xs mt-1" style={{ color: 'var(--muted-foreground)', fontWeight: 600 }}>Solo lectura</p>
            )}
          </div>
          <button
            onClick={() => setCurrentDate(prev => clampDate(addDays(prev, 1)))}
            disabled={isToday}
            className="w-10 h-10 rounded-2xl flex items-center justify-center"
            style={{ backgroundColor: 'var(--muted)', opacity: isToday ? 0.35 : 1 }}
          >
            <ChevronRight size={18} style={{ color: 'var(--muted-foreground)' }} strokeWidth={1.8} />
          </button>
        </div>

        <div
          className="pt-4 flex flex-col gap-4"
          style={{ borderTop: '1px solid var(--border)' }}
        >
          <div className="flex items-center gap-2">
          <MonthDropdown
            selectedDate={currentDate}
            onSelectMonth={month => setCurrentDate(prev => setMonthOnDate(prev, month))}
          />
          <div className="flex flex-1 min-w-0 items-center gap-1.5">
            <div
              ref={daysScrollRef}
              className="flex flex-1 min-w-0 gap-1.5 overflow-x-auto scroll-smooth"
              style={{ scrollbarWidth: 'none' }}
            >
          {monthDays.map(d => {
            const date = new Date(d + 'T12:00:00');
            const isSelected = d === currentDate;
            const count = visibleEntries.filter(e => e.date === d).length;
            return (
              <button
                key={d}
                ref={isSelected ? selectedDayRef : undefined}
                onClick={() => setCurrentDate(d)}
                className="flex flex-col items-center px-3.5 py-2.5 rounded-2xl flex-shrink-0 transition-all"
                style={datePillStyle(isSelected)}
              >
                <span className="text-[10px]" style={{ color: isSelected ? 'var(--primary-muted-text)' : 'var(--muted-foreground)', fontWeight: 700 }}>
                  {DAYS_SHORT[date.getDay()]}
                </span>
                <span style={{ fontWeight: 900, fontSize: 16, color: isSelected ? SELECTED_TEXT : 'var(--foreground)' }}>
                  {date.getDate()}
                </span>
                {count > 0 && (
                  <span
                    className="w-1 h-1 rounded-full mt-1"
                    style={{ backgroundColor: isSelected ? SELECTED_TEXT : 'var(--muted-foreground)' }}
                  />
                )}
              </button>
            );
          })}
            </div>
            <button
              type="button"
              onClick={() => setShowFilters(!showFilters)}
              aria-label="Filtrar"
              className="flex flex-col items-center justify-center px-3.5 py-2.5 rounded-2xl flex-shrink-0 transition-all"
              style={filterPillStyle(showFilters)}
            >
              <SlidersHorizontal size={16} strokeWidth={2.5} />
            </button>
          </div>
        </div>

        {isAuxiliar && isToday && filteredEntries.length > 0 && (
          <motion.button
            whileTap={{ scale: 0.97 }}
            onClick={() => onNavigate('nueva-anotacion')}
            className="w-full flex items-center justify-center gap-2 px-4 py-3.5 rounded-2xl"
            style={{ background: CTA_GRADIENT, color: '#ffffff', fontWeight: 800, boxShadow: CTA_SHADOW_SM }}
          >
            <Plus size={16} strokeWidth={2.5} />
            Nueva anotación
          </motion.button>
        )}
        </div>
      </div>

      <AnimatePresence>
        {showFilters && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="overflow-hidden"
            style={{ backgroundColor: 'var(--card)', borderBottom: '1px solid var(--border)' }}
          >
            <div className="flex gap-2 px-5 py-3 overflow-x-auto" style={{ scrollbarWidth: 'none' }}>
              <button
                onClick={() => setFilterType(null)}
                className="flex-shrink-0 px-3.5 py-1.5 rounded-full text-xs"
                style={filterPillStyle(!filterType)}
              >
                Todos ({visibleEntries.filter(e => e.date === currentDate).length})
              </button>
              {ALL_TYPES.map(type => {
                const count = typeCounts[type] || 0;
                if (!count) return null;
                const config = entryTypeConfig[type];
                const isActive = filterType === type;
                return (
                  <button
                    key={type}
                    onClick={() => setFilterType(isActive ? null : type)}
                    className="flex-shrink-0 px-3.5 py-1.5 rounded-full text-xs"
                    style={filterPillStyle(isActive)}
                  >
                    {config.label} ({count})
                  </button>
                );
              })}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="flex-1 overflow-y-auto pb-24 px-5 py-4">
        {filteredEntries.length === 0 ? (
          <div className="flex flex-col items-center py-20 text-center">
            <div
              className="w-16 h-16 rounded-3xl flex items-center justify-center mb-4"
              style={{ backgroundColor: 'var(--muted)' }}
            >
              <BookOpen size={28} style={{ color: 'var(--muted-foreground)' }} strokeWidth={2.5} />
            </div>
            <p style={{ fontWeight: 800, fontSize: 17, color: 'var(--foreground)' }}>Sin registros</p>
            <p className="text-sm mt-1" style={{ color: 'var(--muted-foreground)' }}>
              {isAuxiliar && isToday ? 'Empezá registrando la primera actividad.' : 'No hay actividades para este día.'}
            </p>
            {isAuxiliar && isToday && (
              <motion.button
                whileTap={{ scale: 0.97 }}
                onClick={() => onNavigate('nueva-anotacion')}
                className="mt-5 flex items-center gap-2 px-6 py-3.5 rounded-2xl"
                style={{ background: CTA_GRADIENT, color: '#ffffff', fontWeight: 800, boxShadow: CTA_SHADOW }}
              >
                <Plus size={16} strokeWidth={2.5} /> Nueva anotación
              </motion.button>
            )}
          </div>
        ) : (
          <div className="relative">
            <div
              className="absolute top-4 bottom-4"
              style={{ left: 19, width: 1, backgroundColor: 'var(--border)' }}
            />

            <div className="space-y-4">
              {filteredEntries.map((entry, i) => {
                const Icon = ICONS[entry.type];
                return (
                  <motion.div
                    key={entry.id}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.05 }}
                    className="flex gap-4"
                  >
                    <div className="flex flex-col items-center flex-shrink-0 z-10">
                      <div
                        className="w-10 h-10 rounded-2xl flex items-center justify-center"
                        style={{ backgroundColor: 'var(--muted)' }}
                      >
                        <Icon size={16} style={{ color: 'var(--primary)' }} strokeWidth={2.5} />
                      </div>
                      <span
                        className="text-[10px] mt-1"
                        style={{ color: 'var(--muted-foreground)', fontWeight: 600 }}
                      >
                        {entry.time}
                      </span>
                    </div>

                    <div className="flex-1 min-w-0 pb-2">
                      <EntryCard
                        entry={entry}
                        userId={user.id}
                        onConfirmRead={onConfirmRead}
                        onPress={setSelectedEntry}
                        isReadOnly={user.role !== 'auxiliar'}
                        showAudienceBadge={isAuxiliar || user.role === 'padre'}
                      />
                    </div>
                  </motion.div>
                );
              })}
            </div>
          </div>
        )}
      </div>

      <EntryDetailModal
        entry={selectedEntry}
        userId={user.id}
        canManage={isAuxiliar}
        isReadOnly={user.role !== 'auxiliar'}
        showAudienceBadge={isAuxiliar || user.role === 'padre'}
        onClose={() => setSelectedEntry(null)}
        onEdit={(entry) => {
          setSelectedEntry(null);
          onEditEntry?.(entry);
        }}
        onDelete={onDeleteEntry}
        onConfirmRead={onConfirmRead}
      />
    </div>
  );
}
