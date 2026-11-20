// IndexedDB & Browser File System Access API for Local Music Storage

const DB_NAME = 'WhiteDevilsMusicDB';
const DB_VERSION = 1;
const STORE_NAME = 'tracks_store';
const SETTINGS_STORE = 'settings_store';

export function openMusicDB() {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION);
    request.onupgradeneeded = (e) => {
      const db = e.target.result;
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        db.createObjectStore(STORE_NAME, { keyPath: 'id' });
      }
      if (!db.objectStoreNames.contains(SETTINGS_STORE)) {
        db.createObjectStore(SETTINGS_STORE, { keyPath: 'key' });
      }
    };
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}

// Save tracks to IndexedDB
export async function saveTracksToIndexedDB(tracks) {
  try {
    const db = await openMusicDB();
    const tx = db.transaction(STORE_NAME, 'readwrite');
    const store = tx.objectStore(STORE_NAME);
    // Clear and put
    await new Promise((res, rej) => {
      const clearReq = store.clear();
      clearReq.onsuccess = res;
      clearReq.onerror = rej;
    });

    for (const track of tracks) {
      // Store serializable data and file blob if available
      const record = {
        id: track.id,
        title: track.title,
        artist: track.artist,
        album: track.album,
        duration: track.duration,
        coverUrl: track.coverUrl || '',
        useDefaultIcon: track.useDefaultIcon !== false,
        fileBlob: track.fileBlob || null,
        audioUrl: track.fileBlob ? '' : (track.audioUrl || ''),
        relPath: track.relPath || '',
        isLiked: !!track.isLiked
      };
      store.put(record);
    }
  } catch (err) {
    console.warn("Could not save tracks to IndexedDB:", err);
  }
}

// Update a single track in IndexedDB
export async function updateTrackInIndexedDB(track) {
  try {
    const db = await openMusicDB();
    const tx = db.transaction(STORE_NAME, 'readwrite');
    const store = tx.objectStore(STORE_NAME);
    const existing = await new Promise((resolve) => {
      const req = store.get(track.id);
      req.onsuccess = () => resolve(req.result);
      req.onerror = () => resolve(null);
    });

    const record = {
      ...(existing || {}),
      id: track.id,
      title: track.title,
      artist: track.artist,
      album: track.album,
      duration: track.duration || existing?.duration || 210,
      coverUrl: track.coverUrl || '',
      useDefaultIcon: track.useDefaultIcon !== false,
      audioUrl: track.fileBlob ? (existing?.audioUrl || '') : (track.audioUrl || existing?.audioUrl || ''),
      relPath: track.relPath || existing?.relPath || '',
      isLiked: track.isLiked !== undefined ? track.isLiked : (existing?.isLiked || false)
    };
    store.put(record);
  } catch (err) {
    console.warn("Could not update track in IndexedDB:", err);
  }
}

// Load saved tracks from IndexedDB
export async function loadTracksFromIndexedDB() {
  try {
    const db = await openMusicDB();
    const tx = db.transaction(STORE_NAME, 'readonly');
    const store = tx.objectStore(STORE_NAME);
    return new Promise((resolve) => {
      const req = store.getAll();
      req.onsuccess = () => {
        const records = req.result || [];
        const tracks = records.map(r => {
          let audioUrl = '';
          if (r.fileBlob) {
            audioUrl = URL.createObjectURL(r.fileBlob);
          }
          return {
            ...r,
            audioUrl: audioUrl || r.audioUrl,
            isLocalFile: true
          };
        });
        resolve(tracks);
      };
      req.onerror = () => resolve([]);
    });
  } catch (err) {
    return [];
  }
}

// Extract track metadata from File object in browser with sub-millisecond responsiveness
export function extractBrowserTrack(file) {
  const baseName = file.name.replace(/\.[^/.]+$/, "");
  let title = baseName;
  let artist = 'Unknown artist';
  let album = 'Music';

  if (baseName.includes(' - ')) {
    const parts = baseName.split(' - ');
    artist = parts[0].trim();
    title = parts.slice(1).join(' - ').trim();
  }

  const audioUrl = URL.createObjectURL(file);

  return {
    id: `device-track-${file.name.replace(/[^a-zA-Z0-9]/g, '_')}-${file.size}`,
    title,
    artist,
    album,
    duration: 210,
    coverUrl: '',
    useDefaultIcon: true,
    audioUrl,
    fileBlob: file,
    isLocalFile: true
  };
}

// Recursively scan File System Access API DirectoryHandle
export async function scanDirectoryHandle(dirHandle) {
  const tracks = [];
  const supportedExts = ['.mp3', '.m4a', '.wav', '.flac', '.ogg', '.aac'];

  async function walk(handle) {
    for await (const entry of handle.values()) {
      if (entry.kind === 'file') {
        const ext = '.' + entry.name.split('.').pop().toLowerCase();
        if (supportedExts.includes(ext)) {
          try {
            const file = await entry.getFile();
            const track = await extractBrowserTrack(file);
            tracks.push(track);
          } catch (e) {
            console.warn("Could not read file from handle:", entry.name, e);
          }
        }
      } else if (entry.kind === 'directory') {
        if (!entry.name.startsWith('.') && entry.name !== 'node_modules' && entry.name !== 'AppData') {
          await walk(entry);
        }
      }
    }
  }

  await walk(dirHandle);
  return tracks;
}

// ---------------------------------------------------------------------------
// Bulletproof Metadata Overrides Store (localStorage)
// Preserves user edits for title, artist, album, and coverUrl permanently
// ---------------------------------------------------------------------------

const OVERRIDES_STORAGE_KEY = 'white_devils_track_overrides';

export function getStoredOverrides(userId = null) {
  if (typeof window === 'undefined' || !window.localStorage) return {};
  try {
    const key = userId ? `${OVERRIDES_STORAGE_KEY}_${userId}` : OVERRIDES_STORAGE_KEY;
    const raw = localStorage.getItem(key);
    return raw ? JSON.parse(raw) : {};
  } catch (e) {
    return {};
  }
}

export function normalizeOverrideKey(str) {
  if (!str) return '';
  return String(str).trim().toLowerCase().replace(/[^a-z0-9]/g, '');
}

export function saveStoredOverride(updatedTrack, originalTrack = null, userId = null) {
  if (typeof window === 'undefined' || !window.localStorage) return null;
  try {
    const key = userId ? `${OVERRIDES_STORAGE_KEY}_${userId}` : OVERRIDES_STORAGE_KEY;
    const overrides = getStoredOverrides(userId);

    const overrideData = {
      id: updatedTrack.id,
      title: updatedTrack.title,
      artist: updatedTrack.artist,
      album: updatedTrack.album,
      coverUrl: updatedTrack.coverUrl,
      useDefaultIcon: updatedTrack.useDefaultIcon,
      relPath: updatedTrack.relPath || originalTrack?.relPath,
      originalTitle: originalTrack?.title || updatedTrack.title,
      updatedAt: Date.now()
    };

    // 1. Index by ID
    if (updatedTrack.id) {
      overrides[`id:${updatedTrack.id}`] = overrideData;
    }
    // 2. Index by relative path / filename
    if (overrideData.relPath) {
      overrides[`rel:${overrideData.relPath.toLowerCase()}`] = overrideData;
      const fn = overrideData.relPath.split(/[\/\\]/).pop().toLowerCase();
      overrides[`fn:${fn}`] = overrideData;
    }
    // 3. Index by normalized title
    if (overrideData.title) {
      overrides[`title:${normalizeOverrideKey(overrideData.title)}`] = overrideData;
    }
    if (overrideData.originalTitle) {
      overrides[`title:${normalizeOverrideKey(overrideData.originalTitle)}`] = overrideData;
    }

    localStorage.setItem(key, JSON.stringify(overrides));
    return overrideData;
  } catch (e) {
    console.warn("Could not save override to localStorage:", e);
    return null;
  }
}

export function findMatchingOverride(track, overrides = null) {
  if (!track) return null;
  const store = overrides || getStoredOverrides();
  if (!store || typeof store !== 'object') return null;

  // 1. ID match
  if (track.id && store[`id:${track.id}`]) {
    return store[`id:${track.id}`];
  }
  if (track.id && store[track.id] && store[track.id].artist) {
    return store[track.id];
  }

  // 2. RelPath match
  if (track.relPath && store[`rel:${track.relPath.toLowerCase()}`]) {
    return store[`rel:${track.relPath.toLowerCase()}`];
  }

  // 3. Filename match
  if (track.relPath) {
    const fn = track.relPath.split(/[\/\\]/).pop().toLowerCase();
    if (store[`fn:${fn}`]) return store[`fn:${fn}`];
  }

  // 4. Normalized title match
  if (track.title) {
    const norm = normalizeOverrideKey(track.title);
    if (store[`title:${norm}`]) return store[`title:${norm}`];
  }

  // 5. Deep scan values
  const trackNorm = normalizeOverrideKey(track.title);
  const trackFn = track.relPath ? track.relPath.split(/[\/\\]/).pop().toLowerCase() : '';
  for (const key of Object.keys(store)) {
    const item = store[key];
    if (!item || typeof item !== 'object') continue;
    if (item.id === track.id) return item;
    if (trackNorm && (normalizeOverrideKey(item.title) === trackNorm || normalizeOverrideKey(item.originalTitle) === trackNorm)) {
      return item;
    }
    if (trackFn && item.relPath && item.relPath.split(/[\/\\]/).pop().toLowerCase() === trackFn) {
      return item;
    }
  }

  return null;
}

export function applyStoredOverrides(trackList, overrides = null, userId = null) {
  if (!Array.isArray(trackList)) return trackList;
  const store = overrides || getStoredOverrides(userId);
  return trackList.map(t => {
    const ov = findMatchingOverride(t, store);
    const rawArtist = ov ? (ov.artist !== undefined ? ov.artist : t.artist) : t.artist;
    const rawAlbum = ov ? (ov.album !== undefined ? ov.album : t.album) : t.album;
    const cleanArtist = (rawArtist && rawArtist !== 'Verified Test Artist') ? rawArtist : 'Unknown artist';
    const cleanAlbum = (rawAlbum && rawAlbum !== 'Verified Test Album') ? rawAlbum : 'Music';

    if (!ov) {
      return {
        ...t,
        artist: cleanArtist,
        album: cleanAlbum
      };
    }
    return {
      ...t,
      title: ov.title || t.title,
      artist: cleanArtist,
      album: cleanAlbum,
      coverUrl: ov.coverUrl !== undefined ? ov.coverUrl : t.coverUrl,
      useDefaultIcon: ov.coverUrl ? false : (ov.useDefaultIcon !== undefined ? ov.useDefaultIcon : t.useDefaultIcon)
    };
  });
}
