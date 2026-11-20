import React from 'react';
import { ArtistFolderIcon } from './MusicIcons';

// Helper to extract individual artists from comma-separated artist strings
function extractArtists(artistStr) {
  if (!artistStr || typeof artistStr !== 'string') return ['Unknown artist'];
  const list = artistStr
    .split(/[,;]+/)
    .map(name => name.trim())
    .filter(name => name.length > 0);
  return list.length > 0 ? list : ['Unknown artist'];
}

export default function ArtistsTab({ tracks, onSelectArtist }) {
  // Aggregate unique artists
  const artistMap = {};

  tracks.forEach(t => {
    const artistNames = extractArtists(t.artist);
    artistNames.forEach(artistName => {
      if (!artistMap[artistName]) {
        artistMap[artistName] = {
          name: artistName,
          count: 0,
          coverUrl: t.coverUrl,
          tracks: []
        };
      }
      if (!artistMap[artistName].tracks.some(existing => existing.id === t.id)) {
        artistMap[artistName].count += 1;
        artistMap[artistName].tracks.push(t);
        if (!artistMap[artistName].coverUrl && t.coverUrl) {
          artistMap[artistName].coverUrl = t.coverUrl;
        }
      }
    });
  });

  const artists = Object.values(artistMap).sort((a, b) => a.name.localeCompare(b.name));

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      {/* Header */}
      <div>
        <h1 style={{ fontSize: '32px', fontWeight: '800', color: 'var(--text-main)', margin: '0 0 4px 0' }}>
          Artists
        </h1>
        <p style={{ fontSize: '14px', color: 'var(--text-muted)', margin: 0 }}>
          {artists.length} {artists.length === 1 ? 'artist' : 'artists'}
        </p>
      </div>

      {/* Grid of Artists */}
      <div className="responsive-music-grid">
        {artists.map(artist => (
          <div
            key={artist.name}
            onClick={() => onSelectArtist(artist)}
            className="app-card"
            style={{
              padding: '12px',
              display: 'flex',
              flexDirection: 'column',
              cursor: 'pointer',
              minWidth: 0,
              maxWidth: '100%',
              overflow: 'hidden',
              boxSizing: 'border-box',
              transition: 'transform 0.15s ease, box-shadow 0.15s ease'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = 'translateY(-3px)';
              e.currentTarget.style.boxShadow = '0 8px 20px rgba(0, 0, 0, 0.05)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = 'translateY(0)';
              e.currentTarget.style.boxShadow = '0 2px 10px rgba(0, 0, 0, 0.02)';
            }}
          >
            {/* Artist Image */}
            <div
              className="pink-tile"
              style={{
                width: '100%',
                maxWidth: '100%',
                aspectRatio: '1 / 1',
                backgroundColor: '#FFF0F2',
                borderRadius: '20px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                overflow: 'hidden'
              }}
            >
              <img
                src="/artists.png"
                alt="Artist"
                style={{
                  width: '40%',
                  height: '40%',
                  objectFit: 'contain',
                  display: 'block',
                  mixBlendMode: 'multiply'
                }}
              />
            </div>

            {/* Title & Artist label */}
            <div style={{ marginTop: '12px', paddingLeft: '4px', minWidth: 0, maxWidth: '100%', overflow: 'hidden' }}>
              <h3 style={{
                fontSize: '15px',
                fontWeight: '700',
                color: 'var(--text-main)',
                margin: '0 0 2px 0',
                whiteSpace: 'nowrap',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                maxWidth: '100%',
                display: 'block'
              }}>
                {artist.name}
              </h3>
              <p style={{
                fontSize: '13px',
                color: 'var(--text-muted)',
                margin: 0,
                whiteSpace: 'nowrap',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                maxWidth: '100%',
                display: 'block'
              }}>
                Artist
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
