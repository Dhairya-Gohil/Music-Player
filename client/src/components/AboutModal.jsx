import React, { useState } from 'react';
import {
  X,
  Music,
  Mail,
  Phone,
  Check,
  Copy,
  Sparkles,
  Heart,
  ShieldCheck,
  ExternalLink,
  Code2,
  Smartphone
} from 'lucide-react';

export default function AboutModal({ isOpen, onClose }) {
  const [copiedField, setCopiedField] = useState(null);

  if (!isOpen) return null;

  const developerInfo = {
    name: "Dhairya Gohil",
    alias: "White Devil",
    role: "Developer & Designer",
    email: "whitedvl404@gmail.com",
    phone: "+91 78598 989422",
    version: "v2.0.0 (Production)",
    releaseYear: "2026"
  };

  const handleCopy = (text, fieldName) => {
    navigator.clipboard?.writeText(text);
    setCopiedField(fieldName);
    setTimeout(() => {
      setCopiedField(null);
    }, 2000);
  };

  return (
    <div className="modal-overlay" onClick={onClose} style={{ zIndex: 1100 }}>
      <div
        className="app-card"
        onClick={(e) => e.stopPropagation()}
        style={{
          width: '92%',
          maxWidth: '460px',
          maxHeight: '90vh',
          backgroundColor: '#ffffff',
          borderRadius: '24px',
          padding: '20px 18px',
          display: 'flex',
          flexDirection: 'column',
          gap: '16px',
          boxShadow: '0 25px 60px rgba(15, 23, 42, 0.16)',
          border: '1px solid rgba(0, 0, 0, 0.06)',
          overflowY: 'auto',
          position: 'relative',
          animation: 'fadeIn 0.2s ease-out'
        }}
      >
        {/* Header Row: Title & Close Button */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div style={{
              width: '32px',
              height: '32px',
              borderRadius: '10px',
              background: 'linear-gradient(135deg, #e0246a, #cc3344)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#ffffff',
              boxShadow: '0 3px 10px rgba(224, 36, 106, 0.25)'
            }}>
              <Music size={16} />
            </div>
            <div>
              <h2 style={{
                fontSize: '17px',
                fontWeight: '800',
                color: '#0f172a',
                margin: 0
              }}>
                About Application
              </h2>
              <p style={{ fontSize: '11.5px', color: '#64748b', margin: 0 }}>
                Music Studio
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            style={{
              width: '30px',
              height: '30px',
              borderRadius: '50%',
              border: 'none',
              backgroundColor: '#f1f5f9',
              color: '#64748b',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              transition: 'all 0.15s ease'
            }}
            onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#e2e8f0'}
            onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#f1f5f9'}
          >
            <X size={16} />
          </button>
        </div>

        {/* Developer Hero Profile Card */}
        <div style={{
          background: 'linear-gradient(135deg, #fff0f3 0%, #fdeef1 100%)',
          borderRadius: '18px',
          padding: '16px',
          border: '1px solid #fecdd3',
          display: 'flex',
          flexDirection: 'column',
          gap: '12px',
          position: 'relative'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
            {/* Avatar Badge */}
            <div style={{
              width: '52px',
              height: '52px',
              borderRadius: '16px',
              background: 'linear-gradient(135deg, #e0246a, #cc3344)',
              color: '#ffffff',
              fontSize: '24px',
              fontWeight: '900',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: '0 4px 14px rgba(224, 36, 106, 0.25)',
              position: 'relative',
              flexShrink: 0
            }}>
              W
              <span style={{
                position: 'absolute',
                bottom: '-2px',
                right: '-2px',
                width: '16px',
                height: '16px',
                borderRadius: '50%',
                backgroundColor: '#10b981',
                border: '2px solid #ffffff',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#ffffff',
                fontSize: '9px'
              }}>
                ✓
              </span>
            </div>

            <div style={{ minWidth: 0, flex: 1, display: 'flex', flexDirection: 'column', gap: '4px' }}>
              <h3 style={{
                fontSize: '17px',
                fontWeight: '800',
                color: '#0f172a',
                margin: 0,
                lineHeight: '1.2'
              }}>
                {developerInfo.name}
              </h3>

              <div>
                <span style={{
                  fontSize: '10.5px',
                  fontWeight: '700',
                  color: '#e0246a',
                  backgroundColor: 'rgba(224, 36, 106, 0.1)',
                  padding: '2px 8px',
                  borderRadius: '9999px',
                  display: 'inline-block'
                }}>
                  {developerInfo.alias}
                </span>
              </div>

              <p style={{
                fontSize: '12px',
                color: '#64748b',
                fontWeight: '600',
                margin: 0
              }}>
                {developerInfo.role}
              </p>
            </div>
          </div>

          <p style={{
            fontSize: '12px',
            color: '#475569',
            lineHeight: '1.6',
            margin: 0,
            textAlign: 'justify',
            textJustify: 'inter-word'
          }}>
            Creator of <strong>Music</strong> — an offline-first, high-fidelity music streaming application with studio-grade audio tools, multi-user sessions, and zero-storage local sync.
          </p>
        </div>

        {/* Contact Information Section */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          <p style={{
            fontSize: '11px',
            fontWeight: '800',
            color: '#94a3b8',
            textTransform: 'uppercase',
            letterSpacing: '0.06em',
            margin: '0 0 2px 2px'
          }}>
            Developer Contact
          </p>

          {/* Email Row */}
          <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '8px 12px',
            backgroundColor: '#f8fafc',
            borderRadius: '12px',
            border: '1px solid #e2e8f0'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', minWidth: 0, flex: 1 }}>
              <div style={{
                width: '28px',
                height: '28px',
                borderRadius: '7px',
                backgroundColor: '#eff6ff',
                color: '#3b82f6',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0
              }}>
                <Mail size={14} />
              </div>
              <div style={{ minWidth: 0, flex: 1 }}>
                <p style={{ fontSize: '10px', color: '#94a3b8', fontWeight: '700', margin: 0, textTransform: 'uppercase' }}>
                  Email Address
                </p>
                <a
                  href={`mailto:${developerInfo.email}`}
                  title="Send Email"
                  style={{
                    fontSize: '11.5px',
                    fontWeight: '600',
                    color: '#0f172a',
                    textDecoration: 'none',
                    margin: 0,
                    display: 'block',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    whiteSpace: 'nowrap'
                  }}
                >
                  {developerInfo.email}
                </a>
              </div>
            </div>

            <button
              onClick={() => handleCopy(developerInfo.email, 'email')}
              title="Copy Email"
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '4px',
                padding: '5px 8px',
                borderRadius: '7px',
                border: '1px solid #cbd5e1',
                backgroundColor: '#ffffff',
                color: copiedField === 'email' ? '#10b981' : '#475569',
                fontSize: '11px',
                fontWeight: '700',
                cursor: 'pointer',
                flexShrink: 0,
                marginLeft: '6px',
                transition: 'all 0.15s ease'
              }}
            >
              {copiedField === 'email' ? (
                <>
                  <Check size={12} color="#10b981" /> Copied
                </>
              ) : (
                <>
                  <Copy size={12} /> Copy
                </>
              )}
            </button>
          </div>

          {/* Phone Number Row */}
          <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '8px 12px',
            backgroundColor: '#f8fafc',
            borderRadius: '12px',
            border: '1px solid #e2e8f0'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', minWidth: 0, flex: 1 }}>
              <div style={{
                width: '28px',
                height: '28px',
                borderRadius: '7px',
                backgroundColor: '#f0fdf4',
                color: '#10b981',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0
              }}>
                <Phone size={14} />
              </div>
              <div style={{ minWidth: 0, flex: 1 }}>
                <p style={{ fontSize: '10px', color: '#94a3b8', fontWeight: '700', margin: 0, textTransform: 'uppercase' }}>
                  Phone / Mobile
                </p>
                <a
                  href={`tel:${developerInfo.phone.replace(/\s+/g, '')}`}
                  title="Call Developer"
                  style={{
                    fontSize: '11.5px',
                    fontWeight: '600',
                    color: '#0f172a',
                    textDecoration: 'none',
                    margin: 0,
                    display: 'block',
                    whiteSpace: 'nowrap',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis'
                  }}
                >
                  {developerInfo.phone}
                </a>
              </div>
            </div>

            <button
              onClick={() => handleCopy(developerInfo.phone, 'phone')}
              title="Copy Phone"
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '4px',
                padding: '5px 8px',
                borderRadius: '7px',
                border: '1px solid #cbd5e1',
                backgroundColor: '#ffffff',
                color: copiedField === 'phone' ? '#10b981' : '#475569',
                fontSize: '11px',
                fontWeight: '700',
                cursor: 'pointer',
                flexShrink: 0,
                marginLeft: '6px',
                transition: 'all 0.15s ease'
              }}
            >
              {copiedField === 'phone' ? (
                <>
                  <Check size={12} color="#10b981" /> Copied
                </>
              ) : (
                <>
                  <Copy size={12} /> Copy
                </>
              )}
            </button>
          </div>
        </div>

        {/* Features & Security Badges */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: '1fr 1fr',
          gap: '8px'
        }}>
          <div style={{
            padding: '10px',
            borderRadius: '12px',
            backgroundColor: '#faf8f5',
            border: '1px solid rgba(0, 0, 0, 0.05)',
            display: 'flex',
            alignItems: 'center',
            gap: '8px'
          }}>
            <ShieldCheck size={18} color="#10b981" />
            <div style={{ minWidth: 0 }}>
              <p style={{ fontSize: '11.5px', fontWeight: '700', color: '#0f172a', margin: 0 }}>
                100% Private
              </p>
              <p style={{ fontSize: '10.5px', color: '#64748b', margin: 0 }}>
                Zero data tracking
              </p>
            </div>
          </div>

          <div style={{
            padding: '10px',
            borderRadius: '12px',
            backgroundColor: '#faf8f5',
            border: '1px solid rgba(0, 0, 0, 0.05)',
            display: 'flex',
            alignItems: 'center',
            gap: '8px'
          }}>
            <Smartphone size={18} color="#e0246a" />
            <div style={{ minWidth: 0 }}>
              <p style={{ fontSize: '11.5px', fontWeight: '700', color: '#0f172a', margin: 0 }}>
                PWA Ready
              </p>
              <p style={{ fontSize: '10.5px', color: '#64748b', margin: 0 }}>
                Installable App
              </p>
            </div>
          </div>
        </div>

        {/* Footer with Version & Done Action */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          paddingTop: '8px',
          borderTop: '1px solid rgba(0, 0, 0, 0.06)'
        }}>
          <span style={{ fontSize: '11px', color: '#94a3b8', fontWeight: '600' }}>
            Music • {developerInfo.version}
          </span>

          <button
            onClick={onClose}
            className="btn-red-action"
            style={{
              padding: '8px 24px',
              fontSize: '13px',
              borderRadius: '12px',
              fontWeight: '700'
            }}
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
}
