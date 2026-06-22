import { useState } from 'react';
import { View, Text, Pressable } from 'react-native';
import { CalendarDays, ChevronLeft, ChevronRight } from 'lucide-react-native';
import { useTheme } from '@/theme';
import { TODAY } from '@/constants/config';
import { MONTHS_ES, formatDateLabel, getDateStr } from '@/utils/dates';

const DAYS_HEADER = ['D', 'L', 'M', 'X', 'J', 'V', 'S'];

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
  const { theme } = useTheme();
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

  const minParts = minDate ? parseDateParts(minDate) : null;
  const isBeforeMinDate = (dateStr: string) => minDate != null && dateStr < minDate;
  const canGoPrevMonth = !minParts || year > minParts.year || (year === minParts.year && month > minParts.month);

  const handleSelect = (dateStr: string) => {
    if (isBeforeMinDate(dateStr)) return;
    onChange(dateStr);
    setOpen(false);
  };

  return (
    <View>
      <Pressable
        onPress={() => setOpen(o => !o)}
        style={{
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'space-between',
          paddingHorizontal: 16,
          paddingVertical: 14,
          borderRadius: theme.radii.lg,
          backgroundColor: theme.colors.card,
          borderWidth: error ? 2 : 1.5,
          borderColor: error ? theme.colors.destructive : theme.colors.border,
        }}
      >
        <Text style={{ fontFamily: theme.typography.fontFamilyBold, fontSize: 14, color: theme.colors.foreground }}>
          {value ? formatDateLabel(value) : 'Seleccioná una fecha'}
        </Text>
        <CalendarDays size={18} color={theme.colors.primary} />
      </Pressable>

      {open && (
        <View
          style={{
            marginTop: 12,
            borderRadius: theme.radii.xl,
            padding: 12,
            backgroundColor: theme.colors.card,
            borderWidth: 1.5,
            borderColor: theme.colors.border,
          }}
        >
          <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
            <Pressable
              onPress={prevMonth}
              disabled={!canGoPrevMonth}
              style={{
                width: 36,
                height: 36,
                borderRadius: 16,
                backgroundColor: theme.colors.muted,
                alignItems: 'center',
                justifyContent: 'center',
                opacity: canGoPrevMonth ? 1 : 0.4,
              }}
            >
              <ChevronLeft size={16} color={theme.colors.mutedForeground} />
            </Pressable>
            <Text style={{ fontFamily: theme.typography.fontFamilyBlack, fontSize: 15, color: theme.colors.foreground }}>
              {MONTHS_ES[month]} {year}
            </Text>
            <Pressable
              onPress={nextMonth}
              style={{
                width: 36,
                height: 36,
                borderRadius: 16,
                backgroundColor: theme.colors.muted,
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <ChevronRight size={16} color={theme.colors.mutedForeground} />
            </Pressable>
          </View>

          <View style={{ flexDirection: 'row', marginBottom: 4 }}>
            {DAYS_HEADER.map(d => (
              <View key={d} style={{ flex: 1, alignItems: 'center', paddingVertical: 4 }}>
                <Text style={{ fontFamily: theme.typography.fontFamilyBold, fontSize: 11, color: theme.colors.mutedForeground }}>
                  {d}
                </Text>
              </View>
            ))}
          </View>

          <View style={{ flexDirection: 'row', flexWrap: 'wrap' }}>
            {Array.from({ length: totalCells }, (_, i) => {
              const day = i - firstDay + 1;
              if (day < 1 || day > daysInMonth) {
                return <View key={i} style={{ width: `${100 / 7}%`, height: 40 }} />;
              }

              const dateStr = getDateStr(year, month, day);
              const isSelected = dateStr === value;
              const isToday = dateStr === TODAY;
              const isDisabled = isBeforeMinDate(dateStr);
              const isWeekend = i % 7 === 0 || i % 7 === 6;

              return (
                <Pressable
                  key={i}
                  disabled={isDisabled}
                  onPress={() => handleSelect(dateStr)}
                  style={{
                    width: `${100 / 7}%`,
                    height: 40,
                    alignItems: 'center',
                    justifyContent: 'center',
                    borderRadius: 16,
                    backgroundColor: isDisabled
                      ? 'transparent'
                      : isSelected
                        ? theme.colors.primary
                        : isToday
                          ? theme.colors.muted
                          : 'transparent',
                    opacity: isDisabled ? 0.35 : 1,
                  }}
                >
                  <Text
                    style={{
                      fontFamily: isToday || isSelected ? theme.typography.fontFamilyBlack : theme.typography.fontFamilyBold,
                      fontSize: 14,
                      color: isDisabled
                        ? theme.colors.mutedForeground
                        : isSelected
                          ? '#fff'
                          : isToday
                            ? theme.colors.primary
                            : isWeekend
                              ? theme.colors.mutedForeground
                              : theme.colors.foreground,
                    }}
                  >
                    {day}
                  </Text>
                </Pressable>
              );
            })}
          </View>
        </View>
      )}
    </View>
  );
}
