import React, { useState, useEffect, useRef } from 'react';
import { X, Camera, Trash2, Check, FolderEdit } from 'lucide-react';
import { PlaylistFolderIcon } from './MusicIcons';

export default function EditPlaylistModal({ isOpen, onClose, playlist, onSavePlaylist, onDeletePlaylist }) {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [coverUrl, setCoverUrl] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [showConfirmDelete, setShowConfirmDelete] = useState(false);
  const fileInputRef = useRef(null);

  useEffect(() => {
    if (playlist) {
      setName(playlist.name || '');
      setDescription(playlist.description || '');
      setCoverUrl(playlist.coverUrl || '');
      setShowConfirmDelete(false);
    }
  }, [playlist]);

  if (!isOpen || !playlist) return null;

  const handleFileChange = async (e) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      const reader = new FileReader();
      reader.onload = (uploadEvent) => {
        setCoverUrl(uploadEvent.target.result);
      };
      reader.readAsDataURL(file);

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
        console.warn("Server upload failed, using local base64:", err);
      }
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!name.trim()) return;
    setIsSaving(true);
    try {
      await onSavePlaylist(playlist.id, {
        name: name.trim(),
        description: description.trim(),
        coverUrl: coverUrl.trim()
      });
      onClose();
    } catch (err) {
      console.error(err);
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async () => {
    try {
      await onDeletePlaylist(playlist.id);
      onClose();
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div
        style={{
          width: '90%',
          maxWidth: '460px',
          padding: '24px',
          display: 'flex',
          flexDirection: 'column',
          gap: '20px',
          boxShadow: '0 20px 50px rgba(0, 0, 0, 0.15)',
          backgroundColor: '#ffffff',
          borderRadius: '24px'
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <input 
          type="file" 
          ref={fileInputRef} 
          style={{ display: 'none' }} 
          accept="image/*"
          onChange={handleFileChange}
        />

        {/* Top Header */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <FolderEdit size={22} color="var(--accent-pink)" />
            <h3 style={{ fontSize: '18px', fontWeight: '800', color: 'var(--text-main)', margin: 0 }}>
              Edit Playlist
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

        {/* Playlist Cover Art with Change button */}
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px' }}>
          <div 
            onClick={() => fileInputRef.current?.click()}
            title="Click to change playlist cover image"
            style={{
              width: '130px',
              height: '130px',
              borderRadius: '24px',
              backgroundColor: '#fdeef1',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              position: 'relative',
              overflow: 'hidden',
              cursor: 'pointer',
              boxShadow: '0 4px 14px rgba(0, 0, 0, 0.08)'
            }}
          >
            {coverUrl ? (
              <img 
                src={coverUrl} 
                alt="Playlist cover" 
                style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                onError={(e) => e.target.style.display = 'none'}
              />
            ) : (
              <PlaylistFolderIcon size={64} />
            )}

            <div style={{
              position: 'absolute',
              display: 'flex',
              alignItems: 'center',
              gap: '4px',
              backgroundColor: 'rgba(30, 30, 30, 0.75)',
              color: '#ffffff',
              padding: '6px 12px',
              borderRadius: '10px',
              fontSize: '11px',
              fontWeight: '600'
            }}>
              <Camera size={14} />
              <span>Change</span>
            </div>
          </div>
          <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>Tap to update cover image</span>
        </div>

        {/* Form Inputs */}
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
          <div>
            <label style={{ fontSize: '12px', color: 'var(--text-muted)', fontWeight: '700', display: 'block', marginBottom: '6px' }}>
              Playlist Name
            </label>
            <input 
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              style={{
                width: '100%',
                padding: '12px 14px',
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
            <label style={{ fontSize: '12px', color: 'var(--text-muted)', fontWeight: '700', display: 'block', marginBottom: '6px' }}>
              Description
            </label>
            <textarea 
              rows="2"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Playlist description..."
              style={{
                width: '100%',
                padding: '10px 14px',
                borderRadius: '12px',
                border: '1.5px solid var(--border-search)',
                backgroundColor: '#faf8f5',
                color: 'var(--text-main)',
                fontSize: '14px',
                outline: 'none',
                resize: 'none'
              }}
            />
          </div>

          {/* Action buttons */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: '10px' }}>
            {showConfirmDelete ? (
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span style={{ fontSize: '12px', color: '#dc2626', fontWeight: '700' }}>Confirm delete?</span>
                <button
                  type="button"
                  onClick={handleDelete}
                  style={{
                    padding: '6px 12px',
                    borderRadius: '8px',
                    border: 'none',
                    backgroundColor: '#dc2626',
                    color: '#ffffff',
                    fontSize: '12px',
                    fontWeight: '700',
                    cursor: 'pointer'
                  }}
                >
                  Yes, Delete
                </button>
                <button
                  type="button"
                  onClick={() => setShowConfirmDelete(false)}
                  style={{
                    padding: '6px 10px',
                    borderRadius: '8px',
                    border: '1px solid #d1d5db',
                    backgroundColor: 'transparent',
                    color: 'var(--text-muted)',
                    fontSize: '12px',
                    cursor: 'pointer'
                  }}
                >
                  Cancel
                </button>
              </div>
            ) : (
              <button
                type="button"
                onClick={() => setShowConfirmDelete(true)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  background: 'none',
                  border: 'none',
                  color: '#dc2626',
                  fontSize: '13px',
                  fontWeight: '600',
                  cursor: 'pointer',
                  padding: '6px 0'
                }}
              >
                <Trash2 size={16} /> Delete Playlist
              </button>
            )}

            <button
              type="submit"
              disabled={isSaving}
              className="btn-red-action"
              style={{ padding: '10px 22px' }}
            >
              {isSaving ? 'Saving...' : 'Save Changes'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
