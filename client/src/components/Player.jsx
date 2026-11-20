import React from 'react';
import { 
  Play, 
  Pause, 
  SkipBack, 
  SkipForward, 
  Shuffle, 
  Repeat, 
  Repeat1, 
  Volume2, 
  VolumeX, 
  Volume1, 
  Heart, 
  Sliders,
  Maximize2,
  Edit3
} from 'lucide-react';

function formatTime(secs) {
  if (isNaN(secs) || secs < 0) return '0:00';
  const m = Math.floor(secs / 60);
  const s = Math.floor(secs % 60);
  return `${m}:${s < 10 ? '0' : ''}${s}`;
}

export default function Player({
  currentTrack,
  isPlaying,
  onTogglePlay,
  onPrev,
  onNext,
  currentTime,
  duration,
  onSeek,
  volume = 0.85,
  onChangeVolume,
  isMuted = false,
  onToggleMute,
  isShuffle = false,
  onToggleShuffle,
  repeatMode = 'off',
  onToggleRepeat,
  isLiked = false,
  onToggleLike,
  onOpenEqualizer,
  onOpenNowPlaying,
  onEditSong
}) {
  if (!currentTrack) {
    return (
      <footer style={{
        position: 'fixed',
        bottom: 0,
        left: 0,
        right: 0,
        height: '84px',
        backgroundColor: '#ffffff',
        borderTop: '1px solid rgba(0, 0, 0, 0.08)',
        boxShadow: '0 -4px 20px rgba(0, 0, 0, 0.04)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '0 28px',
        zIndex: 90,
        color: '#94a3b8',
        fontSize: '13px',
        fontWeight: '600'
      }}>
        Select a track or press Play to start listening 🎶
      </footer>
    );
  }

  const progressPercent = duration ? Math.min(100, Math.max(0, (currentTime / duration) * 100)) : 0;
  const volumePercent = (isMuted ? 0 : volume) * 100;

  return (
    <footer style={{
      position: 'fixed',
      bottom: 0,
      left: 0,
      right: 0,
      height: '84px',
      backgroundColor: '#ffffff',
      borderTop: '1px solid rgba(0, 0, 0, 0.08)',
      boxShadow: '0 -4px 20px rgba(0, 0, 0, 0.04)',
      display: 'grid',
      gridTemplateColumns: 'minmax(200px, 1fr) minmax(360px, 2fr) minmax(200px, 1fr)',
      alignItems: 'center',
      padding: '0 28px',
      zIndex: 90,
      gap: '24px',
      userSelect: 'none'
    }}>
      {/* 1. Left: Track Info & Like / Edit */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px', minWidth: 0 }}>
        {/* Cover thumbnail */}
        <div 
          onClick={onOpenNowPlaying}
          title="Click to expand Now Playing"
          style={{
            width: '50px',
            height: '50px',
            borderRadius: '12px',
            overflow: 'hidden',
            flexShrink: 0,
            backgroundColor: '#fdeef1',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: '0 2px 8px rgba(0, 0, 0, 0.06)',
            cursor: 'pointer'
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

        {/* Title & Artist */}
        <div style={{ overflow: 'hidden', flex: 1, minWidth: 0 }}>
          <h4 
            onClick={onOpenNowPlaying}
            title={currentTrack.title}
            style={{
              fontSize: '13.5px',
              fontWeight: '700',
              color: '#0f172a',
              margin: '0 0 2px 0',
              whiteSpace: 'nowrap',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              cursor: 'pointer'
            }}
          >
            {currentTrack.title}
          </h4>
          <p 
            title={currentTrack.artist}
            style={{
              fontSize: '12px',
              color: '#64748b',
              margin: 0,
              whiteSpace: 'nowrap',
              overflow: 'hidden',
              textOverflow: 'ellipsis'
            }}
          >
            {currentTrack.artist} {currentTrack.album ? `• ${currentTrack.album}` : ''}
          </p>
        </div>

        {/* Like Heart Button */}
        <button
          onClick={() => onToggleLike && onToggleLike(currentTrack.id)}
          title={isLiked ? "Unlike" : "Like"}
          style={{
            background: 'none',
            border: 'none',
            cursor: 'pointer',
            padding: '6px',
            color: isLiked ? '#e0246a' : '#94a3b8',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            transition: 'transform 0.1s ease'
          }}
          onMouseDown={(e) => e.currentTarget.style.transform = 'scale(0.9)'}
          onMouseUp={(e) => e.currentTarget.style.transform = 'scale(1)'}
        >
          <Heart size={18} fill={isLiked ? '#e0246a' : 'none'} color={isLiked ? '#e0246a' : '#94a3b8'} />
        </button>

        {/* Edit Song Info Button */}
        {onEditSong && (
          <button
            onClick={() => onEditSong(currentTrack)}
            title="Edit song metadata"
            style={{
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              padding: '6px',
              color: '#94a3b8',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}
            onMouseEnter={(e) => e.currentTarget.style.color = '#3b82f6'}
            onMouseLeave={(e) => e.currentTarget.style.color = '#94a3b8'}
          >
            <Edit3 size={16} />
          </button>
        )}
      </div>

      {/* 2. Middle: Controls & Progress Scrubber */}
      <div style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: '6px',
        width: '100%',
        maxWidth: '540px',
        margin: '0 auto'
      }}>
        {/* Buttons Row */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '18px' }}>
          {/* Shuffle Button */}
          <button
            onClick={onToggleShuffle}
            title={isShuffle ? "Shuffle ON" : "Shuffle OFF"}
            style={{
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              color: isShuffle ? '#e0246a' : '#94a3b8',
              display: 'flex',
              alignItems: 'center',
              padding: '4px',
              transition: 'color 0.15s ease'
            }}
          >
            <Shuffle size={16} />
          </button>

          {/* Previous Track */}
          <button
            onClick={onPrev}
            title="Previous Track"
            style={{
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              color: '#0f172a',
              display: 'flex',
              alignItems: 'center',
              padding: '4px'
            }}
          >
            <SkipBack size={19} />
          </button>

          {/* Circular Play / Pause Button */}
          <button
            onClick={onTogglePlay}
            title={isPlaying ? "Pause" : "Play"}
            style={{
              width: '40px',
              height: '40px',
              borderRadius: '50%',
              background: 'linear-gradient(135deg, #e0246a, #cc3344)',
              border: 'none',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#ffffff',
              boxShadow: '0 3px 12px rgba(224, 36, 106, 0.3)',
              transform: 'scale(1)',
              transition: 'transform 0.12s ease'
            }}
            onMouseDown={(e) => e.currentTarget.style.transform = 'scale(0.93)'}
            onMouseUp={(e) => e.currentTarget.style.transform = 'scale(1)'}
          >
            {isPlaying ? (
              <Pause size={18} fill="#ffffff" />
            ) : (
              <Play size={18} fill="#ffffff" style={{ marginLeft: '2px' }} />
            )}
          </button>

          {/* Next Track */}
          <button
            onClick={onNext}
            title="Next Track"
            style={{
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              color: '#0f172a',
              display: 'flex',
              alignItems: 'center',
              padding: '4px'
            }}
          >
            <SkipForward size={19} />
          </button>

          {/* Repeat Button */}
          <button
            onClick={onToggleRepeat}
            title={`Repeat: ${repeatMode.toUpperCase()}`}
            style={{
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              color: repeatMode !== 'off' ? '#e0246a' : '#94a3b8',
              display: 'flex',
              alignItems: 'center',
              padding: '4px',
              transition: 'color 0.15s ease'
            }}
          >
            {repeatMode === 'one' ? <Repeat1 size={16} /> : <Repeat size={16} />}
          </button>
        </div>

        {/* Scrubber Bar */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', width: '100%' }}>
          <span style={{
            fontSize: '11px',
            color: '#64748b',
            minWidth: '32px',
            textAlign: 'right',
            fontVariantNumeric: 'tabular-nums'
          }}>
            {formatTime(currentTime)}
          </span>

          <div style={{ position: 'relative', flex: 1, display: 'flex', alignItems: 'center' }}>
            <input 
              type="range"
              min="0"
              max={duration || 100}
              step="0.1"
              value={currentTime || 0}
              onChange={(e) => onSeek && onSeek(parseFloat(e.target.value))}
              style={{
                width: '100%',
                height: '4px',
                background: `linear-gradient(to right, #e0246a 0%, #e0246a ${progressPercent}%, #e2e8f0 ${progressPercent}%, #e2e8f0 100%)`,
                borderRadius: '9999px'
              }}
            />
          </div>

          <span style={{
            fontSize: '11px',
            color: '#64748b',
            minWidth: '32px',
            fontVariantNumeric: 'tabular-nums'
          }}>
            {formatTime(duration)}
          </span>
        </div>
      </div>

      {/* 3. Right: FX Buttons & Volume Slider */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: '12px' }}>
        {/* Equalizer */}
        {onOpenEqualizer && (
          <button
            onClick={onOpenEqualizer}
            title="Open Equalizer (EQ)"
            style={{
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              color: '#64748b',
              display: 'flex',
              alignItems: 'center',
              padding: '6px',
              borderRadius: '8px',
              transition: 'all 0.12s ease'
            }}
            onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#f8fafc'}
            onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
          >
            <Sliders size={17} />
          </button>
        )}


        {/* Fullscreen / Expand Now Playing */}
        {onOpenNowPlaying && (
          <button
            onClick={onOpenNowPlaying}
            title="Maximize Now Playing View"
            style={{
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              color: '#64748b',
              display: 'flex',
              alignItems: 'center',
              padding: '6px',
              borderRadius: '8px',
              transition: 'all 0.12s ease'
            }}
            onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#f8fafc'}
            onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
          >
            <Maximize2 size={17} />
          </button>
        )}

        {/* Volume Control */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', minWidth: '110px' }}>
          <button
            onClick={onToggleMute}
            title={isMuted ? "Unmute" : "Mute"}
            style={{
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              color: '#64748b',
              display: 'flex',
              alignItems: 'center',
              padding: '4px'
            }}
          >
            {isMuted || volume === 0 ? (
              <VolumeX size={17} color="#e0246a" />
            ) : volume < 0.5 ? (
              <Volume1 size={17} />
            ) : (
              <Volume2 size={17} />
            )}
          </button>

          <input 
            type="range"
            min="0"
            max="1"
            step="0.01"
            value={isMuted ? 0 : volume}
            onChange={(e) => onChangeVolume && onChangeVolume(parseFloat(e.target.value))}
            style={{
              width: '80px',
              height: '4px',
              background: `linear-gradient(to right, #e0246a 0%, #e0246a ${volumePercent}%, #e2e8f0 ${volumePercent}%, #e2e8f0 100%)`,
              borderRadius: '9999px'
            }}
          />
        </div>
      </div>
    </footer>
  );
}
