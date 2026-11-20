
import React, { useState, useRef, useEffect } from 'react';
import { Plus, MoreVertical, Edit3, Trash2 } from 'lucide-react';

export default function PlaylistsTab({
  playlists,
  tracks,
  onSelectPlaylist,
  onOpenCreatePlaylist,
  onOpenLikedSongs,
  onEditPlaylist,
  onDeletePlaylist
}) {
  const likedTracks = tracks.filter(t => t.isLiked);
  const [activeMenuId, setActiveMenuId] = useState(null);
  const menuRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target)) {
        setActiveMenuId(null);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);

    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Reusable fixed image style
  const imageTileStyle = {
    width: '100%',
    maxWidth: '100%',
    aspectRatio: '1 / 1',
    backgroundColor: '#FFF0F2',
    borderRadius: '20px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
    boxSizing: 'border-box'
  };

  const imageStyle = {
    width: '40%',
    height: '40%',
    objectFit: 'contain',
    display: 'block',
    mixBlendMode: 'multiply'
  };

  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      gap: '20px'
    }}>

      {/* Header */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between'
      }}>
        <div>
          <h1 style={{
            fontSize: '32px',
            fontWeight: '800',
            color: 'var(--text-main)',
            margin: '0 0 4px 0'
          }}>
            Playlists
          </h1>

          <p style={{
            fontSize: '14px',
            color: 'var(--text-muted)',
            margin: 0
          }}>
            {playlists.length + 1} playlists
          </p>
        </div>

        {/* New Playlist Action */}
        <button
          onClick={onOpenCreatePlaylist}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            padding: '8px 16px',
            borderRadius: '12px',
            border: 'none',
            backgroundColor: 'var(--bg-pink-card)',
            color: 'var(--accent-pink)',
            fontSize: '13px',
            fontWeight: '700',
            cursor: 'pointer'
          }}
        >
          <Plus size={16} /> New Playlist
        </button>
      </div>

      {/* Grid */}
      <div className="responsive-music-grid">

        {/* 1. Liked Songs Card */}
        <div
          onClick={onOpenLikedSongs}
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

          {/* Liked Songs Image */}
          <div
            className="pink-tile"
            style={imageTileStyle}
          >
            <img
              src="/liked.png"
              alt="Liked Songs"
              style={imageStyle}
            />
          </div>

          {/* Liked Songs Details */}
          <div style={{
            marginTop: '12px',
            paddingLeft: '4px',
            minWidth: 0,
            maxWidth: '100%',
            overflow: 'hidden'
          }}>
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
              Liked Songs
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
              {likedTracks.length} songs
            </p>
          </div>
        </div>

        {/* 2. Custom User Playlists */}
        {playlists.map(pl => {
          const count = pl.trackIds
            ? pl.trackIds.length
            : (pl.tracks ? pl.tracks.length : 0);

          const isMenuOpen = activeMenuId === pl.id;

          return (
            <div
              key={pl.id}
              onClick={() => onSelectPlaylist(pl)}
              className="app-card"
              style={{
                padding: '12px',
                display: 'flex',
                flexDirection: 'column',
                cursor: 'pointer',
                position: 'relative',
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

              {/* Top-Right 3-Dot Options Menu */}
              <div
                style={{
                  position: 'absolute',
                  top: '16px',
                  right: '16px',
                  zIndex: 10
                }}
                onClick={(e) => e.stopPropagation()}
                ref={isMenuOpen ? menuRef : null}
              >
                <button
                  onClick={() => setActiveMenuId(isMenuOpen ? null : pl.id)}
                  style={{
                    width: '30px',
                    height: '30px',
                    borderRadius: '50%',
                    backgroundColor: 'rgba(255, 255, 255, 0.85)',
                    backdropFilter: 'blur(4px)',
                    border: '1px solid rgba(0, 0, 0, 0.06)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    cursor: 'pointer',
                    color: 'var(--text-main)'
                  }}
                >
                  <MoreVertical size={16} />
                </button>

                {/* Dropdown Menu */}
                {isMenuOpen && (
                  <div style={{
                    position: 'absolute',
                    top: '100%',
                    right: 0,
                    width: '160px',
                    backgroundColor: '#ffffff',
                    border: '1px solid rgba(0, 0, 0, 0.08)',
                    borderRadius: '12px',
                    boxShadow: '0 8px 24px rgba(0, 0, 0, 0.12)',
                    padding: '6px',
                    zIndex: 20,
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '2px'
                  }}>

                    {/* Edit Playlist */}
                    <button
                      onClick={() => {
                        setActiveMenuId(null);
                        onEditPlaylist(pl);
                      }}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '8px',
                        padding: '8px 10px',
                        background: 'none',
                        border: 'none',
                        color: 'var(--text-main)',
                        fontSize: '13px',
                        fontWeight: '600',
                        cursor: 'pointer',
                        borderRadius: '8px',
                        textAlign: 'left'
                      }}
                      onMouseEnter={(e) =>
                        e.currentTarget.style.backgroundColor = '#faf8f5'
                      }
                      onMouseLeave={(e) =>
                        e.currentTarget.style.backgroundColor = 'transparent'
                      }
                    >
                      <Edit3 size={14} color="#3b82f6" />
                      Edit playlist
                    </button>

                    {/* Delete Playlist */}
                    <button
                      onClick={() => {
                        setActiveMenuId(null);
                        onDeletePlaylist(pl.id);
                      }}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '8px',
                        padding: '8px 10px',
                        background: 'none',
                        border: 'none',
                        color: '#dc2626',
                        fontSize: '13px',
                        fontWeight: '600',
                        cursor: 'pointer',
                        borderRadius: '8px',
                        textAlign: 'left'
                      }}
                      onMouseEnter={(e) =>
                        e.currentTarget.style.backgroundColor = '#fee2e2'
                      }
                      onMouseLeave={(e) =>
                        e.currentTarget.style.backgroundColor = 'transparent'
                      }
                    >
                      <Trash2 size={14} color="#dc2626" />
                      Delete playlist
                    </button>

                  </div>
                )}
              </div>

              {/* Fixed Playlist Image */}
              <div
                className="pink-tile"
                style={imageTileStyle}
              >
                <img
                  src="/playlists.png"
                  alt="Playlist"
                  style={imageStyle}
                />
              </div>

              {/* Playlist Details */}
              <div style={{
                marginTop: '12px',
                paddingLeft: '4px',
                minWidth: 0,
                maxWidth: '100%',
                overflow: 'hidden'
              }}>
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
                  {pl.name}
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
                  {count} songs
                </p>
              </div>

            </div>
          );
        })}

      </div>
    </div>
  );
}

