import React from 'react';

// ==========================================
// 1. أيقونات الأدوار (Role Icons)
// ==========================================

export const MafiaIcon = ({ size = 60, color = "var(--crimson-red)" }) => (
  <svg viewBox="0 0 24 24" width={size} height={size} fill={color} style={{ filter: 'drop-shadow(0px 4px 6px rgba(139,0,0,0.4))' }}>
    <path d="M12 2L2 7l2 2v8c0 2.2 3.6 4 8 4s8-1.8 8-4V9l2-2-10-5zm0 2.8l7 3.5-7 3.5-7-3.5 7-3.5z" />
    <path d="M9 13v4h6v-4H9z" opacity="0.6"/>
  </svg>
);

export const DoctorIcon = ({ size = 60, color = "var(--primary-gold)" }) => (
  <svg viewBox="0 0 24 24" width={size} height={size} fill={color}>
    <path d="M20 6h-4V4c0-1.1-.9-2-2-2h-4c-1.1 0-2 .9-2 2v2H4c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V8c0-1.1-.9-2-2-2zM10 4h4v2h-4V4zm6 11h-3v3h-2v-3H8v-2h3v-3h2v3h3v2z" />
  </svg>
);

export const DetectiveIcon = ({ size = 60, color = "#e0e0e0" }) => (
  <svg viewBox="0 0 24 24" width={size} height={size} fill="none" stroke={color} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="11" cy="11" r="8" />
    <line x1="21" y1="21" x2="16.65" y2="16.65" />
    <path d="M11 8c-1.66 0-3 1.34-3 3" opacity="0.5" />
  </svg>
);

export const CitizenIcon = ({ size = 60, color = "var(--text-dim)" }) => (
  <svg viewBox="0 0 24 24" width={size} height={size} fill={color}>
    <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z" />
  </svg>
);

export const JesterIcon = ({ size = 60, color = "#a64dff" }) => (
  <svg viewBox="0 0 24 24" width={size} height={size} fill={color}>
    <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 14c-2 0-3.5-1.5-3.5-3.5S8 9 10 9s3.5 1.5 3.5 3.5S14 16 12 16zm4-5.5c-.83 0-1.5-.67-1.5-1.5s.67-1.5 1.5-1.5 1.5.67 1.5 1.5-.67 1.5-1.5 1.5z" />
    <path d="M10 12.5c-.83 0-1.5-.67-1.5-1.5s.67-1.5 1.5-1.5 1.5.67 1.5 1.5-.67 1.5-1.5 1.5z" opacity="0.6"/>
  </svg>
);

export const VigilanteIcon = ({ size = 60, color = "#ff9900" }) => (
  <svg viewBox="0 0 24 24" width={size} height={size} fill="none" stroke={color} strokeWidth="1.5">
    <circle cx="12" cy="12" r="10" />
    <circle cx="12" cy="12" r="4" />
    <line x1="12" y1="2" x2="12" y2="6" />
    <line x1="12" y1="22" x2="12" y2="18" />
    <line x1="2" y1="12" x2="6" y2="12" />
    <line x1="22" y1="12" x2="18" y2="12" />
  </svg>
);

// ==========================================
// 2. رسومات البيئة والمشاهد (Atmospheric Art)
// ==========================================

export const CitySkyline = () => (
  <svg viewBox="0 0 100 40" width="100%" height="80px" style={{ opacity: 0.4, marginBottom: '20px' }}>
    <rect x="10" y="15" width="15" height="25" fill="#111" />
    <rect x="26" y="5" width="20" height="35" fill="#0a0a0a" />
    <rect x="47" y="20" width="12" height="20" fill="#111" />
    <rect x="60" y="10" width="18" height="30" fill="#050505" />
    <rect x="79" y="18" width="15" height="22" fill="#111" />
    <circle cx="85" cy="8" r="3" fill="var(--primary-gold)" opacity="0.5" className="star-twinkle" />
    <circle cx="20" cy="12" r="2" fill="var(--text-dim)" opacity="0.3" className="star-twinkle" style={{ animationDelay: '1s' }} />
  </svg>
);

export const NooseSVG = () => (
  <svg viewBox="0 0 50 100" width="80px" height="150px" style={{ margin: '0 auto', display: 'block', opacity: 0.8 }} className="swing-animation">
    <path d="M25 0 V 60" stroke="var(--primary-gold)" strokeWidth="3" fill="none" strokeDasharray="4 2" />
    <circle cx="25" cy="75" r="15" stroke="var(--primary-gold)" strokeWidth="4" fill="none" />
    <path d="M22 60 H 28 V 65 H 22 Z" fill="var(--crimson-red)" />
  </svg>
);

export const ShatteredGlassSVG = () => (
  <svg viewBox="0 0 100 100" width="100%" height="100%" style={{ position: 'absolute', top: 0, left: 0, pointerEvents: 'none', zIndex: 10 }}>
    <path d="M50 50 L10 10 M50 50 L90 20 M50 50 L80 90 M50 50 L20 80 M50 50 L40 10 M50 50 L90 60" stroke="rgba(255,255,255,0.15)" strokeWidth="1" />
    <circle cx="50" cy="50" r="3" fill="var(--crimson-red)" opacity="0.8" />
    <path d="M50 50 Q 55 60 50 70" stroke="var(--crimson-red)" strokeWidth="2" fill="none" className="blood-drip" />
  </svg>
);

export const SmokeBackground = () => (
  <div className="smoke-container">
    <div className="smoke-layer smoke-1"></div>
    <div className="smoke-layer smoke-2"></div>
  </div>
);
