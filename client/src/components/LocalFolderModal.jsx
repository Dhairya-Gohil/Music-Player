import React, { useState, useRef } from 'react';
import { X, Folder, Upload, HardDrive, RefreshCw, CheckCircle2, Music } from 'lucide-react';

export default function LocalFolderModal({ 
  isOpen, 
  onClose, 
  currentFolder = 'd:\\Music\\songs',
  onRescan, 
  onBatchUpload, 
  onLoadBrowserFiles,
  onSetCustomFolder 
}) {
  const [customPath, setCustomPath] = useState('');
  const [isRescanning, setIsRescanning] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [selectedFiles, setSelectedFiles] = useState([]);
  const [statusMsg, setStatusMsg] = useState('');
  const folderInputRef = useRef(null);
  const fileInputRef = useRef(null);

  if (!isOpen) return null;

  const handleRescanClick = async () => {
    setIsRescanning(true);
    setStatusMsg('');
    try {
      await onRescan();
      setStatusMsg('Scanned local storage successfully!');
    } catch (e) {
      setStatusMsg('Rescan failed. Make sure server is running.');
    } finally {
      setIsRescanning(false);
    }
  };

  const handleSetPath = async (e) => {
    e.preventDefault();
    if (!customPath.trim()) return;
    setIsRescanning(true);
    try {
      const res = await onSetCustomFolder(customPath.trim());
      if (res.success) {
        setStatusMsg(`Connected to ${customPath}! Found ${res.count} songs.`);
      } else {
        setStatusMsg(res.message || 'Folder not found on computer.');
      }
    } catch (e) {
      setStatusMsg('Error setting folder.');
    } finally {
      setIsRescanning(false);
    }
  };

  const handleFilesChosen = (e) => {
    const files = Array.from(e.target.files || []).filter(f => {
      const name = f.name.toLowerCase();
      return name.endsWith('.mp3') || name.endsWith('.m4a') || name.endsWith('.wav') || name.endsWith('.flac');
    });

    if (files.length === 0) return;
    setSelectedFiles(files);
  };

  const handleImportChosenFiles = async () => {
    if (selectedFiles.length === 0) return;
    setIsUploading(true);
    try {
      // Send to server to save directly in d:\Music\songs
      await onBatchUpload(selectedFiles);
      setStatusMsg(`Successfully imported ${selectedFiles.length} songs to local storage!`);
      setSelectedFiles([]);
      setTimeout(() => {
        onClose();
      }, 1000);
    } catch (e) {
      // Fallback: load directly into browser player
      onLoadBrowserFiles(selectedFiles);
      setStatusMsg(`Loaded ${selectedFiles.length} songs in browser.`);
      setSelectedFiles([]);
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div
        style={{
          width: '92%',
          maxWidth: '480px',
          padding: '24px',
          display: 'flex',
          flexDirection: 'column',
          gap: '20px',
          boxShadow: '0 20px 50px rgba(0, 0, 0, 0.15)',
          backgroundColor: '#ffffff',
          borderRadius: '24px',
          maxHeight: '88vh',
          overflowY: 'auto'
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: '1px solid rgba(0, 0, 0, 0.06)', paddingBottom: '14px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div style={{
              width: '40px',
              height: '40px',
              borderRadius: '12px',
              backgroundColor: 'var(--bg-pink-card)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}>
              <HardDrive size={22} color="var(--accent-pink)" />
            </div>
            <div>
              <h3 style={{ fontSize: '18px', fontWeight: '800', color: 'var(--text-main)', margin: 0 }}>
                Fetch Local Storage Songs
              </h3>
              <p style={{ fontSize: '12px', color: 'var(--text-muted)', margin: 0 }}>
                Play MP3 & M4A files from your computer
              </p>
            </div>
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

        {statusMsg && (
          <div style={{
            padding: '10px 14px',
            borderRadius: '12px',
            backgroundColor: '#fdeef1',
            color: 'var(--accent-pink)',
            fontSize: '13px',
            fontWeight: '600'
          }}>
            {statusMsg}
          </div>
        )}

        {/* Auto-Discovery Banner */}
        <div style={{
          padding: '14px 16px',
          borderRadius: '16px',
          backgroundColor: '#fdeef1',
          border: '1px solid rgba(224, 36, 106, 0.2)',
          display: 'flex',
          flexDirection: 'column',
          gap: '8px'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <span style={{ fontSize: '13px', fontWeight: '800', color: 'var(--accent-pink)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
              ⚡ Automatic Auto-Discovery Active
            </span>
            <button
              onClick={handleRescanClick}
              disabled={isRescanning}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                padding: '6px 12px',
                borderRadius: '10px',
                border: 'none',
                backgroundColor: 'var(--accent-pink)',
                color: '#ffffff',
                fontSize: '12px',
                fontWeight: '700',
                cursor: isRescanning ? 'not-allowed' : 'pointer'
              }}
            >
              <RefreshCw size={13} className={isRescanning ? "animate-spin" : ""} />
              {isRescanning ? 'Scanning...' : 'Rescan Now'}
            </button>
          </div>
          <p style={{ fontSize: '12px', color: 'var(--text-main)', margin: 0, lineHeight: 1.4 }}>
            The app automatically searches your computer's <strong>Downloads</strong>, <strong>Music</strong>, and <strong>D:\Music\songs</strong> folders for <code>.mp3</code> and <code>.m4a</code> files. Newly downloaded songs appear automatically without manual steps.
          </p>
        </div>

        {/* Option 1: Pick folder or multiple files directly from computer */}
        <div style={{
          padding: '16px',
          borderRadius: '16px',
          backgroundColor: '#faf8f5',
          border: '1px solid rgba(0, 0, 0, 0.06)',
          display: 'flex',
          flexDirection: 'column',
          gap: '12px'
        }}>
          <h4 style={{ fontSize: '14px', fontWeight: '700', color: 'var(--text-main)', margin: 0 }}>
            1. Select MP3 / M4A Files or Folder
          </h4>
          <p style={{ fontSize: '12px', color: 'var(--text-muted)', margin: 0 }}>
            Choose music files or an entire folder from your drive to immediately import into your library.
          </p>

          <input 
            type="file" 
            ref={fileInputRef} 
            multiple 
            accept=".mp3,.m4a,.wav,.flac,.ogg,.aac" 
            style={{ display: 'none' }}
            onChange={handleFilesChosen}
          />

          <input 
            type="file" 
            ref={folderInputRef} 
            webkitdirectory="true" 
            directory="true" 
            style={{ display: 'none' }}
            onChange={handleFilesChosen}
          />

          <div style={{ display: 'flex', gap: '8px' }}>
            <button
              onClick={() => fileInputRef.current?.click()}
              style={{
                flex: 1,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '8px',
                padding: '10px 14px',
                borderRadius: '12px',
                border: '1px solid var(--border-search)',
                backgroundColor: '#ffffff',
                color: 'var(--text-main)',
                fontSize: '13px',
                fontWeight: '600',
                cursor: 'pointer'
              }}
            >
              <Music size={16} color="var(--accent-pink)" />
              Pick MP3 / M4A
            </button>

            <button
              onClick={() => folderInputRef.current?.click()}
              style={{
                flex: 1,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '8px',
                padding: '10px 14px',
                borderRadius: '12px',
                border: '1px solid var(--border-search)',
                backgroundColor: '#ffffff',
                color: 'var(--text-main)',
                fontSize: '13px',
                fontWeight: '600',
                cursor: 'pointer'
              }}
            >
              <Folder size={16} color="var(--accent-pink)" />
              Pick Entire Folder
            </button>
          </div>

          {selectedFiles.length > 0 && (
            <div style={{
              marginTop: '4px',
              padding: '12px',
              borderRadius: '12px',
              backgroundColor: '#ffffff',
              border: '1px solid rgba(0, 0, 0, 0.08)'
            }}>
              <p style={{ fontSize: '13px', fontWeight: '700', color: 'var(--text-main)', margin: '0 0 6px 0' }}>
                {selectedFiles.length} audio files selected
              </p>
              <div style={{ maxHeight: '90px', overflowY: 'auto', fontSize: '12px', color: 'var(--text-muted)' }}>
                {selectedFiles.slice(0, 5).map((f, i) => (
                  <div key={i} style={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                    • {f.name}
                  </div>
                ))}
                {selectedFiles.length > 5 && <div>...and {selectedFiles.length - 5} more</div>}
              </div>

              <button
                onClick={handleImportChosenFiles}
                disabled={isUploading}
                className="btn-red-action"
                style={{ width: '100%', marginTop: '10px', padding: '10px' }}
              >
                {isUploading ? 'Importing files...' : `Import ${selectedFiles.length} Songs to Library`}
              </button>
            </div>
          )}
        </div>

        {/* Option 2: Default local storage directory (d:\Music\songs) */}
        <div style={{
          padding: '16px',
          borderRadius: '16px',
          backgroundColor: '#faf8f5',
          border: '1px solid rgba(0, 0, 0, 0.06)',
          display: 'flex',
          flexDirection: 'column',
          gap: '10px'
        }}>
          <h4 style={{ fontSize: '14px', fontWeight: '700', color: 'var(--text-main)', margin: 0 }}>
            2. Local Songs Directory
          </h4>
          <p style={{ fontSize: '12px', color: 'var(--text-muted)', margin: 0 }}>
            Place your songs directly in:
          </p>
          <div style={{
            padding: '8px 12px',
            backgroundColor: '#ffffff',
            borderRadius: '10px',
            fontSize: '12px',
            fontFamily: 'monospace',
            color: 'var(--accent-red)',
            wordBreak: 'break-all',
            border: '1px solid rgba(0, 0, 0, 0.08)'
          }}>
            {currentFolder}
          </div>

          <button
            onClick={handleRescanClick}
            disabled={isRescanning}
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '8px',
              padding: '10px',
              borderRadius: '12px',
              border: 'none',
              backgroundColor: 'var(--bg-pink-card)',
              color: 'var(--accent-pink)',
              fontWeight: '700',
              fontSize: '13px',
              cursor: isRescanning ? 'not-allowed' : 'pointer'
            }}
          >
            <RefreshCw size={16} className={isRescanning ? "animate-spin" : ""} />
            {isRescanning ? 'Scanning folder...' : 'Scan / Refresh Folder'}
          </button>
        </div>

        {/* Option 3: Custom directory path on Windows */}
        <form onSubmit={handleSetPath} style={{
          padding: '16px',
          borderRadius: '16px',
          backgroundColor: '#faf8f5',
          border: '1px solid rgba(0, 0, 0, 0.06)',
          display: 'flex',
          flexDirection: 'column',
          gap: '10px'
        }}>
          <h4 style={{ fontSize: '14px', fontWeight: '700', color: 'var(--text-main)', margin: 0 }}>
            3. Set Custom Windows Folder Path
          </h4>
          <input 
            type="text"
            placeholder="e.g. C:\Users\Username\Music or D:\MyTracks"
            value={customPath}
            onChange={(e) => setCustomPath(e.target.value)}
            style={{
              padding: '10px 14px',
              borderRadius: '12px',
              border: '1.5px solid var(--border-search)',
              backgroundColor: '#ffffff',
              color: 'var(--text-main)',
              fontSize: '13px',
              outline: 'none'
            }}
          />
          <button
            type="submit"
            className="btn-red-action"
            style={{ padding: '9px 16px', alignSelf: 'flex-start' }}
          >
            Set & Scan Path
          </button>
        </form>
      </div>
    </div>
  );
}
