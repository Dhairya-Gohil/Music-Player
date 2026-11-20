import React, { useState, useRef, useEffect } from 'react';
import { MoreVertical, Heart, Edit3, Plus, MinusCircle } from 'lucide-react';
import { MusicNoteLogo } from './MusicIcons';
import { PlayPauseIcon } from './PlayerIcons';

export default function SongRow({
  track,
  isCurrent,
  isPlaying,
  onPlay,
  onPause,
  onEditSong,
  onToggleLike,
  onAddToPlaylist,
  playlists = [],
  onRemoveFromPlaylist
}) {
  const [menuOpen, setMenuOpen] = useState(false);
  const [playlistSubmenuOpen, setPlaylistSubmenuOpen] = useState(false);
  const menuRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target)) {
        setMenuOpen(false);
        setPlaylistSubmenuOpen(false);
      }
    };
    if (menuOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [menuOpen]);

  const handleRowClick = () => {
    if (isCurrent && isPlaying) {
      onPause();
    } else {
      onPlay(track);
    }
  };

  return (
    <div
      onClick={handleRowClick}
      style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '10px 14px',
        borderRadius: '18px',
        backgroundColor: '#ffffff',
        cursor: 'pointer',
        border: isCurrent ? '1.5px solid #f472b6' : '1px solid #f1f5f9',
        boxShadow: isCurrent ? '0 4px 16px rgba(244, 114, 182, 0.12)' : '0 2px 6px rgba(0, 0, 0, 0.02)',
        transition: 'all 0.15s ease',
        position: 'relative'
      }}
      onMouseEnter={(e) => {
        if (!isCurrent) e.currentTarget.style.backgroundColor = '#f8fafc';
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.backgroundColor = '#ffffff';
      }}
    >
      {/* Left: Thumbnail & Title/Artist */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px', minWidth: 0, flex: 1 }}>
        {/* Thumbnail: If track has coverUrl, display image; otherwise soft pink tile with note logo */}
        <div style={{
          width: '48px',
          height: '48px',
          borderRadius: '14px',
          overflow: 'hidden',
          flexShrink: 0,
          backgroundColor: '#fdeef1',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          position: 'relative',
          boxShadow: '0 2px 6px rgba(0, 0, 0, 0.04)'
        }}>
          <img 
            src={track.coverUrl || '/pink_image.png'} 
            alt={track.title}
            style={{ width: '100%', height: '100%', objectFit: 'cover' }}
            onError={(e) => {
              if (e.target.src !== window.location.origin + '/pink_image.png') {
                e.target.src = '/pink_image.png';
              }
            }}
          />

          {isCurrent && isPlaying && (
            <div style={{
              position: 'absolute',
              inset: 0,
              backgroundColor: 'transparent',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '3px',
              pointerEvents: 'none'
            }}>
              <span className="eq-bar" style={{
                background: '#e0246a',
                width: '3.5px',
                borderRadius: '3px',
                boxShadow: '0 0 3px rgba(255, 255, 255, 0.95), 0 1px 2px rgba(0, 0, 0, 0.25)'
              }} />
              <span className="eq-bar" style={{
                background: '#e0246a',
                width: '3.5px',
                borderRadius: '3px',
                boxShadow: '0 0 3px rgba(255, 255, 255, 0.95), 0 1px 2px rgba(0, 0, 0, 0.25)'
              }} />
              <span className="eq-bar" style={{
                background: '#e0246a',
                width: '3.5px',
                borderRadius: '3px',
                boxShadow: '0 0 3px rgba(255, 255, 255, 0.95), 0 1px 2px rgba(0, 0, 0, 0.25)'
              }} />
            </div>
          )}
        </div>

        {/* Text */}
        <div style={{ overflow: 'hidden', flex: 1, paddingRight: '8px' }}>
          <h4 style={{
            fontSize: '14.5px',
            fontWeight: '700',
            color: isCurrent ? '#be185d' : '#0f172a',
            margin: '0 0 3px 0',
            whiteSpace: 'nowrap',
            overflow: 'hidden',
            textOverflow: 'ellipsis'
          }}>
            {track.title}
          </h4>
          <p style={{
            fontSize: '12.5px',
            color: '#64748b',
            margin: 0,
            whiteSpace: 'nowrap',
            overflow: 'hidden',
            textOverflow: 'ellipsis'
          }}>
            {track.artist} {track.album ? `• ${track.album}` : ''}
          </p>
        </div>
      </div>

      {/* Right: Quick Heart Like Button, Remove from Playlist (if in playlist), & 3-Dot More Menu */}
      <div 
        style={{ display: 'flex', alignItems: 'center', gap: '4px', position: 'relative' }} 
        ref={menuRef}
        onClick={(e) => e.stopPropagation()}
      >
        <button
          onClick={() => onToggleLike(track.id)}
          title={track.isLiked ? "Unlike" : "Like"}
          style={{
            background: 'none',
            border: 'none',
            cursor: 'pointer',
            padding: '6px',
            display: 'flex',
            alignItems: 'center',
            color: track.isLiked ? '#e0246a' : '#cbd5e1',
            transition: 'transform 0.12s ease'
          }}
          onMouseEnter={(e) => {
            if (!track.isLiked) e.currentTarget.style.color = '#e0246a';
            e.currentTarget.style.transform = 'scale(1.15)';
          }}
          onMouseLeave={(e) => {
            if (!track.isLiked) e.currentTarget.style.color = '#cbd5e1';
            e.currentTarget.style.transform = 'scale(1)';
          }}
        >
          <Heart size={18} fill={track.isLiked ? '#e0246a' : 'none'} />
        </button>

        {onRemoveFromPlaylist && (
          <button
            onClick={() => onRemoveFromPlaylist(track.id)}
            title="Remove from playlist"
            style={{
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              padding: '6px',
              display: 'flex',
              alignItems: 'center',
              color: '#94a3b8',
              transition: 'color 0.15s ease, transform 0.12s ease'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.color = '#ef4444';
              e.currentTarget.style.transform = 'scale(1.15)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.color = '#94a3b8';
              e.currentTarget.style.transform = 'scale(1)';
            }}
          >
            <MinusCircle size={18} />
          </button>
        )}

        <button
          onClick={() => setMenuOpen(!menuOpen)}
          style={{
            background: 'none',
            border: 'none',
            cursor: 'pointer',
            color: '#94a3b8',
            padding: '6px',
            display: 'flex',
            alignItems: 'center',
            borderRadius: '50%'
          }}
        >
          <MoreVertical size={18} />
        </button>

        {/* Dropdown Menu */}
        {menuOpen && (
          <div style={{
            position: 'absolute',
            top: '100%',
            right: 0,
            width: '190px',
            backgroundColor: '#ffffff',
            border: '1px solid var(--border-light)',
            borderRadius: '16px',
            boxShadow: '0 10px 30px rgba(0, 0, 0, 0.12)',
            padding: '8px',
            zIndex: 60,
            display: 'flex',
            flexDirection: 'column',
            gap: '4px'
          }}>
            {onRemoveFromPlaylist && (
              <button
                onClick={() => {
                  onRemoveFromPlaylist(track.id);
                  setMenuOpen(false);
                }}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '10px',
                  padding: '8px 12px',
                  background: 'none',
                  border: 'none',
                  color: '#ef4444',
                  fontSize: '13px',
                  fontWeight: '600',
                  cursor: 'pointer',
                  borderRadius: '8px',
                  textAlign: 'left'
                }}
                onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#fef2f2'}
                onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
              >
                <MinusCircle size={15} color="#ef4444" /> Remove from playlist
              </button>
            )}
            <button
              onClick={() => {
                handleRowClick();
                setMenuOpen(false);
              }}
              className="blend-multiply"
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '10px',
                padding: '8px 12px',
                background: 'none',
                border: 'none',
                color: 'var(--text-main)',
                fontSize: '13px',
                fontWeight: '600',
                cursor: 'pointer',
                borderRadius: '8px',
                textAlign: 'left',
                mixBlendMode: 'multiply'
              }}
              onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#faf8f5'}
              onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
            >
              <PlayPauseIcon isPlaying={isCurrent && isPlaying} size={18} />
              {isCurrent && isPlaying ? 'Pause' : 'Play Song'}
            </button>

            <button
              onClick={() => {
                onEditSong(track);
                setMenuOpen(false);
              }}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '10px',
                padding: '8px 12px',
                background: 'none',
                border: 'none',
                color: 'var(--text-main)',
                fontSize: '13px',
                fontWeight: '600',
                cursor: 'pointer',
                borderRadius: '8px',
                textAlign: 'left'
              }}
              onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#faf8f5'}
              onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
            >
              <Edit3 size={15} color="#3b82f6" /> Edit song info
            </button>

            <button
              onClick={() => {
                onToggleLike(track.id);
                setMenuOpen(false);
              }}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '10px',
                padding: '8px 12px',
                background: 'none',
                border: 'none',
                color: 'var(--text-main)',
                fontSize: '13px',
                fontWeight: '600',
                cursor: 'pointer',
                borderRadius: '8px',
                textAlign: 'left'
              }}
              onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#faf8f5'}
              onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
            >
              <Heart size={15} color={track.isLiked ? '#e0246a' : 'currentColor'} fill={track.isLiked ? '#e0246a' : 'none'} />
              {track.isLiked ? 'Unlike song' : 'Like song'}
            </button>

            {/* Add to Playlist Submenu */}
            <div style={{ position: 'relative' }}>
              <button
                onClick={() => setPlaylistSubmenuOpen(!playlistSubmenuOpen)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  width: '100%',
                  padding: '8px 12px',
                  background: 'none',
                  border: 'none',
                  color: 'var(--text-main)',
                  fontSize: '13px',
                  fontWeight: '600',
                  cursor: 'pointer',
                  borderRadius: '8px',
                  textAlign: 'left'
                }}
                onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#faf8f5'}
                onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
              >
                <span style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <Plus size={15} color="#10b981" /> Add to playlist
                </span>
                <span style={{ fontSize: '11px', color: 'var(--text-dim)' }}>›</span>
              </button>

              {playlistSubmenuOpen && (
                <div style={{
                  position: 'absolute',
                  top: 0,
                  right: '100%',
                  width: '170px',
                  backgroundColor: '#ffffff',
                  border: '1px solid var(--border-light)',
                  borderRadius: '12px',
                  boxShadow: '0 8px 24px rgba(0, 0, 0, 0.12)',
                  padding: '6px',
                  zIndex: 70,
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '2px'
                }}>
                  {playlists.length === 0 ? (
                    <span style={{ fontSize: '11px', color: 'var(--text-dim)', padding: '6px' }}>No playlists</span>
                  ) : (
                    playlists.map(pl => (
                      <button
                        key={pl.id}
                        onClick={() => {
                          onAddToPlaylist(pl.id, track.id);
                          setMenuOpen(false);
                          setPlaylistSubmenuOpen(false);
                        }}
                        style={{
                          padding: '6px 10px',
                          background: 'none',
                          border: 'none',
                          color: 'var(--text-main)',
                          fontSize: '12px',
                          fontWeight: '500',
                          cursor: 'pointer',
                          borderRadius: '6px',
                          textAlign: 'left',
                          whiteSpace: 'nowrap',
                          overflow: 'hidden',
                          textOverflow: 'ellipsis'
                        }}
                        onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#faf8f5'}
                        onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
                      >
                        {pl.name}
                      </button>
                    ))
                  )}
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
