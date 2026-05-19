import React, { useState } from 'react';
import { ROLES, MODES } from '../logic/gameEngine';
import { RoleCard, PlayerButton, ModeCard, CountdownTimer, HelpButton, RulesModal, getRoleMeta } from './Components';
import { CitySkyline, NooseSVG, ShatteredGlassSVG, SmokeBackground } from './SVGGraphics';

// ==========================================
// 1. شاشة البوابة (بدون مصطلحات بوليسية)
// ==========================================
export const GatewayScreen = ({ onVerify }) => {
  const [code, setCode] = useState("");
  const [error, setError] = useState(false);

  const handleSubmit = () => {
    if (code.trim() === "") return;
    onVerify(code).then(isValid => {
      if (!isValid) setError(true);
    });
  };

  return (
    <div className="center-content fade-in">
      <SmokeBackground />
      <div className="card" style={{ zIndex: 1 }}>
        <h1 style={{ color: "var(--primary-gold)", fontSize: "2.8rem" }}>المافيا</h1>
        <p style={{ margin: "10px 0 20px" }}>الرجاء إدخال كود التفعيل للبدء</p>
        <input 
          type="text" 
          className="input-field" 
          placeholder="أدخل الكود..." 
          value={code} 
          onChange={(e) => { setCode(e.target.value); setError(false); }}
        />
        {error && <p style={{ color: "var(--bright-red)", marginTop: "10px" }}>الكود غير صحيح أو منتهي الصلاحية.</p>}
        <button className="btn btn-primary" onClick={handleSubmit} style={{ marginTop: "20px" }}>
          دخول
        </button>
      </div>
    </div>
  );
};

// ==========================================
// 2. القائمة الرئيسية (الأسماء التسويقية المعتمدة)
// ==========================================
export const MainMenuScreen = ({ onSelectMode }) => {
  const [showRules, setShowRules] = useState(false);

  return (
    <div className="center-content fade-in">
      <SmokeBackground />
      <div style={{ zIndex: 1, width: '100%' }}>
        <h1 style={{ fontSize: '3rem', color: 'var(--primary-gold)' }}>المافيا</h1>
        <CitySkyline />
        <p style={{ marginBottom: "20px", fontSize: "1.2rem" }}>اختر طريقة اللعب</p>
        
        <ModeCard 
          title="المافيا الأصلية" 
          description="لعب سريع، أدوار أساسية (مافيا، طبيب، محقق، مواطنين)." 
          isActive={false} 
          isAdvanced={false}
          onClick={() => onSelectMode(MODES.CLASSIC)} 
        />

        <ModeCard 
          title="المافيا الفوضى" 
          description="يضيف (القناص، المختل الأناني) ونظام الوصية الإجبارية وقفص الاتهام." 
          isActive={false} 
          isAdvanced={true}
          onClick={() => onSelectMode(MODES.CHAOS)} 
        />

        <button className="btn btn-secondary" onClick={() => setShowRules(true)} style={{ marginTop: '20px' }}>
          دليل القوانين (التعليمات)
        </button>

        {showRules && <RulesModal onClose={() => setShowRules(false)} />}
      </div>
    </div>
  );
};

// ==========================================
// 3. شاشة تسجيل اللاعبين
// ==========================================
export const SetupScreen = ({ players, setPlayers, startGame, mode }) => {
  const [name, setName] = useState("");
  const minPlayers = mode === MODES.CHAOS ? 6 : 4;

  const handleAdd = () => {
    if (name.trim() !== "" && !players.includes(name.trim())) {
      setPlayers([...players, name.trim()]);
      setName("");
    }
  };

  return (
    <div className="center-content fade-in">
      <h1 style={{ color: 'var(--primary-gold)' }}>تسجيل اللاعبين</h1>
      <p>الحد الأدنى: {minPlayers} | المسجلون: {players.length}</p>
      
      <div className="card" style={{ marginBottom: "20px", marginTop: "15px" }}>
        <div style={{ display: 'flex' }}>
          <input 
            type="text" 
            className="input-field" 
            placeholder="اسم اللاعب..." 
            value={name} 
            onChange={(e) => setName(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleAdd()}
            style={{ marginTop: 0, borderRadius: '0 6px 6px 0', borderLeft: 'none' }}
          />
          <button className="btn btn-secondary" onClick={handleAdd} style={{ width: '80px', marginTop: 0, borderRadius: '6px 0 0 6px' }}>إضافة</button>
        </div>
      </div>

      <div className="scroll-container" style={{ width: '100%', maxHeight: '35vh', overflowY: 'auto' }}>
        {players.map((p, i) => (
          <div key={i} style={{ padding: '12px', borderBottom: '1px solid #333', fontSize: '1.2rem' }}>{p}</div>
        ))}
      </div>

      <button 
        className="btn btn-primary" 
        onClick={startGame} 
        disabled={players.length < minPlayers}
        style={{ marginTop: "20px" }}
      >
        بدء اللعبة وتوزيع الأدوار
      </button>
    </div>
  );
};

// ==========================================
// 4. مرحلة كشف الأدوار
// ==========================================
export const RoleRevealScreen = ({ players, onComplete }) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [showRole, setShowRole] = useState(false);

  const player = players[currentIndex];

  const handleNext = () => {
    if (currentIndex < players.length - 1) {
      setCurrentIndex(currentIndex + 1);
      setShowRole(false);
    } else {
      onComplete(); 
    }
  };

  return (
    <div className="center-content fade-in">
      <div className="card" style={{ minHeight: '300px', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
        {!showRole ? (
          <div style={{ margin: 'auto' }}>
            <h2 style={{ color: 'var(--text-dim)' }}>توزيع الأدوار</h2>
            <p style={{ marginTop: '10px' }}>الرجاء تمرير الجهاز بسرية إلى:</p>
            <h1 style={{ color: 'var(--primary-gold)', fontSize: '3rem', margin: '20px 0' }}>{player.name}</h1>
            <button className="btn btn-primary" onClick={() => setShowRole(true)}>أنا {player.name}، اكشف دوري</button>
          </div>
        ) : (
          <>
            <RoleCard role={player.role} />
            <div style={{ marginTop: 'auto', paddingTop: '30px' }}>
              <button className="btn btn-danger" onClick={handleNext}>
                إخفاء الدور وتمرير الجهاز
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

// ==========================================
// 5. التمهيد والتوجيه الجماعي
// ==========================================
export const FirstDayIntroScreen = ({ onContinue }) => (
  <div className="center-content fade-in">
    <div className="card">
      <h1 style={{ color: 'var(--primary-gold)' }}>اليوم الأول</h1>
      <p style={{ fontSize: '1.2rem', lineHeight: '1.6', margin: '20px 0' }}>
        الآن، الجميع يعرف دوره. المافيا بينكم وتعرف بعضها البعض.<br/>
        لديكم دقيقة للتعارف ورمي الاتهامات قبل أن يحل الظلام.
      </p>
      <CountdownTimer initialSeconds={60} onExpire={onContinue} />
      <button className="btn btn-secondary" onClick={onContinue} style={{ marginTop: '20px' }}>
        تخطي وبدء الليل
      </button>
    </div>
  </div>
);

export const GroupSleepScreen = ({ onContinue }) => (
  <div className="center-content fade-in">
    <h1 style={{ color: "var(--primary-gold)", fontSize: "3rem", marginBottom: "10px" }}>المدينة تنام</h1>
    <p style={{ fontSize: "1.3rem", marginBottom: "40px", color: "var(--text-main)", lineHeight: '1.6' }}>
      أيها اللاعبون، حان وقت النوم.<br/>أغمضوا أعينكم جميعاً، وسنبدأ بتمرير الجهاز.
    </p>
    <button className="btn btn-primary" onClick={onContinue}>بدء التمرير السري</button>
  </div>
);

export const GroupWakeScreen = ({ onContinue }) => (
  <div className="center-content fade-in">
    <h1 style={{ color: "var(--primary-gold)", fontSize: "3rem", marginBottom: "10px" }}>المدينة تستيقظ</h1>
    <p style={{ fontSize: "1.3rem", marginBottom: "40px", color: "var(--text-main)", lineHeight: '1.6' }}>
      أيها اللاعبون، افتحوا أعينكم.<br/>لقد انتهت الليلة... دعونا نرى ما حدث.
    </p>
    <button className="btn btn-primary" onClick={onContinue}>عرض التقرير الصباحي</button>
  </div>
);

// ==========================================
// 6. شاشات الليل والتمرير 
// ==========================================
export const NightTransitionScreen = ({ targetPlayer, onReady }) => (
  <div className="center-content fade-in">
    <CitySkyline />
    <div className="card" style={{ zIndex: 1, marginTop: '20px' }}>
      <p style={{ color: 'var(--text-dim)', fontSize: '1.2rem' }}>الرجاء تمرير الجهاز بسرية إلى:</p>
      <h1 style={{ color: "var(--primary-gold)", fontSize: "3.5rem", margin: "20px 0" }}>{targetPlayer.name}</h1>
      <button className="btn btn-primary" onClick={onReady}>استلمت الجهاز</button>
    </div>
  </div>
);

export const NightTurnScreen = ({ player, players, mode, onActionComplete }) => {
  const [targetId, setTargetId] = useState(null);
  const [willTargetId, setWillTargetId] = useState(null);
  const [investigationResult, setInvestigationResult] = useState(null);
  const [showRules, setShowRules] = useState(false);

  const isChaos = mode === MODES.CHAOS;
  const aliveOthers = players.filter(p => p.id !== player.id && p.isAlive);
  const mafiaMates = players.filter(p => p.role === ROLES.MAFIA && p.id !== player.id && p.isAlive);

  const handleConfirm = () => {
    onActionComplete({ targetId, willTargetId });
  };

  const renderRoleAction = () => {
    // تحديث المحقق: يرى الدور التفصيلي الصريح (مافيا، مختل، طبيب، قناص..)
    if (investigationResult) {
      const isMafia = investigationResult.role === ROLES.MAFIA;
      const exactRoleTitle = getRoleMeta(investigationResult.role).title;
      return (
        <div style={{ padding: "20px", border: "1px solid var(--primary-gold)", borderRadius: "8px" }}>
          <p>نتيجة التحقيق السري:</p>
          <h2 style={{ color: isMafia ? "var(--crimson-red)" : "var(--primary-gold)", marginTop: "10px", fontSize: '1.8rem' }}>
            [ {investigationResult.name} ] هو:<br/>{exactRoleTitle}
          </h2>
        </div>
      );
    }

    let promptText = "";
    let targetList = players.filter(p => p.isAlive && p.id !== player.id);
    let isDecoy = false;

    if (player.role === ROLES.MAFIA) {
      promptText = "من تريد أن تقتل الليلة؟";
    } else if (player.role === ROLES.DOCTOR) {
      promptText = player.hasSelfHealed ? "من تريد إنقاذه؟ (لا يمكنك حماية نفسك مرة أخرى)" : "من تريد إنقاذه الليلة؟";
      targetList = player.hasSelfHealed ? aliveOthers : players.filter(p => p.isAlive); 
    } else if (player.role === ROLES.DETECTIVE) {
      promptText = "اختر شخصاً للتحقيق في هويته الكاملة:";
    } else if (player.role === ROLES.VIGILANTE) {
      promptText = player.bullets > 0 ? "هل ترغب في قنص أحدهم الليلة؟" : "لقد نفدت ذخيرتك.";
      if (player.bullets === 0) targetList = [];
    } else {
      isDecoy = true;
      promptText = "أنت لا تملك قدرات ليلية. للتمويه على من حولك، المس أي اسم عشوائياً قبل إنهاء دورك:";
    }

    return (
      <>
        {player.role === ROLES.MAFIA && mafiaMates.length > 0 && (
          <div style={{ marginBottom: '15px', color: 'var(--text-dim)' }}>
            زملائك في المافيا: {mafiaMates.map(m => m.name).join('، ')}
          </div>
        )}
        <p style={{ color: "var(--primary-gold)", fontWeight: "bold", marginBottom: "15px", fontSize: "1.1rem", lineHeight: '1.5' }}>{promptText}</p>
        
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', justifyContent: 'center' }}>
          {targetList.map(p => {
            const isMafiaMate = player.role === ROLES.MAFIA && p.role === ROLES.MAFIA;
            return (
              <PlayerButton 
                key={p.id} 
                player={p} 
                selected={targetId === p.id} 
                disabled={isMafiaMate}
                onClick={() => {
                  setTargetId(p.id);
                  if (player.role === ROLES.DETECTIVE) setInvestigationResult(p);
                }}
              />
            );
          })}
          
          {(player.role === ROLES.DOCTOR || player.role === ROLES.VIGILANTE) && player.bullets !== 0 && (
            <button 
              className={`btn ${targetId === null ? "btn-primary" : "btn-secondary"}`} 
              style={{ padding: '10px', marginTop: '5px' }} 
              onClick={() => setTargetId(null)}
            >
              تخطي (لا أريد استخدام قدرتي)
            </button>
          )}
        </div>
      </>
    );
  };

  const isConfirmDisabled = (player.role !== ROLES.DOCTOR && player.role !== ROLES.VIGILANTE) && targetId === null && investigationResult === null;

  return (
    <div className="center-content fade-in scroll-container" style={{ overflowY: 'auto', position: 'relative' }}>
      <HelpButton onClick={() => setShowRules(true)} />
      {showRules && <RulesModal onClose={() => setShowRules(false)} />}

      <RoleCard role={player.role} />
      
      <div className="card" style={{ marginTop: "15px" }}>
        {renderRoleAction()}
      </div>

      {isChaos && !investigationResult && (
        <div className="card" style={{ marginTop: "15px", padding: '15px' }}>
          <p style={{ fontSize: "1rem", color: "var(--text-dim)" }}>الوصية الجنائية (تُقرأ للجميع إذا مت الليلة):</p>
          <select 
            className="input-field" 
            style={{ fontSize: "1rem", padding: "10px", marginTop: "10px", backgroundColor: 'rgba(0,0,0,0.3)' }}
            value={willTargetId || ""}
            onChange={(e) => setWillTargetId(Number(e.target.value))}
          >
            <option value="" disabled>وجه اتهامك نحو...</option>
            {aliveOthers.map(p => (
              <option key={p.id} value={p.id}>{p.name}</option>
            ))}
          </select>
        </div>
      )}

      <button className="btn btn-primary" style={{ marginTop: "20px" }} onClick={handleConfirm} disabled={isConfirmDisabled}>
        تأكيد وإنهاء دوري
      </button>
    </div>
  );
};

// ==========================================
// 7. السرد الصباحي الدرامي
// ==========================================
export const MorningSequenceScreen = ({ mafiaKill, savedByDoctor, vigilanteKill, vigilanteSuicide, jesterWon, deathWillMessage, onComplete }) => {
  const [stepIndex, setStepIndex] = useState(0);
  const events = [];

  // إذا فاز المختل برصاصة القناص بالليل، نختصر الصباح وننتقل للنهاية
  if (jesterWon) {
    onComplete();
    return null;
  }

  // الحدث 1: المافيا والطبيب (بدون كشف الدور)
  if (mafiaKill) {
    events.push({
      type: 'kill',
      title: 'جريمة المافيا',
      text: `بكل أسف.. تم العثور على [ ${mafiaKill.name} ] مقتولاً الليلة الماضية.\n(تبين بعد تفتيشه أنه: مواطن بريء)`, // المافيا لا تقتل المافيا
      will: deathWillMessage,
      color: 'var(--crimson-red)',
      icon: <ShatteredGlassSVG />
    });
  } else if (savedByDoctor) {
    events.push({
      type: 'save',
      title: 'تدخل بطولي',
      text: `حاولت المافيا القتل الليلة، ولكن تدخل الطبيب الشجاع في اللحظة المناسبة وأنقذ الضحية!`,
      color: 'var(--primary-gold)',
      icon: <CitySkyline />
    });
  } else {
    events.push({
      type: 'peace',
      title: 'ليلة هادئة',
      text: `مرت الليلة بسلام.. المافيا لم تقتل أحداً.`,
      color: 'var(--text-main)',
      icon: <CitySkyline />
    });
  }

  // الحدث 2: القناص (بدون كشف الدور التفصيلي)
  if (vigilanteKill) {
    const isVictimMafia = vigilanteKill.role === ROLES.MAFIA;
    const hideRoleStr = isVictimMafia ? "مافيا" : "مواطن بريء";

    events.push({
      type: 'vigilante_shot',
      title: 'رصاصة القناص',
      text: `سمعت المدينة دوي رصاصة أخرى! القناص أخذ العدالة بيده وقتل [ ${vigilanteKill.name} ].\n(تبين بعد تفتيشه أنه: ${hideRoleStr})`,
      color: 'var(--primary-gold)'
    });
  }

  if (vigilanteSuicide) {
    events.push({
      type: 'vigilante_suicide',
      title: 'عقاب القناص',
      text: `بما أن ضحية القناص كان بريئاً.. لم يتحمل القناص تأنيب الضمير وانتحر فوراً!`,
      color: 'var(--crimson-red)'
    });
  }

  const currentEvent = events[stepIndex];

  const handleNext = () => {
    if (stepIndex < events.length - 1) {
      setStepIndex(stepIndex + 1);
    } else {
      onComplete(); 
    }
  };

  return (
    <div className="center-content fade-in">
      {currentEvent.icon && <div style={{ marginBottom: '20px' }}>{currentEvent.icon}</div>}
      
      <div className="card" style={{ zIndex: 11, minHeight: '250px', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
        <div>
          <h1 style={{ color: currentEvent.color, marginBottom: '20px' }}>{currentEvent.title}</h1>
          <p style={{ fontSize: "1.3rem", lineHeight: '1.6', whiteSpace: 'pre-line' }}>{currentEvent.text}</p>
          
          {currentEvent.will && (
            <div className="fade-in" style={{ marginTop: "20px", padding: "15px", border: "1px solid var(--text-dim)", background: "rgba(0,0,0,0.5)", borderRadius: '8px' }}>
              <h3 style={{ color: "var(--text-dim)", marginBottom: "10px" }}>الوصية الجنائية للضحية:</h3>
              <p style={{ color: "var(--primary-gold)", fontSize: '1.2rem', fontStyle: 'italic' }}>"{currentEvent.will}"</p>
            </div>
          )}
        </div>
        
        <button className="btn btn-primary" style={{ marginTop: "30px" }} onClick={handleNext}>
          {stepIndex < events.length - 1 ? "التالي" : "بدء النقاش"}
        </button>
      </div>
    </div>
  );
};

// ==========================================
// 8. مرحلة النقاش
// ==========================================
export const DiscussionScreen = ({ aliveCount, onContinue }) => {
  const [showRules, setShowRules] = useState(false);
  const discussionTime = aliveCount > 6 ? 180 : (aliveCount > 4 ? 120 : 90); 

  return (
    <div className="center-content fade-in">
      <HelpButton onClick={() => setShowRules(true)} />
      {showRules && <RulesModal onClose={() => setShowRules(false)} />}

      <div className="card">
        <h1 style={{ color: "var(--primary-gold)", fontSize: '2.5rem' }}>وقت النقاش</h1>
        <p style={{ margin: '15px 0', fontSize: '1.1rem', lineHeight: '1.5' }}>تناقشوا، حللوا الأدلة، وحاولوا معرفة من هي المافيا.</p>
        
        <CountdownTimer initialSeconds={discussionTime} onExpire={onContinue} />

        <button className="btn btn-danger" onClick={onContinue} style={{ marginTop: "20px" }}>
          إنهاء النقاش والتوجه للمحكمة
        </button>
      </div>
    </div>
  );
};

// ==========================================
// 9. التصويت السري 
// ==========================================
export const VotingScreen = ({ alivePlayers, onVoteComplete }) => {
  const [votes, setVotes] = useState({});
  const [currentPlayerIndex, setCurrentPlayerIndex] = useState(0);
  const [step, setStep] = useState('call'); 

  const voter = alivePlayers[currentPlayerIndex];
  const targets = alivePlayers.filter(p => p.id !== voter.id);

  const handleVote = (targetId) => {
    const newVotes = { ...votes };
    if (targetId !== null) {
      newVotes[targetId] = (newVotes[targetId] || 0) + 1;
    }
    setVotes(newVotes);

    if (currentPlayerIndex < alivePlayers.length - 1) {
      setCurrentPlayerIndex(currentPlayerIndex + 1);
      setStep('call'); 
    } else {
      onVoteComplete(newVotes);
    }
  };

  if (step === 'call') {
    return (
      <div className="center-content fade-in">
        <div className="card" style={{ minHeight: '300px', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
          <div style={{ margin: 'auto' }}>
            <h2 style={{ color: 'var(--text-dim)' }}>التصويت السري</h2>
            <p style={{ marginTop: '10px' }}>الرجاء تمرير الجهاز للتصويت إلى:</p>
            <h1 style={{ color: "var(--primary-gold)", fontSize: "3rem", margin: "20px 0" }}>{voter.name}</h1>
            <button className="btn btn-primary" onClick={() => setStep('vote')}>أنا {voter.name}، جاهز للتصويت</button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="center-content fade-in">
      <div className="card">
        <h2>تصويت: <span style={{ color: "var(--primary-gold)" }}>{voter.name}</span></h2>
        <p style={{ margin: '15px 0', color: 'var(--text-dim)' }}>صوّت ضد المتهم (بسرعة وسرية):</p>
        
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', justifyContent: 'center' }}>
          {targets.map(p => (
            <PlayerButton key={p.id} player={p} onClick={() => handleVote(p.id)} />
          ))}
        </div>
        
        <button 
          className="btn btn-secondary" 
          style={{ marginTop: "25px", padding: '12px' }} 
          onClick={(e) => { e.currentTarget.blur(); handleVote(null); }}
        >
          الامتناع عن التصويت
        </button>
      </div>
    </div>
  );
};

// ==========================================
// 10. قفص الاتهام والقرار النهائي (جديد)
// ==========================================
export const DefenseScreen = ({ accusedPlayer, onComplete }) => (
  <div className="center-content fade-in">
    <div className="card blood-glow">
      <h1 style={{ color: 'var(--crimson-red)' }}>قفص الاتهام</h1>
      <p style={{ fontSize: '1.2rem', marginTop: '15px' }}>المتهم الأول بأغلبية الأصوات هو:</p>
      <h2 style={{ fontSize: '3rem', color: '#fff', margin: '15px 0' }}>{accusedPlayer.name}</h2>
      <p style={{ color: 'var(--text-dim)', lineHeight: '1.5' }}>لديك 30 ثانية للدفاع عن نفسك وتبرير موقفك أمام المدينة قبل إصدار الحكم.</p>
      
      <CountdownTimer initialSeconds={30} onExpire={onComplete} />
      
      <button className="btn btn-primary" onClick={onComplete} style={{ marginTop: '20px' }}>
        انتهاء التبرير والتوجه للحكم النهائي
      </button>
    </div>
  </div>
);

export const FinalDecisionScreen = ({ accusedPlayer, onDecision }) => (
  <div className="center-content fade-in">
    <NooseSVG />
    <div className="card" style={{ marginTop: '20px' }}>
      <h1 style={{ color: 'var(--primary-gold)' }}>الحكم النهائي</h1>
      <p style={{ fontSize: '1.3rem', marginTop: '20px', lineHeight: '1.6' }}>
        بعد الاستماع لدفاع <strong style={{color: '#fff'}}>{accusedPlayer.name}</strong>..<br/>
        مدير الجلسة: هل اتفقت أغلبية الغرفة على إعدامه؟
      </p>
      
      <div style={{ display: 'flex', gap: '15px', marginTop: '30px' }}>
        <button className="btn btn-danger" style={{ padding: '15px' }} onClick={() => onDecision(true)}>نعم، إعدام</button>
        <button className="btn btn-secondary" style={{ padding: '15px' }} onClick={() => onDecision(false)}>لا، براءة</button>
      </div>
    </div>
  </div>
);

export const ExecutionScreen = ({ executedPlayer, onContinue }) => (
  <div className="center-content fade-in" style={{ padding: "20px" }}>
    <div className="card" style={{ zIndex: 1 }}>
      <h1 style={{ color: "var(--crimson-red)", fontSize: '2.5rem', marginBottom: '15px' }}>نتيجة المحكمة</h1>
      {executedPlayer ? (
        <>
          <p style={{ fontSize: "1.5rem" }}>تم إعدام: <strong style={{ color: "#fff" }}>{executedPlayer.name}</strong></p>
          <p style={{ color: "var(--primary-gold)", marginTop: "15px", fontSize: '1.2rem' }}>
            وبعد تفتيشه، تبين أنه: {executedPlayer.role === ROLES.MAFIA ? "مافيا" : "مواطن بريء"}
          </p>
        </>
      ) : (
        <p style={{ fontSize: "1.3rem", color: "var(--text-main)", lineHeight: '1.6' }}>
          تشتتت الأصوات، أو قررت الغرفة البراءة..<br/>لا إعدام اليوم.
        </p>
      )}
      <button className="btn btn-primary" style={{ marginTop: "30px" }} onClick={onContinue}>إغلاق المحكمة وبدء الليل</button>
    </div>
  </div>
);

// ==========================================
// 11. شاشة النهاية (Game Over - كشف جميع الأوراق)
// ==========================================
export const GameOverScreen = ({ winner, jesterWon, players, onRestart, onPlayAgain }) => {
  let title = "";
  let color = "";
  let subtitle = "";

  if (jesterWon) {
    title = "المختل الأناني فاز!";
    color = "#a64dff";
    subtitle = "لقد تلاعب بكم جميعاً ونجح في هدفه، فاز المختل لوحده!";
  } else if (winner === "mafia") {
    title = "انتصار المافيا!";
    color = "var(--crimson-red)";
    subtitle = "سيطرت المافيا على المدينة بأكملها وتفوقت عددياً.";
  } else {
    title = "انتصار المواطنين!";
    color = "var(--primary-gold)";
    subtitle = "تم القضاء على جميع أفراد المافيا، المدينة في أمان.";
  }

  return (
    <div className="center-content fade-in scroll-container" style={{ overflowY: 'auto' }}>
      <h1 style={{ color, fontSize: "3rem", marginBottom: "10px" }}>{title}</h1>
      <p style={{ marginBottom: "25px", fontSize: '1.2rem', lineHeight: '1.5' }}>{subtitle}</p>
      
      <div className="card" style={{ width: "100%", padding: "20px" }}>
        <h3 style={{ marginBottom: "15px", color: "var(--text-dim)", borderBottom: "1px solid #333", paddingBottom: "10px" }}>
          الأدوار الحقيقية للجميع:
        </h3>
        {players.map(p => (
          <div key={p.id} style={{ display: "flex", justifyContent: "space-between", padding: "12px 0", borderBottom: "1px solid #222", fontSize: '1.1rem' }}>
            <span style={{ color: p.isAlive ? "#fff" : "var(--text-dim)", textDecoration: p.isAlive ? "none" : "line-through", fontWeight: "bold" }}>{p.name}</span>
            <span style={{ color: p.role === ROLES.MAFIA ? "var(--crimson-red)" : "var(--primary-gold)" }}>{getRoleMeta(p.role).title}</span>
          </div>
        ))}
      </div>

      <div style={{ width: '100%', marginTop: '30px' }}>
        <button className="btn btn-primary" onClick={onPlayAgain} style={{ marginBottom: '15px' }}>
          لعب جديد بنفس الأسماء
        </button>
        <button className="btn btn-secondary" onClick={onRestart}>
          العودة للقائمة الرئيسية
        </button>
      </div>
    </div>
  );
};
