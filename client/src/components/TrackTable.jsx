import React from 'react';
import { Play, Pause, Heart, Clock, Music } from 'lucide-react';

function formatDuration(secs) {
  if (isNaN(secs)) return '3:00';
  const m = Math.floor(secs / 60);
  const s = Math.floor(secs % 60);
  return `${m}:${s < 10 ? '0' : ''}${s}`;
}

export default function TrackTable({
  tracks,
  currentTrack,
  isPlaying,
  onPlay,
  onPause,
  onToggleLike
}) {
  return (
    <div style={{ width: '100%', overflowX: 'auto' }}>
      <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '13px' }}>
        <thead>
          <tr style={{ color: 'var(--text-dim)', borderBottom: '1px solid var(--border-color)', height: '36px' }}>
            <th style={{ width: '40px', paddingLeft: '12px' }}>#</th>
            <th style={{ padding: '0 12px' }}>Title</th>
            <th style={{ padding: '0 12px' }}>Album</th>
            <th style={{ padding: '0 12px' }}>Genre</th>
            <th style={{ width: '60px', paddingRight: '16px', textAlign: 'right' }}><Clock size={14} /></th>
          </tr>
        </thead>
        <tbody>
          {tracks.map((track, idx) => {
            const isCurrent = currentTrack && currentTrack.id === track.id;

            return (
              <tr 
                key={track.id}
                onClick={() => {
                  if (isCurrent && isPlaying) {
                    onPause();
                  } else {
                    onPlay(track);
                  }
                }}
                style={{
                  height: '56px',
                  borderBottom: '1px solid rgba(255, 255, 255, 0.03)',
                  cursor: 'pointer',
                  backgroundColor: isCurrent ? 'rgba(99, 102, 241, 0.08)' : 'transparent',
                  transition: 'background-color 0.15s'
                }}
                onMouseEnter={(e) => {
                  if (!isCurrent) e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.04)';
                }}
                onMouseLeave={(e) => {
                  if (!isCurrent) e.currentTarget.style.backgroundColor = 'transparent';
                }}
              >
                {/* Index / Play indicator */}
                <td style={{ paddingLeft: '12px', color: 'var(--text-dim)' }}>
                  {isCurrent && isPlaying ? (
                    <div style={{ display: 'flex', gap: '2px', alignItems: 'flex-end', height: '14px' }}>
                      <span className="eq-bar" />
                      <span className="eq-bar" />
                      <span className="eq-bar" />
                    </div>
                  ) : (
                    <span>{idx + 1}</span>
                  )}
                </td>

                {/* Title & Cover & Artist */}
                <td style={{ padding: '0 12px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <img 
                      src={track.coverUrl || 'https://images.unsplash.com/photo-1518609878373-06d740f60d8b?w=100'} 
                      alt={track.title}
                      style={{ width: '38px', height: '38px', borderRadius: '6px', objectFit: 'cover' }}
                    />
                    <div>
                      <p style={{
                        fontSize: '13px',
                        fontWeight: '600',
                        color: isCurrent ? 'var(--accent-primary)' : '#ffffff',
                        margin: 0
                      }}>
                        {track.title}
                      </p>
                      <p style={{ fontSize: '11px', color: 'var(--text-muted)', margin: 0 }}>
                        {track.artist}
                      </p>
                    </div>
                  </div>
                </td>

                {/* Album */}
                <td style={{ padding: '0 12px', color: 'var(--text-muted)' }}>
                  {track.album || 'Single'}
                </td>

                {/* Genre */}
                <td style={{ padding: '0 12px' }}>
                  <span style={{
                    fontSize: '11px',
                    padding: '2px 8px',
                    borderRadius: '9999px',
                    backgroundColor: 'rgba(255, 255, 255, 0.06)',
                    color: 'var(--text-muted)'
                  }}>
                    {track.genre || 'Electronic'}
                  </span>
                </td>

                {/* Duration & Like */}
                <td style={{ paddingRight: '16px', textAlign: 'right' }}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: '12px' }}>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onToggleLike(track.id);
                      }}
                      style={{
                        background: 'none',
                        border: 'none',
                        cursor: 'pointer',
                        padding: '2px',
                        color: track.isLiked ? '#ec4899' : 'var(--text-dim)'
                      }}
                    >
                      <Heart size={14} fill={track.isLiked ? '#ec4899' : 'none'} />
                    </button>
                    <span style={{ color: 'var(--text-dim)', fontSize: '12px', minWidth: '32px' }}>
                      {formatDuration(track.duration)}
                    </span>
                  </div>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}

