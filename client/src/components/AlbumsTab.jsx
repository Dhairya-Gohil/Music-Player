import React from 'react';
import { AlbumFolderIcon } from './MusicIcons';

export default function AlbumsTab({ tracks, onSelectAlbum }) {
  // Aggregate unique albums
  const albumMap = {};

  tracks.forEach(t => {
    const albumName = t.album || 'Single / Unknown Album';
    if (!albumMap[albumName]) {
      albumMap[albumName] = {
        name: albumName,
        artist: t.artist,
        count: 0,
        coverUrl: t.coverUrl,
        tracks: []
      };
    }
    albumMap[albumName].count += 1;
    albumMap[albumName].tracks.push(t);
  });

  const albums = Object.values(albumMap).sort((a, b) => a.name.localeCompare(b.name));

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      {/* Header */}
      <div>
        <h1 style={{ fontSize: '32px', fontWeight: '800', color: 'var(--text-main)', margin: '0 0 4px 0' }}>
          Albums
        </h1>
        <p style={{ fontSize: '14px', color: 'var(--text-muted)', margin: 0 }}>
          {albums.length} albums
        </p>
      </div>

      {/* Grid of Albums */}
      <div className="responsive-music-grid">
        {albums.map(album => (
          <div
            key={album.name}
            onClick={() => onSelectAlbum(album)}
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
            {/* Soft pink square tile with magenta album vinyl icon */}
            {/* Album Image */}
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
                src="/albums.png"
                alt="Album"
                style={{
                  width: '40%',
                  height: '40%',
                  objectFit: 'contain',
                  display: 'block',
                  mixBlendMode: 'multiply'
                }}
              />
            </div>

            {/* Title & Album label */}
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
                {album.name}
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
                Album
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
