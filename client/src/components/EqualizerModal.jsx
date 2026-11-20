import React from 'react';
import { X, Sliders, RotateCcw, Check } from 'lucide-react';

export const EQ_PRESETS = {
  Original: [0, 0, 0, 0, 0],
  'Bass Boost': [7, 5, 1, 0, 0],
  'Vocal Clarity': [-1, 1, 5, 4, 2],
  'Electronic / EDM': [6, 4, -1, 3, 5],
  Rock: [4, 2, -1, 3, 4],
  Acoustic: [2, 3, 1, 2, 3]
};

export const FREQ_LABELS = ['60Hz', '250Hz', '1kHz', '4kHz', '12kHz'];

export default function EqualizerModal({
  isOpen,
  onClose,
  eqGains = [0, 0, 0, 0, 0],
  onChangeGain,
  currentPreset = 'Original',
  onSelectPreset
}) {
  if (!isOpen) return null;

  return (
    <div
      className="modal-overlay"
      onClick={onClose}
      style={{
        position: 'fixed',
        inset: 0,
        backgroundColor: 'rgba(15, 23, 42, 0.45)',
        backdropFilter: 'blur(8px)',
        WebkitBackdropFilter: 'blur(8px)',
        zIndex: 2500,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '16px',
        animation: 'fadeIn 0.15s ease-out'
      }}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          width: '100%',
          maxWidth: '560px',
          backgroundColor: '#ffffff',
          borderRadius: '24px',
          padding: '24px',
          display: 'flex',
          flexDirection: 'column',
          gap: '20px',
          boxShadow: '0 24px 60px rgba(15, 23, 42, 0.18), 0 0 0 1px rgba(0, 0, 0, 0.05)',
          border: '1px solid #f1f5f9',
          animation: 'slideUp 0.2s cubic-bezier(0.16, 1, 0.3, 1)'
        }}
      >
        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div style={{
              width: '38px',
              height: '38px',
              borderRadius: '12px',
              background: 'linear-gradient(135deg, #e0246a, #cc3344)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#ffffff',
              boxShadow: '0 4px 12px rgba(224, 36, 106, 0.25)',
              flexShrink: 0
            }}>
              <Sliders size={20} />
            </div>
            <div>
              <h3 style={{
                fontSize: '18px',
                fontWeight: '800',
                color: '#0f172a',
                margin: 0,
                letterSpacing: '-0.3px'
              }}>
                Audio Studio Equalizer
              </h3>
              <p style={{ fontSize: '12px', color: '#64748b', margin: '2px 0 0 0', fontWeight: '500' }}>
                5-Band Precision Frequency Control
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            title="Close"
            style={{
              width: '32px',
              height: '32px',
              borderRadius: '50%',
              background: '#f8fafc',
              border: '1px solid #e2e8f0',
              cursor: 'pointer',
              color: '#64748b',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              transition: 'all 0.15s ease'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = '#f1f5f9';
              e.currentTarget.style.color = '#0f172a';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = '#f8fafc';
              e.currentTarget.style.color = '#64748b';
            }}
          >
            <X size={17} />
          </button>
        </div>

        {/* Preset Selection Buttons */}
        <div>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            marginBottom: '10px'
          }}>
            <span style={{
              fontSize: '11px',
              color: '#94a3b8',
              fontWeight: '800',
              letterSpacing: '0.06em',
              textTransform: 'uppercase'
            }}>
              Sound Profiles &amp; Presets
            </span>
            {currentPreset && (
              <span style={{
                fontSize: '11.5px',
                fontWeight: '700',
                color: '#e0246a',
                backgroundColor: '#fdeef1',
                padding: '2px 8px',
                borderRadius: '9999px'
              }}>
                Active: {currentPreset}
              </span>
            )}
          </div>

          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
            {Object.keys(EQ_PRESETS).map(name => {
              const active = currentPreset === name;
              return (
                <button
                  key={name}
                  onClick={() => onSelectPreset(name)}
                  style={{
                    padding: '7px 14px',
                    borderRadius: '9999px',
                    border: active ? '1.5px solid #e0246a' : '1px solid #e2e8f0',
                    fontSize: '12.5px',
                    fontWeight: active ? '700' : '600',
                    cursor: 'pointer',
                    backgroundColor: active ? 'linear-gradient(135deg, #e0246a, #cc3344)' : '#ffffff',
                    background: active ? 'linear-gradient(135deg, #e0246a, #cc3344)' : '#ffffff',
                    color: active ? '#ffffff' : '#334155',
                    boxShadow: active ? '0 3px 10px rgba(224, 36, 106, 0.25)' : '0 1px 2px rgba(0, 0, 0, 0.03)',
                    transition: 'all 0.15s ease'
                  }}
                  onMouseEnter={(e) => {
                    if (!active) {
                      e.currentTarget.style.backgroundColor = '#f8fafc';
                      e.currentTarget.style.borderColor = '#cbd5e1';
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (!active) {
                      e.currentTarget.style.backgroundColor = '#ffffff';
                      e.currentTarget.style.borderColor = '#e2e8f0';
                    }
                  }}
                >
                  {name}
                </button>
              );
            })}
          </div>
        </div>

        {/* 5-Band Slider Board */}
        <div style={{
          backgroundColor: '#f8fafc',
          borderRadius: '20px',
          border: '1.5px solid #e2e8f0',
          padding: '22px 14px',
          display: 'flex',
          justifyContent: 'space-around',
          alignItems: 'center',
          height: '240px',
          position: 'relative',
          overflow: 'hidden'
        }}>
          {/* Subtle 0dB Reference Line across background */}
          <div style={{
            position: 'absolute',
            left: '20px',
            right: '20px',
            top: '50%',
            height: '1px',
            backgroundColor: '#e2e8f0',
            pointerEvents: 'none'
          }} />

          {FREQ_LABELS.map((label, idx) => {
            const gain = eqGains[idx] || 0;
            const isBoost = gain > 0;
            const isCut = gain < 0;

            return (
              <div
                key={label}
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  height: '100%',
                  justifyContent: 'space-between',
                  zIndex: 2,
                  minWidth: '50px'
                }}
              >
                {/* dB Display Badge */}
                <span style={{
                  fontSize: '11px',
                  color: isBoost ? '#e0246a' : isCut ? '#0284c7' : '#64748b',
                  fontWeight: '800',
                  fontVariantNumeric: 'tabular-nums',
                  backgroundColor: isBoost ? '#fdeef1' : isCut ? '#e0f2fe' : '#ffffff',
                  border: isBoost ? '1px solid #fecdd3' : isCut ? '1px solid #bae6fd' : '1px solid #e2e8f0',
                  padding: '2px 6px',
                  borderRadius: '6px',
                  minWidth: '34px',
                  textAlign: 'center'
                }}>
                  {gain > 0 ? `+${gain}` : gain}dB
                </span>

                {/* Vertical Slider Wrapper */}
                <div style={{
                  height: '130px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  width: '36px'
                }}>
                  <input
                    type="range"
                    min="-12"
                    max="12"
                    step="1"
                    value={gain}
                    onChange={(e) => onChangeGain(idx, parseFloat(e.target.value))}
                    aria-label={`${label} frequency gain`}
                    style={{
                      transform: 'rotate(-90deg)',
                      width: '120px',
                      cursor: 'pointer',
                      accentColor: '#e0246a'
                    }}
                  />
                </div>

                {/* Frequency Band Label */}
                <span style={{
                  fontSize: '12px',
                  color: '#0f172a',
                  fontWeight: '700',
                  letterSpacing: '0.02em'
                }}>
                  {label}
                </span>
              </div>
            );
          })}
        </div>

        {/* Footer Actions */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          paddingTop: '6px',
          borderTop: '1px solid rgba(0, 0, 0, 0.05)'
        }}>
          <button
            onClick={() => onSelectPreset('Original')}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              padding: '8px 16px',
              borderRadius: '9999px',
              border: '1.5px solid #fecdd3',
              backgroundColor: '#fff1f2',
              color: '#e11d48',
              cursor: 'pointer',
              fontSize: '12.5px',
              fontWeight: '700',
              transition: 'all 0.15s ease'
            }}
            onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#ffe4e6'}
            onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#fff1f2'}
          >
            <RotateCcw size={13} /> Reset to Original
          </button>

          <button
            onClick={onClose}
            className="btn-red-action"
            style={{
              padding: '8px 22px',
              borderRadius: '9999px',
              fontSize: '13px',
              fontWeight: '700',
              display: 'flex',
              alignItems: 'center',
              gap: '6px'
            }}
          >
            <Check size={14} /> Done
          </button>
        </div>
      </div>
    </div>
  );
}
