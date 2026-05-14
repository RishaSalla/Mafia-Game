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
// 1. بيانات الأدوار (الأسماء الكلاسيكية الأصلية)
// ==========================================
export const getRoleMeta = (role) => {
  const meta = {
    [ROLES.MAFIA]: { 
      title: 'المافيا', 
      Icon: MafiaIcon, 
      desc: 'أنت فرد من المافيا.. تعاون مع فريقك لتصفية المدينة.' 
    },
    [ROLES.DOCTOR]: { 
      title: 'الطبيب', 
      Icon: DoctorIcon, 
      desc: 'أنت طبيب المدينة.. اختر شخصاً لإنقاذه من القتل الليلة.' 
    },
    [ROLES.DETECTIVE]: { 
      title: 'المحقق', 
      Icon: DetectiveIcon, 
      desc: 'أنت المحقق.. اختر شخصاً للتحقيق في هويته.' 
    },
    [ROLES.CITIZEN]: { 
      title: 'مواطن', 
      Icon: CitizenIcon, 
      desc: 'أنت مواطن بريء.. راقب، وحلل، وصوت لطرد المافيا.' 
    },
    [ROLES.JESTER]: { 
      title: 'المختل', 
      Icon: JesterIcon, 
      desc: 'أنت تبحث عن الموت.. تلاعب بالجميع ليقوموا بإعدامك غداً وتنتصر!' 
    },
    [ROLES.VIGILANTE]: { 
      title: 'القناص', 
      Icon: VigilanteIcon, 
      desc: 'تملك رصاصة واحدة.. إياك أن تقتل بها بريئاً وإلا ستنتحر ندماً.' 
    }
  };
  return meta[role] || meta[ROLES.CITIZEN];
};

// ==========================================
// 2. بطاقة الدور
// ==========================================
export const RoleCard = ({ role }) => {
  const { title, Icon, desc } = getRoleMeta(role);
  
  return (
    <div className="role-card fade-in">
      <div style={{ marginBottom: '20px' }}>
        <Icon size={90} />
      </div>
      <h1 style={{ fontSize: '2.2rem', marginBottom: '10px', color: 'var(--primary-gold)' }}>{title}</h1>
      <p style={{ fontSize: '1.2rem', color: 'var(--text-main)' }}>{desc}</p>
    </div>
  );
};

// ==========================================
// 3. أزرار اللاعبين (بتحديد سري وخفي)
// ==========================================
export const PlayerButton = ({ player, onClick, selected, disabled }) => {
  return (
    <button 
      className="btn btn-secondary" 
      onClick={() => onClick(player.id)}
      disabled={disabled}
      style={{ 
        opacity: disabled && !selected ? 0.4 : 1,
        // تغييرات طفيفة جداً للسرية بدلاً من الألوان الفاقعة
        borderColor: selected ? 'var(--primary-gold)' : 'var(--text-dim)',
        color: selected ? 'var(--primary-gold)' : 'var(--text-main)',
        boxShadow: selected ? 'inset 0 0 10px rgba(197, 160, 89, 0.1)' : 'none',
        margin: '5px',
        position: 'relative',
        outline: 'none' // إزالة أثر المتصفح (Focus)
      }}
    >
      {player.name}
      {/* علامة صح صغيرة جداً وسرية */}
      {selected && <span style={{ position: 'absolute', left: '10px', fontSize: '0.9rem' }}>✔️</span>}
    </button>
  );
};

// ==========================================
// 4. العداد الزمني (Countdown Timer)
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
      fontSize: '2.5rem',
      fontWeight: 'bold',
      color: isCritical ? 'var(--crimson-red)' : 'var(--primary-gold)',
      margin: '15px 0',
      fontFamily: 'monospace',
      textShadow: isCritical ? '0 0 10px var(--crimson-red)' : 'none',
      transition: 'color 0.3s'
    }}>
      ⏱ {formatTime(seconds)}
    </div>
  );
};

// ==========================================
// 5. نافذة التعليمات (دليل اللعبة الكلاسيكي)
// ==========================================
export const RulesModal = ({ onClose }) => (
  <div className="fade-in" style={{
    position: 'fixed', top: 0, left: 0, width: '100%', height: '100%',
    backgroundColor: 'rgba(0,0,0,0.95)', zIndex: 100,
    display: 'flex', justifyContent: 'center', alignItems: 'center', padding: '20px'
  }}>
    <div className="card scroll-container" style={{ maxHeight: '85vh', overflowY: 'auto', border: '1px solid var(--primary-gold)' }}>
      <h2 style={{ color: 'var(--primary-gold)', borderBottom: '1px solid #333', paddingBottom: '10px' }}>دليل لعبة المافيا</h2>

      <h3 style={{ color: '#fff', marginTop: '20px', textAlign: 'right' }}>الأطوار:</h3>
      <p style={{ color: 'var(--text-dim)', textAlign: 'right', marginBottom: '10px' }}>
        - <strong style={{color: '#fff'}}>المافيا الكلاسيكي:</strong> الأدوار الأساسية (المافيا، الطبيب، المحقق، والمواطن).
      </p>
      <p style={{ color: 'var(--text-dim)', textAlign: 'right' }}>
        - <strong style={{color: '#fff'}}>المافيا المطور:</strong> يضيف شخصيات (المختل، والقناص). ونظام الوصية الإجبارية التي تُفتح إذا مات اللاعب.
      </p>

      <h3 style={{ color: '#fff', marginTop: '20px', textAlign: 'right' }}>كيفية اللعب:</h3>
      <ul style={{ color: 'var(--text-dim)', textAlign: 'right', paddingRight: '20px', lineHeight: '1.8' }}>
        <li><strong>الأدوار:</strong> سيقوم كل لاعب بتمرير الجهاز لمعرفة دوره بسرية تامة.</li>
        <li><strong>الليل:</strong> سيقوم مدير الجلسة (اللعبة) بالنداء على اللاعبين عشوائياً ليقوموا بأفعالهم.</li>
        <li><strong>الصباح:</strong> الإعلان عن الضحية، يليه مؤقت زمني صارم لتبادل الاتهامات.</li>
        <li><strong>المحكمة:</strong> اللعبة ستنادي على اللاعبين واحداً تلو الآخر للتصويت سراً على إعدام المشتبه به.</li>
      </ul>

      <button className="btn btn-primary" onClick={onClose} style={{ marginTop: '30px' }}>إغلاق التعليمات</button>
    </div>
  </div>
);
