/**
 * FLOATING CHAT APPLICATION COMPONENT
 * 
 * This component provides a floating chat interface for real-time messaging between users.
 * 
 * WHAT THIS FILE DOES:
 * - Provides a draggable floating chat button
 * - Manages chat window open/close state
 * - Handles real-time messaging functionality
 * - Integrates with WebSocket for live communication
 * - Manages chat history and message storage
 * - Provides friend list for chat selection
 * 
 
 
 */

import React, { useState, useRef, useEffect } from 'react';
import { Icon } from '@iconify/react';
import { useSocket } from '../../contexts/socketContext';

// Mock data for users and messages
const users = [
  { id: 1, name: 'Alice', avatar: 'https://randomuser.me/api/portraits/women/1.jpg' },
  { id: 2, name: 'Bob', avatar: 'https://randomuser.me/api/portraits/men/2.jpg' },
  { id: 3, name: 'Charlie', avatar: 'https://randomuser.me/api/portraits/men/3.jpg' },
];

const conversations = [
  {
    id: 1,
    userId: 2,
    messages: [
      { fromMe: false, text: 'Hey! How are you?', time: '10:00' },
      { fromMe: true, text: 'I am good! You?', time: '10:01' },
      { fromMe: false, text: 'Doing great!', time: '10:02' },
    ],
  },
  {
    id: 2,
    userId: 3,
    messages: [
      { fromMe: false, text: 'Ready for the meeting?', time: '09:00' },
      { fromMe: true, text: 'Yes, joining now.', time: '09:01' },
    ],
  },
];

function ChatSidebar({ conversations, users, onSelect, selectedId }) {
  return (
    <div style={{ width: 260, borderRight: '1px solid #eee', background: '#fff', height: '100%', overflowY: 'auto' }}>
      <div style={{ padding: 16, fontWeight: 'bold', fontSize: 18 }}>Chats</div>
      {conversations.map(conv => {
        const user = users.find(u => u.id === conv.userId);
        const lastMsg = conv.messages[conv.messages.length - 1];
        return (
          <div
            key={conv.id}
            onClick={() => onSelect(conv.id)}
            style={{
              display: 'flex',
              alignItems: 'center',
              padding: 12,
              cursor: 'pointer',
              background: selectedId === conv.id ? '#f0f0f0' : 'transparent',
              borderLeft: selectedId === conv.id ? '4px solid #3897f0' : '4px solid transparent',
              transition: 'background 0.2s',
            }}
          >
            <img src={user.avatar} alt={user.name} style={{ width: 44, height: 44, borderRadius: '50%', marginRight: 12 }} />
            <div style={{ flex: 1 }}>
              <div style={{ fontWeight: 500 }}>{user.name}</div>
              <div style={{ color: '#888', fontSize: 13, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{lastMsg.text}</div>
            </div>
            <div style={{ color: '#bbb', fontSize: 12, marginLeft: 8 }}>{lastMsg.time}</div>
          </div>
        );
      })}
    </div>
  );
}

function FloatingChatWindow({ conversation, user, onSend }) {
  const [input, setInput] = useState('');
  
  const handleSend = () => {
    if (input.trim()) {
      onSend(input);
      setInput('');
    }
  };
  
  return (
    <div style={{ flex: 1, display: 'flex', flexDirection: 'column', height: '100%' }}>
      <div style={{ padding: 16, borderBottom: '1px solid #eee', display: 'flex', alignItems: 'center' }}>
        <img src={user.avatar} alt={user.name} style={{ width: 36, height: 36, borderRadius: '50%', marginRight: 12 }} />
        <span style={{ fontWeight: 500 }}>{user.name}</span>
      </div>
      <div style={{ flex: 1, overflowY: 'auto', padding: 16, background: '#fafafa' }}>
        {conversation.messages.map((msg, idx) => (
          <div key={idx} style={{ display: 'flex', justifyContent: msg.fromMe ? 'flex-end' : 'flex-start', marginBottom: 10 }}>
            <div style={{
              background: msg.fromMe ? '#3897f0' : '#fff',
              color: msg.fromMe ? '#fff' : '#222',
              borderRadius: 18,
              padding: '8px 16px',
              maxWidth: 320,
              boxShadow: msg.fromMe ? '0 2px 8px #3897f033' : '0 2px 8px #0001',
            }}>
              {msg.text}
              <span style={{ display: 'block', fontSize: 11, color: msg.fromMe ? '#e0e0e0' : '#aaa', marginTop: 2, textAlign: 'right' }}>{msg.time}</span>
            </div>
          </div>
        ))}
      </div>
      <div style={{ padding: 12, borderTop: '1px solid #eee', display: 'flex', background: '#fff' }}>
        <input
          type="text"
          value={input}
          onChange={e => setInput(e.target.value)}
          placeholder="Message..."
          style={{ flex: 1, border: 'none', outline: 'none', fontSize: 16, padding: 8, background: '#f5f5f5', borderRadius: 18, marginRight: 8 }}
          onKeyDown={e => { if (e.key === 'Enter') handleSend(); }}
        />
        <button onClick={handleSend} style={{ background: '#3897f0', color: '#fff', border: 'none', borderRadius: 18, padding: '8px 18px', fontWeight: 500, cursor: 'pointer' }}>Send</button>
      </div>
    </div>
  );
}

export default function ChatApp() {
  const [open, setOpen] = useState(false);
  const [selectedId, setSelectedId] = useState(conversations[0].id);
  const [allConversations, setAllConversations] = useState(conversations);
  // Draggable state
  const [position, setPosition] = useState({ right: 32, bottom: 32 });
  const dragStart = useRef({ x: 0, y: 0, left: 0, top: 0, dragging: false });
  const buttonRef = useRef(null);

  // Helper to get window size
  const getWindowSize = () => ({ width: window.innerWidth, height: window.innerHeight });

  // Mouse/touch event handlers
  const onMouseDown = (e) => {
    e.preventDefault();
    dragStart.current.dragging = false;
    dragStart.current.x = e.type === 'touchstart' ? e.touches[0].clientX : e.clientX;
    dragStart.current.y = e.type === 'touchstart' ? e.touches[0].clientY : e.clientY;
    const rect = buttonRef.current.getBoundingClientRect();
    dragStart.current.left = rect.left;
    dragStart.current.top = rect.top;
    document.addEventListener('mousemove', onMouseMove);
    document.addEventListener('mouseup', onMouseUp);
    document.addEventListener('touchmove', onMouseMove);
    document.addEventListener('touchend', onMouseUp);
  };

  const onMouseMove = (e) => {
    const clientX = e.type === 'touchmove' ? e.touches[0].clientX : e.clientX;
    const clientY = e.type === 'touchmove' ? e.touches[0].clientY : e.clientY;
    const dx = clientX - dragStart.current.x;
    const dy = clientY - dragStart.current.y;
    if (Math.abs(dx) > 3 || Math.abs(dy) > 3) dragStart.current.dragging = true;
    if (dragStart.current.dragging) {
      // Clamp to window
      const win = getWindowSize();
      let left = dragStart.current.left + dx;
      let top = dragStart.current.top + dy;
      left = Math.max(0, Math.min(left, win.width - 60));
      top = Math.max(0, Math.min(top, win.height - 60));
      setPosition({ left, top });
    }
  };

  const onMouseUp = (e) => {
    document.removeEventListener('mousemove', onMouseMove);
    document.removeEventListener('mouseup', onMouseUp);
    document.removeEventListener('touchmove', onMouseMove);
    document.removeEventListener('touchend', onMouseUp);
    if (!dragStart.current.dragging) {
      setOpen(true);
    }
    dragStart.current.dragging = false;
  };

  // Compute style for button
  const buttonStyle = position.left !== undefined && position.top !== undefined
    ? {
        position: 'fixed',
        left: position.left,
        top: position.top,
        zIndex: 1000,
        background: '#fff',
        border: 'none',
        borderRadius: '50%',
        width: 60,
        height: 60,
        boxShadow: '0 2px 12px #0002',
        cursor: 'pointer',
        display: open ? 'none' : 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        transition: 'box-shadow 0.2s',
      }
    : {
        position: 'fixed',
        right: position.right,
        bottom: position.bottom,
        zIndex: 1000,
        background: '#fff',
        border: 'none',
        borderRadius: '50%',
        width: 60,
        height: 60,
        boxShadow: '0 2px 12px #0002',
        cursor: 'pointer',
        display: open ? 'none' : 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        transition: 'box-shadow 0.2s',
      };

  const selectedConv = allConversations.find(c => c.id === selectedId);
  const user = users.find(u => u.id === selectedConv.userId);

  const handleSend = (text) => {
    setAllConversations(convs => convs.map(c =>
      c.id === selectedId
        ? { ...c, messages: [...c.messages, { fromMe: true, text, time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) }] }
        : c
    ));
  };

  return (
    <>
      {/* Draggable Floating Chat Button */}
      <button
        ref={buttonRef}
        style={buttonStyle}
        aria-label="Open chat"
        onMouseDown={onMouseDown}
        onTouchStart={onMouseDown}
      >
        <svg width="32" height="32" fill="#3897f0" viewBox="0 0 24 24"><path d="M12 3C7.03 3 3 6.58 3 11c0 1.61.62 3.09 1.69 4.36-.13.44-.5 1.62-.7 2.25-.11.33.24.65.57.54.66-.22 1.92-.7 2.36-.87C8.5 18.13 10.18 18.5 12 18.5c4.97 0 9-3.58 9-8s-4.03-8-9-8zm0 14c-1.66 0-3.14-.34-4.32-.93l-.31-.16-.33.12c-.4.15-1.13.41-1.7.61.19-.6.44-1.38.52-1.65l.1-.33-.23-.27C4.6 13.09 4 12.08 4 11c0-3.31 3.58-6 8-6s8 2.69 8 6-3.58 6-8 6z"></path></svg>
      </button>

      {/* Chat Overlay */}
      {open && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          width: '100vw',
          height: '100vh',
          background: 'rgba(0,0,0,0.18)',
          zIndex: 1001,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}>
          <div style={{
            width: 700,
            maxWidth: '98vw',
            height: 520,
            background: '#fff',
            borderRadius: 16,
            boxShadow: '0 4px 32px #0002',
            display: 'flex',
            overflow: 'hidden',
            position: 'relative',
          }}>
            <ChatSidebar
              conversations={allConversations}
              users={users}
              onSelect={setSelectedId}
              selectedId={selectedId}
            />
            <FloatingChatWindow
              conversation={selectedConv}
              user={user}
              onSend={handleSend}
            />
            <button
              onClick={() => setOpen(false)}
              style={{
                position: 'absolute',
                top: 12,
                right: 12,
                background: 'none',
                border: 'none',
                fontSize: 22,
                color: '#888',
                cursor: 'pointer',
              }}
              aria-label="Close chat"
            >
              ×
            </button>
          </div>
        </div>
      )}
    </>
  );
} 