'use client';

import { useState, useRef, useEffect } from 'react';

interface Message {
  id: string;
  userId: string;
  username: string;
  avatar: string;
  content: string;
  upvotes: number;
  downvotes: number;
  userVote: 'up' | 'down' | null;
  createdAt: string;
  parentId?: string;
}

interface Channel {
  id: string;
  name: string;
  description: string;
  messageCount: number;
  createdBy: string;
  isPinned: boolean;
}

const MOCK_CHANNELS: Channel[] = [
  { id: '1', name: '# general', description: 'General discussion about this article', messageCount: 47, createdBy: 'moderator', isPinned: true },
  { id: '2', name: '# hot-takes', description: 'Share your controversial opinions', messageCount: 23, createdBy: 'Aryan Shah', isPinned: false },
  { id: '3', name: '# theory-zone', description: 'Lore theories and speculation', messageCount: 31, createdBy: 'Kenji Tanaka', isPinned: false },
  { id: '4', name: '# tips-builds', description: 'Share builds and boss strategies', messageCount: 58, createdBy: 'Sofia Rivera', isPinned: false },
];

const MOCK_MESSAGES: Message[] = [
  { id: '1', userId: 'u1', username: 'Aryan Shah', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=aryan', content: "Messmer is genuinely one of the best boss designs FromSoftware has ever produced. The second phase transformation is INSANE.", upvotes: 284, downvotes: 12, userVote: null, createdAt: '2h ago' },
  { id: '2', userId: 'u2', username: 'Kenji T.', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=kenji', content: "Hot take: the final boss is actually harder than Malenia. Fight me. My build was maxed and it still took me 47 attempts.", upvotes: 156, downvotes: 89, userVote: null, createdAt: '1h ago' },
  { id: '3', userId: 'u3', username: 'Sofia R.', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=sofia', content: "The Scadutree Fragment system is genius. It makes exploration feel mandatory and rewarding at the same time. FromSoft really cooked.", upvotes: 213, downvotes: 8, userVote: null, createdAt: '45m ago' },
  { id: '4', userId: 'u4', username: 'Marcus C.', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=marcus', content: "Can we talk about the lore implications of Miquella's choices? This DLC rewrites everything we thought we knew about him.", upvotes: 178, downvotes: 14, userVote: null, createdAt: '30m ago' },
];

export default function ForumSection({ articleId, articleTitle }: { articleId: string; articleTitle: string }) {
  const [channels, setChannels] = useState<Channel[]>(MOCK_CHANNELS);
  const [activeChannel, setActiveChannel] = useState(MOCK_CHANNELS[0]);
  const [messages, setMessages] = useState<Message[]>(MOCK_MESSAGES);
  const [newMessage, setNewMessage] = useState('');
  const [newChannelName, setNewChannelName] = useState('');
  const [showCreateChannel, setShowCreateChannel] = useState(false);
  const [votes, setVotes] = useState<Record<string, { up: number; down: number; userVote: 'up' | 'down' | null }>>(
    () => Object.fromEntries(MOCK_MESSAGES.map(m => [m.id, { up: m.upvotes, down: m.downvotes, userVote: null }]))
  );
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const handleVote = (messageId: string, type: 'up' | 'down') => {
    setVotes(prev => {
      const curr = prev[messageId];
      if (curr.userVote === type) {
        return { ...prev, [messageId]: { ...curr, [type]: curr[type] - 1, userVote: null } };
      } else if (curr.userVote) {
        const other = type === 'up' ? 'down' : 'up';
        return { ...prev, [messageId]: { ...curr, [type]: curr[type] + 1, [other]: curr[other] - 1, userVote: type } };
      }
      return { ...prev, [messageId]: { ...curr, [type]: curr[type] + 1, userVote: type } };
    });
  };

  const sendMessage = () => {
    if (!newMessage.trim()) return;
    const msg: Message = {
      id: Date.now().toString(),
      userId: 'me', username: 'You', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=you',
      content: newMessage.trim(), upvotes: 0, downvotes: 0, userVote: null, createdAt: 'just now',
    };
    setMessages(prev => [...prev, msg]);
    setVotes(prev => ({ ...prev, [msg.id]: { up: 0, down: 0, userVote: null } }));
    setNewMessage('');
    setTimeout(() => messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' }), 100);
  };

  const createChannel = () => {
    if (!newChannelName.trim()) return;
    const channel: Channel = {
      id: Date.now().toString(),
      name: `# ${newChannelName.toLowerCase().replace(/\s+/g, '-')}`,
      description: 'New channel',
      messageCount: 0,
      createdBy: 'You',
      isPinned: false,
    };
    setChannels(prev => [...prev, channel]);
    setNewChannelName('');
    setShowCreateChannel(false);
    setActiveChannel(channel);
  };

  return (
    <section id="community-forum" style={{ maxWidth: '1100px', margin: '0 auto', padding: '0 24px 80px' }}>
      <div className="mb-8">
        <div className="chip mb-3">💬 Community Forum</div>
        <h2 style={{ fontSize: '1.75rem', fontWeight: 700 }}>Discussion Channels</h2>
        <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', marginTop: '4px' }}>
          Create and join channels for this article
        </p>
      </div>

      <div
        className="glass-heavy"
        style={{ borderRadius: '24px', overflow: 'hidden', border: '1px solid var(--glass-border)', minHeight: '520px', display: 'flex' }}
      >
        {/* Sidebar — Channel List */}
        <div style={{ width: '220px', flexShrink: 0, borderRight: '1px solid rgba(255,255,255,0.06)', padding: '16px 12px', display: 'flex', flexDirection: 'column', gap: '4px', background: 'rgba(0,0,0,0.3)' }}>
          <div style={{ padding: '8px 12px 12px', borderBottom: '1px solid rgba(255,255,255,0.06)', marginBottom: '8px' }}>
            <div style={{ fontSize: '0.7rem', fontWeight: 700, color: 'var(--text-muted)', letterSpacing: '0.08em', textTransform: 'uppercase' }}>
              Channels
            </div>
          </div>

          {channels.map(ch => (
            <button
              key={ch.id}
              id={`channel-${ch.id}`}
              onClick={() => setActiveChannel(ch)}
              className={`forum-channel w-full text-left ${activeChannel.id === ch.id ? 'active' : ''}`}
            >
              <span style={{ fontSize: '0.85rem', fontWeight: activeChannel.id === ch.id ? 700 : 400, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                {ch.isPinned ? '📌 ' : ''}{ch.name}
              </span>
              <span style={{ fontSize: '0.65rem', color: 'var(--text-muted)', marginLeft: 'auto', flexShrink: 0 }}>{ch.messageCount}</span>
            </button>
          ))}

          {/* Create Channel */}
          {showCreateChannel ? (
            <div className="mt-3 flex flex-col gap-2">
              <input
                id="new-channel-input"
                type="text"
                placeholder="channel-name"
                value={newChannelName}
                onChange={e => setNewChannelName(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && createChannel()}
                className="glass rounded-xl px-3 py-2 text-xs w-full"
                style={{ color: 'var(--text-primary)', border: '1px solid var(--glass-border)', background: 'transparent', outline: 'none' }}
                autoFocus
              />
              <div className="flex gap-2">
                <button onClick={createChannel} className="flex-1 text-xs py-1.5 rounded-xl font-bold" style={{ background: 'rgba(124,58,237,0.3)', color: '#a78bfa' }}>Create</button>
                <button onClick={() => setShowCreateChannel(false)} className="flex-1 text-xs py-1.5 rounded-xl" style={{ color: 'var(--text-muted)' }}>Cancel</button>
              </div>
            </div>
          ) : (
            <button
              id="create-channel-btn"
              onClick={() => setShowCreateChannel(true)}
              className="forum-channel mt-2 w-full text-left"
              style={{ color: 'var(--text-muted)', fontSize: '0.8rem' }}
            >
              + Create Channel
            </button>
          )}
        </div>

        {/* Main — Messages */}
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
          {/* Channel Header */}
          <div style={{ padding: '16px 20px', borderBottom: '1px solid rgba(255,255,255,0.06)', display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div>
              <div style={{ fontWeight: 700, fontSize: '0.95rem' }}>{activeChannel.name}</div>
              <div style={{ color: 'var(--text-muted)', fontSize: '0.75rem' }}>{activeChannel.messageCount} messages · created by {activeChannel.createdBy}</div>
            </div>
          </div>

          {/* Messages */}
          <div style={{ flex: 1, overflowY: 'auto', padding: '16px 20px', display: 'flex', flexDirection: 'column', gap: '16px', maxHeight: '400px' }}>
            {messages.map(msg => {
              const v = votes[msg.id] || { up: msg.upvotes, down: msg.downvotes, userVote: null };
              return (
                <div key={msg.id} id={`message-${msg.id}`} className="flex gap-3 group">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={msg.avatar} alt={msg.username} style={{ width: '36px', height: '36px', borderRadius: '50%', flexShrink: 0, border: '1.5px solid rgba(255,255,255,0.1)' }} />
                  <div style={{ flex: 1 }}>
                    <div className="flex items-center gap-2 mb-1">
                      <span style={{ fontWeight: 700, fontSize: '0.875rem' }}>{msg.username}</span>
                      <span style={{ color: 'var(--text-muted)', fontSize: '0.7rem' }}>{msg.createdAt}</span>
                    </div>
                    <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', lineHeight: 1.6 }}>{msg.content}</p>
                    <div className="flex items-center gap-2 mt-2 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button
                        onClick={() => handleVote(msg.id, 'up')}
                        className={`vote-btn text-xs px-2 py-1 ${v.userVote === 'up' ? 'upvoted' : ''}`}
                        id={`forum-upvote-${msg.id}`}
                      >
                        ▲ {v.up}
                      </button>
                      <button
                        onClick={() => handleVote(msg.id, 'down')}
                        className={`vote-btn text-xs px-2 py-1 ${v.userVote === 'down' ? 'downvoted' : ''}`}
                        id={`forum-downvote-${msg.id}`}
                      >
                        ▼ {v.down}
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
            <div ref={messagesEndRef} />
          </div>

          {/* Message Input */}
          <div style={{ padding: '16px 20px', borderTop: '1px solid rgba(255,255,255,0.06)' }}>
            <div className="glass flex items-center gap-3 rounded-2xl px-4 py-3">
              <input
                id="forum-message-input"
                type="text"
                placeholder={`Message ${activeChannel.name}...`}
                value={newMessage}
                onChange={e => setNewMessage(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && sendMessage()}
                className="flex-1 bg-transparent text-sm outline-none"
                style={{ color: 'var(--text-primary)' }}
              />
              <button
                id="forum-send-btn"
                onClick={sendMessage}
                disabled={!newMessage.trim()}
                className="btn-primary text-xs px-4 py-2 disabled:opacity-40 disabled:cursor-not-allowed"
              >
                Send
              </button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
