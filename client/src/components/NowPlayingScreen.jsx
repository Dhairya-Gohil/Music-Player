import React, { useState, useRef, useEffect } from 'react';
import {
  ArrowLeft,
  MoreVertical,
  Play,
  Pause,
  SkipBack,
  SkipForward,
  Heart,
  Edit3,
  Plus,
  ListPlus,
  Shuffle,
  Repeat,
  Repeat1,
  Sliders
} from 'lucide-react';
import { MusicNoteLogo } from './MusicIcons';
import { ArrowBackIcon, PlayPauseIcon, NextTrackIcon, PrevTrackIcon } from './PlayerIcons';

function formatTime(secs) {
  if (isNaN(secs) || secs < 0) return '0:00';
  const m = Math.floor(secs / 60);
  const s = Math.floor(secs % 60);
  return `${m}:${s < 10 ? '0' : ''}${s}`;
}

export default function NowPlayingScreen({
  isOpen,
  onClose,
  currentTrack,
  isPlaying,
  onTogglePlay,
  onPrev,
  onNext,
  currentTime,
  duration,
  onSeek,
  isLiked,
  onToggleLike,
  onEditSong,
  onOpenCreatePlaylist,
  playlists = [],
  onAddToPlaylist,
  onSaveTrack,
  isShuffle = false,
  onToggleShuffle,
  repeatMode = 'off',
  onToggleRepeat,
  onOpenEqualizer
}) {
  const [moreMenuOpen, setMoreMenuOpen] = useState(false);
  const [playlistSubmenuOpen, setPlaylistSubmenuOpen] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [dragTime, setDragTime] = useState(0);
  const [toastMessage, setToastMessage] = useState(null);
  const toastTimerRef = useRef(null);
  const progressBarRef = useRef(null);

  useEffect(() => {
    return () => {
      if (toastTimerRef.current) clearTimeout(toastTimerRef.current);
    };
  }, []);

  const triggerToast = (msg) => {
    if (toastTimerRef.current) clearTimeout(toastTimerRef.current);
    setToastMessage(msg);
    toastTimerRef.current = setTimeout(() => {
      setToastMessage(null);
    }, 1800);
  };

  const handleShuffleClick = () => {
    if (onToggleShuffle) {
      onToggleShuffle();
      triggerToast({
        icon: <Shuffle size={16} color="#ffffff" strokeWidth={2.5} />,
        text: !isShuffle ? "Shuffle ON (Randomized)" : "Shuffle OFF (Sequential)"
      });
    }
  };

  const handleRepeatClick = () => {
    if (onToggleRepeat) {
      const next = repeatMode === 'off' ? 'all' : repeatMode === 'all' ? 'one' : 'off';
      onToggleRepeat();
      if (next === 'all') {
        triggerToast({
          icon: <Repeat size={16} color="#ffffff" strokeWidth={2.5} />,
          text: "Repeat ALL (Looping Playlist)"
        });
      } else if (next === 'one') {
        triggerToast({
          icon: <Repeat1 size={16} color="#ffffff" strokeWidth={2.5} />,
          text: "Repeat ONE (Looping Song)"
        });
      } else {
        triggerToast({
          icon: <Repeat size={16} color="#ffffff" strokeWidth={2.5} style={{ opacity: 0.7 }} />,
          text: "Repeat OFF"
        });
      }
    }
  };

  if (!isOpen || !currentTrack) return null;

  const calculateSeekTime = (clientX) => {
    if (!progressBarRef.current || !duration) return 0;
    const rect = progressBarRef.current.getBoundingClientRect();
    const pos = Math.max(0, Math.min(1, (clientX - rect.left) / rect.width));
    return pos * duration;
  };

  const handlePointerDown = (e) => {
    setIsDragging(true);
    const newTime = calculateSeekTime(e.clientX);
    setDragTime(newTime);
  };

  const handlePointerMove = (e) => {
    if (isDragging) {
      const newTime = calculateSeekTime(e.clientX);
      setDragTime(newTime);
    }
  };

  const handlePointerUp = (e) => {
    if (isDragging) {
      const newTime = calculateSeekTime(e.clientX);
      onSeek(newTime);
      setIsDragging(false);
    }
  };

  const displayTime = isDragging ? dragTime : currentTime;
  const progressPercent = duration > 0 ? (displayTime / duration) * 100 : 0;

  return (
    <div 
      className="now-playing-overlay"
      onClick={onClose}
    >
      <div
        className="now-playing-container"
        onClick={(e) => e.stopPropagation()}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
      >
        {/* Toast Notification Pill for Mode Changes (App Theme Color) */}
      {toastMessage && (
        <div style={{
          position: 'absolute',
          top: '72px',
          left: '50%',
          transform: 'translateX(-50%)',
          backgroundColor: 'var(--accent-pink, #e0246a)',
          color: '#ffffff',
          padding: '8px 20px',
          borderRadius: '9999px',
          fontSize: '13px',
          fontWeight: '700',
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          boxShadow: '0 8px 24px rgba(224, 36, 106, 0.35)',
          zIndex: 300,
          pointerEvents: 'none',
          whiteSpace: 'nowrap',
          animation: 'fadeIn 0.15s ease-out'
        }}>
          {typeof toastMessage === 'object' && toastMessage.icon}
          <span>{typeof toastMessage === 'object' ? toastMessage.text : toastMessage}</span>
        </div>
      )}

      {/* Top Header: Left Pink Arrow (Screenshot 4, multiply blend), Center "NOW PLAYING", Right 3-dots */}
      <header style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <button
          onClick={onClose}
          className="blend-multiply"
          style={{
            background: 'none',
            border: 'none',
            cursor: 'pointer',
            padding: '4px',
            display: 'flex',
            alignItems: 'center',
            mixBlendMode: 'multiply'
          }}
        >
          <ArrowBackIcon size={28} />
        </button>

        <span style={{
          fontSize: '13px',
          fontWeight: '700',
          letterSpacing: '0.12em',
          color: 'var(--text-muted)',
          textTransform: 'uppercase'
        }}>
          NOW PLAYING
        </span>

        {/* 3-Dot More Menu */}
        <div style={{ position: 'relative' }}>
          <button
            onClick={() => setMoreMenuOpen(!moreMenuOpen)}
            style={{
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              color: 'var(--text-main)',
              padding: '8px',
              display: 'flex',
              alignItems: 'center'
            }}
          >
            <MoreVertical size={22} />
          </button>

          {/* Screenshot 5: More Options Menu Popup */}
          {moreMenuOpen && (
            <div style={{
              position: 'absolute',
              top: '100%',
              right: 0,
              width: '230px',
              backgroundColor: '#ffffff',
              border: '1px solid rgba(0, 0, 0, 0.08)',
              borderRadius: '16px',
              boxShadow: '0 12px 36px rgba(0, 0, 0, 0.14)',
              padding: '8px',
              zIndex: 110,
              display: 'flex',
              flexDirection: 'column',
              gap: '4px'
            }}>
              {/* Shuffle Toggle */}
              {onToggleShuffle && (
                <button
                  onClick={() => {
                    handleShuffleClick();
                    setMoreMenuOpen(false);
                  }}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '12px 14px',
                    background: 'none',
                    border: 'none',
                    color: isShuffle ? 'var(--accent-pink)' : 'var(--text-main)',
                    fontSize: '14px',
                    fontWeight: '600',
                    cursor: 'pointer',
                    borderRadius: '10px',
                    textAlign: 'left'
                  }}
                  onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#faf8f5'}
                  onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
                >
                  <span style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <Shuffle size={17} color={isShuffle ? 'var(--accent-pink)' : '#111827'} /> Shuffle
                  </span>
                  <span style={{
                    fontSize: '11px',
                    fontWeight: '700',
                    color: isShuffle ? '#e0246a' : '#6b7280',
                    backgroundColor: isShuffle ? '#fdeef1' : '#f3f4f6',
                    padding: '2px 8px',
                    borderRadius: '9999px'
                  }}>
                    {isShuffle ? 'ON' : 'OFF'}
                  </span>
                </button>
              )}

              {/* Repeat Mode Toggle */}
              {onToggleRepeat && (
                <button
                  onClick={() => {
                    handleRepeatClick();
                    setMoreMenuOpen(false);
                  }}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '12px 14px',
                    background: 'none',
                    border: 'none',
                    color: repeatMode !== 'off' ? 'var(--accent-pink)' : 'var(--text-main)',
                    fontSize: '14px',
                    fontWeight: '600',
                    cursor: 'pointer',
                    borderRadius: '10px',
                    textAlign: 'left'
                  }}
                  onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#faf8f5'}
                  onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
                >
                  <span style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    {repeatMode === 'one' ? (
                      <Repeat1 size={17} color="var(--accent-pink)" />
                    ) : (
                      <Repeat size={17} color={repeatMode !== 'off' ? 'var(--accent-pink)' : '#111827'} />
                    )}
                    Repeat
                  </span>
                  <span style={{
                    fontSize: '11px',
                    fontWeight: '700',
                    color: repeatMode === 'one' ? '#ffffff' : repeatMode === 'all' ? '#e0246a' : '#6b7280',
                    backgroundColor: repeatMode === 'one' ? '#e0246a' : repeatMode === 'all' ? '#fdeef1' : '#f3f4f6',
                    padding: '2px 8px',
                    borderRadius: '9999px',
                    textTransform: 'uppercase'
                  }}>
                    {repeatMode}
                  </span>
                </button>
              )}

              <button
                onClick={() => {
                  setMoreMenuOpen(false);
                  onEditSong(currentTrack);
                }}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '12px',
                  padding: '12px 14px',
                  background: 'none',
                  border: 'none',
                  color: 'var(--text-main)',
                  fontSize: '14px',
                  fontWeight: '600',
                  cursor: 'pointer',
                  borderRadius: '10px',
                  textAlign: 'left'
                }}
                onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#faf8f5'}
                onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
              >
                <Edit3 size={17} color="#111827" /> Edit song info
              </button>

              {onOpenEqualizer && (
                <button
                  onClick={() => {
                    setMoreMenuOpen(false);
                    onOpenEqualizer();
                  }}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '12px',
                    padding: '12px 14px',
                    background: 'none',
                    border: 'none',
                    color: 'var(--text-main)',
                    fontSize: '14px',
                    fontWeight: '600',
                    cursor: 'pointer',
                    borderRadius: '10px',
                    textAlign: 'left'
                  }}
                  onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#faf8f5'}
                  onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
                >
                  <Sliders size={17} color="#e0246a" /> Studio Equalizer
                </button>
              )}



              <button
                onClick={() => setPlaylistSubmenuOpen(!playlistSubmenuOpen)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '12px 14px',
                  background: 'none',
                  border: 'none',
                  color: 'var(--text-main)',
                  fontSize: '14px',
                  fontWeight: '600',
                  cursor: 'pointer',
                  borderRadius: '10px',
                  textAlign: 'left'
                }}
                onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#faf8f5'}
                onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
              >
                <span style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <ListPlus size={17} color="#111827" /> Add to existing playlist
                </span>
                <span style={{ fontSize: '12px', color: 'var(--text-dim)' }}>›</span>
              </button>

              {/* Submenu for playlists */}
              {playlistSubmenuOpen && (
                <div style={{
                  backgroundColor: '#f5f3ef',
                  borderRadius: '10px',
                  padding: '6px',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '2px'
                }}>
                  {playlists.length === 0 ? (
                    <span style={{ fontSize: '12px', color: 'var(--text-dim)', padding: '6px' }}>No playlists</span>
                  ) : (
                    playlists.map(pl => (
                      <button
                        key={pl.id}
                        onClick={() => {
                          onAddToPlaylist(pl.id, currentTrack.id);
                          setMoreMenuOpen(false);
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
                          textAlign: 'left'
                        }}
                      >
                        {pl.name}
                      </button>
                    ))
                  )}
                </div>
              )}

              <button
                onClick={() => {
                  setMoreMenuOpen(false);
                  onOpenCreatePlaylist();
                }}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '12px',
                  padding: '12px 14px',
                  background: 'none',
                  border: 'none',
                  color: 'var(--text-main)',
                  fontSize: '14px',
                  fontWeight: '600',
                  cursor: 'pointer',
                  borderRadius: '10px',
                  textAlign: 'left'
                }}
                onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#faf8f5'}
                onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
              >
                <Plus size={17} color="#111827" /> Create a playlist
              </button>
            </div>
          )}
        </div>
      </header>

      {/* Main Center Stage: Artwork (Screenshot 4) */}
      <div style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: '24px',
        margin: 'auto 0'
      }}>
        {/* Soft Pink Large Square Tile with Note Logo (Screenshot 4) */}
        <div
          style={{
            width: '320px',
            height: '320px',
            maxWidth: '85vw',
            maxHeight: '42vh',
            borderRadius: '28px',
            backgroundColor: '#fdeef1',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            position: 'relative',
            overflow: 'hidden',
            boxShadow: '0 8px 30px rgba(224, 36, 106, 0.08)'
          }}
        >
          <img
            src={currentTrack.coverUrl || '/pink_image.png'}
            alt={currentTrack.title}
            style={{ width: '100%', height: '100%', objectFit: 'cover' }}
            onError={(e) => {
              if (e.target.src !== window.location.origin + '/pink_image.png') {
                e.target.src = '/pink_image.png';
              }
            }}
          />
        </div>

        {/* Title, Artist, & Heart Like */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          width: '100%',
          maxWidth: '360px',
          padding: '0 4px'
        }}>
          <div style={{ overflow: 'hidden', flex: 1 }}>
            <h2 style={{
              fontSize: '22px',
              fontWeight: '800',
              color: 'var(--text-main)',
              margin: '0 0 4px 0',
              whiteSpace: 'nowrap',
              overflow: 'hidden',
              textOverflow: 'ellipsis'
            }}>
              {currentTrack.title}
            </h2>
            <p style={{
              fontSize: '15px',
              color: 'var(--text-muted)',
              margin: 0,
              whiteSpace: 'nowrap',
              overflow: 'hidden',
              textOverflow: 'ellipsis'
            }}>
              {currentTrack.artist}
            </p>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            {onOpenEqualizer && (
              <button
                onClick={onOpenEqualizer}
                title="Open Studio Equalizer"
                style={{
                  background: '#f8fafc',
                  border: '1px solid #e2e8f0',
                  borderRadius: '50%',
                  width: '36px',
                  height: '36px',
                  cursor: 'pointer',
                  color: '#475569',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  transition: 'all 0.15s ease'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = '#fdeef1';
                  e.currentTarget.style.color = '#e0246a';
                  e.currentTarget.style.borderColor = '#fecdd3';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = '#f8fafc';
                  e.currentTarget.style.color = '#475569';
                  e.currentTarget.style.borderColor = '#e2e8f0';
                }}
              >
                <Sliders size={18} />
              </button>
            )}



            <button
              onClick={() => onToggleLike(currentTrack.id)}
              style={{
                background: 'none',
                border: 'none',
                cursor: 'pointer',
                padding: '6px',
                color: isLiked ? '#e0246a' : 'var(--text-dim)',
                display: 'flex',
                alignItems: 'center'
              }}
            >
              <Heart size={26} fill={isLiked ? '#e0246a' : 'none'} color={isLiked ? '#e0246a' : 'currentColor'} />
            </button>
          </div>
        </div>
      </div>

      {/* Bottom Area: Progress Bar, Controls, "Music" footer */}
      <div style={{
        display: 'flex',
        flexDirection: 'column',
        gap: '24px',
        width: '100%',
        maxWidth: '380px',
        margin: '0 auto'
      }}>
        {/* Progress Scrubber */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
          <div
            ref={progressBarRef}
            onPointerDown={handlePointerDown}
            style={{
              height: '16px',
              display: 'flex',
              alignItems: 'center',
              cursor: 'pointer',
              position: 'relative'
            }}
          >
            {/* Track Background */}
            <div style={{
              width: '100%',
              height: '3px',
              borderRadius: '9999px',
              backgroundColor: '#e5e5ea',
              position: 'relative',
              overflow: 'hidden'
            }}>
              <div style={{
                position: 'absolute',
                top: 0,
                bottom: 0,
                left: 0,
                width: `${progressPercent}%`,
                backgroundColor: 'var(--accent-red)',
                borderRadius: '9999px'
              }} />
            </div>

            {/* Scrubber Knob */}
            <div style={{
              position: 'absolute',
              left: `${progressPercent}%`,
              transform: 'translateX(-50%)',
              width: '8px',
              height: '8px',
              borderRadius: '50%',
              backgroundColor: 'var(--accent-red)',
              boxShadow: '0 1px 3px rgba(0, 0, 0, 0.3)',
              pointerEvents: 'none'
            }} />
          </div>

          {/* Timestamps */}
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px', color: 'var(--text-muted)' }}>
            <span>{formatTime(displayTime)}</span>
            <span>{formatTime(duration || 335)}</span>
          </div>
        </div>

        {/* Controls: Shuffle, Prev, Big Pink Play/Pause, Next, Repeat with multiply blend */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          width: '100%',
          maxWidth: '340px',
          margin: '0 auto'
        }}>
          {/* Shuffle Button */}
          <button
            onClick={handleShuffleClick}
            title={isShuffle ? "Shuffle is ON (Click to turn OFF)" : "Shuffle is OFF (Click to turn ON)"}
            style={{
              width: '44px',
              height: '44px',
              borderRadius: '50%',
              backgroundColor: isShuffle ? '#fdeef1' : 'transparent',
              border: isShuffle ? '1.5px solid rgba(224, 36, 106, 0.4)' : '1.5px solid transparent',
              cursor: 'pointer',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              position: 'relative',
              transition: 'all 0.15s ease',
              boxShadow: isShuffle ? '0 2px 10px rgba(224, 36, 106, 0.18)' : 'none'
            }}
          >
            <Shuffle size={20} color={isShuffle ? '#e0246a' : '#8e8e93'} />
            {isShuffle && (
              <span style={{
                position: 'absolute',
                bottom: '4px',
                width: '4px',
                height: '4px',
                borderRadius: '50%',
                backgroundColor: '#e0246a'
              }} />
            )}
          </button>

          {/* Previous Button */}
          <button
            onClick={() => onPrev?.()}
            className="blend-multiply"
            title="Previous track"
            style={{
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              padding: '6px',
              mixBlendMode: 'multiply',
              transition: 'transform 0.1s ease'
            }}
            onMouseDown={(e) => e.currentTarget.style.transform = 'scale(0.9)'}
            onMouseUp={(e) => e.currentTarget.style.transform = 'scale(1)'}
          >
            <PrevTrackIcon size={32} />
          </button>

          {/* Big Pink Circular Play/Pause Button */}
          <button
            onClick={onTogglePlay}
            className="blend-multiply"
            title={isPlaying ? "Pause" : "Play"}
            style={{
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              padding: 0,
              mixBlendMode: 'multiply',
              transform: 'scale(1)',
              transition: 'transform 0.12s ease'
            }}
            onMouseDown={(e) => e.currentTarget.style.transform = 'scale(0.93)'}
            onMouseUp={(e) => e.currentTarget.style.transform = 'scale(1)'}
          >
            <PlayPauseIcon isPlaying={isPlaying} size={76} />
          </button>

          {/* Next Button */}
          <button
            onClick={() => onNext?.()}
            className="blend-multiply"
            title="Next track"
            style={{
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              padding: '6px',
              mixBlendMode: 'multiply',
              transition: 'transform 0.1s ease'
            }}
            onMouseDown={(e) => e.currentTarget.style.transform = 'scale(0.9)'}
            onMouseUp={(e) => e.currentTarget.style.transform = 'scale(1)'}
          >
            <NextTrackIcon size={32} />
          </button>

          {/* Repeat Button */}
          <button
            onClick={handleRepeatClick}
            title={`Repeat mode: ${repeatMode.toUpperCase()} (Click to toggle)`}
            style={{
              width: '44px',
              height: '44px',
              borderRadius: '50%',
              backgroundColor: repeatMode === 'one' ? '#e0246a' : repeatMode === 'all' ? '#fdeef1' : 'transparent',
              border: repeatMode === 'one' ? '1.5px solid #cc1e5d' : repeatMode === 'all' ? '1.5px solid rgba(224, 36, 106, 0.4)' : '1.5px solid transparent',
              cursor: 'pointer',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              position: 'relative',
              transition: 'all 0.15s ease',
              boxShadow: repeatMode !== 'off' ? '0 2px 10px rgba(224, 36, 106, 0.18)' : 'none'
            }}
          >
            {repeatMode === 'one' ? (
              <div style={{ position: 'relative', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Repeat1 size={20} color="#ffffff" />
                <span style={{
                  position: 'absolute',
                  top: '-4px',
                  right: '-6px',
                  fontSize: '9px',
                  fontWeight: '900',
                  color: '#ffffff',
                  backgroundColor: '#99113e',
                  borderRadius: '50%',
                  width: '12px',
                  height: '12px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}>1</span>
              </div>
            ) : (
              <>
                <Repeat size={20} color={repeatMode === 'all' ? '#e0246a' : '#8e8e93'} />
                {repeatMode === 'all' && (
                  <span style={{
                    position: 'absolute',
                    bottom: '4px',
                    width: '4px',
                    height: '4px',
                    borderRadius: '50%',
                    backgroundColor: '#e0246a'
                  }} />
                )}
              </>
            )}
          </button>
        </div>

      </div>
    </div>
  </div>
  );
}
