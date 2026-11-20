// Client-side Authentication, JWT Session & Offline-Resilient Multi-User Engine

const TOKEN_KEY = 'white_devils_jwt_token';
const USER_KEY = 'white_devils_auth_user';
const LOCAL_USERS_KEY = 'white_devils_registered_users';

export function getStoredToken() {
  if (typeof window === 'undefined' || !window.localStorage) return null;
  return localStorage.getItem(TOKEN_KEY) || null;
}

export function getStoredUser() {
  if (typeof window === 'undefined' || !window.localStorage) return null;
  try {
    const raw = localStorage.getItem(USER_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch (e) {
    return null;
  }
}

export function setSession(token, user) {
  if (typeof window === 'undefined' || !window.localStorage) return;
  if (token) {
    localStorage.setItem(TOKEN_KEY, token);
  } else {
    localStorage.removeItem(TOKEN_KEY);
  }
  if (user) {
    localStorage.setItem(USER_KEY, JSON.stringify(user));
  } else {
    localStorage.removeItem(USER_KEY);
  }
}

export function clearSession() {
  if (typeof window === 'undefined' || !window.localStorage) return;
  localStorage.removeItem(TOKEN_KEY);
  localStorage.removeItem(USER_KEY);
}

// Scoped storage keys so different users on the same machine never mix up cached data
export function getUserPlaylistsKey(userId) {
  return `white_devils_user_playlists_${userId || 'guest'}`;
}

export function getUserOverridesKey(userId) {
  return `white_devils_track_overrides_${userId || 'guest'}`;
}

// Helper: Get local offline registered accounts
function getLocalUsers() {
  if (typeof window === 'undefined' || !window.localStorage) return [];
  try {
    const raw = localStorage.getItem(LOCAL_USERS_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch (e) {
    return [];
  }
}

function saveLocalUsers(users) {
  if (typeof window === 'undefined' || !window.localStorage) return;
  try {
    localStorage.setItem(LOCAL_USERS_KEY, JSON.stringify(users));
  } catch (e) {}
}

// Helper: Safely parse JSON or return null if HTML/proxy error
async function parseResponseSafely(res) {
  const text = await res.text();
  try {
    const json = JSON.parse(text);
    return { isJson: true, data: json };
  } catch (e) {
    return { isJson: false, text, status: res.status };
  }
}

// ---------------------------------------------------------------------------
// 1. REGISTER (Sign In & Create Account)
// ---------------------------------------------------------------------------
export async function registerAccount({ username, email, password, name }) {
  const cleanUsername = String(username || '').trim();
  const cleanEmail = String(email || '').trim().toLowerCase();

  if (!cleanUsername || cleanUsername.length < 3) {
    throw new Error('Username must be at least 3 characters long.');
  }
  if (!cleanEmail || !cleanEmail.includes('@') || !cleanEmail.includes('.')) {
    throw new Error('Please enter a valid email address (e.g., name@domain.com).');
  }
  if (!password || password.length < 6) {
    throw new Error('Password must be at least 6 characters long.');
  }

  // Attempt backend register first
  try {
    const res = await fetch('/api/auth/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        username: cleanUsername,
        email: cleanEmail,
        password,
        name: name || cleanUsername
      })
    });

    const parsed = await parseResponseSafely(res);
    if (parsed.isJson && parsed.data) {
      if (res.ok && parsed.data.success) {
        // Sync to local fallback cache as well
        cacheLocalUser({
          id: parsed.data.user.id,
          username: cleanUsername,
          email: cleanEmail,
          password,
          name: parsed.data.user.name || cleanUsername
        });
        return parsed.data;
      }
      throw new Error(parsed.data.message || 'Registration was rejected by the server.');
    }
  } catch (networkErr) {
    // If it was a real validation error from JSON, rethrow it
    if (networkErr.message && !networkErr.message.includes('<!DOCTYPE') && !networkErr.message.includes('Failed to fetch')) {
      throw networkErr;
    }
    console.warn("Backend server not responding or returned non-JSON. Falling back to local offline user storage.");
  }

  // Fallback: Local Client-side Registration (so user is never blocked)
  const localUsers = getLocalUsers();
  if (localUsers.some(u => u.email && u.email.toLowerCase() === cleanEmail)) {
    throw new Error('An account with this email address is already registered. Please log in.');
  }
  if (localUsers.some(u => u.username && u.username.toLowerCase() === cleanUsername.toLowerCase())) {
    throw new Error('This username is already taken. Please choose another username.');
  }

  const newUser = {
    id: `usr_local_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
    username: cleanUsername,
    email: cleanEmail,
    password, // Stored locally in browser
    name: name || cleanUsername,
    createdAt: new Date().toISOString(),
    likedTrackIds: [],
    playlists: [],
    todos: [
      { id: `todo_${Date.now()}_1`, text: "Explore local tracks and create playlists", completed: false }
    ],
    trackOverrides: {}
  };

  localUsers.push(newUser);
  saveLocalUsers(localUsers);

  const localToken = `jwt_local_${Date.now()}_${Math.random().toString(36).substring(2, 10)}`;
  const sanitized = {
    id: newUser.id,
    username: newUser.username,
    email: newUser.email,
    name: newUser.name,
    createdAt: newUser.createdAt
  };

  return {
    success: true,
    token: localToken,
    user: sanitized
  };
}

// ---------------------------------------------------------------------------
// 2. LOG IN (Email + Password)
// ---------------------------------------------------------------------------
export async function loginAccount({ email, password }) {
  const cleanEmail = String(email || '').trim().toLowerCase();

  if (!cleanEmail) {
    throw new Error('Email address is required.');
  }
  if (!password) {
    throw new Error('Password is required.');
  }

  // Attempt backend login first
  try {
    const res = await fetch('/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: cleanEmail, password })
    });

    const parsed = await parseResponseSafely(res);
    if (parsed.isJson && parsed.data) {
      if (res.ok && parsed.data.success) {
        return parsed.data;
      }
      throw new Error(parsed.data.message || 'Invalid email or password.');
    }
  } catch (networkErr) {
    if (networkErr.message && !networkErr.message.includes('<!DOCTYPE') && !networkErr.message.includes('Failed to fetch')) {
      throw networkErr;
    }
    console.warn("Backend server not responding or returned non-JSON. Falling back to local offline user storage.");
  }

  // Fallback: Local Client-side Login
  const localUsers = getLocalUsers();
  const user = localUsers.find(u => (u.email && u.email.toLowerCase() === cleanEmail) || (u.username && u.username.toLowerCase() === cleanEmail));

  if (!user) {
    throw new Error('No account found with this email. Please check your email or click Sign In to create an account.');
  }

  if (user.password !== password) {
    throw new Error('Incorrect password. Please try again or click Forgot Password.');
  }

  const localToken = `jwt_local_${Date.now()}_${Math.random().toString(36).substring(2, 10)}`;
  const sanitized = {
    id: user.id,
    username: user.username,
    email: user.email,
    name: user.name,
    createdAt: user.createdAt
  };

  return {
    success: true,
    token: localToken,
    user: sanitized
  };
}

// ---------------------------------------------------------------------------
// 3. FORGOT PASSWORD (Send Reset Code)
// ---------------------------------------------------------------------------
export async function requestPasswordResetCode(email) {
  const cleanEmail = String(email || '').trim().toLowerCase();
  if (!cleanEmail || !cleanEmail.includes('@')) {
    throw new Error('Please enter a valid registered email address.');
  }

  try {
    const res = await fetch('/api/auth/forgot-password', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: cleanEmail })
    });

    const parsed = await parseResponseSafely(res);
    if (parsed.isJson && parsed.data) {
      if (res.ok && parsed.data.success) {
        return parsed.data;
      }
      throw new Error(parsed.data.message || 'Could not request password reset.');
    }
  } catch (networkErr) {
    if (networkErr.message && !networkErr.message.includes('<!DOCTYPE') && !networkErr.message.includes('Failed to fetch')) {
      throw networkErr;
    }
  }

  // Local fallback
  const localUsers = getLocalUsers();
  const user = localUsers.find(u => u.email && u.email.toLowerCase() === cleanEmail);
  if (!user) {
    throw new Error('No account found with this email address.');
  }

  const code = Math.floor(100000 + Math.random() * 900000).toString();
  user.resetToken = code;
  user.resetExpires = Date.now() + 3600000;
  saveLocalUsers(localUsers);

  return {
    success: true,
    email: cleanEmail,
    resetToken: code,
    message: `Verification code generated for ${cleanEmail}`
  };
}

// ---------------------------------------------------------------------------
// 4. RESET PASSWORD (Verification Code + New Password)
// ---------------------------------------------------------------------------
export async function resetPasswordWithCode({ token, newPassword }) {
  if (!token || !token.trim()) {
    throw new Error('Reset verification code is required.');
  }
  if (!newPassword || newPassword.length < 6) {
    throw new Error('New password must be at least 6 characters long.');
  }

  try {
    const res = await fetch('/api/auth/reset-password', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ token: token.trim(), newPassword })
    });

    const parsed = await parseResponseSafely(res);
    if (parsed.isJson && parsed.data) {
      if (res.ok && parsed.data.success) {
        return parsed.data;
      }
      throw new Error(parsed.data.message || 'Password reset failed.');
    }
  } catch (networkErr) {
    if (networkErr.message && !networkErr.message.includes('<!DOCTYPE') && !networkErr.message.includes('Failed to fetch')) {
      throw networkErr;
    }
  }

  // Local fallback
  const localUsers = getLocalUsers();
  const cleanCode = token.trim();
  const user = localUsers.find(u => u.resetToken && u.resetToken.toUpperCase() === cleanCode.toUpperCase());

  if (!user) {
    throw new Error('Invalid verification code. Please check your code or request a new one.');
  }
  if (user.resetExpires && user.resetExpires < Date.now()) {
    throw new Error('This verification code has expired. Please request a new code.');
  }

  user.password = newPassword;
  user.resetToken = null;
  user.resetExpires = null;
  saveLocalUsers(localUsers);

  const localToken = `jwt_local_${Date.now()}_${Math.random().toString(36).substring(2, 10)}`;
  return {
    success: true,
    token: localToken,
    user: {
      id: user.id,
      username: user.username,
      email: user.email,
      name: user.name
    },
    message: 'Password updated successfully!'
  };
}

function cacheLocalUser(userData) {
  const users = getLocalUsers();
  const idx = users.findIndex(u => u.email.toLowerCase() === userData.email.toLowerCase());
  if (idx !== -1) {
    users[idx] = { ...users[idx], ...userData };
  } else {
    users.push(userData);
  }
  saveLocalUsers(users);
}

// Authenticated fetch wrapper
export async function authFetch(url, options = {}) {
  const token = getStoredToken();
  const headers = {
    ...(options.headers || {})
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const config = {
    ...options,
    headers
  };

  try {
    const response = await fetch(url, config);
    if (response.status === 401 && token) {
      clearSession();
    }
    return response;
  } catch (err) {
    console.warn("authFetch network issue:", err.message);
    // Return a dummy Response object with empty json fallback
    return {
      ok: false,
      status: 503,
      json: async () => ({ success: false, message: 'Server is currently offline' }),
      text: async () => 'Server is currently offline'
    };
  }
}
