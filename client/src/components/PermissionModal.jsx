import React, { useState } from 'react';
import { ShieldCheck, HardDrive, Bell, CheckCircle2, FolderSearch, AlertCircle, X } from 'lucide-react';
import { scanDirectoryHandle, saveTracksToIndexedDB, extractBrowserTrack } from '../utils/localMusicStore';

export default function PermissionModal({
  isOpen,
  onClose,
  onTracksImported,
  onBackendRescan
}) {
  const [isScanning, setIsScanning] = useState(false);
  const [notificationGranted, setNotificationGranted] = useState(
    typeof window !== 'undefined' && 'Notification' in window && Notification.permission === 'granted'
  );
  const [statusMessage, setStatusMessage] = useState('');
  const [scanCount, setScanCount] = useState(0);

  const fileInputRef = React.useRef(null);
  const folderInputRef = React.useRef(null);

  if (!isOpen) return null;

  // Request Notification permission
  const handleRequestNotifications = async () => {
    if ('Notification' in window) {
      try {
        const perm = await Notification.requestPermission();
        if (perm === 'granted') {
          setNotificationGranted(true);
          try {
            new Notification("WHITE DEVIL's MUSIC", {
              body: "Notifications enabled! You will now see playback updates in your status bar.",
              icon: "/favicon.ico"
            });
          } catch (e) {}
          return true;
        }
      } catch (err) {
        console.warn("Notification request error:", err);
      }
    }
    return false;
  };

  // Main Action: Request Both Storage Access and Notifications
  const handleGrantAccessAndFetch = async () => {
    setIsScanning(true);
    setStatusMessage('Requesting storage and notification access...');

    // 1. Request Notifications
    await handleRequestNotifications();

    // 2. Request Storage / Directory Access
    if ('showDirectoryPicker' in window) {
      try {
        setStatusMessage('Please select your Downloads or Music folder in the file picker...');
        const dirHandle = await window.showDirectoryPicker({
          id: 'white-devils-music-dir',
          mode: 'read',
          startIn: 'downloads'
        });

        setStatusMessage('Scanning selected folder for MP3 & M4A files...');
        const localTracks = await scanDirectoryHandle(dirHandle);

        if (localTracks.length > 0) {
          await saveTracksToIndexedDB(localTracks);
          setScanCount(localTracks.length);
          setStatusMessage(`Found ${localTracks.length} local audio songs!`);

          if (onTracksImported) {
            onTracksImported(localTracks);
          }

          // Also attempt backend rescan
          if (onBackendRescan) onBackendRescan();

          setTimeout(() => {
            setIsScanning(false);
            onClose();
          }, 1000);
          return;
        } else {
          setStatusMessage('No MP3 or M4A files found in selected folder. Trying backend...');
        }
      } catch (err) {
        if (err.name !== 'AbortError') {
          console.warn("showDirectoryPicker notice:", err);
        }
      }
    }

    // 3. Fallback: Trigger backend rescan for Downloads & Music folders
    try {
      setStatusMessage('Scanning Downloads & Music via backend service...');
      if (onBackendRescan) {
        const res = await onBackendRescan();
        if (res && res.tracks && res.tracks.length > 0) {
          setStatusMessage(`Loaded ${res.tracks.length} songs from Downloads!`);
          setTimeout(() => {
            setIsScanning(false);
            onClose();
          }, 1000);
          return;
        }
      }
    } catch (e) {
      console.warn("Backend rescan notice:", e);
    }

    // 4. Fallback: Open folder input
    setIsScanning(false);
    folderInputRef.current?.click();
  };

  // Handle files selected from fallback input
  const handleFallbackFiles = async (e) => {
    const rawFiles = Array.from(e.target.files || []).filter(f => {
      const ext = f.name.toLowerCase();
      return ext.endsWith('.mp3') || ext.endsWith('.m4a') || ext.endsWith('.wav') || ext.endsWith('.flac');
    });

    if (rawFiles.length === 0) {
      setStatusMessage('No MP3 or M4A files detected.');
      return;
    }

    setIsScanning(true);
    setStatusMessage(`Importing ${rawFiles.length} songs...`);

    const tracks = [];
    for (const f of rawFiles) {
      const t = await extractBrowserTrack(f);
      tracks.push(t);
    }

    await saveTracksToIndexedDB(tracks);
    setScanCount(tracks.length);
    if (onTracksImported) onTracksImported(tracks);

    setStatusMessage(`Successfully imported ${tracks.length} songs!`);
    setTimeout(() => {
      setIsScanning(false);
      onClose();
    }, 800);
  };

  return (
    <div className="modal-overlay" style={{ zIndex: 200 }} onClick={onClose}>
      <div 
        style={{
          width: '92%',
          maxWidth: '440px',
          padding: '24px',
          display: 'flex',
          flexDirection: 'column',
          gap: '20px',
          backgroundColor: '#ffffff',
          borderRadius: '28px',
          boxShadow: '0 25px 60px rgba(0, 0, 0, 0.22)',
          animation: 'fadeIn 0.2s ease-out'
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Hidden Fallback Inputs */}
        <input 
          type="file" 
          ref={folderInputRef} 
          webkitdirectory="true" 
          directory="true" 
          multiple 
          style={{ display: 'none' }}
          onChange={handleFallbackFiles}
        />
        <input 
          type="file" 
          ref={fileInputRef} 
          multiple 
          accept=".mp3,.m4a,audio/*"
          style={{ display: 'none' }}
          onChange={handleFallbackFiles}
        />

        {/* Top Header */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div style={{
              width: '44px',
              height: '44px',
              borderRadius: '16px',
              backgroundColor: '#fdeef1',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'var(--accent-pink)'
            }}>
              <ShieldCheck size={24} />
            </div>
            <div>
              <h3 style={{ fontSize: '18px', fontWeight: '800', color: 'var(--text-main)', margin: 0 }}>
                Storage & Notifications
              </h3>
              <p style={{ fontSize: '12px', color: 'var(--text-muted)', margin: 0 }}>
                WHITE DEVIL's MUSIC Device Access
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

        {/* Permission items */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          {/* 1. Storage Access */}
          <div style={{
            display: 'flex',
            alignItems: 'flex-start',
            gap: '14px',
            padding: '14px',
            borderRadius: '16px',
            backgroundColor: '#faf8f5',
            border: '1px solid rgba(0, 0, 0, 0.05)'
          }}>
            <div style={{ color: 'var(--accent-pink)', marginTop: '2px' }}>
              <HardDrive size={20} />
            </div>
            <div style={{ flex: 1 }}>
              <h4 style={{ fontSize: '14px', fontWeight: '700', color: 'var(--text-main)', margin: '0 0 3px 0' }}>
                Storage & Audio Files Access
              </h4>
              <p style={{ fontSize: '12px', color: 'var(--text-muted)', margin: 0, lineHeight: 1.4 }}>
                Required to automatically find and play your <strong>MP3 & M4A songs</strong> from your Downloads & Music folders.
              </p>
            </div>
          </div>

          {/* 2. Notification Access */}
          <div style={{
            display: 'flex',
            alignItems: 'flex-start',
            gap: '14px',
            padding: '14px',
            borderRadius: '16px',
            backgroundColor: '#faf8f5',
            border: '1px solid rgba(0, 0, 0, 0.05)'
          }}>
            <div style={{ color: 'var(--accent-red)', marginTop: '2px' }}>
              <Bell size={20} />
            </div>
            <div style={{ flex: 1 }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <h4 style={{ fontSize: '14px', fontWeight: '700', color: 'var(--text-main)', margin: '0 0 3px 0' }}>
                  Playback Notifications
                </h4>
                {notificationGranted && (
                  <span style={{ fontSize: '11px', fontWeight: '700', color: '#16a34a', display: 'flex', alignItems: 'center', gap: '4px' }}>
                    <CheckCircle2 size={13} /> Granted
                  </span>
                )}
              </div>
              <p style={{ fontSize: '12px', color: 'var(--text-muted)', margin: 0, lineHeight: 1.4 }}>
                Required to display currently playing songs, album art, and lock-screen controls in your status bar.
              </p>
            </div>
          </div>
        </div>

        {/* Status Message */}
        {statusMessage && (
          <div style={{
            padding: '10px 14px',
            borderRadius: '12px',
            backgroundColor: '#fdeef1',
            color: 'var(--accent-pink)',
            fontSize: '12px',
            fontWeight: '600',
            textAlign: 'center'
          }}>
            {statusMessage}
          </div>
        )}

        {/* Action Button: Coral/Red Styled */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
          <button
            onClick={handleGrantAccessAndFetch}
            disabled={isScanning}
            className="btn-red-action"
            style={{
              width: '100%',
              padding: '14px',
              fontSize: '15px',
              borderRadius: '16px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '8px'
            }}
          >
            <FolderSearch size={18} />
            {isScanning ? 'Granting Access & Scanning...' : 'Grant Access & Fetch Songs'}
          </button>

          <button
            onClick={() => {
              fileInputRef.current?.click();
            }}
            style={{
              background: 'none',
              border: 'none',
              color: 'var(--text-muted)',
              fontSize: '13px',
              fontWeight: '600',
              padding: '6px',
              cursor: 'pointer'
            }}
          >
            Select specific audio files manually
          </button>
        </div>
      </div>
    </div>
  );
}
