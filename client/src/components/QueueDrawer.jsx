import React from 'react';
import { X, Play, Trash2, Music } from 'lucide-react';

export default function QueueDrawer({ 
  isOpen, 
  onClose, 
  queue, 
  currentTrack, 
  onSelectTrack, 
  onRemoveFromQueue,
  onClearQueue 
}) {
  if (!isOpen) return null;

  return (
    <aside style={{
      position: 'fixed',
      top: 0,
      right: 0,
      width: '340px',
      height: 'calc(100% - 88px)',
      backgroundColor: 'var(--bg-sidebar)',
      borderLeft: '1px solid var(--border-color)',
      zIndex: 40,
      display: 'flex',
      flexDirection: 'column',
      padding: '20px',
      boxShadow: '-10px 0 30px rgba(0, 0, 0, 0.5)',
      animation: 'slideIn 0.2s ease-out'
    }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
        <div>
          <h3 style={{ fontSize: '16px', fontWeight: '700', color: '#ffffff' }}>Playback Queue</h3>
          <p style={{ fontSize: '12px', color: 'var(--text-muted)' }}>{queue.length} tracks</p>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          {queue.length > 0 && (
            <button
              onClick={onClearQueue}
              title="Clear Queue"
              style={{
                background: 'none',
                border: 'none',
                cursor: 'pointer',
                color: 'var(--text-dim)',
                padding: '4px'
              }}
            >
              <Trash2 size={16} />
            </button>
          )}
          <button
            onClick={onClose}
            style={{
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              color: 'var(--text-muted)',
              padding: '4px'
            }}
          >
            <X size={18} />
          </button>
        </div>
      </div>

      {/* Now Playing Item */}
      {currentTrack && (
        <div style={{ marginBottom: '18px' }}>
          <p style={{ fontSize: '11px', color: 'var(--accent-secondary)', fontWeight: '700', textTransform: 'uppercase', marginBottom: '8px' }}>
            Now Playing
          </p>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '12px',
            padding: '10px',
            borderRadius: '10px',
            background: 'rgba(99, 102, 241, 0.12)',
            border: '1px solid rgba(99, 102, 241, 0.3)'
          }}>
            <img 
              src={currentTrack.coverUrl || 'https://images.unsplash.com/photo-1518609878373-06d740f60d8b?w=200'} 
              alt={currentTrack.title}
              style={{ width: '42px', height: '42px', borderRadius: '6px', objectFit: 'cover' }}
            />
            <div style={{ overflow: 'hidden', flex: 1 }}>
              <p style={{ fontSize: '13px', fontWeight: '600', color: '#ffffff', whiteSpace: 'nowrap', textOverflow: 'ellipsis', overflow: 'hidden' }}>
                {currentTrack.title}
              </p>
              <p style={{ fontSize: '11px', color: 'var(--text-muted)', whiteSpace: 'nowrap', textOverflow: 'ellipsis', overflow: 'hidden' }}>
                {currentTrack.artist}
              </p>
            </div>
            <div style={{ display: 'flex', gap: '2px', alignItems: 'flex-end', height: '16px' }}>
              <span className="eq-bar" />
              <span className="eq-bar" />
              <span className="eq-bar" />
            </div>
          </div>
        </div>
      )}

      {/* Queue List */}
      <p style={{ fontSize: '11px', color: 'var(--text-dim)', fontWeight: '700', textTransform: 'uppercase', marginBottom: '8px' }}>
        Next In Queue
      </p>

      <div style={{ overflowY: 'auto', flex: 1, display: 'flex', flexDirection: 'column', gap: '6px' }}>
        {queue.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '40px 10px', color: 'var(--text-dim)', fontSize: '13px' }}>
            Queue is empty. Click any song to play and populate the queue.
          </div>
        ) : (
          queue.map((track, idx) => (
            <div
              key={`${track.id}-${idx}`}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '10px',
                padding: '8px 10px',
                borderRadius: '8px',
                backgroundColor: 'rgba(255, 255, 255, 0.03)',
                transition: 'background-color 0.15s'
              }}
            >
              <button
                onClick={() => onSelectTrack(track)}
                style={{
                  background: 'none',
                  border: 'none',
                  cursor: 'pointer',
                  color: 'var(--text-muted)',
                  display: 'flex',
                  alignItems: 'center',
                  padding: '2px'
                }}
              >
                <Play size={14} />
              </button>

              <div style={{ overflow: 'hidden', flex: 1 }}>
                <p style={{ fontSize: '12px', fontWeight: '500', color: '#ffffff', whiteSpace: 'nowrap', textOverflow: 'ellipsis', overflow: 'hidden' }}>
                  {track.title}
                </p>
                <p style={{ fontSize: '11px', color: 'var(--text-dim)', whiteSpace: 'nowrap', textOverflow: 'ellipsis', overflow: 'hidden' }}>
                  {track.artist}
                </p>
              </div>

              <button
                onClick={() => onRemoveFromQueue(idx)}
                style={{
                  background: 'none',
                  border: 'none',
                  cursor: 'pointer',
                  color: 'var(--text-dim)',
                  padding: '4px'
                }}
              >
                <X size={14} />
              </button>
            </div>
          ))
        )}
      </div>
    </aside>
  );
}

