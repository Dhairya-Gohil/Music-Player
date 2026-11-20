import React, { useState, useEffect, useRef } from 'react';
import { Camera, Edit2, Check, RotateCcw } from 'lucide-react';
import { ArrowBackIcon } from './PlayerIcons';

const DEFAULT_COVER = '/pink_image.png';

export default function EditSongInfoModal({ isOpen, onClose, track, onSaveTrack }) {
  const [title, setTitle] = useState('');
  const [artist, setArtist] = useState('');
  const [album, setAlbum] = useState('');
  const [coverUrl, setCoverUrl] = useState(DEFAULT_COVER);
  const [isSaving, setIsSaving] = useState(false);
  const [isUploadingImage, setIsUploadingImage] = useState(false);

  // Field edit states: can only edit when pencil is clicked
  const [isEditingTitle, setIsEditingTitle] = useState(false);
  const [isEditingArtist, setIsEditingArtist] = useState(false);
  const [isEditingAlbum, setIsEditingAlbum] = useState(false);

  const fileInputRef = useRef(null);
  const songInputRef = useRef(null);
  const artistInputRef = useRef(null);
  const albumInputRef = useRef(null);

  useEffect(() => {
    if (track) {
      setTitle(track.title || '');
      setArtist(track.artist || '');
      setAlbum(track.album || '');
      const initialCover = track.coverUrl && track.coverUrl !== '/pink_music.png' ? track.coverUrl : DEFAULT_COVER;
      setCoverUrl(initialCover);
      setIsEditingTitle(false);
      setIsEditingArtist(false);
      setIsEditingAlbum(false);
    }
  }, [track, isOpen]);

  if (!isOpen || !track) return null;

  const hasCustomImage = Boolean(coverUrl && coverUrl !== DEFAULT_COVER && coverUrl !== '/pink_music.png');

  // Handle local image file selection
  const handleFileChange = async (e) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setIsUploadingImage(true);

      // Instant local preview via FileReader base64
      const reader = new FileReader();
      reader.onload = (uploadEvent) => {
        setCoverUrl(uploadEvent.target.result);
      };
      reader.readAsDataURL(file);

      // Also attempt server upload
      try {
        const formData = new FormData();
        formData.append('image', file);
        const res = await fetch('/api/upload/image', {
          method: 'POST',
          body: formData
        });
        const data = await res.json();
        if (data.success && data.coverUrl) {
          setCoverUrl(data.coverUrl);
        }
      } catch (err) {
        console.warn("Server upload failed, using local base64 image:", err);
      } finally {
        setIsUploadingImage(false);
      }
    }
  };

  const handleSave = async () => {
    setIsSaving(true);
    try {
      const finalCover = coverUrl.trim() || DEFAULT_COVER;
      const updated = {
        ...track,
        title: title.trim() || track.title,
        artist: artist.trim() || track.artist,
        album: album.trim() || track.album,
        coverUrl: finalCover,
        useDefaultIcon: (finalCover === DEFAULT_COVER || finalCover === '/pink_music.png')
      };
      await onSaveTrack(updated);
      onClose();
    } catch (err) {
      console.error("Save error:", err);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div style={{
      position: 'fixed',
      inset: 0,
      backgroundColor: '#faf8f5',
      zIndex: 120,
      display: 'flex',
      flexDirection: 'column',
      padding: '24px 20px',
      overflowY: 'auto',
      animation: 'fadeIn 0.15s ease-out'
    }}>
      {/* Hidden file input */}
      <input 
        type="file" 
        ref={fileInputRef} 
        style={{ display: 'none' }} 
        accept="image/*"
        onChange={handleFileChange}
      />

      {/* Top Bar: Left Arrow, "Edit song info", Right "Save" button */}
      <header style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '28px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
          <button
            onClick={onClose}
            className="blend-multiply"
            style={{
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              padding: '4px',
              mixBlendMode: 'multiply'
            }}
          >
            <ArrowBackIcon size={26} />
          </button>
          <h2 style={{ fontSize: '22px', fontWeight: '800', color: 'var(--text-main)', margin: 0 }}>
            Edit song info
          </h2>
        </div>

        {/* Save Button */}
        <button
          onClick={handleSave}
          disabled={isSaving}
          className="btn-red-action"
        >
          {isSaving ? 'Saving...' : 'Save'}
        </button>
      </header>

      {/* Artwork Box with [📷 Change] button and [Switch to default image] */}
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '12px', marginBottom: '28px' }}>
        <div 
          onClick={() => fileInputRef.current?.click()}
          title="Click to choose a custom music cover image"
          style={{
            width: '180px',
            height: '180px',
            borderRadius: '32px',
            backgroundColor: '#fdeef1',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            position: 'relative',
            overflow: 'hidden',
            cursor: 'pointer',
            boxShadow: '0 4px 16px rgba(0, 0, 0, 0.08)'
          }}
        >
          <img 
            src={coverUrl || DEFAULT_COVER} 
            alt="Artwork" 
            style={{ width: '100%', height: '100%', objectFit: 'cover' }}
            onError={(e) => {
              if (e.target.src !== window.location.origin + DEFAULT_COVER) {
                e.target.src = DEFAULT_COVER;
              }
            }}
          />

          {/* Floating Dark [📷 Change] Pill Button */}
          <div style={{
            position: 'absolute',
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            backgroundColor: 'rgba(30, 30, 30, 0.75)',
            backdropFilter: 'blur(4px)',
            color: '#ffffff',
            padding: '8px 16px',
            borderRadius: '12px',
            fontSize: '13px',
            fontWeight: '600'
          }}>
            <Camera size={16} />
            <span>{isUploadingImage ? 'Uploading...' : 'Change'}</span>
          </div>
        </div>

        {/* Option to switch to default image if user does not want to keep custom image */}
        {hasCustomImage && (
          <button
            type="button"
            onClick={() => setCoverUrl(DEFAULT_COVER)}
            title="Remove custom image and switch back to default pink_image.png"
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              backgroundColor: '#fdeef1',
              border: '1.5px solid var(--accent-pink, #e0246a)',
              color: 'var(--accent-pink, #e0246a)',
              padding: '7px 16px',
              borderRadius: '9999px',
              fontSize: '13px',
              fontWeight: '700',
              cursor: 'pointer',
              transition: 'all 0.15s ease'
            }}
            onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#fbdbe2'}
            onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#fdeef1'}
          >
            <RotateCcw size={14} />
            <span>Switch to default image</span>
          </button>
        )}

        <p style={{ fontSize: '13px', color: 'var(--text-muted)', textAlign: 'center', margin: 0 }}>
          {hasCustomImage ? 'Custom image active • Click image to replace' : 'Default pink image active • Click image to set custom'}
        </p>
      </div>

      {/* DETAILS Section */}
      <div style={{ width: '100%', maxWidth: '480px', margin: '0 auto' }}>
        <p style={{
          fontSize: '12px',
          fontWeight: '700',
          letterSpacing: '0.08em',
          color: 'var(--text-muted)',
          textTransform: 'uppercase',
          marginBottom: '10px',
          paddingLeft: '4px'
        }}>
          DETAILS
        </p>

        {/* White Rounded Card with 3 Fields */}
        <div className="app-card" style={{ padding: '4px 18px' }}>
          {/* Song Row */}
          <div 
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              padding: '16px 0',
              borderBottom: '1px solid #f0edf0'
            }}
          >
            <div style={{ flex: 1, paddingRight: '12px' }}>
              <span style={{ fontSize: '12px', color: 'var(--text-muted)', display: 'block', marginBottom: '2px' }}>
                Song
              </span>
              <input 
                ref={songInputRef}
                type="text"
                value={title}
                readOnly={!isEditingTitle}
                onChange={(e) => setTitle(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') setIsEditingTitle(false);
                }}
                placeholder="Song title"
                style={{
                  width: '100%',
                  border: 'none',
                  borderBottom: isEditingTitle ? '2px solid var(--accent-pink, #e0246a)' : '2px solid transparent',
                  background: isEditingTitle ? '#faf8f5' : 'transparent',
                  outline: 'none',
                  fontSize: '16px',
                  fontWeight: '600',
                  color: 'var(--text-main)',
                  padding: isEditingTitle ? '4px 6px' : '0',
                  borderRadius: '4px',
                  cursor: isEditingTitle ? 'text' : 'default',
                  transition: 'all 0.15s ease'
                }}
              />
            </div>
            <button
              type="button"
              onClick={() => {
                if (!isEditingTitle) {
                  setIsEditingTitle(true);
                  setTimeout(() => songInputRef.current?.focus(), 50);
                } else {
                  setIsEditingTitle(false);
                }
              }}
              title={isEditingTitle ? "Done editing song title" : "Click pencil to edit song title"}
              style={{
                background: isEditingTitle ? '#fdeef1' : 'none',
                border: 'none',
                padding: '8px',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                borderRadius: '50%',
                color: isEditingTitle ? 'var(--accent-pink, #e0246a)' : 'var(--text-muted)',
                transition: 'all 0.15s ease'
              }}
            >
              {isEditingTitle ? <Check size={18} /> : <Edit2 size={18} />}
            </button>
          </div>

          {/* Artist Row - Only editable when clicking pencil icon */}
          <div 
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              padding: '16px 0',
              borderBottom: '1px solid #f0edf0'
            }}
          >
            <div style={{ flex: 1, paddingRight: '12px' }}>
              <span style={{ fontSize: '12px', color: 'var(--text-muted)', display: 'block', marginBottom: '2px' }}>
                Artist
              </span>
              <input 
                ref={artistInputRef}
                type="text"
                value={artist}
                readOnly={!isEditingArtist}
                onChange={(e) => setArtist(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') setIsEditingArtist(false);
                }}
                placeholder="Artist name"
                style={{
                  width: '100%',
                  border: 'none',
                  borderBottom: isEditingArtist ? '2px solid var(--accent-pink, #e0246a)' : '2px solid transparent',
                  background: isEditingArtist ? '#faf8f5' : 'transparent',
                  outline: 'none',
                  fontSize: '16px',
                  fontWeight: '600',
                  color: 'var(--text-main)',
                  padding: isEditingArtist ? '4px 6px' : '0',
                  borderRadius: '4px',
                  cursor: isEditingArtist ? 'text' : 'default',
                  transition: 'all 0.15s ease'
                }}
              />
            </div>
            <button
              type="button"
              onClick={() => {
                if (!isEditingArtist) {
                  setIsEditingArtist(true);
                  setTimeout(() => artistInputRef.current?.focus(), 50);
                } else {
                  setIsEditingArtist(false);
                }
              }}
              title={isEditingArtist ? "Done editing artist name" : "Click pencil to edit artist name"}
              style={{
                background: isEditingArtist ? '#fdeef1' : 'none',
                border: 'none',
                padding: '8px',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                borderRadius: '50%',
                color: isEditingArtist ? 'var(--accent-pink, #e0246a)' : 'var(--text-muted)',
                transition: 'all 0.15s ease'
              }}
            >
              {isEditingArtist ? <Check size={18} /> : <Edit2 size={18} />}
            </button>
          </div>

          {/* Album Row - Only editable when clicking pencil icon */}
          <div 
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              padding: '16px 0'
            }}
          >
            <div style={{ flex: 1, paddingRight: '12px' }}>
              <span style={{ fontSize: '12px', color: 'var(--text-muted)', display: 'block', marginBottom: '2px' }}>
                Album
              </span>
              <input 
                ref={albumInputRef}
                type="text"
                value={album}
                readOnly={!isEditingAlbum}
                onChange={(e) => setAlbum(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') setIsEditingAlbum(false);
                }}
                placeholder="Album name"
                style={{
                  width: '100%',
                  border: 'none',
                  borderBottom: isEditingAlbum ? '2px solid var(--accent-pink, #e0246a)' : '2px solid transparent',
                  background: isEditingAlbum ? '#faf8f5' : 'transparent',
                  outline: 'none',
                  fontSize: '16px',
                  fontWeight: '600',
                  color: 'var(--text-main)',
                  padding: isEditingAlbum ? '4px 6px' : '0',
                  borderRadius: '4px',
                  cursor: isEditingAlbum ? 'text' : 'default',
                  transition: 'all 0.15s ease'
                }}
              />
            </div>
            <button
              type="button"
              onClick={() => {
                if (!isEditingAlbum) {
                  setIsEditingAlbum(true);
                  setTimeout(() => albumInputRef.current?.focus(), 50);
                } else {
                  setIsEditingAlbum(false);
                }
              }}
              title={isEditingAlbum ? "Done editing album name" : "Click pencil to edit album name"}
              style={{
                background: isEditingAlbum ? '#fdeef1' : 'none',
                border: 'none',
                padding: '8px',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                borderRadius: '50%',
                color: isEditingAlbum ? 'var(--accent-pink, #e0246a)' : 'var(--text-muted)',
                transition: 'all 0.15s ease'
              }}
            >
              {isEditingAlbum ? <Check size={18} /> : <Edit2 size={18} />}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
