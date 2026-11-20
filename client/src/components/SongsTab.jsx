import React from 'react';
import SongRow from './SongRow';

export default function SongsTab({
  tracks,
  currentTrack,
  isPlaying,
  onPlay,
  onPause,
  onEditSong,
  onToggleLike,
  onAddToPlaylist,
  playlists,
  onRequestPermission
}) {
  // Sort tracks alphabetically by title
  const sortedTracks = [...tracks].sort((a, b) => a.title.localeCompare(b.title));

  // Group by first letter
  const groupedTracks = sortedTracks.reduce((groups, track) => {
    const firstChar = track.title[0]?.toUpperCase() || '#';
    const letter = /[A-Z]/.test(firstChar) ? firstChar : '#';
    if (!groups[letter]) groups[letter] = [];
    groups[letter].push(track);
    return groups;
  }, {});

  const letters = Object.keys(groupedTracks).sort((a, b) => {
    if (a === '#') return 1;
    if (b === '#') return -1;
    return a.localeCompare(b);
  });

  if (tracks.length === 0) {
    return (
      <div style={{
        textAlign: 'center',
        padding: '60px 20px',
        backgroundColor: '#ffffff',
        borderRadius: '24px',
        border: '1px solid #e2e8f0',
        boxShadow: '0 2px 12px rgba(0, 0, 0, 0.02)'
      }}>
        <div style={{
          width: '50px',
          height: '50px',
          borderRadius: '16px',
          backgroundColor: '#fdeef1',
          color: '#e0246a',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          margin: '0 auto 14px'
        }}>
          🎵
        </div>
        <p style={{ fontSize: '17px', fontWeight: '800', color: '#0f172a', margin: '0 0 6px 0' }}>
          No local songs loaded yet
        </p>
        <p style={{ fontSize: '13px', margin: '0 0 20px 0', color: '#64748b', lineHeight: '1.5' }}>
          Grant storage access to automatically find and play MP3 &amp; M4A files from your Downloads &amp; Music folders.
        </p>
        {onRequestPermission && (
          <button
            onClick={onRequestPermission}
            className="btn-red-action"
            style={{ padding: '12px 24px', fontSize: '14px', borderRadius: '16px' }}
          >
            Grant Storage Access &amp; Fetch Songs
          </button>
        )}
      </div>
    );
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>
      {letters.map(letter => (
        <div key={letter} style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          {/* Alphabetical Section Divider Header */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '4px 4px 2px' }}>
            <span style={{
              fontSize: '12px',
              fontWeight: '800',
              color: '#e0246a',
              backgroundColor: '#fdeef1',
              width: '24px',
              height: '24px',
              borderRadius: '7px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: '0 1px 3px rgba(224, 36, 106, 0.1)'
            }}>
              {letter}
            </span>
            <div style={{ flex: 1, height: '1px', backgroundColor: '#e2e8f0' }} />
          </div>

          {/* Songs List */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {groupedTracks[letter].map((track, idx) => (
              <SongRow
                key={`${track.id || 'track'}-${idx}`}
                track={track}
                isCurrent={currentTrack?.id === track.id}
                isPlaying={isPlaying}
                onPlay={onPlay}
                onPause={onPause}
                onEditSong={onEditSong}
                onToggleLike={onToggleLike}
                onAddToPlaylist={onAddToPlaylist}
                playlists={playlists}
              />
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}
