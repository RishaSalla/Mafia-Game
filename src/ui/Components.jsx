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
// 1. بيانات الأدوار (النصوص البوليسية والأيقونات)
// ==========================================
export const getRoleMeta = (role) => {
  const meta = {
    [ROLES.MAFIA]: { 
      title: 'العصابة', 
      Icon: MafiaIcon, 
      desc: 'أنت المطلوب الأول للعدالة.. قم بتصفية أهدافك دون ترك أي أثر.' 
    },
    [ROLES.DOCTOR]: { 
      title: 'طبيب الطوارئ', 
      Icon: DoctorIcon, 
      desc: 'مسعف المدينة.. اختر شخصاً لإنقاذه من الاغتيال الليلة.' 
    },
    [ROLES.DETECTIVE]: { 
      title: 'المحقق السري', 
      Icon: DetectiveIcon, 
      desc: 'ابحث في السجلات الجنائية.. افحص هوية شخص تشك بخيانته.' 
    },
    [ROLES.CITIZEN]: { 
      title: 'مواطن مدني', 
      Icon: CitizenIcon, 
      desc: 'أنت بريء.. راقب، حلل الأدلة، وساعد في كشف المجرمين.' 
    },
    [ROLES.JESTER]: { 
      title: 'المختل', 
      Icon: JesterIcon, 
      desc: 'الجميع يبحث عن كبش فداء.. تلاعب بالأدلة ليتم إعدامك غداً وتنتصر!' 
    },
    [ROLES.VIGILANTE]: { 
      title: 'القناص المارق', 
      Icon: VigilanteIcon, 
      desc: 'العدالة بيدك.. تملك رصاصة واحدة، إياك أن تقتل بها بريئاً وإلا ستنتحر ندماً.' 
    }
  };
  return meta[role] || meta[ROLES.CITIZEN];
};

// ==========================================
// 2. بطاقة الدور (Role Card)
// ==========================================
export const RoleCard = ({ role }) => {
  const { title, Icon, desc } = getRoleMeta(role);
  
  return (
    <div className="role-card fade-in">
      <div style={{ marginBottom: '20px' }}>
        <Icon size={90} />
      </div>
      <h1 style={{ fontSize: '2.2rem', marginBottom: '10px' }}>{title}</h1>
      <p style={{ fontSize: '1.2rem', color: 'var(--text-main)' }}>{desc}</p>
    </div>
  );
};

// ==========================================
// 3. أزرار اختيار اللاعبين
// ==========================================
export const PlayerButton = ({ player, onClick, selected, disabled, isDanger = false }) => {
  let btnClass = "btn ";
  
  if (selected) {
    btnClass += isDanger ? "btn-danger" : "btn-primary";
  } else {
    btnClass += "btn-secondary";
  }
  
  return (
    <button 
      className={btnClass} 
      onClick={() => onClick(player.id)}
      disabled={disabled}
      style={{ 
        opacity: disabled && !selected ? 0.3 : 1,
        transform: selected ? 'scale(1.02)' : 'scale(1)',
        transition: 'all 0.2s ease-in-out',
        margin: '5px'
      }}
    >
      {player.name}
    </button>
  );
};

// ==========================================
// 4. العداد الزمني (Countdown Timer) - جديد
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
// 5. نافذة التعليمات (دليل اللعبة البوليسي) - جديد
// ==========================================
export const RulesModal = ({ onClose }) => (
  <div className="fade-in" style={{
    position: 'fixed', top: 0, left: 0, width: '100%', height: '100%',
    backgroundColor: 'rgba(0,0,0,0.9)', zIndex: 100,
    display: 'flex', justifyContent: 'center', alignItems: 'center', padding: '20px'
  }}>
    <div className="card scroll-container" style={{ maxHeight: '85vh', overflowY: 'auto', border: '1px solid var(--primary-gold)' }}>
      <h2 style={{ color: 'var(--primary-gold)', borderBottom: '1px solid #333', paddingBottom: '10px' }}>ملف التعليمات الجنائية</h2>

      <h3 style={{ color: '#fff', marginTop: '20px', textAlign: 'right' }}>أطوار التحقيق:</h3>
      <p style={{ color: 'var(--text-dim)', textAlign: 'right', marginBottom: '10px' }}>
        - <strong style={{color: '#fff'}}>الكلاسيكي:</strong> تحقيق مباشر يشمل (العصابة، طبيب الطوارئ، المحقق، والمواطنين). القوانين صارمة وسريعة.
      </p>
      <p style={{ color: 'var(--text-dim)', textAlign: 'right' }}>
        - <strong style={{color: '#fff'}}>المطور:</strong> يضيف شخصيات معقدة (المختل، والقناص). ويُجبر جميع اللاعبين على ترك "وصية جنائية" كل ليلة لاشتباههم بشخص معين في حال تم اغتيالهم.
      </p>

      <h3 style={{ color: '#fff', marginTop: '20px', textAlign: 'right' }}>سير الجلسة:</h3>
      <ul style={{ color: 'var(--text-dim)', textAlign: 'right', paddingRight: '20px', lineHeight: '1.8' }}>
        <li><strong>اليوم الأول:</strong> دقيقة واحدة للتعارف وتبادل الشكوك الأولية قبل حلول الظلام الأول.</li>
        <li><strong>الليل:</strong> يتم تمرير ملف القضية (الجهاز) بسرية. ترتيب استيقاظ اللاعبين يُخلط عشوائياً كل ليلة لمنع التخمين.</li>
        <li><strong>الصباح والنقاش:</strong> الإعلان عن مسرح الجريمة، يليه مؤقت زمني صارم لتبادل الاتهامات.</li>
        <li><strong>المحكمة:</strong> يصوت الأحياء على إعدام المشتبه به الأكبر لإنهاء الجلسة.</li>
      </ul>

      <button className="btn btn-primary" onClick={onClose} style={{ marginTop: '30px' }}>إغلاق الملف</button>
    </div>
  </div>
);
