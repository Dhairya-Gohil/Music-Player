import React from 'react';
import {
  Music,
  Users,
  Disc,
  ListMusic,
  Heart,
  RotateCw,
  Plus,
  CheckSquare,
  Sliders,
  Upload,
  User,
  FolderOpen
} from 'lucide-react';

export default function Sidebar({
  activeTab,
  setActiveTab,
  playlists = [],
  onSelectPlaylist,
  onOpenLikedSongs,
  onOpenCreatePlaylist,
  onOpenEqualizer,
  onOpenTodoList,
  onOpenUpload,
  onRescan,
  isRescanning = false,
  currentUser = null,
  onOpenAuthModal,
  totalSongCount = 0,
  onRequestPermission,
  onOpenAbout
}) {
  const navItems = [
    { id: 'songs', label: 'Songs', icon: Music, count: totalSongCount },
    { id: 'artists', label: 'Artists', icon: Users },
    { id: 'albums', label: 'Albums', icon: Disc },
    { id: 'playlists', label: 'Playlists', icon: ListMusic, count: playlists.length + 1 },
  ];

  return (
    <aside style={{
      width: '260px',
      height: '100%',
      backgroundColor: '#ffffff',
      display: 'flex',
      flexDirection: 'column',
      borderRight: '1px solid rgba(0, 0, 0, 0.07)',
      padding: '20px 14px',
      gap: '16px',
      flexShrink: 0,
      boxSizing: 'border-box',
      userSelect: 'none'
    }}>
      {/* 1. Brand Logo & Title (About Trigger) */}
      <div
        onClick={onOpenAbout}
        title={onOpenAbout ? "About Developer & Application" : "White Devil's Music"}
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '10px',
          padding: '0 6px 12px 6px',
          borderBottom: '1px solid rgba(0, 0, 0, 0.06)',
          cursor: onOpenAbout ? 'pointer' : 'default',
          transition: 'opacity 0.12s ease'
        }}
        onMouseEnter={(e) => {
          if (onOpenAbout) e.currentTarget.style.opacity = '0.8';
        }}
        onMouseLeave={(e) => {
          if (onOpenAbout) e.currentTarget.style.opacity = '1';
        }}
      >
        <div style={{
          width: '36px',
          height: '36px',
          minWidth: '36px',
          borderRadius: '10px',
          background: 'linear-gradient(135deg, #e0246a, #cc3344)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: '#ffffff',
          boxShadow: '0 3px 10px rgba(224, 36, 106, 0.25)',
          flexShrink: 0
        }}>
          <Music size={18} />
        </div>
        <div style={{ minWidth: 0, flex: 1 }}>
          <h1 style={{
            fontSize: '12.5px',
            fontWeight: '800',
            letterSpacing: '0.04em',
            textTransform: 'uppercase',
            color: 'var(--accent-red, #cc3344)',
            margin: 0,
            whiteSpace: 'nowrap',
            overflow: 'hidden',
            textOverflow: 'ellipsis'
          }}>
            WHITE DEVIL'S MUSIC
          </h1>
          <p style={{
            fontSize: '11px',
            color: '#64748b',
            margin: 0,
            fontWeight: '600'
          }}>
            Local Audio Hub • About
          </p>
        </div>
      </div>

      {/* 2. User Account Pill / Card */}
      {onOpenAuthModal && (
        <div
          onClick={onOpenAuthModal}
          title={currentUser ? `Signed in as @${currentUser.username}` : "Sign In or Create Account"}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '10px',
            padding: '8px 10px',
            borderRadius: '12px',
            backgroundColor: currentUser ? '#f0fdf4' : '#faf8f5',
            border: currentUser ? '1px solid #bbf7d0' : '1px solid rgba(0, 0, 0, 0.06)',
            cursor: 'pointer',
            transition: 'all 0.15s ease'
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.transform = 'translateY(-1px)';
            e.currentTarget.style.boxShadow = '0 4px 12px rgba(0, 0, 0, 0.04)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.transform = 'translateY(0)';
            e.currentTarget.style.boxShadow = 'none';
          }}
        >
          <div style={{
            width: '30px',
            height: '30px',
            borderRadius: '50%',
            background: currentUser ? 'linear-gradient(135deg, #10b981, #059669)' : '#fdeef1',
            color: currentUser ? '#ffffff' : '#e0246a',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '12px',
            fontWeight: '800',
            flexShrink: 0
          }}>
            {currentUser ? (currentUser.name || currentUser.username || 'U')[0].toUpperCase() : <User size={15} />}
          </div>
          <div style={{ minWidth: 0, flex: 1 }}>
            <p style={{
              fontSize: '12.5px',
              fontWeight: '700',
              color: currentUser ? '#15803d' : '#0f172a',
              margin: 0,
              whiteSpace: 'nowrap',
              overflow: 'hidden',
              textOverflow: 'ellipsis'
            }}>
              {currentUser ? (currentUser.name || currentUser.username) : 'Sign In'}
            </p>
            <p style={{
              fontSize: '11px',
              color: '#64748b',
              margin: 0,
              whiteSpace: 'nowrap',
              overflow: 'hidden',
              textOverflow: 'ellipsis'
            }}>
              {currentUser ? `@${currentUser.username}` : 'Private Session'}
            </p>
          </div>
        </div>
      )}

      {/* 3. Main Navigation */}
      <nav style={{ display: 'flex', flexDirection: 'column', gap: '3px' }}>
        <p style={{
          fontSize: '10.5px',
          fontWeight: '800',
          color: '#94a3b8',
          textTransform: 'uppercase',
          letterSpacing: '0.06em',
          padding: '0 8px 4px 8px',
          margin: 0
        }}>
          Discover
        </p>

        {navItems.map(item => {
          const isActive = activeTab === item.id;
          const Icon = item.icon;
          return (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '9px 12px',
                borderRadius: '10px',
                border: 'none',
                backgroundColor: isActive ? '#fdeef1' : 'transparent',
                color: isActive ? '#e0246a' : '#475569',
                fontSize: '13px',
                fontWeight: isActive ? '700' : '600',
                cursor: 'pointer',
                textAlign: 'left',
                transition: 'all 0.12s ease'
              }}
              onMouseEnter={(e) => {
                if (!isActive) e.currentTarget.style.backgroundColor = '#f8fafc';
              }}
              onMouseLeave={(e) => {
                if (!isActive) e.currentTarget.style.backgroundColor = 'transparent';
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <Icon size={16} color={isActive ? '#e0246a' : '#64748b'} />
                <span>{item.label}</span>
              </div>
              {item.count !== undefined && (
                <span style={{
                  fontSize: '11px',
                  fontWeight: '700',
                  color: isActive ? '#e0246a' : '#94a3b8',
                  backgroundColor: isActive ? 'rgba(224, 36, 106, 0.1)' : 'transparent',
                  padding: '1px 6px',
                  borderRadius: '9999px'
                }}>
                  {item.count}
                </span>
              )}
            </button>
          );
        })}

        {/* Quick Liked Songs Shortcut */}
        <button
          onClick={onOpenLikedSongs}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '10px',
            padding: '9px 12px',
            borderRadius: '10px',
            border: 'none',
            backgroundColor: 'transparent',
            color: '#475569',
            fontSize: '13px',
            fontWeight: '600',
            cursor: 'pointer',
            textAlign: 'left',
            transition: 'all 0.12s ease'
          }}
          onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#f8fafc'}
          onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
        >
          <Heart size={16} color="#e0246a" fill="#e0246a" />
          <span>Liked Songs</span>
        </button>
      </nav>

      {/* 4. Studio Tools Navigation */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '3px' }}>
        <p style={{
          fontSize: '10.5px',
          fontWeight: '800',
          color: '#94a3b8',
          textTransform: 'uppercase',
          letterSpacing: '0.06em',
          padding: '0 8px 4px 8px',
          margin: 0
        }}>
          Studio &amp; Tools
        </p>

        {onOpenTodoList && (
          <button
            onClick={onOpenTodoList}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '10px',
              padding: '8px 12px',
              borderRadius: '10px',
              border: 'none',
              backgroundColor: 'transparent',
              color: '#475569',
              fontSize: '12.5px',
              fontWeight: '600',
              cursor: 'pointer',
              textAlign: 'left',
              transition: 'all 0.12s ease'
            }}
            onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#f8fafc'}
            onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
          >
            <CheckSquare size={15} color="#cc3344" />
            <span>To-Do List</span>
          </button>
        )}

        {onOpenEqualizer && (
          <button
            onClick={onOpenEqualizer}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '10px',
              padding: '8px 12px',
              borderRadius: '10px',
              border: 'none',
              backgroundColor: 'transparent',
              color: '#475569',
              fontSize: '12.5px',
              fontWeight: '600',
              cursor: 'pointer',
              textAlign: 'left',
              transition: 'all 0.12s ease'
            }}
            onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#f8fafc'}
            onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
          >
            <Sliders size={15} color="#8b5cf6" />
            <span>Studio Equalizer</span>
          </button>
        )}


        {onRescan && (
          <button
            onClick={onRescan}
            disabled={isRescanning}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '10px',
              padding: '8px 12px',
              borderRadius: '10px',
              border: 'none',
              backgroundColor: 'transparent',
              color: isRescanning ? '#e11d48' : '#475569',
              fontSize: '12.5px',
              fontWeight: '600',
              cursor: isRescanning ? 'default' : 'pointer',
              textAlign: 'left',
              transition: 'all 0.12s ease'
            }}
            onMouseEnter={(e) => {
              if (!isRescanning) e.currentTarget.style.backgroundColor = '#f8fafc';
            }}
            onMouseLeave={(e) => {
              if (!isRescanning) e.currentTarget.style.backgroundColor = 'transparent';
            }}
          >
            <RotateCw
              size={15}
              color="#e11d48"
              style={{ animation: isRescanning ? 'spin 1s linear infinite' : 'none' }}
            />
            <span>{isRescanning ? 'Syncing Tracks...' : 'Sync Storage'}</span>
          </button>
        )}

        {onOpenUpload && (
          <button
            onClick={onOpenUpload}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '10px',
              padding: '8px 12px',
              borderRadius: '10px',
              border: 'none',
              backgroundColor: 'transparent',
              color: '#475569',
              fontSize: '12.5px',
              fontWeight: '600',
              cursor: 'pointer',
              textAlign: 'left',
              transition: 'all 0.12s ease'
            }}
            onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#f8fafc'}
            onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
          >
            <Upload size={15} color="#10b981" />
            <span>Upload Music</span>
          </button>
        )}
      </div>

      {/* 5. Playlists Section with "+" button */}
      <div style={{
        display: 'flex',
        flexDirection: 'column',
        flex: 1,
        minHeight: 0,
        borderTop: '1px solid rgba(0, 0, 0, 0.06)',
        paddingTop: '12px'
      }}>
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '0 8px 6px 8px'
        }}>
          <span style={{
            fontSize: '10.5px',
            fontWeight: '800',
            color: '#94a3b8',
            textTransform: 'uppercase',
            letterSpacing: '0.06em'
          }}>
            Your Playlists
          </span>
          {onOpenCreatePlaylist && (
            <button
              onClick={onOpenCreatePlaylist}
              title="Create New Playlist"
              style={{
                width: '22px',
                height: '22px',
                borderRadius: '6px',
                border: 'none',
                backgroundColor: '#fdeef1',
                color: '#e0246a',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer',
                transition: 'all 0.12s ease'
              }}
              onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#fbcfe8'}
              onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#fdeef1'}
            >
              <Plus size={14} />
            </button>
          )}
        </div>

        {/* Scrollable list of playlists */}
        <div style={{
          overflowY: 'auto',
          flex: 1,
          display: 'flex',
          flexDirection: 'column',
          gap: '2px',
          paddingRight: '2px'
        }}>
          {playlists.map(pl => {
            const count = pl.trackIds ? pl.trackIds.length : (pl.tracks ? pl.tracks.length : 0);
            return (
              <button
                key={pl.id}
                onClick={() => onSelectPlaylist(pl)}
                title={pl.name}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '7px 10px',
                  borderRadius: '8px',
                  border: 'none',
                  backgroundColor: 'transparent',
                  color: '#475569',
                  fontSize: '12px',
                  fontWeight: '500',
                  cursor: 'pointer',
                  textAlign: 'left',
                  transition: 'all 0.12s ease'
                }}
                onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#f8fafc'}
                onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
              >
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  minWidth: 0,
                  flex: 1
                }}>
                  <ListMusic size={13} color="#94a3b8" style={{ flexShrink: 0 }} />
                  <span style={{
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    whiteSpace: 'nowrap'
                  }}>
                    {pl.name}
                  </span>
                </div>
                <span style={{
                  fontSize: '10.5px',
                  color: '#94a3b8',
                  flexShrink: 0,
                  marginLeft: '6px'
                }}>
                  {count}
                </span>
              </button>
            );
          })}
        </div>
      </div>
    </aside>
  );
}
