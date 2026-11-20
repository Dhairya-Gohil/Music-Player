import React, { useState, useEffect } from 'react';
import {
  User,
  Mail,
  Lock,
  Eye,
  EyeOff,
  LogIn,
  UserPlus,
  LogOut,
  CheckCircle,
  AlertCircle,
  KeyRound,
  ArrowLeft,
  ShieldCheck,
  X,
  Music2,
  Download,
  Smartphone
} from 'lucide-react';
import { 
  registerAccount, 
  loginAccount, 
  requestPasswordResetCode, 
  resetPasswordWithCode 
} from '../utils/auth';
import { 
  promptPWAInstall, 
  isAppInstalled, 
  subscribePWA 
} from '../utils/pwaInstall';

export default function AuthModal({
  isOpen,
  onClose,
  currentUser,
  onLoginSuccess,
  onLogout,
  showAppToast
}) {
  // Views: 'login' | 'register' | 'forgot' | 'reset'
  const [currentView, setCurrentView] = useState('login');

  // Form Fields
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [retypePassword, setRetypePassword] = useState('');
  const [resetToken, setResetToken] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [retypeNewPassword, setRetypeNewPassword] = useState('');

  // Password Visibility Toggles
  const [showPassword, setShowPassword] = useState(false);
  const [showRetypePassword, setShowRetypePassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showRetypeNewPassword, setShowRetypeNewPassword] = useState(false);

  // Status & Validation
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [fieldErrors, setFieldErrors] = useState({});

  // PWA Download / Install App State
  const [installed, setInstalled] = useState(isAppInstalled());
  const [pwaMessage, setPwaMessage] = useState('');

  useEffect(() => {
    return subscribePWA((canInstall, isInst) => {
      setInstalled(isInst);
    });
  }, []);

  const handleInstallApp = async () => {
    const res = await promptPWAInstall();
    if (res.outcome === 'accepted') {
      setPwaMessage('🎉 App installed successfully! You can now launch it from your home screen or desktop.');
      setTimeout(() => setPwaMessage(''), 4500);
    } else if (res.message) {
      setPwaMessage(res.message);
      setTimeout(() => setPwaMessage(''), 7000);
    }
  };

  if (!isOpen) return null;

  const resetAllFields = () => {
    setUsername('');
    setEmail('');
    setPassword('');
    setRetypePassword('');
    setResetToken('');
    setNewPassword('');
    setRetypeNewPassword('');
    setShowPassword(false);
    setShowRetypePassword(false);
    setShowNewPassword(false);
    setShowRetypeNewPassword(false);
    setErrorMessage('');
    setSuccessMessage('');
    setFieldErrors({});
  };

  const validateEmail = (val) => {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(String(val).trim());
  };

  // 1. Handle Login (Email + Password)
  const handleLoginSubmit = async (e) => {
    e.preventDefault();
    setErrorMessage('');
    setSuccessMessage('');
    const errors = {};

    if (!email.trim()) {
      errors.email = 'Email address is required.';
    } else if (!validateEmail(email)) {
      errors.email = 'Please enter a valid email address (e.g., name@domain.com).';
    }

    if (!password) {
      errors.password = 'Password is required.';
    }

    if (Object.keys(errors).length > 0) {
      setFieldErrors(errors);
      setErrorMessage(Object.values(errors)[0]);
      return;
    }

    setFieldErrors({});
    setIsLoading(true);

    try {
      const data = await loginAccount({ email: email.trim(), password });

      onLoginSuccess(data.token, data.user);
      resetAllFields();
      if (showAppToast) {
        showAppToast(`👋 Welcome back, ${data.user.name || data.user.username}!`);
      }
      onClose();
    } catch (err) {
      setErrorMessage(err.message || 'Login failed. Please check your credentials.');
    } finally {
      setIsLoading(false);
    }
  };

  // 2. Handle Register (Username + Email + Password + Retype Password)
  const handleRegisterSubmit = async (e) => {
    e.preventDefault();
    setErrorMessage('');
    setSuccessMessage('');
    const errors = {};

    if (!username.trim()) {
      errors.username = 'Username is required.';
    } else if (username.trim().length < 3) {
      errors.username = 'Username must be at least 3 characters long.';
    }

    if (!email.trim()) {
      errors.email = 'Email address is required.';
    } else if (!validateEmail(email)) {
      errors.email = 'Please enter a valid email address (e.g., name@domain.com).';
    }

    if (!password) {
      errors.password = 'Password is required.';
    } else if (password.length < 6) {
      errors.password = 'Password must be at least 6 characters long.';
    }

    if (!retypePassword) {
      errors.retypePassword = 'Please retype your password to confirm.';
    } else if (password !== retypePassword) {
      errors.retypePassword = 'Passwords do not match. Please verify both fields.';
    }

    if (Object.keys(errors).length > 0) {
      setFieldErrors(errors);
      setErrorMessage(Object.values(errors)[0]);
      return;
    }

    setFieldErrors({});
    setIsLoading(true);

    try {
      const data = await registerAccount({
        username: username.trim(),
        email: email.trim(),
        password,
        name: username.trim()
      });

      onLoginSuccess(data.token, data.user);
      resetAllFields();
      if (showAppToast) {
        showAppToast(`🎉 Account created! Welcome, ${data.user.username}!`);
      }
      onClose();
    } catch (err) {
      setErrorMessage(err.message || 'Registration failed. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  // 3. Handle Forgot Password (Send Reset Code)
  const handleForgotPasswordSubmit = async (e) => {
    e.preventDefault();
    setErrorMessage('');
    setSuccessMessage('');

    if (!email.trim() || !validateEmail(email)) {
      setErrorMessage('Please enter a valid registered email address.');
      setFieldErrors({ email: 'Valid email required' });
      return;
    }

    setIsLoading(true);
    try {
      const data = await requestPasswordResetCode(email.trim());

      setSuccessMessage(`Reset code generated for ${email.trim()}.`);
      if (data.resetToken) {
        setResetToken(data.resetToken);
      }
      setCurrentView('reset');
    } catch (err) {
      setErrorMessage(err.message || 'Could not request password reset.');
    } finally {
      setIsLoading(false);
    }
  };

  // 4. Handle Reset Password (Token + New Password + Retype New Password)
  const handleResetPasswordSubmit = async (e) => {
    e.preventDefault();
    setErrorMessage('');
    setSuccessMessage('');
    const errors = {};

    if (!resetToken.trim()) {
      errors.resetToken = 'Reset verification code is required.';
    }

    if (!newPassword || newPassword.length < 6) {
      errors.newPassword = 'New password must be at least 6 characters.';
    }

    if (!retypeNewPassword) {
      errors.retypeNewPassword = 'Please confirm your new password.';
    } else if (newPassword !== retypeNewPassword) {
      errors.retypeNewPassword = 'Passwords do not match.';
    }

    if (Object.keys(errors).length > 0) {
      setFieldErrors(errors);
      setErrorMessage(Object.values(errors)[0]);
      return;
    }

    setFieldErrors({});
    setIsLoading(true);

    try {
      const data = await resetPasswordWithCode({
        token: resetToken.trim(),
        newPassword
      });

      setSuccessMessage(data.message || 'Password has been successfully updated! You can now log in.');
      setPassword('');
      setRetypePassword('');
      setNewPassword('');
      setRetypeNewPassword('');
      setCurrentView('login');
      if (showAppToast) {
        showAppToast("✅ Password reset successfully! Please sign in.");
      }
    } catch (err) {
      setErrorMessage(err.message || 'Password reset failed.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        backgroundColor: 'rgba(15, 23, 42, 0.45)',
        backdropFilter: 'blur(10px)',
        zIndex: 9999,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '16px',
        animation: 'fadeIn 0.2s ease-out'
      }}
      onClick={onClose}
    >
      <div
        style={{
          width: '100%',
          maxWidth: '420px',
          backgroundColor: '#ffffff',
          borderRadius: '28px',
          boxShadow: '0 25px 60px -12px rgba(15, 23, 42, 0.25), 0 0 0 1px rgba(226, 232, 240, 0.9)',
          overflow: 'hidden',
          animation: 'scaleUp 0.25s cubic-bezier(0.16, 1, 0.3, 1)'
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div style={{
          padding: '24px 26px 18px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          borderBottom: '1px solid #f1f5f9'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div style={{
              width: '40px',
              height: '40px',
              borderRadius: '14px',
              background: 'linear-gradient(135deg, #fdeef1, #ffe4e6)',
              color: '#e0246a',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: '0 4px 12px rgba(224, 36, 106, 0.12)'
            }}>
              <Music2 size={20} />
            </div>
            <div>
              <h2 style={{ fontSize: '18px', fontWeight: '800', margin: 0, color: '#0f172a' }}>
                {currentUser
                  ? 'Your Account'
                  : currentView === 'login'
                    ? 'Welcome Back'
                    : currentView === 'register'
                      ? 'Create Account'
                      : currentView === 'forgot'
                        ? 'Forgot Password'
                        : 'Reset Password'
                }
              </h2>
              <span style={{ fontSize: '12px', color: '#64748b', fontWeight: '500' }}>
                {currentUser
                  ? 'Private Multi-User Session Active'
                  : currentView === 'login'
                    ? 'Log in with your registered email'
                    : currentView === 'register'
                      ? 'Sign in to access your private library'
                      : 'Reset and recover your access'
                }
              </span>
            </div>
          </div>

          <button
            onClick={onClose}
            style={{
              background: '#f8fafc',
              border: '1px solid #e2e8f0',
              color: '#64748b',
              cursor: 'pointer',
              padding: '6px',
              borderRadius: '50%',
              display: 'flex',
              transition: 'all 0.15s ease'
            }}
            onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#f1f5f9'}
            onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#f8fafc'}
          >
            <X size={17} />
          </button>
        </div>

        {/* Status Banners */}
        <div style={{ padding: '0 26px' }}>
          {errorMessage && (
            <div style={{
              marginTop: '16px',
              padding: '12px 14px',
              borderRadius: '14px',
              backgroundColor: '#fff1f2',
              border: '1.5px solid #fecdd3',
              color: '#e11d48',
              fontSize: '13px',
              fontWeight: '600',
              display: 'flex',
              alignItems: 'center',
              gap: '8px'
            }}>
              <AlertCircle size={16} style={{ flexShrink: 0 }} />
              <span>{errorMessage}</span>
            </div>
          )}

          {successMessage && (
            <div style={{
              marginTop: '16px',
              padding: '12px 14px',
              borderRadius: '14px',
              backgroundColor: '#f0fdf4',
              border: '1.5px solid #bbf7d0',
              color: '#15803d',
              fontSize: '13px',
              fontWeight: '600',
              display: 'flex',
              alignItems: 'center',
              gap: '8px'
            }}>
              <CheckCircle size={16} style={{ flexShrink: 0 }} />
              <span>{successMessage}</span>
            </div>
          )}
        </div>

        {/* Modal Body */}
        {currentUser ? (
          /* Logged In View */
          <div style={{ padding: '24px 26px' }}>
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '16px',
              padding: '18px',
              backgroundColor: '#f8fafc',
              borderRadius: '20px',
              border: '1px solid #e2e8f0',
              marginBottom: '18px'
            }}>
              <div style={{
                width: '56px',
                height: '56px',
                borderRadius: '50%',
                background: 'linear-gradient(135deg, #e0246a, #ff4d6d)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '22px',
                fontWeight: '800',
                color: '#ffffff',
                boxShadow: '0 4px 14px rgba(224, 36, 106, 0.3)'
              }}>
                {(currentUser.name || currentUser.username || 'U')[0].toUpperCase()}
              </div>

              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <h3 style={{ fontSize: '18px', fontWeight: '800', margin: 0, color: '#0f172a' }}>
                    {currentUser.name || currentUser.username}
                  </h3>
                  <CheckCircle size={16} color="#10b981" />
                </div>
                <p style={{ margin: '3px 0 0', fontSize: '13px', color: '#64748b' }}>
                  @{currentUser.username}
                </p>
                {currentUser.email && (
                  <p style={{ margin: '2px 0 0', fontSize: '12px', color: '#94a3b8' }}>
                    {currentUser.email}
                  </p>
                )}
              </div>
            </div>

            <div style={{
              padding: '14px 16px',
              backgroundColor: '#fdeef1',
              borderRadius: '16px',
              border: '1px solid rgba(224, 36, 106, 0.2)',
              fontSize: '13px',
              color: '#be185d',
              lineHeight: '1.5',
              marginBottom: '16px'
            }}>
              🔒 <strong>Private Mode Active:</strong> Your playlists, liked songs, to-dos, and custom metadata are strictly personal and never visible to other users.
            </div>

            {/* Install / Download Web App as Native Standalone App */}
            <div style={{
              padding: '12px 14px',
              backgroundColor: '#f8fafc',
              borderRadius: '16px',
              border: '1.5px solid #e2e8f0',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              gap: '10px',
              marginBottom: '20px'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', minWidth: 0 }}>
                <div style={{
                  width: '36px',
                  height: '36px',
                  borderRadius: '10px',
                  backgroundColor: '#fff1f2',
                  color: '#e11d48',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexShrink: 0
                }}>
                  <Download size={18} />
                </div>
                <div style={{ minWidth: 0 }}>
                  <h4 style={{ fontSize: '13px', fontWeight: '700', color: '#0f172a', margin: '0 0 2px 0' }}>
                    {installed ? 'App Installed' : 'Install / Download App'}
                  </h4>
                  <p style={{ fontSize: '11px', color: '#64748b', margin: 0, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                    {installed ? 'Running standalone on your device' : 'Add to home screen & use as standalone app'}
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={handleInstallApp}
                disabled={installed}
                style={{
                  padding: '7px 14px',
                  borderRadius: '10px',
                  border: 'none',
                  backgroundColor: installed ? '#e2e8f0' : 'var(--accent-red, #cc3344)',
                  color: installed ? '#94a3b8' : '#ffffff',
                  fontSize: '11.5px',
                  fontWeight: '700',
                  cursor: installed ? 'default' : 'pointer',
                  flexShrink: 0,
                  boxShadow: installed ? 'none' : '0 2px 8px rgba(204, 51, 68, 0.25)',
                  transition: 'all 0.15s ease'
                }}
              >
                {installed ? 'Installed ✓' : 'Install'}
              </button>
            </div>

            {pwaMessage && (
              <div style={{
                padding: '10px 14px',
                borderRadius: '12px',
                backgroundColor: '#eff6ff',
                color: '#1d4ed8',
                fontSize: '12px',
                fontWeight: '600',
                marginBottom: '18px',
                textAlign: 'center',
                lineHeight: 1.4
              }}>
                {pwaMessage}
              </div>
            )}

            <div style={{ display: 'flex', gap: '10px' }}>
              <button
                type="button"
                onClick={() => {
                  onLogout();
                  resetAllFields();
                  setCurrentView('login');
                }}
                style={{
                  flex: 1,
                  padding: '13px 16px',
                  borderRadius: '16px',
                  border: '1.5px solid #e2e8f0',
                  backgroundColor: '#ffffff',
                  color: '#475569',
                  fontSize: '14px',
                  fontWeight: '700',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '8px',
                  transition: 'all 0.15s ease'
                }}
                onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#f8fafc'}
                onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#ffffff'}
              >
                <LogOut size={16} />
                <span>Log Out</span>
              </button>

              <button
                type="button"
                onClick={onClose}
                style={{
                  flex: 1,
                  padding: '13px 16px',
                  borderRadius: '16px',
                  border: 'none',
                  background: 'linear-gradient(135deg, #e0246a, #cc3344)',
                  color: '#ffffff',
                  fontSize: '14px',
                  fontWeight: '700',
                  cursor: 'pointer',
                  boxShadow: '0 4px 16px rgba(224, 36, 106, 0.25)'
                }}
              >
                Done
              </button>
            </div>
          </div>
        ) : (
          /* Unauthenticated Forms */
          <div style={{ padding: '22px 26px 26px' }}>
            {/* View Switcher: Log In vs Sign In (Create Account) */}
            {(currentView === 'login' || currentView === 'register') && (
              <div style={{
                display: 'flex',
                backgroundColor: '#f1f5f9',
                borderRadius: '16px',
                padding: '4px',
                marginBottom: '20px'
              }}>
                <button
                  type="button"
                  onClick={() => { setCurrentView('login'); setErrorMessage(''); setFieldErrors({}); }}
                  style={{
                    flex: 1,
                    padding: '10px',
                    borderRadius: '12px',
                    border: 'none',
                    backgroundColor: currentView === 'login' ? '#ffffff' : 'transparent',
                    color: currentView === 'login' ? '#e0246a' : '#64748b',
                    fontSize: '13px',
                    fontWeight: '800',
                    cursor: 'pointer',
                    boxShadow: currentView === 'login' ? '0 2px 8px rgba(0, 0, 0, 0.06)' : 'none',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '6px',
                    transition: 'all 0.2s ease'
                  }}
                >
                  <LogIn size={15} />
                  <span>Log In</span>
                </button>

                <button
                  type="button"
                  onClick={() => { setCurrentView('register'); setErrorMessage(''); setFieldErrors({}); }}
                  style={{
                    flex: 1,
                    padding: '10px',
                    borderRadius: '12px',
                    border: 'none',
                    backgroundColor: currentView === 'register' ? '#ffffff' : 'transparent',
                    color: currentView === 'register' ? '#e0246a' : '#64748b',
                    fontSize: '13px',
                    fontWeight: '800',
                    cursor: 'pointer',
                    boxShadow: currentView === 'register' ? '0 2px 8px rgba(0, 0, 0, 0.06)' : 'none',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '6px',
                    transition: 'all 0.2s ease'
                  }}
                >
                  <UserPlus size={15} />
                  <span>Sign In</span>
                </button>
              </div>
            )}

            {/* 1. LOG IN VIEW (Email + Password) */}
            {currentView === 'login' && (
              <form onSubmit={handleLoginSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '12px', fontWeight: '700', color: '#475569', marginBottom: '6px' }}>
                    Email Address
                  </label>
                  <div style={{ position: 'relative' }}>
                    <Mail size={16} color="#94a3b8" style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)' }} />
                    <input
                      type="email"
                      placeholder="name@domain.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                      autoFocus
                      style={{
                        width: '100%',
                        padding: '12px 14px 12px 40px',
                        borderRadius: '14px',
                        backgroundColor: '#f8fafc',
                        border: fieldErrors.email ? '1.5px solid #e11d48' : '1.5px solid #e2e8f0',
                        color: '#0f172a',
                        fontSize: '14px',
                        outline: 'none',
                        boxSizing: 'border-box',
                        transition: 'border-color 0.15s ease'
                      }}
                      onFocus={(e) => e.target.style.borderColor = '#e0246a'}
                      onBlur={(e) => e.target.style.borderColor = fieldErrors.email ? '#e11d48' : '#e2e8f0'}
                    />
                  </div>
                  {fieldErrors.email && (
                    <span style={{ fontSize: '11px', color: '#e11d48', fontWeight: '600', marginTop: '4px', display: 'block' }}>
                      {fieldErrors.email}
                    </span>
                  )}
                </div>

                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                    <label style={{ fontSize: '12px', fontWeight: '700', color: '#475569' }}>
                      Password
                    </label>
                    <button
                      type="button"
                      onClick={() => { setCurrentView('forgot'); setErrorMessage(''); setFieldErrors({}); }}
                      style={{
                        background: 'none',
                        border: 'none',
                        color: '#e0246a',
                        fontSize: '12px',
                        fontWeight: '700',
                        cursor: 'pointer',
                        padding: 0
                      }}
                    >
                      Forgot password?
                    </button>
                  </div>

                  <div style={{ position: 'relative' }}>
                    <Lock size={16} color="#94a3b8" style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)' }} />
                    <input
                      type={showPassword ? 'text' : 'password'}
                      placeholder="Enter your password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required
                      style={{
                        width: '100%',
                        padding: '12px 42px 12px 40px',
                        borderRadius: '14px',
                        backgroundColor: '#f8fafc',
                        border: fieldErrors.password ? '1.5px solid #e11d48' : '1.5px solid #e2e8f0',
                        color: '#0f172a',
                        fontSize: '14px',
                        outline: 'none',
                        boxSizing: 'border-box',
                        transition: 'border-color 0.15s ease'
                      }}
                      onFocus={(e) => e.target.style.borderColor = '#e0246a'}
                      onBlur={(e) => e.target.style.borderColor = fieldErrors.password ? '#e11d48' : '#e2e8f0'}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      style={{
                        position: 'absolute',
                        right: '12px',
                        top: '50%',
                        transform: 'translateY(-50%)',
                        background: 'none',
                        border: 'none',
                        color: '#94a3b8',
                        cursor: 'pointer',
                        padding: '4px',
                        display: 'flex'
                      }}
                      title={showPassword ? "Hide password" : "Show password"}
                    >
                      {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                    </button>
                  </div>
                  {fieldErrors.password && (
                    <span style={{ fontSize: '11px', color: '#e11d48', fontWeight: '600', marginTop: '4px', display: 'block' }}>
                      {fieldErrors.password}
                    </span>
                  )}
                </div>

                <button
                  type="submit"
                  disabled={isLoading}
                  style={{
                    marginTop: '8px',
                    padding: '13px',
                    borderRadius: '16px',
                    border: 'none',
                    background: 'linear-gradient(135deg, #e0246a, #cc3344)',
                    color: '#ffffff',
                    fontSize: '14px',
                    fontWeight: '800',
                    cursor: isLoading ? 'default' : 'pointer',
                    opacity: isLoading ? 0.7 : 1,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '8px',
                    boxShadow: '0 6px 20px rgba(224, 36, 106, 0.25)',
                    transition: 'transform 0.1s ease'
                  }}
                >
                  {isLoading ? <span>Signing In...</span> : (
                    <>
                      <LogIn size={16} />
                      <span>Log In to Music</span>
                    </>
                  )}
                </button>
              </form>
            )}

            {/* 2. SIGN IN / REGISTER VIEW (Username + Email + Password + Retype Password) */}
            {currentView === 'register' && (
              <form onSubmit={handleRegisterSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '13px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '12px', fontWeight: '700', color: '#475569', marginBottom: '5px' }}>
                    Username
                  </label>
                  <div style={{ position: 'relative' }}>
                    <User size={16} color="#94a3b8" style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)' }} />
                    <input
                      type="text"
                      placeholder="e.g. White Devil"
                      value={username}
                      onChange={(e) => setUsername(e.target.value)}
                      required
                      autoFocus
                      style={{
                        width: '100%',
                        padding: '11px 14px 11px 40px',
                        borderRadius: '14px',
                        backgroundColor: '#f8fafc',
                        border: fieldErrors.username ? '1.5px solid #e11d48' : '1.5px solid #e2e8f0',
                        color: '#0f172a',
                        fontSize: '14px',
                        outline: 'none',
                        boxSizing: 'border-box'
                      }}
                      onFocus={(e) => e.target.style.borderColor = '#e0246a'}
                      onBlur={(e) => e.target.style.borderColor = fieldErrors.username ? '#e11d48' : '#e2e8f0'}
                    />
                  </div>
                  {fieldErrors.username && (
                    <span style={{ fontSize: '11px', color: '#e11d48', fontWeight: '600', marginTop: '3px', display: 'block' }}>
                      {fieldErrors.username}
                    </span>
                  )}
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '12px', fontWeight: '700', color: '#475569', marginBottom: '5px' }}>
                    Email Address
                  </label>
                  <div style={{ position: 'relative' }}>
                    <Mail size={16} color="#94a3b8" style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)' }} />
                    <input
                      type="email"
                      placeholder="yourname@domain.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                      style={{
                        width: '100%',
                        padding: '11px 14px 11px 40px',
                        borderRadius: '14px',
                        backgroundColor: '#f8fafc',
                        border: fieldErrors.email ? '1.5px solid #e11d48' : '1.5px solid #e2e8f0',
                        color: '#0f172a',
                        fontSize: '14px',
                        outline: 'none',
                        boxSizing: 'border-box'
                      }}
                      onFocus={(e) => e.target.style.borderColor = '#e0246a'}
                      onBlur={(e) => e.target.style.borderColor = fieldErrors.email ? '#e11d48' : '#e2e8f0'}
                    />
                  </div>
                  {fieldErrors.email && (
                    <span style={{ fontSize: '11px', color: '#e11d48', fontWeight: '600', marginTop: '3px', display: 'block' }}>
                      {fieldErrors.email}
                    </span>
                  )}
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '12px', fontWeight: '700', color: '#475569', marginBottom: '5px' }}>
                    Password
                  </label>
                  <div style={{ position: 'relative' }}>
                    <Lock size={16} color="#94a3b8" style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)' }} />
                    <input
                      type={showPassword ? 'text' : 'password'}
                      placeholder="At least 6 characters"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required
                      style={{
                        width: '100%',
                        padding: '11px 42px 11px 40px',
                        borderRadius: '14px',
                        backgroundColor: '#f8fafc',
                        border: fieldErrors.password ? '1.5px solid #e11d48' : '1.5px solid #e2e8f0',
                        color: '#0f172a',
                        fontSize: '14px',
                        outline: 'none',
                        boxSizing: 'border-box'
                      }}
                      onFocus={(e) => e.target.style.borderColor = '#e0246a'}
                      onBlur={(e) => e.target.style.borderColor = fieldErrors.password ? '#e11d48' : '#e2e8f0'}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      style={{
                        position: 'absolute',
                        right: '12px',
                        top: '50%',
                        transform: 'translateY(-50%)',
                        background: 'none',
                        border: 'none',
                        color: '#94a3b8',
                        cursor: 'pointer',
                        padding: '4px',
                        display: 'flex'
                      }}
                      title={showPassword ? "Hide password" : "Show password"}
                    >
                      {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                    </button>
                  </div>
                  {fieldErrors.password && (
                    <span style={{ fontSize: '11px', color: '#e11d48', fontWeight: '600', marginTop: '3px', display: 'block' }}>
                      {fieldErrors.password}
                    </span>
                  )}
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '12px', fontWeight: '700', color: '#475569', marginBottom: '5px' }}>
                    Retype Password
                  </label>
                  <div style={{ position: 'relative' }}>
                    <KeyRound size={16} color="#94a3b8" style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)' }} />
                    <input
                      type={showRetypePassword ? 'text' : 'password'}
                      placeholder="Re-enter password"
                      value={retypePassword}
                      onChange={(e) => setRetypePassword(e.target.value)}
                      required
                      style={{
                        width: '100%',
                        padding: '11px 42px 11px 40px',
                        borderRadius: '14px',
                        backgroundColor: '#f8fafc',
                        border: fieldErrors.retypePassword ? '1.5px solid #e11d48' : '1.5px solid #e2e8f0',
                        color: '#0f172a',
                        fontSize: '14px',
                        outline: 'none',
                        boxSizing: 'border-box'
                      }}
                      onFocus={(e) => e.target.style.borderColor = '#e0246a'}
                      onBlur={(e) => e.target.style.borderColor = fieldErrors.retypePassword ? '#e11d48' : '#e2e8f0'}
                    />
                    <button
                      type="button"
                      onClick={() => setShowRetypePassword(!showRetypePassword)}
                      style={{
                        position: 'absolute',
                        right: '12px',
                        top: '50%',
                        transform: 'translateY(-50%)',
                        background: 'none',
                        border: 'none',
                        color: '#94a3b8',
                        cursor: 'pointer',
                        padding: '4px',
                        display: 'flex'
                      }}
                      title={showRetypePassword ? "Hide password" : "Show password"}
                    >
                      {showRetypePassword ? <EyeOff size={16} /> : <Eye size={16} />}
                    </button>
                  </div>
                  {fieldErrors.retypePassword && (
                    <span style={{ fontSize: '11px', color: '#e11d48', fontWeight: '600', marginTop: '3px', display: 'block' }}>
                      {fieldErrors.retypePassword}
                    </span>
                  )}
                </div>

                <button
                  type="submit"
                  disabled={isLoading}
                  style={{
                    marginTop: '8px',
                    padding: '13px',
                    borderRadius: '16px',
                    border: 'none',
                    background: 'linear-gradient(135deg, #e0246a, #cc3344)',
                    color: '#ffffff',
                    fontSize: '14px',
                    fontWeight: '800',
                    cursor: isLoading ? 'default' : 'pointer',
                    opacity: isLoading ? 0.7 : 1,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '8px',
                    boxShadow: '0 6px 20px rgba(224, 36, 106, 0.25)'
                  }}
                >
                  {isLoading ? <span>Creating Account...</span> : (
                    <>
                      <UserPlus size={16} />
                      <span>Sign In &amp; Create Account</span>
                    </>
                  )}
                </button>
              </form>
            )}

            {/* 3. FORGOT PASSWORD VIEW */}
            {currentView === 'forgot' && (
              <form onSubmit={handleForgotPasswordSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                <div style={{
                  padding: '14px',
                  backgroundColor: '#f8fafc',
                  borderRadius: '16px',
                  border: '1px solid #e2e8f0',
                  fontSize: '13px',
                  color: '#475569',
                  lineHeight: '1.5'
                }}>
                  Enter the email address registered with your account. We will send a secure verification code to reset your password.
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '12px', fontWeight: '700', color: '#475569', marginBottom: '6px' }}>
                    Registered Email
                  </label>
                  <div style={{ position: 'relative' }}>
                    <Mail size={16} color="#94a3b8" style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)' }} />
                    <input
                      type="email"
                      placeholder="name@domain.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                      autoFocus
                      style={{
                        width: '100%',
                        padding: '12px 14px 12px 40px',
                        borderRadius: '14px',
                        backgroundColor: '#f8fafc',
                        border: fieldErrors.email ? '1.5px solid #e11d48' : '1.5px solid #e2e8f0',
                        color: '#0f172a',
                        fontSize: '14px',
                        outline: 'none',
                        boxSizing: 'border-box'
                      }}
                      onFocus={(e) => e.target.style.borderColor = '#e0246a'}
                      onBlur={(e) => e.target.style.borderColor = '#e2e8f0'}
                    />
                  </div>
                </div>

                <div style={{ display: 'flex', gap: '10px', marginTop: '6px' }}>
                  <button
                    type="button"
                    onClick={() => { setCurrentView('login'); setErrorMessage(''); }}
                    style={{
                      flex: 1,
                      padding: '12px',
                      borderRadius: '14px',
                      border: '1.5px solid #e2e8f0',
                      backgroundColor: '#ffffff',
                      color: '#64748b',
                      fontSize: '13px',
                      fontWeight: '700',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '6px'
                    }}
                  >
                    <ArrowLeft size={15} />
                    <span>Back to Login</span>
                  </button>

                  <button
                    type="submit"
                    disabled={isLoading}
                    style={{
                      flex: 1.2,
                      padding: '12px',
                      borderRadius: '14px',
                      border: 'none',
                      background: 'linear-gradient(135deg, #e0246a, #cc3344)',
                      color: '#ffffff',
                      fontSize: '13px',
                      fontWeight: '800',
                      cursor: isLoading ? 'default' : 'pointer',
                      boxShadow: '0 4px 16px rgba(224, 36, 106, 0.25)'
                    }}
                  >
                    {isLoading ? 'Generating Code...' : 'Send Reset Code'}
                  </button>
                </div>
              </form>
            )}

            {/* 4. RESET PASSWORD VIEW */}
            {currentView === 'reset' && (
              <form onSubmit={handleResetPasswordSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                <div style={{
                  padding: '12px 14px',
                  backgroundColor: '#f0fdf4',
                  borderRadius: '14px',
                  border: '1px solid #bbf7d0',
                  fontSize: '12px',
                  color: '#15803d',
                  lineHeight: '1.5'
                }}>
                  Enter the verification code generated for <strong>{email}</strong> along with your new password.
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '12px', fontWeight: '700', color: '#475569', marginBottom: '5px' }}>
                    Reset Verification Code
                  </label>
                  <input
                    type="text"
                    placeholder="Enter reset code"
                    value={resetToken}
                    onChange={(e) => setResetToken(e.target.value)}
                    required
                    style={{
                      width: '100%',
                      padding: '11px 14px',
                      borderRadius: '14px',
                      backgroundColor: '#f8fafc',
                      border: fieldErrors.resetToken ? '1.5px solid #e11d48' : '1.5px solid #e2e8f0',
                      color: '#0f172a',
                      fontSize: '14px',
                      fontWeight: '700',
                      letterSpacing: '0.05em',
                      outline: 'none',
                      boxSizing: 'border-box'
                    }}
                  />
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '12px', fontWeight: '700', color: '#475569', marginBottom: '5px' }}>
                    New Password
                  </label>
                  <div style={{ position: 'relative' }}>
                    <Lock size={16} color="#94a3b8" style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)' }} />
                    <input
                      type={showNewPassword ? 'text' : 'password'}
                      placeholder="Minimum 6 characters"
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      required
                      style={{
                        width: '100%',
                        padding: '11px 42px 11px 40px',
                        borderRadius: '14px',
                        backgroundColor: '#f8fafc',
                        border: fieldErrors.newPassword ? '1.5px solid #e11d48' : '1.5px solid #e2e8f0',
                        color: '#0f172a',
                        fontSize: '14px',
                        outline: 'none',
                        boxSizing: 'border-box'
                      }}
                    />
                    <button
                      type="button"
                      onClick={() => setShowNewPassword(!showNewPassword)}
                      style={{
                        position: 'absolute',
                        right: '12px',
                        top: '50%',
                        transform: 'translateY(-50%)',
                        background: 'none',
                        border: 'none',
                        color: '#94a3b8',
                        cursor: 'pointer',
                        padding: '4px',
                        display: 'flex'
                      }}
                      title={showNewPassword ? "Hide password" : "Show password"}
                    >
                      {showNewPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                    </button>
                  </div>
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '12px', fontWeight: '700', color: '#475569', marginBottom: '5px' }}>
                    Confirm New Password
                  </label>
                  <div style={{ position: 'relative' }}>
                    <KeyRound size={16} color="#94a3b8" style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)' }} />
                    <input
                      type={showRetypeNewPassword ? 'text' : 'password'}
                      placeholder="Retype new password"
                      value={retypeNewPassword}
                      onChange={(e) => setRetypeNewPassword(e.target.value)}
                      required
                      style={{
                        width: '100%',
                        padding: '11px 42px 11px 40px',
                        borderRadius: '14px',
                        backgroundColor: '#f8fafc',
                        border: fieldErrors.retypeNewPassword ? '1.5px solid #e11d48' : '1.5px solid #e2e8f0',
                        color: '#0f172a',
                        fontSize: '14px',
                        outline: 'none',
                        boxSizing: 'border-box'
                      }}
                    />
                    <button
                      type="button"
                      onClick={() => setShowRetypeNewPassword(!showRetypeNewPassword)}
                      style={{
                        position: 'absolute',
                        right: '12px',
                        top: '50%',
                        transform: 'translateY(-50%)',
                        background: 'none',
                        border: 'none',
                        color: '#94a3b8',
                        cursor: 'pointer',
                        padding: '4px',
                        display: 'flex'
                      }}
                      title={showRetypeNewPassword ? "Hide password" : "Show password"}
                    >
                      {showRetypeNewPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                    </button>
                  </div>
                </div>

                <div style={{ display: 'flex', gap: '10px', marginTop: '6px' }}>
                  <button
                    type="button"
                    onClick={() => { setCurrentView('login'); setErrorMessage(''); }}
                    style={{
                      flex: 1,
                      padding: '12px',
                      borderRadius: '14px',
                      border: '1.5px solid #e2e8f0',
                      backgroundColor: '#ffffff',
                      color: '#64748b',
                      fontSize: '13px',
                      fontWeight: '700',
                      cursor: 'pointer'
                    }}
                  >
                    Cancel
                  </button>

                  <button
                    type="submit"
                    disabled={isLoading}
                    style={{
                      flex: 1.3,
                      padding: '12px',
                      borderRadius: '14px',
                      border: 'none',
                      background: 'linear-gradient(135deg, #e0246a, #cc3344)',
                      color: '#ffffff',
                      fontSize: '13px',
                      fontWeight: '800',
                      cursor: isLoading ? 'default' : 'pointer',
                      boxShadow: '0 4px 16px rgba(224, 36, 106, 0.25)'
                    }}
                  >
                    {isLoading ? 'Updating...' : 'Save New Password'}
                  </button>
                </div>
              </form>
            )}

            {/* Install / Add to Home Screen Quick Link for unauthenticated users */}
            <div style={{ marginTop: '20px', paddingTop: '14px', borderTop: '1px solid #f1f5f9', textAlign: 'center' }}>
              <button
                type="button"
                onClick={handleInstallApp}
                style={{
                  background: 'none',
                  border: 'none',
                  color: '#64748b',
                  fontSize: '12px',
                  fontWeight: '600',
                  cursor: 'pointer',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '6px',
                  padding: '4px 8px',
                  borderRadius: '8px',
                  transition: 'color 0.15s ease'
                }}
                onMouseEnter={(e) => e.currentTarget.style.color = 'var(--accent-red, #cc3344)'}
                onMouseLeave={(e) => e.currentTarget.style.color = '#64748b'}
              >
                <Download size={14} color="#e0246a" />
                <span>{installed ? '✓ App Installed on this device' : 'Download / Install Web App to Home Screen'}</span>
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
