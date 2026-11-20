import React from 'react';
import { RotateCw, User, Search, X, Sparkles, Music, Sliders } from 'lucide-react';

export default function HeaderBar({
  searchQuery,
  onSearchChange,
  onOpenTodoList,
  totalSongCount = 0,
  isLocalStorageSource = false,
  onRescan,
  isRescanning = false,
  currentUser = null,
  onOpenAuthModal,
  onOpenPermissionModal,
  onOpenAbout,
  onOpenEqualizer
}) {
  return (
    <header style={{
      padding: '16px 16px 12px 16px',
      display: 'flex',
      flexDirection: 'column',
      gap: '16px',
      backgroundColor: 'transparent'
    }}>
      {/* Top Row: Brand & Quick Action Controls - Always single line */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'nowrap',
        width: '100%',
        gap: '6px'
      }}>
        {/* Brand Label / About Section Trigger */}
        <div
          onClick={onOpenAbout}
          title={onOpenAbout ? "About Developer & Application" : "White Devil's Music"}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '5px',
            minWidth: 0,
            flexShrink: 1,
            cursor: onOpenAbout ? 'pointer' : 'default',
            userSelect: 'none',
            transition: 'opacity 0.12s ease'
          }}
          onMouseEnter={(e) => {
            if (onOpenAbout) e.currentTarget.style.opacity = '0.8';
          }}
          onMouseLeave={(e) => {
            if (onOpenAbout) e.currentTarget.style.opacity = '1';
          }}
        >
          <div style={{
            width: '22px',
            height: '22px',
            minWidth: '22px',
            borderRadius: '6px',
            background: 'linear-gradient(135deg, #e0246a, #cc3344)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#ffffff',
            boxShadow: '0 2px 6px rgba(224, 36, 106, 0.25)',
            flexShrink: 0
          }}>
            <Music size={12} />
          </div>
          <span style={{
            fontSize: '11.5px',
            fontWeight: '800',
            letterSpacing: '0.05em',
            textTransform: 'uppercase',
            color: 'var(--accent-red, #cc3344)',
            whiteSpace: 'nowrap',
            overflow: 'hidden',
            textOverflow: 'ellipsis'
          }}>
            WHITE DEVIL'S MUSIC
          </span>
        </div>

        {/* Action Buttons Group */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '4px', flexShrink: 0 }}>
          {/* Sync Button */}
          {onRescan && (
            <button
              onClick={onRescan}
              disabled={isRescanning}
              title="Sync local tracks"
              style={{
                padding: '5px 8px',
                borderRadius: '9999px',
                border: '1.5px solid #fecdd3',
                backgroundColor: isRescanning ? '#fecdd3' : '#fff1f2',
                color: '#e11d48',
                fontSize: '11px',
                fontWeight: '700',
                cursor: isRescanning ? 'default' : 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '4px',
                whiteSpace: 'nowrap',
                transition: 'all 0.15s ease'
              }}
            >
              <RotateCw size={11} style={{ animation: isRescanning ? 'spin 1s linear infinite' : 'none' }} />
              <span>{isRescanning ? 'Syncing...' : 'Sync'}</span>
            </button>
          )}

          {/* User Account Button */}
          {onOpenAuthModal && (
            <button
              onClick={onOpenAuthModal}
              title={currentUser ? `Account: @${currentUser.username}` : "Sign in / Register"}
              style={{
                padding: '5px 9px',
                borderRadius: '9999px',
                border: currentUser ? '1.5px solid #bbf7d0' : '1.5px solid #e2e8f0',
                backgroundColor: currentUser ? '#f0fdf4' : '#ffffff',
                color: currentUser ? '#15803d' : '#334155',
                fontSize: '11.5px',
                fontWeight: '700',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '5px',
                boxShadow: '0 1px 3px rgba(0, 0, 0, 0.04)',
                whiteSpace: 'nowrap',
                transition: 'all 0.15s ease'
              }}
            >
              {currentUser ? (
                <>
                  <div style={{
                    width: '16px',
                    height: '16px',
                    borderRadius: '50%',
                    background: 'linear-gradient(135deg, #10b981, #059669)',
                    color: '#fff',
                    fontSize: '9px',
                    fontWeight: '800',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    flexShrink: 0
                  }}>
                    {(currentUser.name || currentUser.username || 'U')[0].toUpperCase()}
                  </div>
                  <span style={{ maxWidth: '68px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    {currentUser.name || currentUser.username}
                  </span>
                </>
              ) : (
                <>
                  <User size={12} color="#64748b" />
                  <span>Sign In</span>
                </>
              )}
            </button>
          )}

          {/* Coral/Red List Button */}
          <button
            onClick={onOpenTodoList}
            className="btn-red-action"
            style={{
              padding: '5px 12px',
              fontSize: '11.5px',
              borderRadius: '9999px',
              fontWeight: '700',
              whiteSpace: 'nowrap'
            }}
          >
            List
          </button>
        </div>
      </div>

      {/* Main Title & Subtitle */}
      <div>
        <h1 style={{
          fontSize: '28px',
          fontWeight: '800',
          letterSpacing: '-0.5px',
          color: '#0f172a',
          lineHeight: '1.2',
          margin: '0 0 5px 0'
        }}>
          Made For Your Ears.
        </h1>
        <div style={{
          fontSize: '13px',
          color: '#64748b',
          fontWeight: '500',
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          flexWrap: 'wrap'
        }}>
          <span>{totalSongCount} songs in your library</span>
          {isLocalStorageSource && (
            <span
              onClick={onOpenPermissionModal}
              title={onOpenPermissionModal ? "Click to scan folders or grant storage access" : "Local Storage"}
              style={{
                fontSize: '11px',
                fontWeight: '700',
                padding: '2px 8px',
                borderRadius: '9999px',
                backgroundColor: '#fdeef1',
                color: '#e0246a',
                cursor: onOpenPermissionModal ? 'pointer' : 'default',
                userSelect: 'none'
              }}
            >
              Local Storage
            </span>
          )}
          {onOpenEqualizer && (
            <button
              onClick={onOpenEqualizer}
              title="Open Audio Studio Equalizer"
              style={{
                fontSize: '11px',
                fontWeight: '700',
                padding: '2.5px 9px',
                borderRadius: '9999px',
                backgroundColor: '#ffffff',
                color: '#475569',
                border: '1px solid #e2e8f0',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '4px',
                boxShadow: '0 1px 2px rgba(0, 0, 0, 0.04)',
                transition: 'all 0.15s ease'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = '#fdeef1';
                e.currentTarget.style.color = '#e0246a';
                e.currentTarget.style.borderColor = '#fecdd3';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = '#ffffff';
                e.currentTarget.style.color = '#475569';
                e.currentTarget.style.borderColor = '#e2e8f0';
              }}
            >
              <Sliders size={11} color="#e0246a" /> EQ
            </button>
          )}
        </div>
      </div>

      {/* Modern Search Input Bar with embedded Icon & Clear Button */}
      <div style={{
        position: 'relative',
        display: 'flex',
        alignItems: 'center'
      }}>
        <Search
          size={17}
          color="#94a3b8"
          style={{ position: 'absolute', left: '16px', pointerEvents: 'none' }}
        />
        <input
          type="text"
          placeholder="Search songs, artists, albums..."
          value={searchQuery}
          onChange={(e) => onSearchChange(e.target.value)}
          style={{
            width: '100%',
            padding: '12px 38px 12px 42px',
            borderRadius: '16px',
            border: '1.5px solid #e2e8f0',
            backgroundColor: '#ffffff',
            color: '#0f172a',
            fontSize: '14px',
            fontWeight: '500',
            outline: 'none',
            boxShadow: '0 2px 8px rgba(0, 0, 0, 0.03)',
            transition: 'all 0.2s ease',
            boxSizing: 'border-box'
          }}
          onFocus={(e) => {
            e.target.style.borderColor = 'var(--accent-red, #cc3344)';
            e.target.style.boxShadow = '0 0 0 3px rgba(204, 51, 68, 0.12)';
          }}
          onBlur={(e) => {
            e.target.style.borderColor = '#e2e8f0';
            e.target.style.boxShadow = '0 2px 8px rgba(0, 0, 0, 0.03)';
          }}
        />
        {searchQuery && (
          <button
            onClick={() => onSearchChange('')}
            style={{
              position: 'absolute',
              right: '12px',
              background: '#f1f5f9',
              border: 'none',
              borderRadius: '50%',
              width: '20px',
              height: '20px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
              color: '#64748b'
            }}
          >
            <X size={12} />
          </button>
        )}
      </div>
    </header>
  );
}
