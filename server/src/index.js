const express = require('express');
const cors = require('cors');
const fs = require('fs');
const path = require('path');
const multer = require('multer');
const { loadData, saveData } = require('./tracksData');
const { scanDirectory, scanAllMusicLocations, autoDiscoverAndSync, setupAutoWatchers, trackPathMap, SUPPORTED_EXTS } = require('./localScanner');
const { 
  createUser, 
  authenticateUser, 
  sanitizeUser, 
  generateToken, 
  findUserById, 
  findUserByUsername,
  findUserByEmail,
  createPasswordResetToken,
  resetPasswordWithToken,
  updateUser 
} = require('./userManager');
const { authenticate, optionalAuth } = require('./authMiddleware');

const app = express();
const PORT = process.env.PORT || 5000;

// Local songs directory in d:\Music\songs
const defaultSongsDir = path.resolve(__dirname, '..', '..', 'songs');
if (!fs.existsSync(defaultSongsDir)) {
  fs.mkdirSync(defaultSongsDir, { recursive: true });
}

// Auto-discover and watch MP3 and M4A files from user's computer
try {
  scanDirectory(defaultSongsDir).then(() => {
    console.log(`🎵 Pre-cached ${trackPathMap.size} tracks from ${defaultSongsDir}`);
  }).catch(() => {});
  setupAutoWatchers(defaultSongsDir);
} catch (err) {
  console.warn("Auto-discovery startup notice:", err.message);
}

// Uploads directory
const uploadsDir = path.join(__dirname, '..', 'uploads');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

// Enable CORS and body parsing (limit 50mb for base64 images if sent via json)
app.use(cors());
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

// Static serve uploaded files and local songs with full CORS
app.use('/uploads', express.static(uploadsDir));
app.use('/songs', (req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Methods', 'GET, HEAD, OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Range, Authorization');
  next();
}, express.static(defaultSongsDir));

// Multer storage for saving audio files to d:\Music\songs
const songsStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, defaultSongsDir);
  },
  filename: (req, file, cb) => {
    cb(null, file.originalname);
  }
});

const uploadToSongs = multer({
  storage: songsStorage,
  limits: { fileSize: 100 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase();
    if (SUPPORTED_EXTS.includes(ext) || file.mimetype.startsWith('audio/')) {
      cb(null, true);
    } else {
      cb(new Error('Only audio files are allowed!'));
    }
  }
});

// Multer storage for images (song / playlist covers)
const imageStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadsDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
    const ext = path.extname(file.originalname) || '.jpg';
    cb(null, `cover-${uniqueSuffix}${ext}`);
  }
});

const uploadImage = multer({
  storage: imageStorage,
  limits: { fileSize: 15 * 1024 * 1024 }, // 15MB
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Only image files are allowed!'));
    }
  }
});

// Helper: Get audio mime type
function getAudioMimeType(filePath) {
  const ext = path.extname(filePath).toLowerCase();
  switch (ext) {
    case '.mp3': return 'audio/mpeg';
    case '.m4a': return 'audio/mp4';
    case '.wav': return 'audio/wav';
    case '.flac': return 'audio/flac';
    case '.ogg': return 'audio/ogg';
    case '.aac': return 'audio/aac';
    default: return 'audio/mpeg';
  }
}

// Helper: Stream local audio with HTTP 206 Range support and complete CORS headers for Web Audio API
function streamAudioFile(filePath, req, res) {
  if (!fs.existsSync(filePath)) {
    return res.status(404).send('Audio file not found on local storage');
  }

  const stat = fs.statSync(filePath);
  const fileSize = stat.size;
  const range = req.headers.range;
  const mimeType = getAudioMimeType(filePath);

  const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, HEAD, OPTIONS',
    'Access-Control-Allow-Headers': 'Origin, X-Requested-With, Content-Type, Accept, Range, Authorization',
    'Access-Control-Expose-Headers': 'Content-Range, Accept-Ranges, Content-Length'
  };

  if (range) {
    const parts = range.replace(/bytes=/, "").split("-");
    const start = parseInt(parts[0], 10);
    const end = parts[1] ? parseInt(parts[1], 10) : fileSize - 1;

    if (start >= fileSize) {
      res.writeHead(416, { ...corsHeaders, 'Content-Range': `bytes */${fileSize}` });
      res.end(`Requested range not satisfiable\n${start} >= ${fileSize}`);
      return;
    }

    const chunksize = (end - start) + 1;
    const file = fs.createReadStream(filePath, { start, end });
    const head = {
      ...corsHeaders,
      'Content-Range': `bytes ${start}-${end}/${fileSize}`,
      'Accept-Ranges': 'bytes',
      'Content-Length': chunksize,
      'Content-Type': mimeType,
    };

    res.writeHead(206, head);
    file.pipe(res);
  } else {
    const head = {
      ...corsHeaders,
      'Content-Length': fileSize,
      'Content-Type': mimeType,
      'Accept-Ranges': 'bytes',
    };
    res.writeHead(200, head);
    fs.createReadStream(filePath).pipe(res);
  }
}

// GET /api/health
app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'ok', 
    songsDir: defaultSongsDir,
    timestamp: new Date().toISOString() 
  });
});

// Helper: Normalize key for metadata matching
function normalizeMetaKey(str) {
  if (!str) return '';
  return str.trim().toLowerCase().replace(/[^a-z0-9]/g, '');
}

// Helper: Merge track overrides
function mergeOverrides(trackList, overrides = {}) {
  if (!overrides || typeof overrides !== 'object') return trackList || [];
  
  return (trackList || []).map(t => {
    // 1. Exact track ID
    let override = overrides[t.id];

    // 2. Exact RelPath or Filename
    if (!override && t.relPath) {
      override = overrides[t.relPath] || overrides[t.relPath.toLowerCase()];
      if (!override) {
        const fn = path.basename(t.relPath).toLowerCase();
        override = overrides[fn];
      }
    }

    // 3. Normalized Title
    if (!override && t.title) {
      const normTitle = normalizeMetaKey(t.title);
      override = overrides[normTitle];
    }

    // 4. Scan override values if not found directly
    if (!override) {
      const tNorm = normalizeMetaKey(t.title);
      const tFn = t.relPath ? path.basename(t.relPath).toLowerCase() : '';
      for (const key of Object.keys(overrides)) {
        const ov = overrides[key];
        if (!ov || typeof ov !== 'object') continue;
        if (ov.id === t.id) { override = ov; break; }
        if (tNorm && (normalizeMetaKey(ov.title) === tNorm || normalizeMetaKey(ov.originalTitle) === tNorm)) {
          override = ov;
          break;
        }
        if (tFn && ov.relPath && path.basename(ov.relPath).toLowerCase() === tFn) {
          override = ov;
          break;
        }
      }
    }

    if (override) {
      const cleanArtist = (override.artist && override.artist !== 'Verified Test Artist') 
        ? override.artist 
        : (t.artist && t.artist !== 'Verified Test Artist' ? t.artist : 'Unknown artist');
      const cleanAlbum = (override.album && override.album !== 'Verified Test Album') 
        ? override.album 
        : (t.album && t.album !== 'Verified Test Album' ? t.album : 'Music');
      return { 
        ...t, 
        title: override.title || t.title,
        artist: cleanArtist,
        album: cleanAlbum,
        coverUrl: override.coverUrl !== undefined ? override.coverUrl : t.coverUrl,
        useDefaultIcon: override.coverUrl ? false : (override.useDefaultIcon !== undefined ? override.useDefaultIcon : t.useDefaultIcon),
        genre: override.genre || t.genre
      };
    }
    return {
      ...t,
      artist: (t.artist && t.artist !== 'Verified Test Artist') ? t.artist : 'Unknown artist',
      album: (t.album && t.album !== 'Verified Test Album') ? t.album : 'Music'
    };
  });
}

// Helper: Merge with user-specific overrides and user-specific likes
function mergeUserTracks(localTracks, user, globalOverrides = {}) {
  const userOverrides = (user && user.trackOverrides) ? user.trackOverrides : {};
  const effectiveOverrides = { ...(globalOverrides || {}), ...(userOverrides || {}) };
  const merged = mergeOverrides(localTracks, effectiveOverrides);

  const likedSet = new Set((user && Array.isArray(user.likedTrackIds)) ? user.likedTrackIds : []);
  return merged.map(t => ({
    ...t,
    isLiked: likedSet.has(t.id)
  }));
}

// ---------------------------------------------------------------------------
// AUTHENTICATION ROUTES (JWT & EMAIL-PASSWORD)
// ---------------------------------------------------------------------------

// POST /api/auth/register - Register new user account (Username, Email, Password, Name)
app.post('/api/auth/register', (req, res) => {
  try {
    const { username, email, password, name } = req.body;
    const user = createUser({ username, email, password, name });
    const token = generateToken(user);
    res.status(201).json({
      success: true,
      token,
      user
    });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
});

// POST /api/auth/login - Log in with Email and Password
app.post('/api/auth/login', (req, res) => {
  try {
    const { email, username, password } = req.body;
    const identifier = email || username;
    const user = authenticateUser(identifier, password);
    const token = generateToken(user);
    res.json({
      success: true,
      token,
      user
    });
  } catch (err) {
    res.status(401).json({ success: false, message: err.message });
  }
});

// GET /api/auth/me - Get current user profile from token
app.get('/api/auth/me', authenticate, (req, res) => {
  res.json({
    success: true,
    user: sanitizeUser(req.user)
  });
});

// POST /api/auth/forgot-password - Request password reset code
app.post('/api/auth/forgot-password', (req, res) => {
  try {
    const { email } = req.body;
    const result = createPasswordResetToken(email);
    res.json({
      success: true,
      message: `Password reset verification code has been sent to ${result.email}.`,
      resetToken: result.resetToken, // Returned for instant testing and local feedback
      expiresInMinutes: result.expiresInMinutes
    });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
});

// POST /api/auth/reset-password - Reset password using verification code
app.post('/api/auth/reset-password', (req, res) => {
  try {
    const { token, newPassword } = req.body;
    const user = resetPasswordWithToken(token, newPassword);
    const jwtToken = generateToken(user);
    res.json({
      success: true,
      message: 'Password has been successfully updated! You are now logged in.',
      token: jwtToken,
      user
    });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
});

// ---------------------------------------------------------------------------
// TRACKS & MUSIC LIBRARY ROUTES
// ---------------------------------------------------------------------------

// GET /api/tracks - Fetch all songs (auto-discovers local files in-place, scopes likes & overrides to current user)
app.get('/api/tracks', optionalAuth, async (req, res) => {
  const data = loadData();
  const targetDir = data.customSongsDir && fs.existsSync(data.customSongsDir) 
    ? data.customSongsDir 
    : defaultSongsDir;

  try {
    let localTracks = await scanAllMusicLocations(defaultSongsDir, data.customSongsDir);
    const mergedTracks = mergeUserTracks(localTracks, req.user, data.trackOverrides);
    return res.json({
      success: true,
      count: mergedTracks.length,
      tracks: mergedTracks,
      source: 'local_storage',
      folder: targetDir,
      user: req.user ? { id: req.user.id, username: req.user.username } : null
    });
  } catch (err) {
    console.error("Local scan error:", err);
    return res.json({
      success: true,
      count: 0,
      tracks: [],
      source: 'local_storage',
      folder: targetDir,
      error: err.message
    });
  }
});

// POST /api/tracks/rescan - Force rescan of local storage directory in-place
app.post('/api/tracks/rescan', optionalAuth, async (req, res) => {
  const data = loadData();
  const targetDir = data.customSongsDir && fs.existsSync(data.customSongsDir) 
    ? data.customSongsDir 
    : defaultSongsDir;

  try {
    let localTracks = await scanAllMusicLocations(defaultSongsDir, data.customSongsDir);
    const mergedTracks = mergeUserTracks(localTracks, req.user, data.trackOverrides);

    res.json({
      success: true,
      count: mergedTracks.length,
      tracks: mergedTracks,
      folder: targetDir
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// POST /api/settings/folder - Configure a custom local music folder
app.post('/api/settings/folder', optionalAuth, async (req, res) => {
  const { folderPath } = req.body;
  if (!folderPath || !fs.existsSync(folderPath)) {
    return res.status(400).json({ success: false, message: 'Folder path does not exist on this machine.' });
  }

  const data = loadData();
  data.customSongsDir = folderPath;
  saveData(data);

  const localTracks = await scanAllMusicLocations(defaultSongsDir, folderPath);
  const mergedTracks = mergeUserTracks(localTracks, req.user, data.trackOverrides);

  res.json({
    success: true,
    folder: folderPath,
    count: mergedTracks.length,
    tracks: mergedTracks
  });
});

// GET /api/stream/local - Stream audio file directly from local storage with Range support
// GET /api/stream/local - Stream audio file directly from local storage with Range support & self-healing fallbacks
app.get('/api/stream/local', async (req, res) => {
  const trackId = req.query.id;
  const relFile = req.query.file;
  const title = req.query.title;

  let fullPath = null;
  if (trackId && trackPathMap.has(trackId)) {
    fullPath = trackPathMap.get(trackId);
  }

  // Fallback 1: check relFile if specified
  if ((!fullPath || !fs.existsSync(fullPath)) && relFile) {
    const data = loadData();
    const targetDir = data.customSongsDir && fs.existsSync(data.customSongsDir) 
      ? data.customSongsDir 
      : defaultSongsDir;

    const cand1 = path.resolve(targetDir, relFile);
    const cand2 = path.resolve(defaultSongsDir, relFile);
    if (fs.existsSync(cand1)) fullPath = cand1;
    else if (fs.existsSync(cand2)) fullPath = cand2;
    else if (fs.existsSync(relFile)) fullPath = relFile;
  }

  // Fallback 2: if trackPathMap was empty on startup, quick scan defaultSongsDir
  if ((!fullPath || !fs.existsSync(fullPath)) && trackPathMap.size === 0) {
    try {
      await scanDirectory(defaultSongsDir);
      if (trackId && trackPathMap.has(trackId)) {
        fullPath = trackPathMap.get(trackId);
      }
    } catch (e) {}
  }

  // Fallback 3: search songs folder for any file loosely matching trackId, relFile or title
  if (!fullPath || !fs.existsSync(fullPath)) {
    const rawTarget = (relFile || trackId || title || '');
    const cleanTarget = rawTarget.toLowerCase().replace(/^local-/, '').replace(/[-_.]/g, ' ').trim();
    if (cleanTarget && fs.existsSync(defaultSongsDir)) {
      try {
        const files = fs.readdirSync(defaultSongsDir);
        for (const f of files) {
          const ext = path.extname(f).toLowerCase();
          if (SUPPORTED_EXTS.includes(ext)) {
            const cleanF = f.toLowerCase().replace(ext, '').replace(/[-_.]/g, ' ').trim();
            if (cleanF === cleanTarget || cleanTarget.includes(cleanF) || cleanF.includes(cleanTarget)) {
              fullPath = path.resolve(defaultSongsDir, f);
              if (trackId) trackPathMap.set(trackId, fullPath);
              break;
            }
          }
        }
      } catch (e) {}
    }
  }

  if (!fullPath || !fs.existsSync(fullPath)) {
    return res.status(404).send('Audio file not found on local storage');
  }

  const ext = path.extname(fullPath).toLowerCase();
  if (!SUPPORTED_EXTS.includes(ext)) {
    return res.status(403).send('Forbidden: Not an audio file');
  }

  streamAudioFile(fullPath, req, res);
});

// POST /api/upload/image - Upload custom cover art for a song or playlist
app.post('/api/upload/image', uploadImage.single('image'), (req, res) => {
  if (!req.file) {
    return res.status(400).json({ success: false, message: 'No image uploaded' });
  }
  const coverUrl = `/uploads/${req.file.filename}`;
  res.json({ success: true, coverUrl });
});

// POST /api/tracks/batch-upload - Batch upload local MP3/M4A files into local storage
app.post('/api/tracks/batch-upload', uploadToSongs.array('audioFiles', 100), optionalAuth, async (req, res) => {
  if (!req.files || req.files.length === 0) {
    return res.status(400).json({ success: false, message: 'No audio files uploaded' });
  }

  const data = loadData();
  const targetDir = defaultSongsDir;
  const localTracks = await scanDirectory(targetDir);
  const mergedTracks = mergeUserTracks(localTracks, req.user, data.trackOverrides);

  res.status(201).json({
    success: true,
    uploadedCount: req.files.length,
    tracks: mergedTracks
  });
});

// POST /api/tracks/like/:id - Private Toggle track like (Strictly scoped to logged in user)
app.post('/api/tracks/like/:id', authenticate, (req, res) => {
  const trackId = req.params.id;
  let isNowLiked = false;

  updateUser(req.user.id, (user) => {
    if (!Array.isArray(user.likedTrackIds)) {
      user.likedTrackIds = [];
    }

    const idx = user.likedTrackIds.indexOf(trackId);
    if (idx !== -1) {
      user.likedTrackIds.splice(idx, 1);
      isNowLiked = false;
    } else {
      user.likedTrackIds.push(trackId);
      isNowLiked = true;
    }
  });

  res.json({ success: true, isLiked: isNowLiked });
});

// PUT /api/tracks/:id - Private track metadata edit (Strictly scoped to logged in user)
app.put('/api/tracks/:id', authenticate, (req, res) => {
  const { title, artist, album, coverUrl, genre, relPath, originalTitle } = req.body;
  const overrideRecord = {
    id: req.params.id,
    title: title ? title.trim() : undefined,
    originalTitle: originalTitle ? originalTitle.trim() : undefined,
    artist: artist ? artist.trim() : undefined,
    album: album ? album.trim() : undefined,
    coverUrl: coverUrl !== undefined ? coverUrl : undefined,
    useDefaultIcon: coverUrl ? false : (coverUrl === '' ? true : undefined),
    genre: genre || undefined,
    relPath: relPath || undefined,
    updatedAt: Date.now()
  };

  let userOverrides = {};
  updateUser(req.user.id, (user) => {
    if (!user.trackOverrides) user.trackOverrides = {};

    user.trackOverrides[req.params.id] = {
      ...(user.trackOverrides[req.params.id] || {}),
      ...overrideRecord
    };

    if (title) {
      const norm = normalizeMetaKey(title);
      user.trackOverrides[norm] = user.trackOverrides[req.params.id];
    }
    if (originalTitle) {
      const normOrig = normalizeMetaKey(originalTitle);
      user.trackOverrides[normOrig] = user.trackOverrides[req.params.id];
    }
    if (relPath) {
      const fn = path.basename(relPath).toLowerCase();
      user.trackOverrides[fn] = user.trackOverrides[req.params.id];
      user.trackOverrides[relPath.toLowerCase()] = user.trackOverrides[req.params.id];
    }

    userOverrides = user.trackOverrides[req.params.id];
  });

  res.json({ success: true, overrides: userOverrides });
});

// ---------------------------------------------------------------------------
// PRIVATE TO-DO LIST ROUTES (SCOPED PER USER)
// ---------------------------------------------------------------------------

// GET /api/todos - Get current user's to-dos
app.get('/api/todos', optionalAuth, (req, res) => {
  if (!req.user) {
    return res.json({ success: true, todos: [] });
  }
  const user = findUserById(req.user.id);
  res.json({ success: true, todos: (user && user.todos) ? user.todos : [] });
});

// POST /api/todos - Add new to-do item for current user
app.post('/api/todos', authenticate, (req, res) => {
  const { text } = req.body;
  if (!text) {
    return res.status(400).json({ success: false, message: 'Text is required' });
  }

  const newTodo = {
    id: `todo-${Date.now()}`,
    text: text.trim(),
    completed: false,
    createdAt: new Date().toISOString()
  };

  updateUser(req.user.id, (user) => {
    if (!Array.isArray(user.todos)) user.todos = [];
    user.todos.unshift(newTodo);
  });

  res.status(201).json({ success: true, todo: newTodo });
});

// PATCH /api/todos/:id - Toggle to-do status for current user
app.patch('/api/todos/:id', authenticate, (req, res) => {
  let updatedTodo = null;
  updateUser(req.user.id, (user) => {
    if (!Array.isArray(user.todos)) user.todos = [];
    const todo = user.todos.find(t => t.id === req.params.id);
    if (todo) {
      if (req.body.completed !== undefined) {
        todo.completed = req.body.completed;
      } else {
        todo.completed = !todo.completed;
      }
      updatedTodo = todo;
    }
  });

  if (!updatedTodo) {
    return res.status(404).json({ success: false, message: 'Todo not found in your list' });
  }

  res.json({ success: true, todo: updatedTodo });
});

// DELETE /api/todos/:id - Delete to-do from current user's list
app.delete('/api/todos/:id', authenticate, (req, res) => {
  updateUser(req.user.id, (user) => {
    if (Array.isArray(user.todos)) {
      user.todos = user.todos.filter(t => t.id !== req.params.id);
    }
  });

  res.json({ success: true, message: 'Todo deleted' });
});

// ---------------------------------------------------------------------------
// PRIVATE PLAYLISTS ROUTES (SCOPED PER USER)
// ---------------------------------------------------------------------------

// GET /api/playlists - Get current user's playlists
app.get('/api/playlists', optionalAuth, (req, res) => {
  if (!req.user) {
    return res.json({ success: true, playlists: [] });
  }
  const user = findUserById(req.user.id);
  res.json({ success: true, playlists: (user && user.playlists) ? user.playlists : [] });
});

// POST /api/playlists - Create new playlist for current user
app.post('/api/playlists', authenticate, (req, res) => {
  const { name, description, coverUrl, id, trackIds } = req.body;
  if (!name) {
    return res.status(400).json({ success: false, message: 'Playlist name is required' });
  }

  const newPlaylist = {
    id: id || `playlist-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`,
    name: name.trim(),
    description: description || '',
    coverUrl: coverUrl || '',
    trackIds: Array.isArray(trackIds) ? trackIds : []
  };

  updateUser(req.user.id, (user) => {
    if (!Array.isArray(user.playlists)) user.playlists = [];
    const existingIdx = user.playlists.findIndex(p => p.id === newPlaylist.id);
    if (existingIdx !== -1) {
      user.playlists[existingIdx] = { ...user.playlists[existingIdx], ...newPlaylist };
    } else {
      user.playlists.push(newPlaylist);
    }
  });

  res.status(201).json({ success: true, playlist: newPlaylist });
});

// PUT /api/playlists/:id - Edit playlist for current user
app.put('/api/playlists/:id', authenticate, (req, res) => {
  let updatedPlaylist = null;
  updateUser(req.user.id, (user) => {
    if (!Array.isArray(user.playlists)) user.playlists = [];
    const playlist = user.playlists.find(p => p.id === req.params.id);
    if (playlist) {
      const { name, description, coverUrl } = req.body;
      if (name) playlist.name = name.trim();
      if (description !== undefined) playlist.description = description;
      if (coverUrl !== undefined) playlist.coverUrl = coverUrl;
      updatedPlaylist = playlist;
    }
  });

  if (!updatedPlaylist) {
    return res.status(404).json({ success: false, message: 'Playlist not found in your account' });
  }

  res.json({ success: true, playlist: updatedPlaylist });
});

// DELETE /api/playlists/:id - Delete playlist for current user
app.delete('/api/playlists/:id', authenticate, (req, res) => {
  updateUser(req.user.id, (user) => {
    if (Array.isArray(user.playlists)) {
      user.playlists = user.playlists.filter(p => p.id !== req.params.id);
    }
  });

  res.json({ success: true, message: 'Playlist deleted' });
});

// POST /api/playlists/:id/add - Add track to current user's playlist
app.post('/api/playlists/:id/add', authenticate, (req, res) => {
  const { trackId } = req.body;
  let updatedPlaylist = null;

  updateUser(req.user.id, (user) => {
    if (!Array.isArray(user.playlists)) user.playlists = [];
    const playlist = user.playlists.find(p => p.id === req.params.id);
    if (playlist) {
      if (!playlist.trackIds) playlist.trackIds = [];
      if (!playlist.trackIds.includes(trackId)) {
        playlist.trackIds.push(trackId);
      }
      updatedPlaylist = playlist;
    }
  });

  if (!updatedPlaylist) {
    return res.status(404).json({ success: false, message: 'Playlist not found' });
  }

  res.json({ success: true, playlist: updatedPlaylist });
});

// DELETE /api/playlists/:id/remove/:trackId - Remove track from current user's playlist
app.delete('/api/playlists/:id/remove/:trackId', authenticate, (req, res) => {
  let updatedPlaylist = null;

  updateUser(req.user.id, (user) => {
    if (!Array.isArray(user.playlists)) user.playlists = [];
    const playlist = user.playlists.find(p => p.id === req.params.id);
    if (playlist) {
      playlist.trackIds = (playlist.trackIds || []).filter(id => id !== req.params.trackId);
      updatedPlaylist = playlist;
    }
  });

  if (!updatedPlaylist) {
    return res.status(404).json({ success: false, message: 'Playlist not found' });
  }

  res.json({ success: true, playlist: updatedPlaylist });
});

// ---------------------------------------------------------------------------
// PRODUCTION CLIENT SERVING (Serves built React Vite frontend)
// ---------------------------------------------------------------------------
const clientDistDir = path.resolve(__dirname, '..', '..', 'client', 'dist');
if (fs.existsSync(clientDistDir)) {
  app.use(express.static(clientDistDir));
  app.get('*', (req, res, next) => {
    if (req.path.startsWith('/api') || req.path.startsWith('/uploads') || req.path.startsWith('/songs')) {
      return next();
    }
    res.sendFile(path.join(clientDistDir, 'index.html'));
  });
}

if (require.main === module) {
  app.listen(PORT, '0.0.0.0', () => {
    console.log(`🎵 SoundWave Music Backend Server running on http://127.0.0.1:${PORT}`);
    console.log(`📁 Local storage songs directory: ${defaultSongsDir}`);
    console.log(`🔒 Multi-user JWT authentication active`);
  });
}

module.exports = { app, mergeOverrides, normalizeMetaKey, defaultSongsDir };
