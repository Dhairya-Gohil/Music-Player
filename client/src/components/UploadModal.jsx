import React, { useState, useRef } from 'react';
import { X, Upload, Music, CheckCircle2, AlertCircle } from 'lucide-react';

export default function UploadModal({ isOpen, onClose, onUploadSuccess }) {
  const [file, setFile] = useState(null);
  const [title, setTitle] = useState('');
  const [artist, setArtist] = useState('');
  const [album, setAlbum] = useState('');
  const [genre, setGenre] = useState('Music');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef(null);

  if (!isOpen) return null;

  const handleFileSelect = (selected) => {
    if (!selected) return;
    setFile(selected);
    setErrorMsg('');
    const cleanName = selected.name.replace(/\.[^/.]+$/, "");
    if (!title) {
      setTitle(cleanName);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileSelect(e.dataTransfer.files[0]);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!file) {
      setErrorMsg('Please choose an audio file to upload.');
      return;
    }

    setIsSubmitting(true);
    setErrorMsg('');

    try {
      const formData = new FormData();
      formData.append('audio', file);
      formData.append('title', title || file.name);
      formData.append('artist', artist || 'Unknown artist');
      formData.append('album', album || 'Music');
      formData.append('genre', genre);

      const response = await fetch('/api/tracks/upload', {
        method: 'POST',
        body: formData
      });

      const data = await response.json();
      if (data.success) {
        onUploadSuccess(data.track);
        onClose();
      } else {
        setErrorMsg(data.message || 'Failed to upload audio file.');
      }
    } catch (err) {
      setErrorMsg('Upload failed. Ensure server is running.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div 
        style={{
          width: '90%',
          maxWidth: '500px',
          padding: '24px',
          display: 'flex',
          flexDirection: 'column',
          gap: '18px',
          boxShadow: '0 20px 50px rgba(0, 0, 0, 0.15)',
          backgroundColor: '#ffffff',
          borderRadius: '24px'
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <Upload size={22} color="var(--accent-pink)" />
            <h3 style={{ fontSize: '18px', fontWeight: '800', color: 'var(--text-main)', margin: 0 }}>
              Upload Audio File
            </h3>
          </div>
          <button 
            onClick={onClose}
            style={{
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              color: 'var(--text-muted)',
              padding: '6px'
            }}
          >
            <X size={20} />
          </button>
        </div>

        {errorMsg && (
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            backgroundColor: '#fee2e2',
            border: '1px solid #fecaca',
            padding: '10px 14px',
            borderRadius: '10px',
            color: '#b91c1c',
            fontSize: '13px'
          }}>
            <AlertCircle size={16} />
            {errorMsg}
          </div>
        )}

        {/* Dropzone */}
        <div
          onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
          onDragLeave={() => setIsDragging(false)}
          onDrop={handleDrop}
          onClick={() => fileInputRef.current?.click()}
          style={{
            border: `2px dashed ${isDragging ? 'var(--accent-pink)' : '#d1d1d6'}`,
            borderRadius: '16px',
            padding: '24px 16px',
            textAlign: 'center',
            cursor: 'pointer',
            backgroundColor: isDragging ? '#fdeef1' : '#faf8f5',
            transition: 'all 0.2s'
          }}
        >
          <input 
            type="file" 
            ref={fileInputRef} 
            onChange={(e) => handleFileSelect(e.target.files[0])}
            accept="audio/*,.mp3,.wav,.ogg,.aac,.flac,.m4a"
            style={{ display: 'none' }}
          />
          {file ? (
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '6px' }}>
              <CheckCircle2 size={32} color="var(--accent-pink)" />
              <p style={{ fontSize: '14px', fontWeight: '700', color: 'var(--text-main)', margin: 0 }}>
                {file.name}
              </p>
              <p style={{ fontSize: '12px', color: 'var(--text-muted)', margin: 0 }}>
                {(file.size / (1024 * 1024)).toFixed(2)} MB • Click to replace
              </p>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '6px' }}>
              <Music size={32} color="var(--text-muted)" />
              <p style={{ fontSize: '14px', fontWeight: '700', color: 'var(--text-main)', margin: 0 }}>
                Click to browse or drag & drop music file
              </p>
              <p style={{ fontSize: '12px', color: 'var(--text-muted)', margin: 0 }}>
                Supports MP3, WAV, FLAC, M4A up to 50MB
              </p>
            </div>
          )}
        </div>

        {/* Form fields */}
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          <div>
            <label style={{ fontSize: '12px', color: 'var(--text-muted)', fontWeight: '700', display: 'block', marginBottom: '4px' }}>
              Song Title
            </label>
            <input 
              type="text"
              placeholder="e.g. Aavan Jaavan Mashup"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              style={{
                width: '100%',
                padding: '10px 14px',
                borderRadius: '12px',
                border: '1.5px solid var(--border-search)',
                backgroundColor: '#faf8f5',
                color: 'var(--text-main)',
                fontSize: '14px',
                outline: 'none'
              }}
            />
          </div>

          <div>
            <label style={{ fontSize: '12px', color: 'var(--text-muted)', fontWeight: '700', display: 'block', marginBottom: '4px' }}>
              Artist Name
            </label>
            <input 
              type="text"
              placeholder="e.g. Arijit Singh"
              value={artist}
              onChange={(e) => setArtist(e.target.value)}
              style={{
                width: '100%',
                padding: '10px 14px',
                borderRadius: '12px',
                border: '1.5px solid var(--border-search)',
                backgroundColor: '#faf8f5',
                color: 'var(--text-main)',
                fontSize: '14px',
                outline: 'none'
              }}
            />
          </div>

          <div>
            <label style={{ fontSize: '12px', color: 'var(--text-muted)', fontWeight: '700', display: 'block', marginBottom: '4px' }}>
              Album
            </label>
            <input 
              type="text"
              placeholder="e.g. Ludo, Tamasha, Music_DJ"
              value={album}
              onChange={(e) => setAlbum(e.target.value)}
              style={{
                width: '100%',
                padding: '10px 14px',
                borderRadius: '12px',
                border: '1.5px solid var(--border-search)',
                backgroundColor: '#faf8f5',
                color: 'var(--text-main)',
                fontSize: '14px',
                outline: 'none'
              }}
            />
          </div>

          <button
            type="submit"
            disabled={isSubmitting || !file}
            className="btn-red-action"
            style={{
              padding: '12px',
              marginTop: '4px',
              opacity: isSubmitting || !file ? 0.6 : 1,
              cursor: isSubmitting || !file ? 'not-allowed' : 'pointer'
            }}
          >
            {isSubmitting ? 'Uploading...' : 'Add to Library'}
          </button>
        </form>
      </div>
    </div>
  );
}
