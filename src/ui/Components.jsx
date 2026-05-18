import React, { useState, useEffect } from 'react';
import { ROLES } from '../logic/gameEngine';
import { 
  MafiaIcon, 
  DoctorIcon, 
  DetectiveIcon, 
  CitizenIcon, 
  JesterIcon, 
  VigilanteIcon 
} from './SVGGraphics';

// ==========================================
// 1. بيانات الأدوار (الأسماء الأصلية لجذور المافيا)
// ==========================================
export const getRoleMeta = (role) => {
  const meta = {
    [ROLES.MAFIA]: { 
      title: 'المافيا', 
      Icon: MafiaIcon, 
      desc: 'أنت من المافيا.. تعاون مع زملائك لتصفية المدينة ليلاً والتخفي نهاراً.' 
    },
    [ROLES.DOCTOR]: { 
      title: 'الطبيب', 
      Icon: DoctorIcon, 
      desc: 'أنت الطبيب.. اختر شخصاً لإنقاذه من القتل الليلة (يمكنك حماية نفسك مرة واحدة فقط).' 
    },
    [ROLES.DETECTIVE]: { 
      title: 'المحقق', 
      Icon: DetectiveIcon, 
      desc: 'أنت المحقق.. اختر شخصاً في الليل لمعرفة ما إذا كان مافيا أم لا.' 
    },
    [ROLES.CITIZEN]: { 
      title: 'مواطن', 
      Icon: CitizenIcon, 
      desc: 'أنت مواطن بريء.. ليس لديك قدرات ليلية، سلاحك هو النقاش والتصويت في النهار.' 
    },
    [ROLES.JESTER]: { 
      title: 'المختل', 
      Icon: JesterIcon, 
      desc: 'أنت تلعب لنفسك فقط.. تلاعب بالجميع ليقوموا بالتصويت على إعدامك، وإذا أعدموك تنتصر!' 
    },
    [ROLES.VIGILANTE]: { 
      title: 'القناص', 
      Icon: VigilanteIcon, 
      desc: 'تملك رصاصة واحدة لقتل أي شخص ليلاً.. ولكن احذر، إذا قتلت بريئاً ستنتحر فوراً.' 
    }
  };
  return meta[role] || meta[ROLES.CITIZEN];
};

// ==========================================
// 2. بطاقة الدور (التي تظهر عند كشف الدور)
// ==========================================
export const RoleCard = ({ role }) => {
  const { title, Icon, desc } = getRoleMeta(role);
  
  return (
    <div className="role-card fade-in" style={{ padding: "10px" }}>
      <div style={{ marginBottom: '15px' }}>
        <Icon size={80} />
      </div>
      <h1 style={{ fontSize: '2.2rem', marginBottom: '10px', color: 'var(--primary-gold)' }}>{title}</h1>
      <p style={{ fontSize: '1.1rem', color: 'var(--text-main)', lineHeight: '1.6' }}>{desc}</p>
    </div>
  );
};

// ==========================================
// 3. زر اللاعب المحمي (Anti-Focus & Decoy Grid)
// ==========================================
export const PlayerButton = ({ player, onClick, selected, disabled }) => {
  return (
    <button 
      className="btn btn-secondary" 
      onClick={(e) => {
        e.currentTarget.blur(); // تفريغ التحديد (Focus) فوراً لحماية السرية
        onClick(player.id);
      }}
      disabled={disabled}
      style={{ 
        opacity: disabled && !selected ? 0.3 : 1,
        borderColor: selected ? 'var(--primary-gold)' : 'var(--text-dim)',
        color: selected ? 'var(--primary-gold)' : 'var(--text-main)',
        position: 'relative',
        margin: '5px',
        padding: '12px',
        fontSize: '1.1rem'
      }}
    >
      {player.name}
      {/* علامة SVG صغيرة جداً لاختيار اللاعب (لا تلفت الانتباه) */}
      {selected && (
        <span style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)' }}>
          <svg viewBox="0 0 24 24" width="16" height="16" fill="var(--primary-gold)">
            <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z"/>
          </svg>
        </span>
      )}
    </button>
  );
};

// ==========================================
// 4. بطاقة اختيار الطور (تفاعلية وأنيقة)
// ==========================================
export const ModeCard = ({ title, description, isActive, onClick, isAdvanced }) => {
  const activeColor = isAdvanced ? 'var(--crimson-red)' : 'var(--primary-gold)';
  
  return (
    <div 
      onClick={onClick}
      style={{
        border: isActive ? `2px solid ${activeColor}` : '1px solid #333',
        background: isActive ? 'rgba(20,20,20,0.9)' : 'rgba(10,10,10,0.5)',
        boxShadow: isActive ? `0 0 15px ${activeColor}40` : 'none',
        padding: '20px', 
        margin: '10px 0', 
        borderRadius: '8px', 
        cursor: 'pointer',
        transition: 'all 0.3s ease-in-out',
        textAlign: 'right'
      }}
    >
      <h2 style={{ color: isActive ? activeColor : 'var(--text-main)', marginBottom: '5px' }}>{title}</h2>
      <p style={{ color: 'var(--text-dim)', fontSize: '0.9rem', lineHeight: '1.5' }}>{description}</p>
    </div>
  );
};

// ==========================================
// 5. العداد الزمني 
// ==========================================
export const CountdownTimer = ({ initialSeconds, onExpire }) => {
  const [seconds, setSeconds] = useState(initialSeconds);

  useEffect(() => {
    if (seconds <= 0) {
      if (onExpire) onExpire();
      return;
    }
    const timerId = setInterval(() => setSeconds(prev => prev - 1), 1000);
    return () => clearInterval(timerId);
  }, [seconds, onExpire]);

  const formatTime = (sec) => {
    const m = Math.floor(sec / 60).toString().padStart(2, '0');
    const s = (sec % 60).toString().padStart(2, '0');
    return `${m}:${s}`;
  };

  const isCritical = seconds <= 10;

  return (
    <div style={{
      fontSize: '2.5rem', fontWeight: 'bold', fontFamily: 'monospace',
      color: isCritical ? 'var(--crimson-red)' : 'var(--primary-gold)',
      margin: '15px 0', transition: 'color 0.3s'
    }}>
      {formatTime(seconds)}
    </div>
  );
};

// ==========================================
// 6. أيقونة التعليمات الصامتة (SVG) ونافذة القوانين
// ==========================================
export const HelpButton = ({ onClick }) => (
  <button 
    onClick={onClick}
    style={{
      position: 'absolute', top: '15px', right: '15px',
      background: 'none', border: 'none', cursor: 'pointer',
      color: 'var(--text-dim)', zIndex: 50, padding: '5px'
    }}
  >
    <svg viewBox="0 0 24 24" width="28" height="28" fill="currentColor">
      <path d="M21 5c-1.11-.35-2.33-.5-3.5-.5-1.95 0-4.05.4-5.5 1.5-1.45-1.1-3.55-1.5-5.5-1.5S2.45 4.9 1 6v14.65c0 .25.25.5.5.5.1 0 .15-.05.25-.09C3.1 20.45 5.05 20 6.5 20c1.95 0 4.05.4 5.5 1.5 1.35-.85 3.8-1.5 5.5-1.5 1.65 0 3.35.3 4.75 1.06.1.05.15.09.25.09.25 0 .5-.25.5-.5V6c-.6-.45-1.25-.75-2-1zm0 13.5c-1.1-.35-2.3-.5-3.5-.5-1.7 0-4.15.65-5.5 1.5V8c1.35-.85 3.8-1.5 5.5-1.5 1.2 0 2.4.15 3.5.5v11.5z"/>
    </svg>
  </button>
);

export const RulesModal = ({ onClose }) => (
  <div className="fade-in" style={{
    position: 'fixed', top: 0, left: 0, width: '100%', height: '100%',
    backgroundColor: 'rgba(0,0,0,0.95)', zIndex: 100,
    display: 'flex', justifyContent: 'center', alignItems: 'center', padding: '20px'
  }}>
    <div className="card scroll-container" style={{ maxHeight: '85vh', overflowY: 'auto', border: '1px solid var(--primary-gold)' }}>
      <h2 style={{ color: 'var(--primary-gold)', borderBottom: '1px solid #333', paddingBottom: '10px' }}>دليل لعبة المافيا</h2>

      <h3 style={{ color: '#fff', marginTop: '20px', textAlign: 'right' }}>الأطوار:</h3>
      <p style={{ color: 'var(--text-dim)', textAlign: 'right', marginBottom: '10px', fontSize: '0.95rem' }}>
        - <strong style={{color: '#fff'}}>المافيا الكلاسيكي:</strong> الأدوار الأساسية (المافيا، الطبيب، المحقق، المواطن).
      </p>
      <p style={{ color: 'var(--text-dim)', textAlign: 'right', fontSize: '0.95rem' }}>
        - <strong style={{color: '#fff'}}>المافيا المطور:</strong> يضيف شخصيات (المختل، والقناص). ونظام الوصية التي تُكتب ليلاً وتُقرأ للجميع إذا مات صاحبها.
      </p>

      <h3 style={{ color: '#fff', marginTop: '20px', textAlign: 'right' }}>قوانين سريعة:</h3>
      <ul style={{ color: 'var(--text-dim)', textAlign: 'right', paddingRight: '20px', lineHeight: '1.8', fontSize: '0.95rem' }}>
        <li>الطبيب لا يمكنه علاج نفسه إلا <strong>مرة واحدة فقط</strong> طوال اللعبة.</li>
        <li>المافيا يعرفون بعضهم ليلاً ولا يمكنهم قتل بعضهم.</li>
        <li>المواطن والمختل يجب أن يلمسوا الشاشة ليلاً للتمويه فقط لكي لا يُكشف دورهم.</li>
        <li>المختل يفوز إذا أقنع المواطنين بالتصويت عليه وإعدامه في المحكمة!</li>
      </ul>

      <button className="btn btn-primary" onClick={onClose} style={{ marginTop: '30px' }}>إغلاق التعليمات</button>
    </div>
  </div>
);
