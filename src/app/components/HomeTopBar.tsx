import type { ReactNode } from 'react';
import { Bell } from 'lucide-react';
// TODO: reactivar MessageCircle cuando se habilite Chat en futura implementación
import type { Child, Screen } from './data';
import { SectionDropdown } from './SectionDropdown';
import { ChildDropdown } from './ChildDropdown';

interface HomeTopBarProps {
  unreadNotifications: number;
  unreadMessages?: number;
  onNavigate: (screen: Screen) => void;
  showChat?: boolean;
  sections?: string[];
  selectedSection?: string;
  onSelectSection?: (section: string) => void;
  childList?: Child[];
  selectedChild?: Child;
  onSelectChild?: (child: Child) => void;
}

function HeaderIconButton({
  label,
  count,
  onClick,
  children,
}: {
  label: string;
  count: number;
  onClick: () => void;
  children: ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={label}
      className="relative w-10 h-10 rounded-2xl flex items-center justify-center"
      style={{ backgroundColor: 'var(--muted)' }}
    >
      {children}
      {count > 0 && (
        <span
          className="absolute -top-1 -right-1 min-w-[18px] h-[18px] px-1 rounded-full flex items-center justify-center border-2 border-card"
          style={{ backgroundColor: 'var(--destructive)', fontSize: 9, fontWeight: 800, color: '#ffffff' }}
        >
          {count > 9 ? '9+' : count}
        </span>
      )}
    </button>
  );
}

export function HomeTopBar({
  unreadNotifications,
  unreadMessages: _unreadMessages = 0,
  onNavigate,
  showChat: _showChat = true,
  sections,
  selectedSection,
  onSelectSection,
  childList,
  selectedChild,
  onSelectChild,
}: HomeTopBarProps) {
  const showSectionPicker =
    sections &&
    sections.length > 0 &&
    selectedSection &&
    onSelectSection;

  const showChildPicker =
    childList &&
    childList.length > 1 &&
    selectedChild &&
    onSelectChild;

  return (
    <div
      className="px-5 pt-12 pb-3 flex-shrink-0"
      style={{
        backgroundColor: 'var(--card)',
        borderBottom: '1px solid var(--border)',
        boxShadow: '0 2px 16px rgba(26,23,64,0.05)',
      }}
    >
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-2 min-w-0">
          <h1 style={{ fontWeight: 900, fontSize: 20, color: 'var(--foreground)', letterSpacing: -0.5 }}>
            Inicio
          </h1>
          {showSectionPicker && (
            <SectionDropdown
              sections={sections}
              selectedSection={selectedSection}
              onSelectSection={onSelectSection}
            />
          )}
          {showChildPicker && (
            <ChildDropdown
              children={childList}
              selectedChild={selectedChild}
              onSelectChild={onSelectChild}
            />
          )}
        </div>
        <HeaderIconButton
          label="Notificaciones"
          count={unreadNotifications}
          onClick={() => onNavigate('notificaciones')}
        >
          <Bell size={20} strokeWidth={1.8} style={{ color: 'var(--muted-foreground)' }} />
        </HeaderIconButton>
        {/* TODO: Chat — oculto en MVP; reactivar en futura implementación
        {showChat && (
          <HeaderIconButton
            label="Chat"
            count={unreadMessages}
            onClick={() => onNavigate('chat')}
          >
            <MessageCircle size={20} strokeWidth={1.8} style={{ color: 'var(--muted-foreground)' }} />
          </HeaderIconButton>
        )}
        */}
      </div>
    </div>
  );
}
