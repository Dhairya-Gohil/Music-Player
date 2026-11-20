import React, { useState } from 'react';
import { Edit3, Trash2, Play } from 'lucide-react';
import SongRow from './SongRow';
import { MusicNoteLogo, PlaylistFolderIcon } from './MusicIcons';
import { ArrowBackIcon } from './PlayerIcons';

export default function DetailSongPage({
  id,
  title,
  subtitle,
  type = 'Collection',
  coverUrl,
  tracks = [],
  currentTrack,
  isPlaying,
  onPlay,
  onPause,
  onEditSong,
  onToggleLike,
  onAddToPlaylist,
  playlists,
  onBack,
  onEditPlaylist,
  onDeletePlaylist,
  onRemoveFromPlaylist
}) {
  const [showConfirmDelete, setShowConfirmDelete] = useState(false);
  const isCustomPlaylist = type === 'Playlist' && title !== 'Liked Songs';

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      {/* Back button & Action buttons */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <button
          onClick={onBack}
          className="blend-multiply"
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '8px',
            background: 'none',
            border: 'none',
            color: 'var(--accent-pink)',
            cursor: 'pointer',
            fontSize: '15px',
            fontWeight: '700',
            padding: '4px 0',
            mixBlendMode: 'multiply'
          }}
        >
          <ArrowBackIcon size={24} /> Back
        </button>

        {isCustomPlaylist && (
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <button
              onClick={() => onEditPlaylist && onEditPlaylist({ id, name: title, description: subtitle, coverUrl })}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                padding: '6px 14px',
                borderRadius: '10px',
                border: '1px solid rgba(0, 0, 0, 0.08)',
                backgroundColor: '#ffffff',
                color: 'var(--text-main)',
                fontSize: '12px',
                fontWeight: '600',
                cursor: 'pointer'
              }}
            >
              <Edit3 size={14} color="#3b82f6" /> Edit
            </button>

            {showConfirmDelete ? (
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <button
                  onClick={() => onDeletePlaylist && onDeletePlaylist(id)}
                  style={{
                    padding: '6px 12px',
                    borderRadius: '8px',
                    border: 'none',
                    backgroundColor: '#dc2626',
                    color: '#ffffff',
                    fontSize: '12px',
                    fontWeight: '700',
                    cursor: 'pointer'
                  }}
                >
                  Confirm Delete
                </button>
                <button
                  onClick={() => setShowConfirmDelete(false)}
                  style={{
                    padding: '6px 8px',
                    borderRadius: '8px',
                    border: '1px solid #d1d5db',
                    background: 'none',
                    color: 'var(--text-muted)',
                    fontSize: '12px',
                    cursor: 'pointer'
                  }}
                >
                  ✕
                </button>
              </div>
            ) : (
              <button
                onClick={() => setShowConfirmDelete(true)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  padding: '6px 14px',
                  borderRadius: '10px',
                  border: '1px solid rgba(220, 38, 38, 0.2)',
                  backgroundColor: '#fee2e2',
                  color: '#dc2626',
                  fontSize: '12px',
                  fontWeight: '600',
                  cursor: 'pointer'
                }}
              >
                <Trash2 size={14} /> Delete
              </button>
            )}
          </div>
        )}
      </div>

      {/* Hero Header */}
      <div className="app-card" style={{
        display: 'flex',
        alignItems: 'center',
        gap: '20px',
        padding: '20px'
      }}>
        {/* Cover Tile */}
        <div className="pink-tile" style={{
          width: '90px',
          height: '90px',
          borderRadius: type === 'Artist' ? '50%' : '20px',
          overflow: 'hidden',
          flexShrink: 0
        }}>
          {coverUrl ? (
            <img 
              src={coverUrl} 
              alt={title}
              style={{ width: '100%', height: '100%', objectFit: 'cover' }}
              onError={(e) => {
                e.target.src = '/pink_image.png';
              }}
            />
          ) : type === 'Playlist' ? (
            <PlaylistFolderIcon size={48} />
          ) : (
            <img 
              src="/pink_image.png" 
              alt={title}
              style={{ width: '100%', height: '100%', objectFit: 'cover' }}
            />
          )}
        </div>

        {/* Info */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', flex: 1, minWidth: 0 }}>
          <span style={{
            fontSize: '11px',
            fontWeight: '800',
            textTransform: 'uppercase',
            color: 'var(--accent-pink)',
            letterSpacing: '0.08em'
          }}>
            {type}
          </span>
          <h2 style={{
            fontSize: '24px',
            fontWeight: '800',
            margin: 0,
            color: 'var(--text-main)',
            whiteSpace: 'nowrap',
            overflow: 'hidden',
            textOverflow: 'ellipsis'
          }}>
            {title}
          </h2>
          <p style={{ fontSize: '13px', color: 'var(--text-muted)', margin: 0 }}>
            {subtitle ? `${subtitle} • ` : ''}{tracks.length} {tracks.length === 1 ? 'song' : 'songs'}
          </p>

          {tracks.length > 0 && (
            <div style={{ marginTop: '8px' }}>
              <button
                onClick={() => onPlay(tracks[0])}
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '6px',
                  backgroundColor: 'var(--accent-pink)',
                  border: 'none',
                  borderRadius: '12px',
                  padding: '8px 18px',
                  color: '#ffffff',
                  fontWeight: '700',
                  fontSize: '13px',
                  cursor: 'pointer'
                }}
              >
                <Play size={15} fill="#ffffff" color="#ffffff" /> Play All
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Track List */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
        {tracks.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '40px 10px', color: 'var(--text-muted)' }}>
            No songs in this {type.toLowerCase()}.
          </div>
        ) : (
          tracks.map(track => (
            <SongRow
              key={track.id}
              track={track}
              isCurrent={currentTrack?.id === track.id}
              isPlaying={isPlaying}
              onPlay={onPlay}
              onPause={onPause}
              onEditSong={onEditSong}
              onToggleLike={onToggleLike}
              onAddToPlaylist={onAddToPlaylist}
              playlists={playlists}
              onRemoveFromPlaylist={isCustomPlaylist && onRemoveFromPlaylist ? () => onRemoveFromPlaylist(id, track.id) : null}
            />
          ))
        )}
      </div>
    </div>
  );
}
