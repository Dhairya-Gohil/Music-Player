import React, { useState, useEffect, useRef } from 'react';
import HeaderBar from './components/HeaderBar';
import BottomNavBar from './components/BottomNavBar';
import SongsTab from './components/SongsTab';
import ArtistsTab from './components/ArtistsTab';
import AlbumsTab from './components/AlbumsTab';
import PlaylistsTab from './components/PlaylistsTab';
import DetailSongPage from './components/DetailSongPage';
import MiniPlayer from './components/MiniPlayer';
import NowPlayingScreen from './components/NowPlayingScreen';
import TodoListDialog from './components/TodoListDialog';
import EditSongInfoModal from './components/EditSongInfoModal';
import EditPlaylistModal from './components/EditPlaylistModal';
import PlaylistModal from './components/PlaylistModal';
import UploadModal from './components/UploadModal';
import PermissionModal from './components/PermissionModal';
import EqualizerModal, { EQ_PRESETS } from './components/EqualizerModal';
import AuthModal from './components/AuthModal';
import AboutModal from './components/AboutModal';
import Sidebar from './components/Sidebar';
import Player from './components/Player';
import { Search, RotateCw, User, X } from 'lucide-react';
import {
  getStoredToken,
  getStoredUser,
  setSession,
  clearSession,
  authFetch,
  getUserPlaylistsKey,
  getUserOverridesKey
} from './utils/auth';
import {
  loadTracksFromIndexedDB,
  saveTracksToIndexedDB,
  updateTrackInIndexedDB,
  applyStoredOverrides,
  saveStoredOverride,
  clearAllStoredMusicTracks
} from './utils/localMusicStore';
import { DEFAULT_LOCAL_TRACKS } from './defaultTracks';

// Default playlists: Empty by default - users should only see their own created playlists
const DEFAULT_PLAYLISTS = [];

function loadStoredPlaylists(userId = null) {
  if (typeof window === 'undefined' || !window.localStorage) return [];
  try {
    const key = getUserPlaylistsKey(userId);
    const raw = localStorage.getItem(key);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    if (Array.isArray(parsed)) {
      // Purge any stale dummy playlists (like Dhurandhar Special, DJ, Party Vibes)
      return parsed.filter(p => p && p.id !== 'playlist-1' && p.id !== 'playlist-2' && p.name !== 'DJ' && p.name !== 'Party Vibes');
    }
  } catch (e) { }
  return [];
}

function saveStoredPlaylists(playlistsList, userId = null) {
  if (typeof window === 'undefined' || !window.localStorage) return;
  try {
    const key = getUserPlaylistsKey(userId);
    const cleanList = (playlistsList || []).filter(p => p && p.id !== 'playlist-1' && p.id !== 'playlist-2' && p.name !== 'DJ' && p.name !== 'Party Vibes');
    localStorage.setItem(key, JSON.stringify(cleanList));
  } catch (e) { }
}

export default function App() {
  // Authentication & Session State
  const [currentUser, setCurrentUser] = useState(getStoredUser);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);

  // Library Data Stores - Pre-loaded with real local tracks & user metadata overrides
  const [tracks, setTracks] = useState(() => applyStoredOverrides(DEFAULT_LOCAL_TRACKS, null, getStoredUser()?.id));
  const [playlists, setPlaylists] = useState(() => loadStoredPlaylists(getStoredUser()?.id));
  const [todos, setTodos] = useState([]);
  const [currentFolder, setCurrentFolder] = useState('d:\\Music\\songs');
  const [isLocalStorageSource, setIsLocalStorageSource] = useState(true);
  const [isRescanning, setIsRescanning] = useState(false);
  const [appToast, setAppToast] = useState(null);
  const appToastTimerRef = useRef(null);

  const showAppToast = (msg) => {
    if (appToastTimerRef.current) clearTimeout(appToastTimerRef.current);
    setAppToast(msg);
    appToastTimerRef.current = setTimeout(() => {
      setAppToast(null);
    }, 2800);
  };

  // Navigation State
  const [activeTab, setActiveTab] = useState('songs'); // 'songs' | 'artists' | 'albums' | 'playlists'
  const [currentView, setCurrentView] = useState('library'); // 'library' | 'detail'
  const [detailData, setDetailData] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');

  // Audio Playback State - Initialized clean with no phantom/default tracks
  const [currentTrack, setCurrentTrack] = useState(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(0.85);
  const [isMuted, setIsMuted] = useState(false);
  const [isShuffle, setIsShuffle] = useState(false);
  const [repeatMode, setRepeatMode] = useState('off'); // 'off' | 'all' | 'one'
  const [queue, setQueue] = useState([]);

  // Desktop vs Mobile responsive detection
  const [isDesktop, setIsDesktop] = useState(() => {
    if (typeof window !== 'undefined') {
      return window.innerWidth >= 768;
    }
    return false;
  });

  useEffect(() => {
    const handleResize = () => {
      setIsDesktop(window.innerWidth >= 768);
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const handleChangeVolume = (val) => {
    setVolume(val);
    setIsMuted(val === 0);
    if (audioRef.current) {
      audioRef.current.volume = val;
      audioRef.current.muted = (val === 0);
    }
  };

  const handleToggleMute = () => {
    const nextMuted = !isMuted;
    setIsMuted(nextMuted);
    if (audioRef.current) {
      audioRef.current.muted = nextMuted;
    }
  };

  // Modals
  const [isNowPlayingOpen, setIsNowPlayingOpen] = useState(false);
  const [isTodoListOpen, setIsTodoListOpen] = useState(false);
  const [isEditSongOpen, setIsEditSongOpen] = useState(false);
  const [songToEdit, setSongToEdit] = useState(null);
  const [isCreatePlaylistOpen, setIsCreatePlaylistOpen] = useState(false);
  const [isEditPlaylistOpen, setIsEditPlaylistOpen] = useState(false);
  const [playlistToEdit, setPlaylistToEdit] = useState(null);
  const [isUploadOpen, setIsUploadOpen] = useState(false);
  const [isPermissionModalOpen, setIsPermissionModalOpen] = useState(false);
  const [isEqualizerOpen, setIsEqualizerOpen] = useState(false);
  const [isAboutOpen, setIsAboutOpen] = useState(false);

  // Equalizer State
  const [currentPreset, setCurrentPreset] = useState('Original');
  const [eqGains, setEqGains] = useState([0, 0, 0, 0, 0]);

  // Audio Engine References
  const audioRef = useRef(null);
  const audioCtxRef = useRef(null);
  const sourceNodeRef = useRef(null);
  const filtersRef = useRef([]);
  const synthTimerRef = useRef(null);
  const playHistoryRef = useRef([]);
  const shuffleQueueRef = useRef([]);

  // Fisher-Yates array shuffle helper
  const shuffleArray = (array) => {
    const arr = [...array];
    for (let i = arr.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [arr[i], arr[j]] = [arr[j], arr[i]];
    }
    return arr;
  };

  // Ensure native audio.loop stays false so the native onEnded event reliably fires
  // without Chromium MediaElementAudioSourceNode loop stalls
  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.loop = false;
    }
  }, []);

  // 1. App Launch: Load local tracks & sync with backend if online
  const loadLibraryData = async (activeUser = currentUser) => {
    const user = activeUser !== undefined ? activeUser : currentUser;

    // One-time cache reset to permanently clear obsolete test tracks from browser storage
    try {
      const RESET_KEY = 'whitedevils_clean_library_v2';
      if (typeof window !== 'undefined' && !localStorage.getItem(RESET_KEY)) {
        await clearAllStoredMusicTracks();
        localStorage.removeItem('white_devils_track_overrides');
        localStorage.removeItem('white_devils_cached_tracks');
        localStorage.setItem(RESET_KEY, 'true');
      }
    } catch (e) { }

    try {
      const cached = await loadTracksFromIndexedDB();
      // Purge any previously cached test tracks from browser storage
      const oldTestTitles = new Set([
        'aavan jaavan mashup',
        'gehra hua x sitaare',
        'gehra hua',
        'kala chashma',
        'neha kakkar mashup',
        'saki saki',
        'soulmate mashup'
      ]);
      const validCached = (cached || []).filter(c => !oldTestTitles.has((c.title || '').trim().toLowerCase()));
      const mergedCached = applyStoredOverrides(validCached, null, user?.id);
      setTracks(mergedCached);
      saveTracksToIndexedDB(mergedCached);
      if (!currentTrack && mergedCached.length > 0) {
        setCurrentTrack(mergedCached[0]);
        setQueue(mergedCached.slice(1));
      } else if (mergedCached.length === 0) {
        setCurrentTrack(null);
        setQueue([]);
      }
    } catch (e) {
      setTracks([]);
    }

    // Fetch from backend
    try {
      const [tracksRes, playlistsRes, todosRes] = await Promise.all([
        authFetch('/api/tracks'),
        authFetch('/api/playlists'),
        authFetch('/api/todos')
      ]);

      const tracksData = await tracksRes.json();
      const playlistsData = await playlistsRes.json();
      const todosData = await todosRes.json();

      if (tracksData.success && Array.isArray(tracksData.tracks)) {
        const oldTestTitles = new Set([
          'aavan jaavan mashup',
          'gehra hua x sitaare',
          'gehra hua',
          'kala chashma',
          'neha kakkar mashup',
          'saki saki',
          'soulmate mashup'
        ]);
        const serverTracks = tracksData.tracks.filter(t => !oldTestTitles.has((t.title || '').trim().toLowerCase()));

        // Preserve any browser storage tracks that the user imported
        setTracks(prevTracks => {
          const deviceTracks = (prevTracks || []).filter(t => (t.id && t.id.startsWith('device-track-')) || t.fileBlob);
          const map = new Map();
          for (const dt of deviceTracks) {
            map.set(dt.id, dt);
          }
          for (const st of serverTracks) {
            if (st && st.id && !map.has(st.id)) {
              map.set(st.id, st);
            }
          }
          const mergedList = Array.from(map.values());
          const finalTracks = applyStoredOverrides(mergedList, null, user?.id);
          saveTracksToIndexedDB(finalTracks);

          if (!currentTrack && finalTracks.length > 0) {
            setCurrentTrack(finalTracks[0]);
            setQueue(finalTracks.slice(1));
          } else if (finalTracks.length === 0) {
            setCurrentTrack(null);
            setQueue([]);
          }
          return finalTracks;
        });

        setIsLocalStorageSource(true);
        if (tracksData.folder) setCurrentFolder(tracksData.folder);
      }
      if (playlistsData.success && Array.isArray(playlistsData.playlists)) {
        if (user) {
          // Filter out dummy presets and merge server playlists with any local-only playlists
          const serverList = playlistsData.playlists.filter(p => p && p.id !== 'playlist-1' && p.id !== 'playlist-2' && p.name !== 'DJ' && p.name !== 'Party Vibes');
          const serverIds = new Set(serverList.map(p => p.id));
          const localList = loadStoredPlaylists(user.id);
          const unsyncedLocal = localList.filter(lp => !serverIds.has(lp.id));
          const merged = [...serverList, ...unsyncedLocal];
          setPlaylists(merged);
          saveStoredPlaylists(merged, user.id);

          // Push any local playlists to the server so they are saved in the user's database
          for (const up of unsyncedLocal) {
            authFetch('/api/playlists', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify(up)
            }).catch(() => { });
          }
        } else {
          // Guest mode: preserve local playlists, NEVER overwrite with empty server array!
          const guestPlaylists = loadStoredPlaylists(null);
          setPlaylists(guestPlaylists);
        }
      } else if (!user) {
        setPlaylists(loadStoredPlaylists(null));
      }
      if (todosData.success && Array.isArray(todosData.todos)) {
        setTodos(todosData.todos);
      } else if (!user) {
        setTodos([]);
      }
    } catch (err) {
      console.warn("Backend sync notice (running on local client mode):", err);
    }
  };

  // History Layer Stack for mobile back gesture & browser back button navigation
  const layersRef = useRef([]);

  const executeCloseLayer = (layerName) => {
    switch (layerName) {
      case 'auth':
        setIsAuthModalOpen(false);
        break;
      case 'edit-song':
        setIsEditSongOpen(false);
        setSongToEdit(null);
        break;
      case 'edit-playlist':
        setIsEditPlaylistOpen(false);
        setPlaylistToEdit(null);
        break;
      case 'create-playlist':
        setIsCreatePlaylistOpen(false);
        break;
      case 'todo-list':
        setIsTodoListOpen(false);
        break;
      case 'permission':
        setIsPermissionModalOpen(false);
        break;
      case 'upload':
        setIsUploadOpen(false);
        break;
      case 'equalizer':
        setIsEqualizerOpen(false);
        break;
      case 'now-playing':
        setIsNowPlayingOpen(false);
        break;
      case 'detail':
        setCurrentView('library');
        setDetailData(null);
        break;
      case 'about':
        setIsAboutOpen(false);
        break;
      default:
        break;
    }
  };

  const handleOpenAbout = () => {
    pushLayer('about');
    setIsAboutOpen(true);
  };

  const pushLayer = (layerName) => {
    layersRef.current.push(layerName);
    if (typeof window !== 'undefined') {
      window.history.pushState({ layer: layerName, depth: layersRef.current.length }, '');
    }
  };

  const closeLayer = (layerName) => {
    const idx = layersRef.current.lastIndexOf(layerName);
    if (idx !== -1) {
      if (idx === layersRef.current.length - 1) {
        window.history.back();
        return;
      }
      layersRef.current.splice(idx, 1);
    }
    executeCloseLayer(layerName);
  };

  const handleOpenAuthModal = () => {
    pushLayer('auth');
    setIsAuthModalOpen(true);
  };

  const handleLoginSuccess = async (token, user) => {
    setSession(token, user);
    setCurrentUser(user);

    // Seamlessly migrate any playlists created offline/guest into the logged in user's account
    const guestPlaylists = loadStoredPlaylists(null);
    if (guestPlaylists.length > 0) {
      const userPlaylists = loadStoredPlaylists(user.id);
      const userIds = new Set(userPlaylists.map(p => p.id));
      const toMigrate = guestPlaylists.filter(gp => !userIds.has(gp.id));
      if (toMigrate.length > 0) {
        const combined = [...userPlaylists, ...toMigrate];
        saveStoredPlaylists(combined, user.id);
        setPlaylists(combined);
        for (const mp of toMigrate) {
          authFetch('/api/playlists', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(mp)
          }).catch(() => { });
        }
      }
      saveStoredPlaylists([], null);
    }

    await loadLibraryData(user);
  };

  const handleLogout = async () => {
    clearSession();
    setCurrentUser(null);
    setPlaylists(loadStoredPlaylists(null));
    setTodos([]);
    await loadLibraryData(null);
    showAppToast("Logged out from private session.");
  };

  useEffect(() => {
    // Non-intrusively request Notification permission for lock-screen & status-bar playback controls
    if (typeof window !== 'undefined' && 'Notification' in window && Notification.permission === 'default') {
      Notification.requestPermission().catch(() => { });
    }

    // Verify token validity on launch
    const token = getStoredToken();
    if (token) {
      authFetch('/api/auth/me')
        .then(res => res.json())
        .then(data => {
          if (data.success && data.user) {
            setCurrentUser(data.user);
            setSession(token, data.user);
            loadLibraryData(data.user);
          } else {
            clearSession();
            setCurrentUser(null);
            loadLibraryData(null);
          }
        })
        .catch(() => {
          loadLibraryData(currentUser);
        });
    } else {
      loadLibraryData(null);
    }

    // Initialize root history state
    if (typeof window !== 'undefined' && (!window.history.state || !window.history.state.appRoot)) {
      window.history.replaceState({ appRoot: true }, '');
    }

    // Handle mobile back gesture & PC browser back button
    const handlePopState = () => {
      if (layersRef.current.length > 0) {
        const topLayer = layersRef.current.pop();
        executeCloseLayer(topLayer);
      }
    };

    // Live Auto-Discovery: Sync newly downloaded songs seamlessly
    const syncLibrary = async () => {
      try {
        const res = await authFetch('/api/tracks');
        if (!res.ok) return;
        const data = await res.json();
        if (data.success && Array.isArray(data.tracks)) {
          const oldTestTitles = new Set([
            'aavan jaavan mashup',
            'gehra hua x sitaare',
            'gehra hua',
            'kala chashma',
            'neha kakkar mashup',
            'saki saki',
            'soulmate mashup'
          ]);
          const serverTracks = data.tracks.filter(t => !oldTestTitles.has((t.title || '').trim().toLowerCase()));
          const uniqueSyncMap = new Map();
          for (const t of serverTracks) {
            if (t && t.id && !uniqueSyncMap.has(t.id)) {
              uniqueSyncMap.set(t.id, t);
            }
          }
          const deduplicated = Array.from(uniqueSyncMap.values());
          const merged = applyStoredOverrides(deduplicated, null, currentUser?.id);
          setTracks(prevTracks => {
            const deviceTracks = (prevTracks || []).filter(t => (t.id && t.id.startsWith('device-track-')) || t.fileBlob);
            const map = new Map();
            for (const dt of deviceTracks) {
              map.set(dt.id, dt);
            }
            for (const st of merged) {
              if (st && st.id && !map.has(st.id)) {
                map.set(st.id, st);
              }
            }
            const combined = Array.from(map.values());
            const prevIds = new Set((prevTracks || []).map(t => t.id));
            const hasNew = combined.some(t => !prevIds.has(t.id));
            if (hasNew || combined.length !== (prevTracks || []).length) {
              return combined;
            }
            return prevTracks;
          });
        }
      } catch (e) { }
    };

    window.addEventListener('popstate', handlePopState);
    window.addEventListener('focus', syncLibrary);
    const syncInterval = setInterval(syncLibrary, 8000);

    return () => {
      window.removeEventListener('popstate', handlePopState);
      window.removeEventListener('focus', syncLibrary);
      clearInterval(syncInterval);
    };
  }, []);

  // Web Audio Context setup & 5-Band Equalizer Engine
  const initWebAudio = () => {
    try {
      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      if (!AudioCtx) return;

      if (!audioCtxRef.current) {
        audioCtxRef.current = new AudioCtx();
      }
      const ctx = audioCtxRef.current;
      if (ctx.state === 'suspended') {
        ctx.resume().catch(() => { });
      }

      if (!filtersRef.current || filtersRef.current.length === 0) {
        // Acoustically tuned 5-band studio curve:
        // 1. 60Hz slider: lowshelf at 150Hz - boosts/cuts sub & punchy mid-bass audibly on all speakers/headphones
        // 2. 250Hz slider: wide peaking (Q=0.707) at 250Hz - warm low-end body vs scooped clarity
        // 3. 1kHz slider: peaking at 1000Hz (Q=1.0) - core vocal body & melodic midrange
        // 4. 4kHz slider: peaking at 4000Hz (Q=1.0) - vocal presence, articulation & attack
        // 5. 12kHz slider: highshelf at 7000Hz - rich treble sparkle, hi-hats, cymbals & studio air
        const filterConfigs = [
          { type: 'lowshelf', freq: 150 },
          { type: 'peaking', freq: 250, Q: 0.707 },
          { type: 'peaking', freq: 1000, Q: 1.0 },
          { type: 'peaking', freq: 4000, Q: 1.0 },
          { type: 'highshelf', freq: 7000 }
        ];

        const filters = filterConfigs.map((cfg, idx) => {
          const filter = ctx.createBiquadFilter();
          filter.type = cfg.type;
          filter.frequency.value = cfg.freq;
          if (cfg.Q) filter.Q.value = cfg.Q;
          filter.gain.value = eqGains[idx] || 0;
          return filter;
        });
        filtersRef.current = filters;
      }

      if (audioRef.current && !sourceNodeRef.current) {
        const source = ctx.createMediaElementSource(audioRef.current);
        sourceNodeRef.current = source;
        let prevNode = source;
        filtersRef.current.forEach(f => {
          prevNode.connect(f);
          prevNode = f;
        });
        prevNode.connect(ctx.destination);
      }
    } catch (e) {
      console.warn("Web Audio API node notice:", e);
    }
  };

  // Synthetic Fallback
  const playSynthesizedFallback = () => {
    try {
      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      const ctx = audioCtxRef.current || new AudioCtx();
      audioCtxRef.current = ctx;
      if (ctx.state === 'suspended') ctx.resume();

      const chords = [
        [261.63, 329.63, 392.00, 493.88],
        [220.00, 261.63, 329.63, 392.00],
        [174.61, 220.00, 261.63, 329.63],
        [196.00, 246.94, 293.66, 349.23]
      ];

      let chordIdx = 0;
      const playChord = () => {
        const chord = chords[chordIdx % chords.length];
        chordIdx++;

        chord.forEach((freq, idx) => {
          const osc = ctx.createOscillator();
          const gain = ctx.createGain();

          osc.type = idx % 2 === 0 ? 'sine' : 'triangle';
          osc.frequency.setValueAtTime(freq, ctx.currentTime);

          gain.gain.setValueAtTime(0.001, ctx.currentTime);
          gain.gain.linearRampToValueAtTime(0.05 / chord.length, ctx.currentTime + 0.8);
          gain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + 3.8);

          osc.connect(gain);
          gain.connect(ctx.destination);

          osc.start(ctx.currentTime);
          osc.stop(ctx.currentTime + 4.0);
        });
      };

      playChord();
      if (synthTimerRef.current) clearInterval(synthTimerRef.current);
      synthTimerRef.current = setInterval(playChord, 3800);
    } catch (err) {
      console.error(err);
    }
  };

  // Playback Handlers
  const handlePlayTrack = (track, recordHistory = true, fromNavigation = false) => {
    if (!track) return;
    initWebAudio();
    if (audioCtxRef.current && audioCtxRef.current.state === 'suspended') {
      audioCtxRef.current.resume().catch(() => { });
    }

    const targetUrl = track.audioUrl || (track.relPath ? `/api/stream/local?id=${encodeURIComponent(track.id)}&file=${encodeURIComponent(track.relPath)}` : '');

    if (currentTrack?.id === track.id) {
      if (audioRef.current) {
        // Ensure audio source is set if empty or about:blank
        if (!audioRef.current.src || audioRef.current.src === '' || audioRef.current.src === window.location.href) {
          if (targetUrl) audioRef.current.src = targetUrl;
        }
        if (audioRef.current.paused || audioRef.current.ended) {
          audioRef.current.play().then(() => {
            setIsPlaying(true);
          }).catch((e) => {
            console.warn("Play error:", e.message);
            if (track.relPath) {
              const fallbackUrl = `/songs/${encodeURIComponent(track.relPath)}`;
              if (!audioRef.current.src.includes(encodeURIComponent(track.relPath))) {
                audioRef.current.src = fallbackUrl;
                audioRef.current.play().then(() => setIsPlaying(true)).catch(() => setIsPlaying(false));
                return;
              }
            }
            setIsPlaying(false);
          });
        }
      }
      return;
    }

    // Keep history of played songs for Previous button navigation (especially in Shuffle mode)
    if (recordHistory && currentTrack && currentTrack.id !== track.id) {
      playHistoryRef.current.push(currentTrack.id);
      if (playHistoryRef.current.length > 50) {
        playHistoryRef.current.shift();
      }
    }

    // When selecting a new song directly while Shuffle is active, regenerate the shuffle queue
    if (!fromNavigation && isShuffle) {
      shuffleQueueRef.current = generateShuffleQueue(track.id);
    }

    setCurrentTrack(track);

    // 1. Android / Windows System Notification Shade & Lock-Screen MediaSession Controls
    if ('mediaSession' in navigator) {
      try {
        navigator.mediaSession.metadata = new MediaMetadata({
          title: track.title,
          artist: track.artist || 'Unknown artist',
          album: track.album || 'Music',
          artwork: track.coverUrl ? [
            { src: track.coverUrl, sizes: '512x512', type: 'image/png' }
          ] : [
            { src: '/music.png', sizes: '512x512', type: 'image/png' }
          ]
        });

        navigator.mediaSession.setActionHandler('play', () => {
          audioRef.current?.play().then(() => setIsPlaying(true)).catch(() => setIsPlaying(false));
        });
        navigator.mediaSession.setActionHandler('pause', () => {
          audioRef.current?.pause();
          setIsPlaying(false);
        });
        navigator.mediaSession.setActionHandler('previoustrack', () => handlePrevTrack());
        navigator.mediaSession.setActionHandler('nexttrack', () => handleNextTrack(false));
        navigator.mediaSession.setActionHandler('seekto', (details) => {
          if (details.seekTime !== undefined) handleSeek(details.seekTime);
        });
      } catch (msErr) {
        console.warn("MediaSession setup notice:", msErr);
      }
    }

    // 2. Browser Push/System Notification
    if ('Notification' in window && Notification.permission === 'granted') {
      try {
        new Notification(track.title, {
          body: `${track.artist} • ${track.album || 'Music'}`,
          icon: track.coverUrl || '/music.png',
          tag: 'white-devils-now-playing',
          silent: true
        });
      } catch (notifErr) { }
    }

    if (audioRef.current) {
      // Keep audio.loop false so native onEnded fires cleanly without WebAudio loop boundary stalls
      audioRef.current.loop = false;
      audioRef.current.src = targetUrl;
      audioRef.current.currentTime = 0;
      audioRef.current.volume = isMuted ? 0 : volume;
      audioRef.current.muted = isMuted;
      audioRef.current.play().then(() => {
        setIsPlaying(true);
        if (synthTimerRef.current) clearInterval(synthTimerRef.current);
      }).catch((err) => {
        console.warn("Audio play notice:", err.message);
        // Fallback to static direct file or relative path
        if (track.relPath) {
          const fallbackUrl = `/songs/${encodeURIComponent(track.relPath)}`;
          console.log("Attempting direct audio fallback:", fallbackUrl);
          audioRef.current.src = fallbackUrl;
          audioRef.current.play().then(() => {
            setIsPlaying(true);
            if (synthTimerRef.current) clearInterval(synthTimerRef.current);
          }).catch((fbErr) => {
            console.warn("Fallback play also failed:", fbErr.message);
            setIsPlaying(false);
          });
          return;
        }
        setIsPlaying(false);
      });
    }
  };

  const handlePauseTrack = () => {
    setIsPlaying(false);
    if (audioRef.current) audioRef.current.pause();
    if (synthTimerRef.current) clearInterval(synthTimerRef.current);
  };

  const handleTogglePlay = () => {
    if (!currentTrack) {
      if (tracks.length > 0) handlePlayTrack(tracks[0]);
      return;
    }
    if (isPlaying) {
      handlePauseTrack();
    } else {
      handlePlayTrack(currentTrack);
    }
  };

  // Get active playback tracklist (detail page tracks or all library tracks)
  const getActivePlaybackList = () => {
    if (detailData && detailData.tracks && detailData.tracks.length > 0) {
      const inDetail = detailData.tracks.some(t => t.id === currentTrack?.id);
      if (inDetail) return detailData.tracks;
    }
    return tracks;
  };

  // Generate a non-repeating randomized queue of remaining tracks for Shuffle mode
  const generateShuffleQueue = (excludeTrackId = null) => {
    const list = getActivePlaybackList();
    if (!list || list.length <= 1) return [];

    let candidates = list.filter(t => t.id !== excludeTrackId);
    let shuffled = shuffleArray(candidates);

    // If more than 2 tracks in list, avoid picking the sequential next track as the first track
    // so shuffle immediately feels noticeably randomized to the user
    if (shuffled.length > 1 && excludeTrackId) {
      const curIdx = list.findIndex(t => t.id === excludeTrackId);
      if (curIdx !== -1) {
        const sequentialNextId = list[(curIdx + 1) % list.length]?.id;
        if (shuffled[0].id === sequentialNextId) {
          const swapIdx = Math.floor(Math.random() * (shuffled.length - 1)) + 1;
          [shuffled[0], shuffled[swapIdx]] = [shuffled[swapIdx], shuffled[0]];
        }
      }
    }
    return shuffled;
  };

  const handleToggleShuffle = () => {
    setIsShuffle(prev => {
      const nextVal = !prev;
      if (nextVal) {
        shuffleQueueRef.current = generateShuffleQueue(currentTrack?.id);
      } else {
        shuffleQueueRef.current = [];
      }
      return nextVal;
    });
  };

  const handleToggleRepeat = () => {
    setRepeatMode(prev => {
      if (prev === 'off') return 'all';
      if (prev === 'all') return 'one';
      return 'off';
    });
  };

  const handleNextTrack = (isAutoEnd = false) => {
    const autoEnd = (isAutoEnd === true);
    const list = getActivePlaybackList();
    if (!list || list.length === 0) return;

    if (isShuffle) {
      if (list.length === 1) {
        if (audioRef.current) audioRef.current.currentTime = 0;
        setCurrentTime(0);
        handlePlayTrack(list[0], false, true);
        return;
      }

      // Check if current shuffle queue is exhausted
      if (shuffleQueueRef.current.length === 0) {
        // If track ended naturally and repeat is off, stop after playing all tracks in list
        if (autoEnd && repeatMode === 'off') {
          handlePauseTrack();
          return;
        }
        // Reshuffle all other tracks in the active list
        shuffleQueueRef.current = generateShuffleQueue(currentTrack?.id);
      }

      const nextTrack = shuffleQueueRef.current.shift() || list[0];
      handlePlayTrack(nextTrack, true, true);
      return;
    }

    // Sequential playback
    const curIdx = list.findIndex(t => t.id === currentTrack?.id);
    if (curIdx !== -1 && curIdx < list.length - 1) {
      handlePlayTrack(list[curIdx + 1], true, true);
    } else {
      // Reached the end of the list
      if (autoEnd && repeatMode === 'off') {
        handlePauseTrack();
      } else {
        // Wrap around to start of song list (repeatMode === 'all' or manual Next click)
        handlePlayTrack(list[0], true, true);
      }
    }
  };

  const handlePrevTrack = () => {
    const list = getActivePlaybackList();
    if (!list || list.length === 0) return;

    // If song has played more than 3 seconds, replay current song from beginning
    if (currentTime > 3) {
      if (audioRef.current) audioRef.current.currentTime = 0;
      setCurrentTime(0);
      return;
    }

    // If we have history from shuffle or manual skips, step back to previously played song
    if (playHistoryRef.current.length > 0) {
      const prevId = playHistoryRef.current.pop();
      const prevTrack = list.find(t => t.id === prevId);
      if (prevTrack) {
        if (isShuffle && currentTrack) {
          shuffleQueueRef.current.unshift(currentTrack);
        }
        handlePlayTrack(prevTrack, false, true);
        return;
      }
    }

    // Fallback: sequential previous with wrap-around
    const curIdx = list.findIndex(t => t.id === currentTrack?.id);
    if (curIdx > 0) {
      handlePlayTrack(list[curIdx - 1], false, true);
    } else {
      handlePlayTrack(list[list.length - 1], false, true);
    }
  };

  const handleTrackEnded = () => {
    if (repeatMode === 'one') {
      if (audioRef.current) {
        audioRef.current.currentTime = 0;
        setCurrentTime(0);
        audioRef.current.play().then(() => {
          setIsPlaying(true);
        }).catch(e => console.warn("Repeat one play error:", e));
      }
      return;
    }

    handleNextTrack(true);
  };

  const handleSeek = (newTime) => {
    if (audioRef.current) {
      audioRef.current.currentTime = newTime;
    }
    setCurrentTime(newTime);
  };

  const handleToggleLike = async (trackId) => {
    if (!currentUser) {
      handleOpenAuthModal();
      showAppToast("🔒 Please sign in to save your personal liked songs.");
      return;
    }

    setTracks(prev => prev.map(t => t.id === trackId ? { ...t, isLiked: !t.isLiked } : t));
    if (currentTrack && currentTrack.id === trackId) {
      setCurrentTrack(prev => ({ ...prev, isLiked: !prev.isLiked }));
    }
    try {
      const res = await authFetch(`/api/tracks/like/${trackId}`, { method: 'POST' });
      if (!res.ok) {
        // Rollback on server error
        setTracks(prev => prev.map(t => t.id === trackId ? { ...t, isLiked: !t.isLiked } : t));
        if (currentTrack && currentTrack.id === trackId) {
          setCurrentTrack(prev => ({ ...prev, isLiked: !prev.isLiked }));
        }
      }
    } catch (e) {
      console.warn("Could not sync like to server:", e);
    }
  };

  // Local Storage Rescan Handler
  const handleRescanLocalFolder = async () => {
    setIsRescanning(true);
    try {
      const res = await authFetch('/api/tracks/rescan', { method: 'POST' });
      const data = await res.json();
      if (data.success && data.tracks && data.tracks.length > 0) {
        const merged = applyStoredOverrides(data.tracks, null, currentUser?.id);
        setTracks(merged);
        setIsLocalStorageSource(true);
        if (data.folder) setCurrentFolder(data.folder);
        if (!currentTrack) {
          setCurrentTrack(merged[0]);
        }
        showAppToast(`Library synced: ${merged.length} songs available`);
        return { ...data, tracks: merged };
      }
      return data;
    } catch (err) {
      console.warn("Rescan error:", err);
      return { success: false, message: err.message };
    } finally {
      setIsRescanning(false);
    }
  };

  // Set Custom Folder on Windows Machine
  const handleSetCustomFolder = async (folderPath) => {
    const res = await fetch('/api/settings/folder', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ folderPath })
    });
    const data = await res.json();
    if (data.success && data.tracks) {
      const merged = applyStoredOverrides(data.tracks);
      setTracks(merged);
      setIsLocalStorageSource(true);
      setCurrentFolder(folderPath);
    }
    return data;
  };

  // Batch upload local audio files to server d:\Music\songs
  const handleBatchUpload = async (files) => {
    const formData = new FormData();
    files.forEach(f => {
      formData.append('audioFiles', f);
    });

    const res = await fetch('/api/tracks/batch-upload', {
      method: 'POST',
      body: formData
    });
    const data = await res.json();
    if (data.success && data.tracks) {
      const merged = applyStoredOverrides(data.tracks);
      setTracks(merged);
      setIsLocalStorageSource(true);
      if (!currentTrack && merged.length > 0) {
        setCurrentTrack(merged[0]);
      }
      showAppToast(`Uploaded ${files.length} audio files`);
    }
    return data;
  };

  // Direct Browser File Objects
  const handleLoadBrowserFiles = (files) => {
    const newLocalTracks = files.map((file, idx) => {
      const cleanName = file.name.replace(/\.[^/.]+$/, "");
      const url = URL.createObjectURL(file);
      return {
        id: `browser-local-${Date.now()}-${idx}`,
        title: cleanName,
        artist: 'Local artist',
        album: 'My Music',
        duration: 210,
        coverUrl: '',
        useDefaultIcon: true,
        audioUrl: url,
        isLiked: false,
        isLocalFile: true
      };
    });

    const merged = applyStoredOverrides([...newLocalTracks, ...tracks]);
    setTracks(merged);
    setIsLocalStorageSource(true);
    if (!currentTrack && newLocalTracks.length > 0) {
      handlePlayTrack(newLocalTracks[0]);
    }
    showAppToast(`Loaded ${newLocalTracks.length} device tracks`);
  };

  // Edit Song Info & Music Cover Art
  const handleOpenEditSong = (track) => {
    setSongToEdit(track);
    pushLayer('edit-song');
    setIsEditSongOpen(true);
  };

  const handleSaveTrackInfo = async (updatedTrack) => {
    if (!currentUser) {
      handleOpenAuthModal();
      showAppToast("🔒 Please sign in to customize song info.");
      return;
    }

    // 1. Permanently save to localStorage overrides scoped to this user
    saveStoredOverride(updatedTrack, songToEdit, currentUser?.id);

    // 2. Update in IndexedDB
    updateTrackInIndexedDB(updatedTrack);

    // 3. Update tracks array in React state
    setTracks(prev => prev.map(t => (t.id === updatedTrack.id || (songToEdit && t.id === songToEdit.id)) ? updatedTrack : t));

    // 4. Update currentTrack if currently playing
    if (currentTrack && (currentTrack.id === updatedTrack.id || (songToEdit && currentTrack.id === songToEdit.id))) {
      setCurrentTrack(updatedTrack);
    }

    // 5. Update detail view if viewing this track's collection
    if (detailData && detailData.tracks) {
      setDetailData(prev => ({
        ...prev,
        tracks: prev.tracks.map(t => (t.id === updatedTrack.id || (songToEdit && t.id === songToEdit.id)) ? updatedTrack : t)
      }));
    }

    showAppToast("Song details saved");

    // 6. Send to backend server
    try {
      await authFetch(`/api/tracks/${updatedTrack.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...updatedTrack,
          originalTitle: songToEdit?.title || updatedTrack.title,
          relPath: updatedTrack.relPath || songToEdit?.relPath
        })
      });
    } catch (err) {
      console.warn("Error updating track on server:", err);
    }
  };

  // Playlist actions: Create, Edit, Delete
  const handleCreatePlaylist = async (name, description) => {
    const cleanName = (name || '').trim();
    if (!cleanName) return;

    const newPlaylist = {
      id: `playlist-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`,
      name: cleanName,
      description: description ? description.trim() : '',
      coverUrl: '',
      trackIds: []
    };

    // 1. Immediately update React state & persist in browser localStorage permanently
    setPlaylists(prev => {
      const updated = [...prev, newPlaylist];
      saveStoredPlaylists(updated, currentUser?.id);
      return updated;
    });

    handleSelectPlaylist(newPlaylist);
    showAppToast(`Playlist "${cleanName}" created & saved`);

    // 2. If user is logged in, also sync to backend server
    if (currentUser) {
      try {
        await authFetch('/api/playlists', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(newPlaylist)
        });
      } catch (e) {
        console.warn("Server sync notice (playlist saved in localStorage):", e);
      }
    }
  };

  const handleOpenEditPlaylist = (playlist) => {
    setPlaylistToEdit(playlist);
    pushLayer('edit-playlist');
    setIsEditPlaylistOpen(true);
  };

  const handleOpenNowPlaying = () => {
    pushLayer('now-playing');
    setIsNowPlayingOpen(true);
  };

  const handleOpenTodoList = () => {
    pushLayer('todo-list');
    setIsTodoListOpen(true);
  };

  const handleOpenCreatePlaylist = () => {
    pushLayer('create-playlist');
    setIsCreatePlaylistOpen(true);
  };

  const handleOpenPermissionModal = () => {
    pushLayer('permission');
    setIsPermissionModalOpen(true);
  };

  const handleOpenUploadModal = () => {
    pushLayer('upload');
    setIsUploadOpen(true);
  };
  const handleOpenUpload = handleOpenUploadModal;

  const handleOpenEqualizer = () => {
    initWebAudio();
    if (audioCtxRef.current && audioCtxRef.current.state === 'suspended') {
      audioCtxRef.current.resume().catch(() => { });
    }
    pushLayer('equalizer');
    setIsEqualizerOpen(true);
  };

  const handleSavePlaylist = async (playlistId, updatedData) => {
    setPlaylists(prev => {
      const updated = prev.map(p => p.id === playlistId ? { ...p, ...updatedData } : p);
      saveStoredPlaylists(updated, currentUser?.id);
      return updated;
    });

    if (detailData && detailData.id === playlistId) {
      setDetailData(prev => ({
        ...prev,
        title: updatedData.name || prev.title,
        subtitle: updatedData.description !== undefined ? updatedData.description : prev.subtitle,
        coverUrl: updatedData.coverUrl !== undefined ? updatedData.coverUrl : prev.coverUrl
      }));
    }

    showAppToast("Playlist updated");

    if (currentUser) {
      try {
        await authFetch(`/api/playlists/${playlistId}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(updatedData)
        });
      } catch (err) {
        console.warn("Could not save playlist changes to server:", err);
      }
    }
  };

  const handleDeletePlaylist = async (playlistId) => {
    setPlaylists(prev => {
      const updated = prev.filter(p => p.id !== playlistId);
      saveStoredPlaylists(updated, currentUser?.id);
      return updated;
    });

    if (detailData && detailData.id === playlistId) {
      closeLayer('detail');
    }

    showAppToast("Playlist deleted");

    if (currentUser) {
      try {
        await authFetch(`/api/playlists/${playlistId}`, { method: 'DELETE' });
      } catch (err) {
        console.warn("Could not delete playlist on server:", err);
      }
    }
  };

  const handleRemoveTrackFromPlaylist = async (playlistId, trackId) => {
    setPlaylists(prev => {
      const updated = prev.map(p => {
        if (p.id === playlistId) {
          const ids = (p.trackIds || []).filter(id => id !== trackId);
          return { ...p, trackIds: ids };
        }
        return p;
      });
      saveStoredPlaylists(updated, currentUser?.id);
      return updated;
    });

    if (detailData && detailData.id === playlistId) {
      setDetailData(prev => ({
        ...prev,
        tracks: prev.tracks.filter(t => t.id !== trackId)
      }));
    }

    if (currentUser) {
      try {
        await authFetch(`/api/playlists/${playlistId}/remove/${trackId}`, { method: 'DELETE' });
      } catch (err) {
        console.warn("Could not remove track from playlist on server:", err);
      }
    }
  };

  const handleAddToPlaylist = async (playlistId, trackId) => {
    setPlaylists(prev => {
      const updated = prev.map(p => {
        if (p.id === playlistId) {
          const ids = p.trackIds || [];
          if (!ids.includes(trackId)) {
            return { ...p, trackIds: [...ids, trackId] };
          }
        }
        return p;
      });
      saveStoredPlaylists(updated, currentUser?.id);
      return updated;
    });

    showAppToast("Added to playlist");

    if (currentUser) {
      try {
        await authFetch(`/api/playlists/${playlistId}/add`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ trackId })
        });
      } catch (err) {
        console.warn("Could not add track to playlist on server:", err);
      }
    }
  };

  // To-Do List Store actions
  const handleAddTodo = async (text) => {
    if (!currentUser) {
      handleOpenAuthModal();
      showAppToast("🔒 Please sign in to save your personal to-dos.");
      return;
    }

    const tempId = `todo-${Date.now()}`;
    const newTodo = { id: tempId, text, completed: false };
    setTodos(prev => [newTodo, ...prev]);
    try {
      const res = await authFetch('/api/todos', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text })
      });
      const data = await res.json();
      if (data.success && data.todo) {
        setTodos(prev => prev.map(t => t.id === tempId ? data.todo : t));
      }
    } catch (e) {
      console.warn("Could not save todo to server:", e);
    }
  };

  const handleToggleTodo = async (id) => {
    if (!currentUser) {
      handleOpenAuthModal();
      return;
    }

    setTodos(prev => prev.map(t => t.id === id ? { ...t, completed: !t.completed } : t));
    try {
      await authFetch(`/api/todos/${id}`, { method: 'PATCH' });
    } catch (e) {
      console.warn("Could not toggle todo on server:", e);
    }
  };

  const handleDeleteTodo = async (id) => {
    if (!currentUser) {
      handleOpenAuthModal();
      return;
    }

    setTodos(prev => prev.filter(t => t.id !== id));
    try {
      await authFetch(`/api/todos/${id}`, { method: 'DELETE' });
    } catch (e) {
      console.warn("Could not delete todo on server:", e);
    }
  };

  // Navigation to DetailSongPage
  const handleSelectArtist = (artist) => {
    setDetailData({
      id: `artist-${artist.name}`,
      type: 'Artist',
      title: artist.name,
      subtitle: null,
      coverUrl: artist.coverUrl,
      tracks: artist.tracks
    });
    pushLayer('detail');
    setCurrentView('detail');
  };

  const handleSelectAlbum = (album) => {
    setDetailData({
      id: `album-${album.name}`,
      type: 'Album',
      title: album.name,
      subtitle: null,
      coverUrl: album.coverUrl,
      tracks: album.tracks
    });
    pushLayer('detail');
    setCurrentView('detail');
  };

  const handleSelectPlaylist = (playlist) => {
    const plTracks = tracks.filter(t => (playlist.trackIds || []).includes(t.id));
    setDetailData({
      id: playlist.id,
      type: 'Playlist',
      title: playlist.name,
      subtitle: playlist.description,
      coverUrl: playlist.coverUrl,
      tracks: plTracks
    });
    pushLayer('detail');
    setCurrentView('detail');
  };

  const handleOpenLikedSongs = () => {
    const liked = tracks.filter(t => t.isLiked);
    setDetailData({
      id: 'liked-songs',
      type: 'Playlist',
      title: 'Liked Songs',
      subtitle: 'Your favorite tracks',
      coverUrl: '',
      tracks: liked
    });
    pushLayer('detail');
    setCurrentView('detail');
  };

  // Filtered tracks by search query across title, artist, album
  const filteredTracks = tracks.filter(t => {
    const q = searchQuery.toLowerCase();
    return (
      t.title.toLowerCase().includes(q) ||
      t.artist.toLowerCase().includes(q) ||
      (t.album && t.album.toLowerCase().includes(q))
    );
  });

  const renderMainContent = (isDesktopView = false) => {
    if (currentView === 'detail' && detailData) {
      return (
        <DetailSongPage
          id={detailData.id}
          title={detailData.title}
          subtitle={detailData.subtitle}
          type={detailData.type}
          coverUrl={detailData.coverUrl}
          tracks={detailData.tracks}
          currentTrack={currentTrack}
          isPlaying={isPlaying}
          onPlay={handlePlayTrack}
          onPause={handlePauseTrack}
          onEditSong={handleOpenEditSong}
          onToggleLike={handleToggleLike}
          onAddToPlaylist={handleAddToPlaylist}
          playlists={playlists}
          onBack={() => closeLayer('detail')}
          onEditPlaylist={() => handleOpenEditPlaylist(playlists.find(p => p.id === detailData.id) || { id: detailData.id, name: detailData.title, description: detailData.subtitle, coverUrl: detailData.coverUrl })}
          onDeletePlaylist={handleDeletePlaylist}
          onRemoveFromPlaylist={handleRemoveTrackFromPlaylist}
        />
      );
    }

    return (
      <>
        {activeTab === 'songs' && (
          <SongsTab
            tracks={filteredTracks}
            currentTrack={currentTrack}
            isPlaying={isPlaying}
            onPlay={handlePlayTrack}
            onPause={handlePauseTrack}
            onEditSong={handleOpenEditSong}
            onToggleLike={handleToggleLike}
            onAddToPlaylist={handleAddToPlaylist}
            playlists={playlists}
            onRequestPermission={handleOpenPermissionModal}
          />
        )}

        {activeTab === 'artists' && (
          <ArtistsTab
            tracks={filteredTracks}
            onSelectArtist={handleSelectArtist}
          />
        )}

        {activeTab === 'albums' && (
          <AlbumsTab
            tracks={filteredTracks}
            onSelectAlbum={handleSelectAlbum}
          />
        )}

        {activeTab === 'playlists' && (
          <PlaylistsTab
            playlists={playlists}
            tracks={tracks}
            onSelectPlaylist={handleSelectPlaylist}
            onOpenCreatePlaylist={handleOpenCreatePlaylist}
            onOpenLikedSongs={handleOpenLikedSongs}
            onEditPlaylist={handleOpenEditPlaylist}
            onDeletePlaylist={handleDeletePlaylist}
          />
        )}
      </>
    );
  };

  const renderModals = () => (
    <>
      {/* Full-Screen / Centered Now Playing Screen */}
      <NowPlayingScreen
        isOpen={isNowPlayingOpen}
        onClose={() => closeLayer('now-playing')}
        currentTrack={currentTrack}
        isPlaying={isPlaying}
        onTogglePlay={handleTogglePlay}
        onPrev={() => handlePrevTrack()}
        onNext={() => handleNextTrack(false)}
        currentTime={currentTime}
        duration={duration}
        onSeek={handleSeek}
        isLiked={currentTrack ? tracks.find(t => t.id === currentTrack.id)?.isLiked : false}
        onToggleLike={handleToggleLike}
        onEditSong={handleOpenEditSong}
        onOpenCreatePlaylist={handleOpenCreatePlaylist}
        playlists={playlists}
        onAddToPlaylist={handleAddToPlaylist}
        onSaveTrack={handleSaveTrackInfo}
        isShuffle={isShuffle}
        onToggleShuffle={handleToggleShuffle}
        repeatMode={repeatMode}
        onToggleRepeat={handleToggleRepeat}
        onOpenEqualizer={handleOpenEqualizer}
      />

      {/* Storage & Notification Access Permission Modal */}
      <PermissionModal
        isOpen={isPermissionModalOpen}
        onClose={() => closeLayer('permission')}
        onTracksImported={(imported) => {
          setTracks(imported);
          setIsLocalStorageSource(true);
          if (!currentTrack && imported.length > 0) {
            handlePlayTrack(imported[0]);
          }
        }}
        onBackendRescan={handleRescanLocalFolder}
      />

      {/* To-Do List Dialog */}
      <TodoListDialog
        isOpen={isTodoListOpen}
        onClose={() => closeLayer('todo-list')}
        todos={todos}
        onAddTodo={handleAddTodo}
        onToggleTodo={handleToggleTodo}
        onDeleteTodo={handleDeleteTodo}
      />

      {/* Edit Song Info Modal */}
      <EditSongInfoModal
        isOpen={isEditSongOpen}
        onClose={() => closeLayer('edit-song')}
        track={songToEdit}
        onSaveTrack={handleSaveTrackInfo}
      />

      {/* Edit Playlist Modal */}
      <EditPlaylistModal
        isOpen={isEditPlaylistOpen}
        onClose={() => closeLayer('edit-playlist')}
        playlist={playlistToEdit}
        onSavePlaylist={handleSavePlaylist}
        onDeletePlaylist={handleDeletePlaylist}
      />

      {/* Create Playlist Modal */}
      <PlaylistModal
        isOpen={isCreatePlaylistOpen}
        onClose={() => closeLayer('create-playlist')}
        onCreatePlaylist={handleCreatePlaylist}
      />

      {/* Upload Music Modal */}
      <UploadModal
        isOpen={isUploadOpen}
        onClose={() => closeLayer('upload')}
        onUploadSuccess={(newTrack) => {
          setTracks(prev => [newTrack, ...prev]);
          handlePlayTrack(newTrack);
        }}
      />

      {/* Studio 5-Band Equalizer */}
      <EqualizerModal
        isOpen={isEqualizerOpen}
        onClose={() => closeLayer('equalizer')}
        eqGains={eqGains}
        onChangeGain={(bandIdx, val) => {
          initWebAudio();
          const newGains = [...eqGains];
          newGains[bandIdx] = val;
          setEqGains(newGains);
          setCurrentPreset('Custom');
          const ctx = audioCtxRef.current;
          if (ctx && ctx.state === 'suspended') {
            ctx.resume().catch(() => { });
          }
          if (filtersRef.current && filtersRef.current[bandIdx]) {
            try {
              filtersRef.current[bandIdx].gain.setValueAtTime(val, ctx ? ctx.currentTime : 0);
            } catch (err) {
              filtersRef.current[bandIdx].gain.value = val;
            }
          }
        }}
        currentPreset={currentPreset}
        onSelectPreset={(presetName) => {
          initWebAudio();
          const presetVals = EQ_PRESETS[presetName] || [0, 0, 0, 0, 0];
          setEqGains(presetVals);
          setCurrentPreset(presetName);
          const ctx = audioCtxRef.current;
          if (ctx && ctx.state === 'suspended') {
            ctx.resume().catch(() => { });
          }
          presetVals.forEach((val, idx) => {
            if (filtersRef.current && filtersRef.current[idx]) {
              try {
                filtersRef.current[idx].gain.setValueAtTime(val, ctx ? ctx.currentTime : 0);
              } catch (err) {
                filtersRef.current[idx].gain.value = val;
              }
            }
          });
        }}
      />

      {/* Private Multi-User Authentication Modal */}
      <AuthModal
        isOpen={isAuthModalOpen}
        onClose={() => closeLayer('auth')}
        currentUser={currentUser}
        onLoginSuccess={handleLoginSuccess}
        onLogout={handleLogout}
        showAppToast={showAppToast}
      />

      {/* Developer & Application About Modal */}
      <AboutModal
        isOpen={isAboutOpen}
        onClose={() => closeLayer('about')}
      />

      {/* App-level Toast Notification in App Theme Color */}
      {appToast && (
        <div style={{
          position: 'fixed',
          top: '20px',
          left: '50%',
          transform: 'translateX(-50%)',
          backgroundColor: 'var(--accent-pink, #e0246a)',
          color: '#ffffff',
          padding: '10px 22px',
          borderRadius: '9999px',
          fontSize: '13px',
          fontWeight: '700',
          letterSpacing: '0.02em',
          boxShadow: '0 8px 24px rgba(224, 36, 106, 0.35)',
          zIndex: 99999,
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          pointerEvents: 'none',
          animation: 'fadeIn 0.2s ease-out'
        }}>
          <span>{appToast}</span>
        </div>
      )}
    </>
  );

  return (
    <>
      {/* Root Persistent Audio Element - Mounted permanently at component root, never unmounts */}
      <audio
        ref={audioRef}
        crossOrigin="anonymous"
        onPlay={() => setIsPlaying(true)}
        onPlaying={() => setIsPlaying(true)}
        onPause={() => setIsPlaying(false)}
        onError={(e) => {
          console.warn("Audio element error event:", e);
          if (currentTrack?.relPath && audioRef.current) {
            const fallbackUrl = `/songs/${encodeURIComponent(currentTrack.relPath)}`;
            if (!audioRef.current.src.includes(encodeURIComponent(currentTrack.relPath))) {
              console.log("Switching audio element to direct fallback:", fallbackUrl);
              audioRef.current.src = fallbackUrl;
              audioRef.current.play().then(() => setIsPlaying(true)).catch(() => setIsPlaying(false));
              return;
            }
          }
          setIsPlaying(false);
        }}
        onTimeUpdate={() => {
          if (audioRef.current) setCurrentTime(audioRef.current.currentTime);
        }}
        onLoadedMetadata={() => {
          if (audioRef.current) setDuration(audioRef.current.duration);
        }}
        onEnded={handleTrackEnded}
      />

      {isDesktop ? (
        <div style={{
          width: '100vw',
          height: '100vh',
          backgroundColor: '#f8fafc',
          display: 'flex',
          overflow: 'hidden',
          position: 'relative'
        }}>
          {/* Left Desktop Navigation Sidebar */}
          <Sidebar
            activeTab={activeTab}
            setActiveTab={(tab) => {
              setActiveTab(tab);
              if (layersRef.current.includes('detail')) {
                closeLayer('detail');
              } else {
                setCurrentView('library');
              }
            }}
            playlists={playlists}
            onSelectPlaylist={handleSelectPlaylist}
            onOpenLikedSongs={handleOpenLikedSongs}
            onOpenCreatePlaylist={handleOpenCreatePlaylist}
            onOpenEqualizer={handleOpenEqualizer}
            onOpenTodoList={handleOpenTodoList}
            onOpenUpload={handleOpenUpload}
            onRescan={handleRescanLocalFolder}
            isRescanning={isRescanning}
            currentUser={currentUser}
            onOpenAuthModal={handleOpenAuthModal}
            totalSongCount={tracks.length}
            onRequestPermission={handleOpenPermissionModal}
            onOpenAbout={handleOpenAbout}
          />

          {/* Main Desktop Content Area */}
          <div style={{
            flex: 1,
            display: 'flex',
            flexDirection: 'column',
            height: '100%',
            minWidth: 0,
            overflow: 'hidden',
            position: 'relative'
          }}>
            {/* Top Desktop Navigation & Search Header */}
            <header style={{
              padding: '16px 36px 14px 36px',
              borderBottom: '1px solid rgba(0, 0, 0, 0.06)',
              backgroundColor: '#ffffff',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              gap: '20px',
              flexShrink: 0
            }}>
              {/* Search Input */}
              <div style={{
                position: 'relative',
                width: '100%',
                maxWidth: '460px',
                display: 'flex',
                alignItems: 'center'
              }}>
                <Search size={16} color="#94a3b8" style={{ position: 'absolute', left: '14px', pointerEvents: 'none' }} />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search songs, artists, albums..."
                  style={{
                    width: '100%',
                    padding: '10px 38px 10px 40px',
                    borderRadius: '9999px',
                    border: '1px solid #e2e8f0',
                    backgroundColor: '#f8fafc',
                    fontSize: '13.5px',
                    color: '#0f172a',
                    outline: 'none',
                    transition: 'all 0.15s ease'
                  }}
                  onFocus={(e) => {
                    e.target.style.backgroundColor = '#ffffff';
                    e.target.style.borderColor = 'var(--accent-pink)';
                    e.target.style.boxShadow = '0 0 0 3px rgba(224, 36, 106, 0.1)';
                  }}
                  onBlur={(e) => {
                    e.target.style.backgroundColor = '#f8fafc';
                    e.target.style.borderColor = '#e2e8f0';
                    e.target.style.boxShadow = 'none';
                  }}
                />
                {searchQuery && (
                  <button
                    onClick={() => setSearchQuery('')}
                    style={{
                      position: 'absolute',
                      right: '12px',
                      background: 'none',
                      border: 'none',
                      cursor: 'pointer',
                      color: '#94a3b8',
                      display: 'flex',
                      alignItems: 'center',
                      padding: '2px'
                    }}
                  >
                    <X size={15} />
                  </button>
                )}
              </div>

              {/* Quick Header Controls */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexShrink: 0 }}>
                {/* Sync Button */}
                <button
                  onClick={handleRescanLocalFolder}
                  disabled={isRescanning}
                  title="Sync local tracks"
                  style={{
                    padding: '7px 14px',
                    borderRadius: '9999px',
                    border: '1.5px solid #fecdd3',
                    backgroundColor: isRescanning ? '#fecdd3' : '#fff1f2',
                    color: '#e11d48',
                    fontSize: '12.5px',
                    fontWeight: '700',
                    cursor: isRescanning ? 'default' : 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px'
                  }}
                >
                  <RotateCw size={13} style={{ animation: isRescanning ? 'spin 1s linear infinite' : 'none' }} />
                  <span>{isRescanning ? 'Syncing...' : 'Sync'}</span>
                </button>

                {/* To-Do List Action */}
                <button
                  onClick={handleOpenTodoList}
                  className="btn-red-action"
                  style={{ padding: '7px 18px', fontSize: '12.5px', borderRadius: '9999px' }}
                >
                  List
                </button>

                {/* User Account Button */}
                <button
                  onClick={handleOpenAuthModal}
                  style={{
                    padding: '6px 14px',
                    borderRadius: '9999px',
                    border: currentUser ? '1.5px solid #bbf7d0' : '1.5px solid #e2e8f0',
                    backgroundColor: currentUser ? '#f0fdf4' : '#ffffff',
                    color: currentUser ? '#15803d' : '#334155',
                    fontSize: '12.5px',
                    fontWeight: '700',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px'
                  }}
                >
                  <div style={{
                    width: '20px',
                    height: '20px',
                    borderRadius: '50%',
                    background: currentUser ? 'linear-gradient(135deg, #10b981, #059669)' : '#e2e8f0',
                    color: currentUser ? '#fff' : '#64748b',
                    fontSize: '10.5px',
                    fontWeight: '800',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                  }}>
                    {currentUser ? (currentUser.name || currentUser.username || 'U')[0].toUpperCase() : <User size={12} />}
                  </div>
                  <span>{currentUser ? (currentUser.name || currentUser.username) : 'Sign In'}</span>
                </button>
              </div>
            </header>

            {/* Desktop Content Scroll Viewport */}
            <main style={{
              flex: 1,
              overflowY: 'auto',
              padding: '24px 36px 110px 36px',
              display: 'flex',
              flexDirection: 'column',
              gap: '20px'
            }}>
              {/* Header info when in Library Hub */}
              {currentView === 'library' && (
                <div style={{
                  display: 'flex',
                  alignItems: 'flex-end',
                  justifyContent: 'space-between',
                  paddingBottom: '8px',
                  borderBottom: '1px solid rgba(0, 0, 0, 0.04)'
                }}>
                  <div>
                    <h2 style={{
                      fontSize: '26px',
                      fontWeight: '800',
                      color: '#0f172a',
                      margin: '0 0 4px 0',
                      letterSpacing: '-0.5px'
                    }}>
                      {activeTab === 'songs' && 'Made For Your Ears.'}
                      {activeTab === 'artists' && 'Artists'}
                      {activeTab === 'albums' && 'Albums'}
                      {activeTab === 'playlists' && 'Playlists'}
                    </h2>
                    <div style={{
                      fontSize: '13px',
                      color: '#64748b',
                      fontWeight: '500',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '8px'
                    }}>
                      <span>{tracks.length} songs in your library</span>
                      {isLocalStorageSource && (
                        <span
                          onClick={handleOpenPermissionModal}
                          style={{
                            fontSize: '11px',
                            fontWeight: '700',
                            padding: '2px 8px',
                            borderRadius: '9999px',
                            backgroundColor: '#fdeef1',
                            color: '#e0246a',
                            cursor: 'pointer'
                          }}
                        >
                          Local Storage
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              )}

              {renderMainContent(true)}
            </main>
          </div>

          {/* Desktop Fixed Bottom Player */}
          <Player
            currentTrack={currentTrack}
            isPlaying={isPlaying}
            onTogglePlay={handleTogglePlay}
            onPrev={handlePrevTrack}
            onNext={() => handleNextTrack(false)}
            currentTime={currentTime}
            duration={duration}
            onSeek={handleSeek}
            volume={volume}
            onChangeVolume={handleChangeVolume}
            isMuted={isMuted}
            onToggleMute={handleToggleMute}
            isShuffle={isShuffle}
            onToggleShuffle={handleToggleShuffle}
            repeatMode={repeatMode}
            onToggleRepeat={handleToggleRepeat}
            isLiked={currentTrack ? tracks.find(t => t.id === currentTrack.id)?.isLiked : false}
            onToggleLike={handleToggleLike}
            onOpenEqualizer={handleOpenEqualizer}
            onOpenNowPlaying={handleOpenNowPlaying}
            onEditSong={handleOpenEditSong}
          />

        </div>
      ) : (
        <div style={{
          width: '100%',
          minHeight: '100vh',
          backgroundColor: '#ffffff',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'stretch'
        }}>
          {/* Mobile App Viewport Container */}
          <div style={{
            width: '100%',
            maxWidth: '480px',
            minHeight: '100vh',
            height: '100vh',
            backgroundColor: '#ffffff',
            display: 'flex',
            flexDirection: 'column',
            position: 'relative',
            overflow: 'hidden',
            boxShadow: '0 20px 50px -10px rgba(15, 23, 42, 0.1), 0 0 0 1px rgba(226, 232, 240, 0.8)'
          }}>
            {/* Top Header Bar */}
            {currentView === 'library' && (
              <HeaderBar
                searchQuery={searchQuery}
                onSearchChange={setSearchQuery}
                onOpenTodoList={handleOpenTodoList}
                totalSongCount={tracks.length}
                isLocalStorageSource={isLocalStorageSource}
                onRescan={handleRescanLocalFolder}
                isRescanning={isRescanning}
                currentUser={currentUser}
                onOpenAuthModal={handleOpenAuthModal}
                onOpenPermissionModal={handleOpenPermissionModal}
                onOpenAbout={handleOpenAbout}
                onOpenEqualizer={handleOpenEqualizer}
              />
            )}

            {/* Main Content Area */}
            <main style={{
              flex: 1,
              overflowY: 'auto',
              padding: '16px 20px 150px 20px',
              display: 'flex',
              flexDirection: 'column'
            }}>
              {renderMainContent(false)}
            </main>

            {/* Sticky Mini Player */}
            <div style={{ maxWidth: '480px', width: '100%', margin: '0 auto' }}>
              <MiniPlayer
                currentTrack={currentTrack}
                isPlaying={isPlaying}
                onTogglePlay={handleTogglePlay}
                onPrev={() => handlePrevTrack()}
                onNext={() => handleNextTrack(false)}
                onOpenNowPlaying={handleOpenNowPlaying}
                currentTime={currentTime}
                duration={duration}
                onSeek={handleSeek}
                isLiked={currentTrack ? tracks.find(t => t.id === currentTrack.id)?.isLiked : false}
                onToggleLike={handleToggleLike}
              />
            </div>

            {/* Bottom Navigation Bar */}
            <div style={{ maxWidth: '480px', width: '100%', margin: '0 auto' }}>
              <BottomNavBar
                activeTab={activeTab}
                onSelectTab={(tabId) => {
                  setActiveTab(tabId);
                  if (layersRef.current.includes('detail')) {
                    closeLayer('detail');
                  } else {
                    setCurrentView('library');
                  }
                }}
              />
            </div>

          </div>
        </div>
      )}

      {/* Modals (Single instance at root) */}
      {renderModals()}
    </>
  );
}
