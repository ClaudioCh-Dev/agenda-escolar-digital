import { View, Text, Pressable } from 'react-native';
import { Plus, X } from 'lucide-react-native';
import type { Child } from '@/types';
import { useTheme, cardShadow } from '@/theme';
import { Dropdown, type DropdownItem } from '@/components/features/Dropdown';

type Props = {
  students: Child[];
  selectedIds: string[];
  onChange: (ids: string[]) => void;
  error?: string;
};

export function PersonalizadoStudentsPicker({ students, selectedIds, onChange, error }: Props) {
  const { theme } = useTheme();

  const selectedStudents = students.filter(s => selectedIds.includes(s.id));
  const availableStudents = students.filter(s => !selectedIds.includes(s.id));
  const availableItems: DropdownItem[] = availableStudents.map(s => ({
    id: s.id,
    label: s.name,
    initials: s.initials,
    color: s.color,
  }));

  const addStudent = (id: string) => {
    if (!selectedIds.includes(id)) onChange([...selectedIds, id]);
  };

  const removeStudent = (id: string) => {
    onChange(selectedIds.filter(studentId => studentId !== id));
  };

  if (students.length === 0) {
    return (
      <View
        style={{
          padding: 16,
          borderRadius: theme.radii.lg,
          backgroundColor: theme.colors.muted,
        }}
      >
        <Text style={{ fontFamily: theme.typography.fontFamilyMedium, fontSize: 14, color: theme.colors.mutedForeground }}>
          No hay alumnos en esta sección.
        </Text>
      </View>
    );
  }

  return (
    <View>
      <Text style={{ fontFamily: theme.typography.fontFamilyBold, fontSize: 14, color: theme.colors.foreground, marginBottom: 8 }}>
        Alumnos *
      </Text>

      {selectedStudents.length > 0 && (
        <View style={{ gap: 8, marginBottom: 12 }}>
          {selectedStudents.map(student => (
            <View
              key={student.id}
              style={{
                flexDirection: 'row',
                alignItems: 'center',
                gap: 12,
                paddingHorizontal: 12,
                paddingVertical: 10,
                borderRadius: theme.radii.lg,
                backgroundColor: theme.colors.card,
                borderWidth: 1,
                borderColor: theme.colors.border,
                ...cardShadow(theme),
              }}
            >
              <View
                style={{
                  width: 36,
                  height: 36,
                  borderRadius: 12,
                  backgroundColor: student.color,
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <Text style={{ fontFamily: theme.typography.fontFamilyBlack, fontSize: 12, color: '#fff' }}>
                  {student.initials}
                </Text>
              </View>
              <View style={{ flex: 1, minWidth: 0 }}>
                <Text style={{ fontFamily: theme.typography.fontFamilyBold, fontSize: 14, color: theme.colors.foreground }}>
                  {student.name}
                </Text>
                <Text style={{ fontFamily: theme.typography.fontFamilyMedium, fontSize: 12, color: theme.colors.mutedForeground, marginTop: 2 }}>
                  {student.grade}
                </Text>
              </View>
              <Pressable onPress={() => removeStudent(student.id)} hitSlop={8}>
                <X size={16} color={theme.colors.mutedForeground} />
              </Pressable>
            </View>
          ))}
        </View>
      )}

      {availableStudents.length > 0 && (
        <View style={{ gap: 8 }}>
          {selectedStudents.length > 0 && (
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
              <Plus size={14} color={theme.colors.primary} strokeWidth={2.5} />
              <Text style={{ fontFamily: theme.typography.fontFamilyBold, fontSize: 13, color: theme.colors.primary }}>
                Agregar otro alumno
              </Text>
            </View>
          )}
          <Dropdown
            items={availableItems}
            selectedId=""
            onSelect={addStudent}
            placeholder={selectedStudents.length === 0 ? 'Seleccionar alumno' : 'Elegir alumno'}
          />
        </View>
      )}

      {selectedStudents.length === 0 && (
        <Text style={{ fontFamily: theme.typography.fontFamilyMedium, fontSize: 12, color: theme.colors.mutedForeground, marginTop: 8 }}>
          Podés agregar uno o más alumnos a este registro.
        </Text>
      )}

      {error && (
        <Text style={{ color: theme.colors.destructive, fontSize: 12, marginTop: 6 }}>{error}</Text>
      )}
    </View>
  );
}
