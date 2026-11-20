const fs = require('fs');
const path = require('path');
const os = require('os');
const crypto = require('crypto');

let mm = null;
async function getMusicMetadata() {
  if (!mm) {
    try {
      mm = await import('music-metadata');
    } catch (e) {
      console.warn("Could not dynamically import music-metadata:", e.message);
    }
  }
  return mm;
}

const SUPPORTED_EXTS = ['.mp3', '.m4a', '.wav', '.flac', '.ogg', '.aac'];

// Map of trackId -> fullPath on disk for zero-copy streaming
const trackPathMap = new Map();

// In-memory cache for ultra-fast rescan (stat check in < 0.01ms per file)
const metadataCache = new Map();

// Clean and extract title and artist from filename fallback
function parseFilenameFallback(filename) {
  const baseName = path.parse(filename).name;
  if (baseName.includes(' - ')) {
    const parts = baseName.split(' - ');
    const artist = parts[0].trim();
    const title = parts.slice(1).join(' - ').trim();
    return { title: title || baseName, artist: artist || 'Unknown artist' };
  }
  const cleanTitle = baseName.replace(/^(\d+[\s\.\-_]+)/, '').trim();
  return {
    title: cleanTitle || baseName,
    artist: 'Unknown artist'
  };
}

// Get standard user audio folders on Windows (Downloads, Music, etc.)
function getStandardAudioDirs(targetSongsDir) {
  const home = os.homedir();
  const userProfile = process.env.USERPROFILE || home;
  const oneDrive = process.env.OneDrive || path.join(home, 'OneDrive');

  const candidates = [
    path.join(home, 'Downloads'),
    path.join(userProfile, 'Downloads'),
    path.join(home, 'Music'),
    path.join(userProfile, 'Music'),
    path.join(oneDrive, 'Music'),
    path.join(oneDrive, 'Downloads'),
    path.join(oneDrive, 'Desktop'),
    path.join(home, 'Desktop'),
    path.join(userProfile, 'Desktop')
  ];

  if (targetSongsDir) {
    const parentDir = path.dirname(targetSongsDir);
    const driveRoot = path.parse(path.resolve(targetSongsDir)).root;
    candidates.push(parentDir);
    candidates.push(driveRoot);
    candidates.push(path.join(driveRoot, 'Downloads'));
    candidates.push(path.join(driveRoot, 'Music'));
  }

  const uniqueDirs = Array.from(new Set(candidates.map(d => d ? path.normalize(d) : '')));
  return uniqueDirs.filter(dir => {
    try {
      return dir && fs.existsSync(dir);
    } catch (e) {
      return false;
    }
  });
}

// Parse single file metadata with high-speed memory caching
async function getFileTrackData(fullPath, mmModule) {
  try {
    const stat = fs.statSync(fullPath);
    const cached = metadataCache.get(fullPath);
    if (cached && cached.mtimeMs === stat.mtimeMs && cached.size === stat.size) {
      return cached.data;
    }

    let metadata = null;
    if (mmModule) {
      try {
        metadata = await mmModule.parseFile(fullPath, { duration: true, skipCovers: false });
      } catch (metaErr) {
        // Tag parse fail fallback
      }
    }

    const fallback = parseFilenameFallback(path.basename(fullPath));
    const title = metadata?.common?.title || fallback.title;
    const rawArtist = metadata?.common?.artist;
    const artist = (rawArtist && rawArtist.trim() && rawArtist !== 'Verified Test Artist') 
      ? rawArtist.trim() 
      : ((fallback.artist && fallback.artist !== 'Verified Test Artist') ? fallback.artist : 'Unknown artist');
    const rawAlbum = metadata?.common?.album;
    const album = (!rawAlbum || rawAlbum === '.' || rawAlbum.toLowerCase() === 'songs' || rawAlbum === 'Verified Test Album') 
      ? 'Music' 
      : rawAlbum.trim();
    const duration = Math.round(metadata?.format?.duration || 0);
    const genre = metadata?.common?.genre?.[0] || 'Music';

    let coverUrl = '';
    if (metadata?.common?.picture && metadata.common.picture.length > 0) {
      const pic = metadata.common.picture[0];
      const mime = pic.format || 'image/jpeg';
      const base64 = Buffer.from(pic.data).toString('base64');
      coverUrl = `data:${mime};base64,${base64}`;
    }

    const data = {
      title,
      artist,
      album,
      duration: duration > 0 ? duration : 210,
      genre,
      coverUrl,
      fileSize: stat.size
    };

    metadataCache.set(fullPath, {
      mtimeMs: stat.mtimeMs,
      size: stat.size,
      data
    });

    return data;
  } catch (e) {
    return null;
  }
}

// Scan a single directory recursively in-place (ZERO FILE COPYING)
async function scanDirectory(dirPath, maxDepth = 2) {
  const results = [];
  if (!dirPath || !fs.existsSync(dirPath)) return results;

  const mmModule = await getMusicMetadata();

  async function walk(currentDir, depth) {
    if (depth > maxDepth) return;
    let entries = [];
    try {
      entries = fs.readdirSync(currentDir, { withFileTypes: true });
    } catch (err) {
      return;
    }

    for (const entry of entries) {
      const fullPath = path.join(currentDir, entry.name);
      if (entry.isDirectory()) {
        const name = entry.name;
        if (!name.startsWith('.') && !name.startsWith('$') &&
            name !== 'node_modules' && name !== 'AppData' &&
            name !== 'dist' && name !== 'build' &&
            name !== 'System Volume Information') {
          await walk(fullPath, depth + 1);
        }
      } else if (entry.isFile()) {
        const ext = path.extname(entry.name).toLowerCase();
        if (SUPPORTED_EXTS.includes(ext)) {
          const trackData = await getFileTrackData(fullPath, mmModule);
          if (trackData) {
            const trackId = `local-${crypto.createHash('md5').update(fullPath.toLowerCase()).digest('hex')}`;
            trackPathMap.set(trackId, fullPath);

            results.push({
              id: trackId,
              title: trackData.title,
              artist: trackData.artist,
              album: trackData.album,
              duration: trackData.duration,
              genre: trackData.genre,
              coverUrl: trackData.coverUrl,
              useDefaultIcon: !trackData.coverUrl,
              audioUrl: `/api/stream/local?id=${encodeURIComponent(trackId)}`,
              relPath: path.basename(fullPath),
              fullPath,
              fileSize: trackData.fileSize,
              isLocalFile: true
            });
          }
        }
      }
    }
  }

  await walk(dirPath, 1);
  return results;
}

// Scan all available music locations in-place (ZERO STORAGE OVERHEAD)
async function scanAllMusicLocations(defaultSongsDir, customSongsDir = null) {
  const searchDirs = new Set();

  if (defaultSongsDir && fs.existsSync(defaultSongsDir)) {
    searchDirs.add(path.normalize(defaultSongsDir));
  }
  if (customSongsDir && fs.existsSync(customSongsDir)) {
    searchDirs.add(path.normalize(customSongsDir));
  }

  // Include standard user audio folders (Downloads, Music, Desktop)
  const standardDirs = getStandardAudioDirs(defaultSongsDir);
  for (const sDir of standardDirs) {
    searchDirs.add(path.normalize(sDir));
  }

  const allTracks = [];
  const seenPaths = new Set();
  const seenSignatures = new Set();

  for (const dir of searchDirs) {
    try {
      const tracks = await scanDirectory(dir, 2);
      for (const t of tracks) {
        const norm = path.normalize(t.fullPath).toLowerCase();
        // Prevent listing duplicates if a file exists in multiple scanned directories
        const signature = `${(t.title || '').trim().toLowerCase()}|${(t.artist || '').trim().toLowerCase()}|${t.fileSize}`;
        if (!seenPaths.has(norm) && !seenSignatures.has(signature)) {
          seenPaths.add(norm);
          seenSignatures.add(signature);
          allTracks.push(t);
        }
      }
    } catch (e) {
      console.warn(`[In-Place Scanner] Error scanning ${dir}:`, e.message);
    }
  }

  return allTracks;
}

// Background auto-discover without copying
function autoDiscoverAndSync(targetSongsDir) {
  // Pure in-place scanner — zero file copying to save disk space
  return [];
}

// Watch folders in background to invalidate cache when new songs arrive
let isWatcherActive = false;
function setupAutoWatchers(targetSongsDir) {
  if (isWatcherActive) return;
  isWatcherActive = true;

  const searchDirs = getStandardAudioDirs(targetSongsDir);
  searchDirs.forEach(dir => {
    try {
      fs.watch(dir, { recursive: false }, (eventType, filename) => {
        if (!filename) return;
        const ext = path.extname(filename).toLowerCase();
        if (SUPPORTED_EXTS.includes(ext)) {
          const fullSrc = path.join(dir, filename);
          metadataCache.delete(fullSrc);
          console.log(`[Auto-Watch] In-place detected audio file: ${filename}`);
        }
      });
      console.log(`[Auto-Watch] In-place watching for MP3/M4A in: ${dir}`);
    } catch (e) {
      console.warn(`[Auto-Watch] Unable to watch ${dir}:`, e.message);
    }
  });
}

module.exports = {
  scanDirectory,
  scanAllMusicLocations,
  autoDiscoverAndSync,
  setupAutoWatchers,
  trackPathMap,
  SUPPORTED_EXTS
};
