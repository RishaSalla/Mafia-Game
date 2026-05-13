import React from 'react';
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
// 1. بيانات الأدوار (النصوص والأيقونات)
// ==========================================
export const getRoleMeta = (role) => {
  const meta = {
    [ROLES.MAFIA]: { 
      title: 'المافيا', 
      Icon: MafiaIcon, 
      desc: 'أنت سيد الظلام.. قم بتصفية أعدائك بصمت تام.' 
    },
    [ROLES.DOCTOR]: { 
      title: 'الطبيب', 
      Icon: DoctorIcon, 
      desc: 'ملاك الرحمة.. اختر شخصاً لإنقاذه من الموت الليلة.' 
    },
    [ROLES.DETECTIVE]: { 
      title: 'المحقق', 
      Icon: DetectiveIcon, 
      desc: 'عين العدالة.. افحص هوية شخص تشك بخيانته.' 
    },
    [ROLES.CITIZEN]: { 
      title: 'مواطن', 
      Icon: CitizenIcon, 
      desc: 'أنت بريء.. راقب، حلل، وابقَ على قيد الحياة.' 
    },
    [ROLES.JESTER]: { 
      title: 'المجنون', 
      Icon: JesterIcon, 
      desc: 'الجميع يكرهك.. هدفك الوحيد هو إقناعهم بإعدامك غداً!' 
    },
    [ROLES.VIGILANTE]: { 
      title: 'القناص', 
      Icon: VigilanteIcon, 
      desc: 'العدالة بيدك.. تملك رصاصة واحدة، إياك أن تقتل بها بريئاً.' 
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
// 3. أزرار اختيار اللاعبين (Player Selection Button)
// ==========================================
export const PlayerButton = ({ player, onClick, selected, disabled, isDanger = false }) => {
  // تحديد شكل الزر بناءً على حالته (مختار، غير مفعل، أحمر للقتل)
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
        transition: 'all 0.2s ease-in-out'
      }}
    >
      {player.name}
    </button>
  );
};
