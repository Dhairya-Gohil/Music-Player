import React, { useState } from 'react';
import { Play, Pause, Heart, Plus, Check } from 'lucide-react';

export default function TrackCard({ 
  track, 
  isPlaying, 
  isCurrent, 
  onPlay, 
  onPause, 
  onToggleLike, 
  playlists = [],
  onAddToPlaylist 
}) {
  const [showMenu, setShowMenu] = useState(false);

  return (
    <div 
      className="glass-panel"
      style={{
        padding: '14px',
        display: 'flex',
        flexDirection: 'column',
        gap: '12px',
        position: 'relative',
        transition: 'transform 0.2s ease, background-color 0.2s ease, box-shadow 0.2s ease',
        cursor: 'pointer'
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.transform = 'translateY(-4px)';
        e.currentTarget.style.backgroundColor = 'var(--bg-card-hover)';
        e.currentTarget.style.boxShadow = '0 12px 24px rgba(0, 0, 0, 0.4)';
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.transform = 'translateY(0)';
        e.currentTarget.style.backgroundColor = 'var(--bg-card)';
        e.currentTarget.style.boxShadow = 'none';
        setShowMenu(false);
      }}
      onClick={() => {
        if (isCurrent && isPlaying) {
          onPause();
        } else {
          onPlay(track);
        }
      }}
    >
      {/* Cover with Floating Play Button */}
      <div style={{ position: 'relative', width: '100%', aspectRatio: '1/1', borderRadius: '10px', overflow: 'hidden' }}>
        <img 
          src={track.coverUrl || 'https://images.unsplash.com/photo-1518609878373-06d740f60d8b?w=400'} 
          alt={track.title}
          style={{ width: '100%', height: '100%', objectFit: 'cover' }}
        />

        {/* Play overlay button */}
        <div style={{
          position: 'absolute',
          inset: 0,
          background: 'rgba(0, 0, 0, 0.35)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          opacity: isCurrent ? 1 : 0,
          transition: 'opacity 0.2s ease'
        }}
        onMouseEnter={(e) => e.currentTarget.style.opacity = '1'}
        onMouseLeave={(e) => { if (!isCurrent) e.currentTarget.style.opacity = '0'; }}
        >
          <div style={{
            width: '46px',
            height: '46px',
            borderRadius: '50%',
            background: 'var(--accent-gradient)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: '0 4px 16px var(--accent-glow)'
          }}>
            {isCurrent && isPlaying ? (
              <Pause size={22} fill="#ffffff" color="#ffffff" />
            ) : (
              <Play size={22} fill="#ffffff" color="#ffffff" style={{ marginLeft: '2px' }} />
            )}
          </div>
        </div>

        {/* Genre badge */}
        <span style={{
          position: 'absolute',
          top: '8px',
          left: '8px',
          fontSize: '10px',
          fontWeight: '700',
          textTransform: 'uppercase',
          padding: '3px 8px',
          borderRadius: '9999px',
          backgroundColor: 'rgba(10, 13, 20, 0.75)',
          backdropFilter: 'blur(4px)',
          color: '#ffffff'
        }}>
          {track.genre || 'Beat'}
        </span>
      </div>

      {/* Track Info */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '3px' }}>
        <h4 style={{
          fontSize: '14px',
          fontWeight: '700',
          color: isCurrent ? 'var(--accent-primary)' : '#ffffff',
          whiteSpace: 'nowrap',
          overflow: 'hidden',
          textOverflow: 'ellipsis'
        }}>
          {track.title}
        </h4>
        <p style={{
          fontSize: '12px',
          color: 'var(--text-muted)',
          whiteSpace: 'nowrap',
          overflow: 'hidden',
          textOverflow: 'ellipsis'
        }}>
          {track.artist}
        </p>
      </div>

      {/* Actions Row */}
      <div 
        style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: '2px' }}
        onClick={(e) => e.stopPropagation()}
      >
        <button
          onClick={() => onToggleLike(track.id)}
          style={{
            background: 'none',
            border: 'none',
            cursor: 'pointer',
            padding: '4px',
            color: track.isLiked ? '#ec4899' : 'var(--text-dim)',
            display: 'flex',
            alignItems: 'center'
          }}
        >
          <Heart size={16} fill={track.isLiked ? '#ec4899' : 'none'} />
        </button>

        {/* Add to Playlist button */}
        <div style={{ position: 'relative' }}>
          <button
            onClick={() => setShowMenu(!showMenu)}
            title="Add to playlist"
            style={{
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              padding: '4px',
              color: 'var(--text-dim)',
              display: 'flex',
              alignItems: 'center'
            }}
          >
            <Plus size={16} />
          </button>

          {showMenu && playlists.length > 0 && (
            <div style={{
              position: 'absolute',
              bottom: '100%',
              right: 0,
              width: '180px',
              backgroundColor: '#161d2f',
              border: '1px solid var(--border-color)',
              borderRadius: '8px',
              boxShadow: '0 8px 24px rgba(0, 0, 0, 0.6)',
              padding: '6px',
              zIndex: 30,
              display: 'flex',
              flexDirection: 'column',
              gap: '2px'
            }}>
              <span style={{ fontSize: '10px', color: 'var(--text-dim)', fontWeight: '700', padding: '4px 8px', textTransform: 'uppercase' }}>
                Add to playlist
              </span>
              {playlists.map(pl => {
                const inPlaylist = pl.trackIds?.includes(track.id);
                return (
                  <button
                    key={pl.id}
                    onClick={() => {
                      onAddToPlaylist(pl.id, track.id);
                      setShowMenu(false);
                    }}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      padding: '6px 8px',
                      background: 'none',
                      border: 'none',
                      color: inPlaylist ? 'var(--accent-primary)' : 'var(--text-muted)',
                      fontSize: '12px',
                      cursor: 'pointer',
                      borderRadius: '4px',
                      textAlign: 'left'
                    }}
                  >
                    <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {pl.name}
                    </span>
                    {inPlaylist && <Check size={12} />}
                  </button>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

