import React from 'react';

// Directly reference user images from public folder
export const arrowImg = '/back.png';
export const playImg = '/play.png';
export const pauseImg = '/pause.png';
export const nextImg = '/next.png';
export const prevImg = '/previous.png';

const commonStyle = {
  objectFit: 'contain',
  mixBlendMode: 'multiply',
  display: 'block',
  userSelect: 'none',
  pointerEvents: 'none'
};

export function ArrowBackIcon({ size = 26, style = {}, alt = "Back" }) {
  return (
    <img
      src={arrowImg}
      alt={alt}
      className="blend-multiply"
      style={{
        width: `${size}px`,
        height: `${size}px`,
        ...commonStyle,
        ...style
      }}
    />
  );
}

export function PlayIcon({ size = 64, style = {}, alt = "Play" }) {
  return (
    <img
      src={playImg}
      alt={alt}
      className="blend-multiply"
      style={{
        width: `${size}px`,
        height: `${size}px`,
        ...commonStyle,
        ...style
      }}
    />
  );
}

export function PauseIcon({ size = 64, style = {}, alt = "Pause" }) {
  return (
    <img
      src={pauseImg}
      alt={alt}
      className="blend-multiply"
      style={{
        width: `${size}px`,
        height: `${size}px`,
        ...commonStyle,
        ...style
      }}
    />
  );
}

export function PlayPauseIcon({ isPlaying, size = 64, style = {} }) {
  return isPlaying ? (
    <PauseIcon size={size} style={style} />
  ) : (
    <PlayIcon size={size} style={style} />
  );
}

export function NextTrackIcon({ size = 26, style = {}, alt = "Next" }) {
  return (
    <img
      src={nextImg}
      alt={alt}
      className="blend-multiply"
      style={{
        width: `${size}px`,
        height: `${size}px`,
        ...commonStyle,
        ...style
      }}
    />
  );
}

export function PrevTrackIcon({ size = 26, style = {}, alt = "Previous" }) {
  return (
    <img
      src={prevImg}
      alt={alt}
      className="blend-multiply"
      style={{
        width: `${size}px`,
        height: `${size}px`,
        ...commonStyle,
        ...style
      }}
    />
  );
}
