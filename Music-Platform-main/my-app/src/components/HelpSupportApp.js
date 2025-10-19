/**
 * FLOATING HELP & SUPPORT COMPONENT
 * 
 * This component provides a floating help button and comprehensive support modal.
 * 
 * WHAT THIS FILE DOES:
 * - Displays a draggable floating help button with question mark icon
 * - Provides comprehensive help and support information
 * - Shows organized help sections with icons and content
 * - Offers contact support functionality

 * 
 
 */

import React, { useState, useRef, useEffect } from 'react';
import { Icon } from '@iconify/react';

export default function HelpSupportApp() {
  const [open, setOpen] = useState(false);
  const [isVisible, setIsVisible] = useState(false);
  // Draggable state
  const [position, setPosition] = useState({ right: 32, bottom: 120 }); // Positioned above chat button
  const dragStart = useRef({ x: 0, y: 0, left: 0, top: 0, dragging: false });
  const buttonRef = useRef(null);

  // Add entrance animation
  useEffect(() => {
    const timer = setTimeout(() => {
      setIsVisible(true);
    }, 1000); // Show after 1 second

    return () => clearTimeout(timer);
  }, []);

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
        transition: 'all 0.2s ease',
        transform: isVisible ? 'scale(1)' : 'scale(0)',
        opacity: isVisible ? 1 : 0,
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
        transition: 'all 0.3s ease',
        transform: isVisible ? 'scale(1)' : 'scale(0)',
        opacity: isVisible ? 1 : 0,
      };

  const handleMouseEnter = (e) => {
    e.target.style.transform = 'scale(1.1)';
    e.target.style.boxShadow = '0 4px 20px #0003';
  };

  const handleMouseLeave = (e) => {
    e.target.style.transform = 'scale(1)';
    e.target.style.boxShadow = '0 2px 12px #0002';
  };

  const helpSections = [
    {
      title: "Getting Started",
      icon: "mdi:rocket-launch",
      content: [
        "Welcome to our music platform! Here's how to get started:",
        "• Create an account or log in to access all features",
        "• Upload your favorite songs and audiobooks",
        "• Create playlists to organize your music",
        "• Connect with friends and share music"
      ]
    },
    {
      title: "Music Features",
      icon: "mdi:music",
      content: [
        "Discover all the music features available:",
        "• Upload and stream your favorite songs",
        "• Create and manage playlists",
        "• Like songs to save them to your library",
        "• Search for songs, artists, and albums",
        "• Listen to audiobooks in our dedicated section"
      ]
    },
    {
      title: "Social Features",
      icon: "mdi:account-group",
      content: [
        "Connect with friends and share your music:",
        "• Add friends to your network",
        "• Send and receive friend requests",
        "• Chat with friends in real-time",
        "• Share playlists and recommendations",
        "• See what your friends are listening to"
      ]
    },
    {
      title: "Account & Settings",
      icon: "mdi:cog",
      content: [
        "Manage your account and preferences:",
        "• Update your profile information",
        "• Change your password",
        "• Manage your privacy settings",
        "• View your listening history",
        "• Access your uploaded content"
      ]
    },
    {
      title: "Troubleshooting",
      icon: "mdi:help-circle",
      content: [
        "Common issues and solutions:",
        "• If music won't play, check your internet connection",
        "• Clear your browser cache if you experience issues",
        "• Make sure your audio files are in supported formats",
        "• Contact support if you need additional help"
      ]
    }
  ];

  return (
    <>
      {/* Draggable Floating Help Button */}
      <button
        ref={buttonRef}
        style={buttonStyle}
        aria-label="Help and Support"
        onMouseDown={onMouseDown}
        onTouchStart={onMouseDown}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
        title="Help & Support"
      >
        <Icon icon="mdi:help-circle" className="text-3xl text-blue-600" />
      </button>

      {/* Help Support Overlay */}
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
            width: 800,
            maxWidth: '98vw',
            maxHeight: '90vh',
            background: '#fff',
            borderRadius: 16,
            boxShadow: '0 4px 32px #0002',
            overflow: 'hidden',
            position: 'relative',
          }}>
            {/* Header */}
            <div style={{
              padding: '24px 32px',
              borderBottom: '1px solid #eee',
              background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
              color: 'white',
            }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                  <Icon icon="mdi:help-circle" className="text-3xl" />
                  <h1 style={{ fontSize: 24, fontWeight: 'bold', margin: 0 }}>Help & Support</h1>
                </div>
                <button
                  onClick={() => setOpen(false)}
                  style={{
                    background: 'none',
                    border: 'none',
                    fontSize: 24,
                    color: 'white',
                    cursor: 'pointer',
                    padding: 8,
                    borderRadius: '50%',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                  aria-label="Close help"
                >
                  ×
                </button>
              </div>
            </div>

            {/* Content */}
            <div style={{
              padding: '32px',
              maxHeight: 'calc(90vh - 120px)',
              overflowY: 'auto',
            }}>
              <div style={{ display: 'grid', gap: 24 }}>
                {helpSections.map((section, index) => (
                  <div key={index} style={{
                    background: '#f8f9fa',
                    borderRadius: 12,
                    padding: 24,
                    border: '1px solid #e9ecef',
                  }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 16 }}>
                      <Icon icon={section.icon} className="text-2xl text-blue-600" />
                      <h3 style={{ fontSize: 20, fontWeight: 'bold', margin: 0, color: '#333' }}>
                        {section.title}
                      </h3>
                    </div>
                    <div style={{ color: '#666', lineHeight: 1.6 }}>
                      {section.content.map((item, itemIndex) => (
                        <div key={itemIndex} style={{ marginBottom: 8 }}>
                          {item}
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>

              {/* Contact Support */}
              <div style={{
                marginTop: 32,
                padding: 24,
                background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                borderRadius: 12,
                color: 'white',
                textAlign: 'center',
              }}>
                <Icon icon="mdi:email" className="text-3xl mb-4" />
                <h3 style={{ fontSize: 20, fontWeight: 'bold', marginBottom: 12 }}>Need More Help?</h3>
                <p style={{ marginBottom: 16, opacity: 0.9 }}>
                  Can't find what you're looking for? Our support team is here to help!
                </p>
                <button
                  onClick={() => {
                    // You can implement email functionality or redirect to contact form
                    window.open('mailto:support@musicplatform.com?subject=Help Request', '_blank');
                  }}
                  style={{
                    background: 'white',
                    color: '#667eea',
                    border: 'none',
                    borderRadius: 8,
                    padding: '12px 24px',
                    fontSize: 16,
                    fontWeight: 'bold',
                    cursor: 'pointer',
                    transition: 'transform 0.2s',
                  }}
                  onMouseOver={(e) => e.target.style.transform = 'scale(1.05)'}
                  onMouseOut={(e) => e.target.style.transform = 'scale(1)'}
                >
                  Contact Support
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
} 