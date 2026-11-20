import React from 'react';

// App Music Note Logo from /public/music.png
export function MusicNoteLogo({ size = 48, className = "", style = {} }) {
  return (
    <img
      src="/music.png"
      alt="Music Logo"
      className={`blend-multiply ${className}`}
      style={{
        width: `${size}px`,
        height: `${size}px`,
        objectFit: 'contain',
        mixBlendMode: 'multiply',
        display: 'block',
        userSelect: 'none',
        pointerEvents: 'none',
        ...style
      }}
    />
  );
}

// Artist Icon (User avatar with music note - Screenshot 3)
export function ArtistFolderIcon({ size = 56 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
      {/* Head */}
      <circle cx="42" cy="32" r="14" fill="#e0246a" />
      {/* Shoulders */}
      <path d="M22 68C22 52 30 46 44 46C56 46 64 52 64 68H22Z" fill="#e0246a" />
      {/* Music Note */}
      <circle cx="70" cy="62" r="8" fill="#e0246a" />
      <rect x="74" y="40" width="5" height="22" rx="2.5" fill="#e0246a" />
      <path d="M76 40C82 42 86 48 86 52C86 46 82 40 76 38V40Z" fill="#e0246a" />
    </svg>
  );
}

// Album Icon (Vinyl disc in sleeve - Screenshot 2)
export function AlbumFolderIcon({ size = 56 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
      {/* Sleeve */}
      <rect x="22" y="24" width="46" height="52" rx="8" fill="#e0246a" />
      {/* Vinyl Disc poking out */}
      <circle cx="62" cy="50" r="22" stroke="#e0246a" strokeWidth="6" fill="white" />
      <circle cx="62" cy="50" r="14" fill="#e0246a" />
      <circle cx="62" cy="50" r="5" fill="white" />
      <circle cx="45" cy="50" r="14" fill="white" />
      <circle cx="45" cy="50" r="5" fill="#e0246a" />
    </svg>
  );
}

// Liked Songs Heart Icon (Heart with music note - Screenshot 6)
export function LikedHeartIcon({ size = 56 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path
        d="M48 30C42 22 30 22 24 28C18 34 18 46 26 56L48 76L60 65C58 63 56 60 56 56C56 50 60 46 66 46C68 46 70 47 72 48L72 30C66 22 54 22 48 30Z"
        fill="#e0246a"
      />
      {/* Attached Note */}
      <circle cx="70" cy="62" r="8" fill="#e0246a" />
      <rect x="74" y="42" width="5" height="20" rx="2.5" fill="#e0246a" />
      <path d="M76 42C82 44 86 50 86 54C86 48 82 42 76 40V42Z" fill="#e0246a" />
    </svg>
  );
}

// Playlist Folder Icon (Playlist sheet with music note - Screenshot 6)
export function PlaylistFolderIcon({ size = 56 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
      {/* Playlist Sheet */}
      <rect x="24" y="24" width="46" height="52" rx="8" fill="#e0246a" />
      {/* Lines on Sheet */}
      <rect x="32" y="36" width="22" height="4" rx="2" fill="white" />
      <rect x="32" y="46" width="22" height="4" rx="2" fill="white" />
      <rect x="32" y="56" width="14" height="4" rx="2" fill="white" />
      {/* Music Note on right */}
      <circle cx="70" cy="62" r="8" fill="#e0246a" />
      <rect x="74" y="40" width="5" height="22" rx="2.5" fill="#e0246a" />
      <path d="M76 40C82 42 86 48 86 52C86 46 82 40 76 38V40Z" fill="#e0246a" />
    </svg>
  );
}

