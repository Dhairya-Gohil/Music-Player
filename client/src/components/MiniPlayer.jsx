import React from 'react';
import { Heart } from 'lucide-react';
import { MusicNoteLogo } from './MusicIcons';
import { PlayPauseIcon, NextTrackIcon, PrevTrackIcon } from './PlayerIcons';

export default function MiniPlayer({
  currentTrack,
  isPlaying,
  onTogglePlay,
  onPrev,
  onNext,
  onOpenNowPlaying,
  isLiked,
  onToggleLike,
  currentTime = 0,
  duration = 0,
  onSeek
}) {
  if (!currentTrack) return null;

  const progressPercent = duration > 0 ? Math.min(100, Math.max(0, (currentTime / duration) * 100)) : 0;

  return (
    <div
      onClick={onOpenNowPlaying}
      style={{
        position: 'fixed',
        bottom: '80px',
        left: '50%',
        transform: 'translateX(-50%)',
        width: 'calc(100% - 20px)',
        maxWidth: '460px',
        height: '62px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '0 14px',
        zIndex: 45,
        cursor: 'pointer',
        backgroundColor: 'rgba(255, 255, 255, 0.96)',
        backdropFilter: 'blur(16px)',
        borderRadius: '20px',
        border: '1px solid rgba(226, 232, 240, 0.9)',
        boxShadow: '0 12px 28px -4px rgba(15, 23, 42, 0.12), 0 2px 6px -1px rgba(15, 23, 42, 0.04)',
        overflow: 'hidden',
        transition: 'transform 0.15s ease, box-shadow 0.15s ease'
      }}
    >
      {/* Top Lined Progress Bar */}
      <div
        onClick={(e) => {
          if (onSeek && duration > 0) {
            e.stopPropagation();
            const rect = e.currentTarget.getBoundingClientRect();
            const clickPos = Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width));
            onSeek(clickPos * duration);
          }
        }}
        title="Playback progress"
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          height: '2.5px',
          backgroundColor: '#f1f5f9',
          overflow: 'hidden',
          cursor: 'pointer'
        }}
      >
        <div style={{
          width: `${progressPercent}%`,
          height: '100%',
          backgroundColor: '#e0246a',
          transition: 'width 0.2s linear'
        }} />
      </div>
      {/* Left: Thumbnail & Song Details */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px', minWidth: 0, flex: 1 }}>
        <div style={{
          width: '46px',
          height: '46px',
          borderRadius: '12px',
          overflow: 'hidden',
          backgroundColor: '#fdeef1',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          flexShrink: 0
        }}>
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

        <div style={{ overflow: 'hidden', paddingRight: '8px' }}>
          <h4 style={{
            fontSize: '14px',
            fontWeight: '700',
            color: 'var(--text-main)',
            margin: 0,
            whiteSpace: 'nowrap',
            overflow: 'hidden',
            textOverflow: 'ellipsis'
          }}>
            {currentTrack.title}
          </h4>
          <p style={{
            fontSize: '12px',
            color: 'var(--text-muted)',
            margin: '2px 0 0 0',
            whiteSpace: 'nowrap',
            overflow: 'hidden',
            textOverflow: 'ellipsis'
          }}>
            {currentTrack.artist}
          </p>
        </div>
      </div>

      {/* Right: Controls */}
      <div
        style={{ display: 'flex', alignItems: 'center', gap: '8px', flexShrink: 0 }}
        onClick={(e) => e.stopPropagation()}
      >
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
          title={isLiked ? "Unlike" : "Like"}
        >
          <Heart size={20} fill={isLiked ? '#e0246a' : 'none'} color={isLiked ? '#e0246a' : 'currentColor'} />
        </button>

        {onPrev && (
          <button
            onClick={() => onPrev?.()}
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
            title="Previous track"
          >
            <PrevTrackIcon size={22} />
          </button>
        )}

        <button
          onClick={onTogglePlay}
          className="blend-multiply"
          style={{
            background: 'none',
            border: 'none',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: 0,
            mixBlendMode: 'multiply'
          }}
          title={isPlaying ? "Pause" : "Play"}
        >
          <PlayPauseIcon isPlaying={isPlaying} size={40} />
        </button>

        <button
          onClick={() => onNext?.()}
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
          title="Next track"
        >
          <NextTrackIcon size={22} />
        </button>
      </div>
    </div>
  );
}
