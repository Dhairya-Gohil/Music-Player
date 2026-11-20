const fs = require('fs');
const path = require('path');
const crypto = require('crypto');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const USERS_FILE = path.join(__dirname, '..', 'users.json');
const DATA_FILE = path.join(__dirname, '..', 'data.json');
const JWT_SECRET = process.env.JWT_SECRET || 'soundwave-private-secret-key-2026';
const JWT_EXPIRES_IN = '30d';

// Email validation helper
const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function isValidEmail(email) {
  if (!email || typeof email !== 'string') return false;
  return EMAIL_REGEX.test(email.trim());
}

// Default starter playlists for newly registered users (clean empty list - only user created playlists)
function getDefaultUserPlaylists(username) {
  return [];
}

// Default starter todos for newly registered users
function getDefaultUserTodos() {
  return [
    { id: `todo-${Date.now()}-1`, text: "Explore local tracks and create playlists", completed: false },
    { id: `todo-${Date.now()}-2`, text: "Like favorite songs to build quick collection", completed: false }
  ];
}

// Load all users from disk
function loadUsers() {
  try {
    if (fs.existsSync(USERS_FILE)) {
      const content = fs.readFileSync(USERS_FILE, 'utf-8');
      const parsed = JSON.parse(content);
      if (Array.isArray(parsed)) return parsed;
    }
  } catch (err) {
    console.error("Error reading users.json:", err.message);
  }

  // If users.json doesn't exist, create initial seed and migrate any existing data.json
  const initialUsers = [];
  try {
    let existingPlaylists = [];
    let existingTodos = [];
    let existingOverrides = {};

    if (fs.existsSync(DATA_FILE)) {
      try {
        const data = JSON.parse(fs.readFileSync(DATA_FILE, 'utf-8'));
        if (Array.isArray(data.playlists)) existingPlaylists = data.playlists;
        if (Array.isArray(data.todos)) existingTodos = data.todos;
        if (data.trackOverrides) existingOverrides = data.trackOverrides;
      } catch (e) {}
    }

    const salt = bcrypt.genSaltSync(10);
    const demoPasswordHash = bcrypt.hashSync('password123', salt);

    const demoUser = {
      id: 'usr_default_1',
      username: 'user',
      email: 'user@soundwave.com',
      passwordHash: demoPasswordHash,
      name: 'Music Listener',
      createdAt: new Date().toISOString(),
      likedTrackIds: [],
      playlists: existingPlaylists.length > 0 ? existingPlaylists : getDefaultUserPlaylists('user'),
      todos: existingTodos.length > 0 ? existingTodos : getDefaultUserTodos(),
      trackOverrides: existingOverrides
    };

    initialUsers.push(demoUser);
    saveUsers(initialUsers);
  } catch (initErr) {
    console.error("Error initializing default user:", initErr);
  }

  return initialUsers;
}

// Save all users to disk safely
function saveUsers(users) {
  try {
    const tempFile = `${USERS_FILE}.tmp`;
    fs.writeFileSync(tempFile, JSON.stringify(users, null, 2), 'utf-8');
    fs.renameSync(tempFile, USERS_FILE);
  } catch (err) {
    console.error("Error saving users.json:", err.message);
    try {
      fs.writeFileSync(USERS_FILE, JSON.stringify(users, null, 2), 'utf-8');
    } catch (fallbackErr) {
      console.error("Fallback save failed:", fallbackErr.message);
    }
  }
}

// Find user by ID
function findUserById(id) {
  if (!id) return null;
  const users = loadUsers();
  return users.find(u => u.id === id) || null;
}

// Find user by username
function findUserByUsername(username) {
  if (!username) return null;
  const clean = username.trim().toLowerCase();
  const users = loadUsers();
  return users.find(u => u.username && u.username.toLowerCase() === clean) || null;
}

// Find user by email
function findUserByEmail(email) {
  if (!email) return null;
  const clean = email.trim().toLowerCase();
  const users = loadUsers();
  return users.find(u => u.email && u.email.toLowerCase() === clean) || null;
}

// Create new user (Sign In / Register)
function createUser({ username, email, password, name }) {
  if (!username || !username.trim()) {
    throw new Error('Username is required.');
  }

  const cleanUsername = username.trim().toLowerCase();
  if (cleanUsername.length < 3) {
    throw new Error('Username must be at least 3 characters long.');
  }

  if (!email || !isValidEmail(email)) {
    throw new Error('Please enter a valid email address (e.g., name@domain.com).');
  }

  const cleanEmail = email.trim().toLowerCase();

  if (!password || password.length < 6) {
    throw new Error('Password must be at least 6 characters long.');
  }

  const users = loadUsers();

  if (users.some(u => u.email && u.email.toLowerCase() === cleanEmail)) {
    throw new Error('An account with this email address is already registered. Please log in.');
  }

  if (users.some(u => u.username && u.username.toLowerCase() === cleanUsername)) {
    throw new Error('This username is already taken. Please choose another username.');
  }

  const salt = bcrypt.genSaltSync(10);
  const passwordHash = bcrypt.hashSync(password, salt);

  const newUser = {
    id: `usr_${Date.now()}_${Math.random().toString(36).substring(2, 8)}`,
    username: cleanUsername,
    email: cleanEmail,
    passwordHash,
    name: (name && name.trim()) || username.trim(),
    createdAt: new Date().toISOString(),
    likedTrackIds: [],
    playlists: getDefaultUserPlaylists(cleanUsername),
    todos: getDefaultUserTodos(),
    trackOverrides: {},
    resetToken: null,
    resetExpires: null
  };

  users.push(newUser);
  saveUsers(users);

  return sanitizeUser(newUser);
}

// Authenticate user by Email (or username fallback) and Password (Log In)
function authenticateUser(identifier, password) {
  if (!identifier || !identifier.trim()) {
    throw new Error('Email is required.');
  }
  if (!password) {
    throw new Error('Password is required.');
  }

  const cleanId = identifier.trim().toLowerCase();
  const users = loadUsers();

  // Find by email first, then fallback to username
  let user = users.find(u => u.email && u.email.toLowerCase() === cleanId);
  if (!user) {
    user = users.find(u => u.username && u.username.toLowerCase() === cleanId);
  }

  if (!user) {
    throw new Error('No account found with this email. Please check your email or sign up.');
  }

  const isMatch = bcrypt.compareSync(password, user.passwordHash);
  if (!isMatch) {
    throw new Error('Incorrect password. Please try again or use Forgot Password.');
  }

  return sanitizeUser(user);
}

// Generate password reset token
function createPasswordResetToken(email) {
  if (!email || !isValidEmail(email)) {
    throw new Error('Please enter a valid registered email address.');
  }

  const cleanEmail = email.trim().toLowerCase();
  const users = loadUsers();
  const user = users.find(u => u.email && u.email.toLowerCase() === cleanEmail);

  if (!user) {
    throw new Error('No account exists with this email address.');
  }

  // 6-character random alphanumeric reset token
  const resetToken = crypto.randomBytes(4).toString('hex').toUpperCase(); // e.g. "A3F8B2C1"
  user.resetToken = resetToken;
  user.resetExpires = Date.now() + 3600000; // 1 hour expiration

  saveUsers(users);

  console.log(`[AUTH] Password reset requested for ${cleanEmail}. Verification Code: ${resetToken}`);

  return {
    success: true,
    email: cleanEmail,
    resetToken,
    expiresInMinutes: 60
  };
}

// Reset password with verification token
function resetPasswordWithToken(token, newPassword) {
  if (!token || !token.trim()) {
    throw new Error('Reset code is required.');
  }

  if (!newPassword || newPassword.length < 6) {
    throw new Error('New password must be at least 6 characters long.');
  }

  const cleanToken = token.trim().toUpperCase();
  const users = loadUsers();
  const user = users.find(u => u.resetToken && u.resetToken.toUpperCase() === cleanToken);

  if (!user) {
    throw new Error('Invalid reset code. Please check your code or request a new one.');
  }

  if (!user.resetExpires || user.resetExpires < Date.now()) {
    throw new Error('This reset code has expired. Please request a new password reset link.');
  }

  const salt = bcrypt.genSaltSync(10);
  user.passwordHash = bcrypt.hashSync(newPassword, salt);
  user.resetToken = null;
  user.resetExpires = null;

  saveUsers(users);

  return sanitizeUser(user);
}

// Sanitize user object (exclude sensitive passwordHash & reset token)
function sanitizeUser(user) {
  if (!user) return null;
  return {
    id: user.id,
    username: user.username,
    email: user.email || '',
    name: user.name,
    createdAt: user.createdAt,
    likedCount: Array.isArray(user.likedTrackIds) ? user.likedTrackIds.length : 0,
    playlistCount: Array.isArray(user.playlists) ? user.playlists.length : 0
  };
}

// Sign JWT token for user
function generateToken(user) {
  return jwt.sign(
    {
      id: user.id,
      username: user.username,
      email: user.email,
      name: user.name
    },
    JWT_SECRET,
    { expiresIn: JWT_EXPIRES_IN }
  );
}

// Verify JWT token
function verifyToken(token) {
  try {
    return jwt.verify(token, JWT_SECRET);
  } catch (err) {
    return null;
  }
}

// Update specific user record safely
function updateUser(userId, mutatorFn) {
  const users = loadUsers();
  const idx = users.findIndex(u => u.id === userId);
  if (idx === -1) return null;

  const user = users[idx];
  mutatorFn(user);
  saveUsers(users);
  return user;
}

module.exports = {
  JWT_SECRET,
  isValidEmail,
  loadUsers,
  saveUsers,
  findUserById,
  findUserByUsername,
  findUserByEmail,
  createUser,
  authenticateUser,
  createPasswordResetToken,
  resetPasswordWithToken,
  sanitizeUser,
  generateToken,
  verifyToken,
  updateUser
};
