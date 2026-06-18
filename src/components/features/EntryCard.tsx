import { View, Text, Pressable } from 'react-native';

import {

  Paperclip, AlertCircle, Check, Download, Image as ImageIcon,

} from 'lucide-react-native';

import type { Entry } from '@/types';

import { entryTypeConfig } from '@/constants/entryTypes';

import { getStudentName } from '@/services';

import { getEntryStudentIds, shortSectionLabel } from '@/utils/visibility';

import { entryRequiresAck, getAckStats, isPendingAck } from '@/utils/ack';
import { EntryAuthorLabel } from '@/components/features/EntryAuthorLabel';

import { useTheme, cardShadow } from '@/theme';



interface EntryCardProps {

  entry: Entry;

  userId: string;

  onPress?: (entry: Entry) => void;

  isReadOnly?: boolean;

  canManage?: boolean;

  compact?: boolean;

  showAudienceBadge?: boolean;

}



export function EntryCard({

  entry,

  userId,

  onPress,

  isReadOnly = false,

  canManage = false,

  compact = false,

  showAudienceBadge = false,

}: EntryCardProps) {

  const { theme } = useTheme();

  const config = entryTypeConfig[entry.type];

  const requiresAck = entryRequiresAck(entry);

  const isRead = entry.readBy.includes(userId);

  const pendingAck = isReadOnly && isPendingAck(entry, userId);

  const ackStats = canManage ? getAckStats(entry) : null;

  const targetStudentIds = getEntryStudentIds(entry);

  const studentAudienceLabel =

    targetStudentIds.length > 0

      ? `Para: ${targetStudentIds.map(id => getStudentName(id).split(' ')[0]).join(', ')}`

      : null;



  const cardStyle = {

    backgroundColor: theme.colors.card,

    borderRadius: theme.radii.xl,

    borderWidth: pendingAck ? 1.5 : entry.isImportant ? 1.5 : 1,

    borderColor: pendingAck

      ? theme.colors.primary

      : entry.isImportant

        ? theme.colors.foreground + '26'

        : theme.colors.border,

    overflow: 'hidden' as const,

    ...cardShadow(theme),

  };



  const content = (

    <View style={{ padding: 16 }}>

      <View style={{ flexDirection: 'row', alignItems: 'flex-start', gap: 12 }}>

        <View style={{ flex: 1, minWidth: 0 }}>

          <View style={{ flexDirection: 'row', alignItems: 'center', flexWrap: 'wrap', gap: 6, marginBottom: 4 }}>

            <Text

              style={{

                fontFamily: theme.typography.fontFamilyBold,

                fontSize: 11,

                color: theme.colors.primary,

                textTransform: 'uppercase',

                letterSpacing: 0.4,

              }}

            >

              {config.label}

            </Text>

            {entry.type === 'nota_personal' && (

              <View style={{ backgroundColor: theme.colors.muted, paddingHorizontal: 8, paddingVertical: 2, borderRadius: 999 }}>

                <Text style={{ fontFamily: theme.typography.fontFamilyBold, fontSize: 10, color: theme.colors.mutedForeground }}>

                  Personal

                </Text>

              </View>

            )}

            {showAudienceBadge && studentAudienceLabel && (

              <View style={{ backgroundColor: theme.colors.muted, paddingHorizontal: 8, paddingVertical: 2, borderRadius: 999 }}>

                <Text style={{ fontFamily: theme.typography.fontFamilyBold, fontSize: 10, color: theme.colors.mutedForeground }}>

                  {studentAudienceLabel}

                </Text>

              </View>

            )}

            {showAudienceBadge && !studentAudienceLabel && entry.type !== 'nota_personal' && (

              <View style={{ backgroundColor: theme.colors.muted, paddingHorizontal: 8, paddingVertical: 2, borderRadius: 999 }}>

                <Text style={{ fontFamily: theme.typography.fontFamilyBold, fontSize: 10, color: theme.colors.mutedForeground }}>

                  {shortSectionLabel(entry.section)}

                </Text>

              </View>

            )}

            {entry.isImportant && (

              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 2 }}>

                <AlertCircle size={10} color={theme.colors.foreground} />

                <Text style={{ fontFamily: theme.typography.fontFamilyBold, fontSize: 10, color: theme.colors.foreground }}>

                  Importante

                </Text>

              </View>

            )}

            {pendingAck && (

              <View style={{ backgroundColor: theme.colors.primaryMuted, paddingHorizontal: 8, paddingVertical: 2, borderRadius: 999 }}>

                <Text style={{ fontFamily: theme.typography.fontFamilyBold, fontSize: 10, color: theme.colors.primary }}>

                  Pendiente

                </Text>

              </View>

            )}

            {isReadOnly && requiresAck && isRead && (

              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 2 }}>

                <Check size={10} color={theme.colors.mutedForeground} />

                <Text style={{ fontFamily: theme.typography.fontFamilyBold, fontSize: 10, color: theme.colors.mutedForeground }}>

                  Confirmado

                </Text>

              </View>

            )}

          </View>

          <Text style={{ fontFamily: theme.typography.fontFamilyBold, fontSize: 14, color: theme.colors.foreground, lineHeight: 18 }}>

            {entry.title}

          </Text>

        </View>

        <Text style={{ fontFamily: theme.typography.fontFamilyMedium, fontSize: 11, color: theme.colors.mutedForeground }}>

          {entry.time}

        </Text>

      </View>



      <Text

        numberOfLines={compact ? 2 : undefined}

        style={{

          marginTop: 10,

          fontFamily: theme.typography.fontFamilyMedium,

          fontSize: 14,

          color: theme.colors.mutedForeground,

          lineHeight: 20,

        }}

      >

        {entry.description}

      </Text>



      {entry.attachments.length > 0 && !compact && (

        <View style={{ marginTop: 12, gap: 6 }}>

          {entry.attachments.map((att, i) => (

            <View

              key={i}

              style={{

                flexDirection: 'row',

                alignItems: 'center',

                gap: 10,

                paddingHorizontal: 12,

                paddingVertical: 8,

                borderRadius: 12,

                backgroundColor: theme.colors.muted,

              }}

            >

              {att.fileType === 'image' ? (

                <ImageIcon size={13} color={theme.colors.mutedForeground} />

              ) : (

                <Paperclip size={13} color={theme.colors.mutedForeground} />

              )}

              <Text numberOfLines={1} style={{ flex: 1, fontFamily: theme.typography.fontFamilyBold, fontSize: 12, color: theme.colors.foreground }}>

                {att.name}

              </Text>

              <Text style={{ fontFamily: theme.typography.fontFamilyMedium, fontSize: 12, color: theme.colors.mutedForeground }}>

                {att.size}

              </Text>

              <Download size={12} color={theme.colors.mutedForeground} />

            </View>

          ))}

        </View>

      )}



      <View

        style={{

          flexDirection: 'row',

          alignItems: 'center',

          justifyContent: 'space-between',

          marginTop: 12,

          paddingTop: 12,

          borderTopWidth: 1,

          borderTopColor: theme.colors.border,

        }}

      >

        <EntryAuthorLabel entry={entry} />

        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>

          {entry.attachments.length > 0 && compact && (

            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>

              <Paperclip size={11} color={theme.colors.mutedForeground} />

              <Text style={{ fontFamily: theme.typography.fontFamilyMedium, fontSize: 11, color: theme.colors.mutedForeground }}>

                {entry.attachments.length}

              </Text>

            </View>

          )}

          {canManage && ackStats && requiresAck && (

            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>

              <Check size={11} color={ackStats.confirmed >= ackStats.total ? theme.colors.mutedForeground : theme.colors.primary} />

              <Text

                style={{

                  fontFamily: theme.typography.fontFamilyBold,

                  fontSize: 11,

                  color: ackStats.confirmed >= ackStats.total ? theme.colors.mutedForeground : theme.colors.primary,

                }}

              >

                {ackStats.confirmed}/{ackStats.total} padres

              </Text>

            </View>

          )}

          {!canManage && entry.readBy.length > 0 && !compact && requiresAck && (

            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>

              <Check size={11} color={theme.colors.mutedForeground} />

              <Text style={{ fontFamily: theme.typography.fontFamilyBold, fontSize: 11, color: theme.colors.mutedForeground }}>

                {entry.readBy.length} confirmado{entry.readBy.length !== 1 ? 's' : ''}

              </Text>

            </View>

          )}

        </View>

      </View>

    </View>

  );



  if (onPress) {

    return (

      <Pressable onPress={() => onPress(entry)} style={({ pressed }) => [cardStyle, { opacity: pressed ? 0.95 : 1 }]}>

        {content}

      </Pressable>

    );

  }



  return <View style={cardStyle}>{content}</View>;

}

