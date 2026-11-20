
import React from 'react';

export default function BottomNavBar({ activeTab, onSelectTab }) {
  const tabs = [
    { id: 'songs', label: 'Songs', image: '/songs.png' },
    { id: 'artists', label: 'Artists', image: '/artists.png' },
    { id: 'albums', label: 'Albums', image: '/albums.png' },
    { id: 'playlists', label: 'Playlists', image: '/playlists.png' }
  ];

  return (
    <nav style={{
      position: 'fixed',
      bottom: 0,
      left: '50%',
      transform: 'translateX(-50%)',
      width: '100%',
      maxWidth: '480px',
      height: '74px',
      backgroundColor: '#ffffff',
      borderTop: '1px solid rgba(0, 0, 0, 0.05)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-around',
      zIndex: 40,
      boxShadow: '0 -4px 16px rgba(0, 0, 0, 0.02)'
    }}>
      {tabs.map(tab => {
        const isActive = activeTab === tab.id;

        return (
          <button
            key={tab.id}
            onClick={() => onSelectTab(tab.id)}
            style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: '3px',
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              padding: '4px 12px'
            }}
          >
            {/* Image icon with active background */}
            <div style={{
              backgroundColor: isActive
                ? 'var(--bg-pink-card)'
                : 'transparent',
              padding: '6px 18px',
              borderRadius: '20px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              transition: 'background-color 0.15s ease'
            }}>
              <img
                src={tab.image}
                alt={tab.label}
                className="blend-multiply"
                style={{
                  width: '22px',
                  height: '22px',
                  objectFit: 'contain',
                  display: 'block',
                  mixBlendMode: 'multiply'
                }}
              />
            </div>

            <span style={{
              fontSize: '12px',
              fontWeight: isActive ? '700' : '500',
              color: isActive
                ? 'var(--accent-red)'
                : 'var(--text-muted)',
              transition: 'color 0.15s ease'
            }}>
              {tab.label}
            </span>
          </button>
        );
      })}
    </nav>
  );
}
