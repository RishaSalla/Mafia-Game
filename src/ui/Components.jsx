import React, { useState, useEffect } from 'react';

// ==========================================
// 1. Icons (أيقونات مرسومة بالكود لضمان الخفة)
// ==========================================

export const Icons = {
  Mafia: () => (
    <svg width="60" height="60" viewBox="0 0 24 24" fill="none" stroke="var(--accent-red)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M14.5 17.5L3 6V3h3l11.5 11.5" />
      <path d="M13 19l6-6" />
      <path d="M16 16l4 4" />
      <path d="M19 21l2-2" />
    </svg>
  ),
  Doctor: () => (
    <svg width="60" height="60" viewBox="0 0 24 24" fill="none" stroke="var(--accent-blue)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
      <path d="M12 7v5" stroke="white" />
      <path d="M9.5 9.5h5" stroke="white" />
    </svg>
  ),
  Detective: () => (
    <svg width="60" height="60" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="11" cy="11" r="8" />
      <line x1="21" y1="21" x2="16.65" y2="16.65" />
    </svg>
  ),
  Citizen: () => (
    <svg width="60" height="60" viewBox="0 0 24 24" fill="none" stroke="var(--text-muted)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
      <path d="M16 16l-2 3" />
      <path d="M22 18l-3 3" />
    </svg>
  ),
  Dead: () => (
    <svg width="60" height="60" viewBox="0 0 24 24" fill="none" stroke="gray" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="9" cy="12" r="1" />
      <circle cx="15" cy="12" r="1" />
      <path d="M8 20v2h8v-2" />
      <path d="M12.5 17l-.5-1-.5 1h1z" />
      <path d="M16 20a2 2 0 0 0 1.5-3.5c-1-1.5-5-2.5-5.5-2.5S7.5 15 6.5 16.5A2 2 0 0 0 8 20" />
    </svg>
  )
};

// ==========================================
// 2. Reusable Components (العناصر الجاهزة)
// ==========================================

// زر أساسي
export const Button = ({ text, onClick, variant = "primary", disabled = false }) => (
  <button 
    className={`btn ${variant === 'danger' ? 'btn-danger' : 'btn-primary'}`} 
    onClick={onClick}
    disabled={disabled}
    style={{ opacity: disabled ? 0.5 : 1 }}
  >
    {text}
  </button>
);

// بطاقة تعرض أيقونة الدور بناءً على النص
export const RoleIcon = ({ role }) => {
  switch (role) {
    case 'mafia': return <Icons.Mafia />;
    case 'doctor': return <Icons.Doctor />;
    case 'detective': return <Icons.Detective />;
    case 'citizen': return <Icons.Citizen />;
    default: return <Icons.Dead />;
  }
};

// زر "اللمس المطول" (أهم عنصر في اللعبة للسرية)
export const HoldToRevealBtn = ({ onRevealStart, onRevealEnd }) => {
  return (
    <button
      className="btn pulse-animation"
      style={{ 
        height: '200px', 
        fontSize: '1.5rem', 
        backgroundColor: '#222',
        border: '2px dashed #555',
        marginTop: '20px'
      }}
      // دعم الماوس (للكمبيوتر)
      onMouseDown={onRevealStart}
      onMouseUp={onRevealEnd}
      onMouseLeave={onRevealEnd}
      // دعم اللمس (للجوال والآيباد)
      onTouchStart={(e) => { e.preventDefault(); onRevealStart(); }}
      onTouchEnd={(e) => { e.preventDefault(); onRevealEnd(); }}
    >
      اضغط باستمرار للكشف
    </button>
  );
};

// شاشة "تمرير الجهاز" الفاصلة
export const PassDeviceScreen = ({ nextPlayerName, onReady }) => (
  <div className="center-content" style={{ background: 'black', height: '100vh', width: '100vw', position: 'fixed', top: 0, left: 0, zIndex: 999 }}>
    <h1 style={{ color: 'var(--accent-red)' }}>توقف!</h1>
    <h2>مرر الجهاز إلى</h2>
    <h1 style={{ fontSize: '3rem', color: 'white' }}>{nextPlayerName}</h1>
    <p style={{ color: '#666' }}>تأكد أن لا أحد ينظر للشاشة غيرك</p>
    <Button text="أنا استلمت الجهاز" onClick={onReady} />
  </div>
);
