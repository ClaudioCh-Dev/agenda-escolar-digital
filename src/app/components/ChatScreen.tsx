import { useState } from 'react';
import { motion } from 'motion/react';
import { ChevronLeft, Send, MessageCircle } from 'lucide-react';
import type { Conversation, User, Screen } from './data';

interface ChatScreenProps {
  user: User;
  conversations: Conversation[];
  onNavigate: (screen: Screen) => void;
  onSendMessage: (conversationId: string, text: string) => void;
}

function formatMsgTime(ts: string): string {
  const d = new Date(ts);
  return `${String(d.getHours()).padStart(2,'0')}:${String(d.getMinutes()).padStart(2,'0')}`;
}

function formatConvTime(ts: string): string {
  const d = new Date(ts);
  const now = new Date('2026-06-13T14:00:00');
  const diffDays = Math.floor((now.getTime()-d.getTime())/86400000);
  if (diffDays===0) return `${String(d.getHours()).padStart(2,'0')}:${String(d.getMinutes()).padStart(2,'0')}`;
  if (diffDays===1) return 'Ayer';
  return `${d.getDate()}/${d.getMonth()+1}`;
}

export function ChatScreen({ user, conversations, onNavigate, onSendMessage }: ChatScreenProps) {
  const [activeConvId, setActiveConvId] = useState<string|null>(null);
  const [messageText, setMessageText] = useState('');

  const activeConv = conversations.find(c => c.id === activeConvId);

  const handleSend = () => {
    if (!messageText.trim() || !activeConvId) return;
    onSendMessage(activeConvId, messageText.trim());
    setMessageText('');
  };

  if (activeConv) {
    const isAuxiliar = user.role === 'auxiliar';
    return (
      <div className="flex flex-col h-full" style={{ backgroundColor: 'var(--background)' }}>
        {/* Thread header */}
        <div className="px-4 pt-12 pb-3 flex items-center gap-3" style={{ backgroundColor: 'var(--card)', borderBottom: '1px solid var(--border)', boxShadow: '0 2px 12px rgba(26,23,64,0.06)' }}>
          <button
            onClick={() => setActiveConvId(null)}
            className="w-10 h-10 rounded-2xl flex items-center justify-center flex-shrink-0"
            style={{ backgroundColor: 'var(--muted)' }}
          >
            <ChevronLeft size={20} style={{ color: 'var(--muted-foreground)' }} />
          </button>
          <div
            className="w-10 h-10 rounded-2xl flex items-center justify-center text-white flex-shrink-0"
            style={{ backgroundColor: activeConv.participantColor, fontWeight: 900 }}
          >
            {activeConv.participantInitials}
          </div>
          <div className="flex-1 min-w-0">
            <p style={{ fontWeight: 800, fontSize: 15, color: 'var(--foreground)' }}>{activeConv.participantName}</p>
            <div className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full" style={{ backgroundColor: '#10CDA0' }} />
              <p className="text-xs" style={{ color: 'var(--muted-foreground)', fontWeight: 600 }}>En línea</p>
            </div>
          </div>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto px-4 py-4 space-y-3">
          {activeConv.messages.map((msg, i) => {
            const isOwn = (isAuxiliar && msg.senderId === 'aux-001') || (!isAuxiliar && msg.senderId !== 'aux-001');
            return (
              <motion.div
                key={msg.id}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.04 }}
                className={`flex ${isOwn ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className="max-w-[78%] px-4 py-3 rounded-3xl"
                  style={{
                    backgroundColor: isOwn ? 'var(--primary)' : 'var(--card)',
                    color: isOwn ? 'var(--primary-foreground)' : 'var(--foreground)',
                    borderBottomRightRadius: isOwn ? 6 : undefined,
                    borderBottomLeftRadius: !isOwn ? 6 : undefined,
                    border: !isOwn ? '1px solid var(--border)' : 'none',
                    boxShadow: '0 2px 12px rgba(26,23,64,0.08)',
                  }}
                >
                  {!isOwn && (
                    <p className="text-[10px] mb-1" style={{ fontWeight: 800, opacity: 0.6 }}>{msg.senderName}</p>
                  )}
                  <p className="text-sm leading-relaxed">{msg.text}</p>
                  <p className="text-[10px] mt-1 text-right" style={{ opacity: 0.55 }}>{formatMsgTime(msg.timestamp)}</p>
                </div>
              </motion.div>
            );
          })}

          {activeConv.messages.length === 0 && (
            <div className="flex flex-col items-center py-12 text-center">
              <span style={{ fontSize: 48 }}>💬</span>
              <p className="mt-3 text-sm" style={{ color: 'var(--muted-foreground)', fontWeight: 600 }}>Iniciá la conversación</p>
            </div>
          )}
        </div>

        {/* Input */}
        <div className="px-4 py-3 flex items-end gap-2" style={{ backgroundColor: 'var(--card)', borderTop: '1px solid var(--border)' }}>
          <input
            type="text"
            value={messageText}
            onChange={e => setMessageText(e.target.value)}
            onKeyDown={e => e.key==='Enter' && !e.shiftKey && handleSend()}
            placeholder="Escribí un mensaje..."
            className="flex-1 px-4 py-3 rounded-2xl text-sm outline-none transition-all"
            style={{
              backgroundColor: 'var(--muted)',
              color: 'var(--foreground)',
              border: '1.5px solid var(--border)',
              fontFamily: 'Nunito, sans-serif',
            }}
          />
          <motion.button
            whileTap={{ scale: 0.9 }}
            onClick={handleSend}
            disabled={!messageText.trim()}
            className="w-11 h-11 rounded-2xl flex items-center justify-center disabled:opacity-40"
            style={{ background: 'linear-gradient(135deg, #6C4FE8 0%, #B47FFF 100%)', boxShadow: '0 4px 16px rgba(108,79,232,0.28)' }}
          >
            <Send size={18} style={{ color: 'var(--primary-foreground)' }} />
          </motion.button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full overflow-hidden" style={{ backgroundColor: 'var(--background)' }}>
      <div className="px-5 pt-12 pb-4" style={{ backgroundColor: 'var(--card)', borderBottom: '1px solid var(--border)', boxShadow: '0 2px 16px rgba(26,23,64,0.05)' }}>
        <h1 style={{ fontWeight: 900, fontSize: 22, color: 'var(--foreground)', letterSpacing: -0.5 }}>Mensajes</h1>
        <p className="text-sm" style={{ color: 'var(--muted-foreground)', fontWeight: 600 }}>Chat privado con familias</p>
      </div>

      <div className="flex-1 overflow-y-auto pb-24 px-5 py-4 space-y-3">
        {conversations.length === 0 ? (
          <div className="flex flex-col items-center py-20 text-center">
            <span style={{ fontSize: 64 }}>💬</span>
            <p className="mt-4" style={{ fontWeight: 800, fontSize: 17, color: 'var(--foreground)' }}>Sin conversaciones</p>
            <p className="text-sm mt-1" style={{ color: 'var(--muted-foreground)' }}>Los chats con familias aparecerán aquí.</p>
          </div>
        ) : (
          conversations.map((conv, i) => (
            <motion.button
              key={conv.id}
              initial={{ opacity: 0, x: -12 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.08 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => setActiveConvId(conv.id)}
              className="w-full flex items-center gap-3.5 p-4 rounded-3xl text-left"
              style={{ backgroundColor: 'var(--card)', boxShadow: '0 2px 12px rgba(26,23,64,0.07)', border: '1px solid var(--border)' }}
            >
              <div className="relative flex-shrink-0">
                <div
                  className="w-12 h-12 rounded-2xl flex items-center justify-center text-white"
                  style={{ backgroundColor: conv.participantColor, fontWeight: 900, fontSize: 16 }}
                >
                  {conv.participantInitials}
                </div>
                {conv.unreadCount > 0 && (
                  <span
                    className="absolute -top-1 -right-1 w-5 h-5 rounded-full flex items-center justify-center text-white border-2 border-background"
                    style={{ backgroundColor: '#6C63FF', fontSize: 10, fontWeight: 900 }}
                  >
                    {conv.unreadCount}
                  </span>
                )}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between mb-0.5">
                  <p className="text-sm" style={{ fontWeight: conv.unreadCount > 0 ? 800 : 700, color: 'var(--foreground)' }}>
                    {conv.participantName}
                  </p>
                  <p className="text-xs flex-shrink-0 ml-2" style={{ color: 'var(--muted-foreground)', fontWeight: 600 }}>
                    {formatConvTime(conv.lastTimestamp)}
                  </p>
                </div>
                <p className="text-xs" style={{ color: 'var(--muted-foreground)', fontWeight: 600 }}>{conv.participantRole}</p>
                <p
                  className="text-xs mt-0.5 truncate"
                  style={{ color: conv.unreadCount > 0 ? 'var(--foreground)' : 'var(--muted-foreground)', fontWeight: conv.unreadCount > 0 ? 700 : 400 }}
                >
                  {conv.lastMessage}
                </p>
              </div>
            </motion.button>
          ))
        )}
      </div>
    </div>
  );
}
