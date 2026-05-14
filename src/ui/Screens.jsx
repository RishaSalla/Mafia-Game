import React, { useState } from 'react';
import { ROLES, MODES } from '../logic/gameEngine';
import { RoleCard, PlayerButton, getRoleMeta, CountdownTimer, RulesModal } from './Components';
import { CitySkyline, NooseSVG, ShatteredGlassSVG, SmokeBackground } from './SVGGraphics';

// ==========================================
// 1. شاشة البوابة 
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
        <h1 style={{ color: "var(--primary-gold)" }}>لعبة المافيا</h1>
        <p>الرجاء إدخال كود التفعيل للبدء</p>
        <input 
          type="text" 
          className="input-field" 
          placeholder="أدخل الكود هنا..." 
          value={code} 
          onChange={(e) => { setCode(e.target.value); setError(false); }}
        />
        {error && <p style={{ color: "var(--bright-red)", marginTop: "10px" }}>الكود غير صحيح أو منتهي الصلاحية.</p>}
        <button className="btn btn-primary" onClick={handleSubmit} style={{ marginTop: "20px" }}>
          تحقق ودخول
        </button>
      </div>
    </div>
  );
};

// ==========================================
// 2. القائمة الرئيسية (اختيار الطور)
// ==========================================
export const MainMenuScreen = ({ onSelectMode }) => {
  const [showRules, setShowRules] = useState(false);

  return (
    <div className="center-content fade-in">
      <SmokeBackground />
      <div style={{ zIndex: 1, width: '100%' }}>
        <h1 style={{ fontSize: '3rem', color: 'var(--primary-gold)' }}>المافيا</h1>
        <CitySkyline />
        <p style={{ marginBottom: "30px", fontSize: "1.2rem" }}>اختر طريقة اللعب</p>
        
        <button className="btn btn-primary" onClick={() => onSelectMode(MODES.CLASSIC)}>
          المافيا الكلاسيكي
        </button>
        <p style={{ fontSize: '0.9rem', color: 'var(--text-dim)', marginBottom: '15px', marginTop: '5px' }}>
          لعب سريع، أدوار أساسية (مافيا، طبيب، محقق، مواطنين).
        </p>

        <button className="btn" onClick={() => onSelectMode(MODES.ADVANCED)} style={{ borderColor: "var(--crimson-red)" }}>
          المافيا المطور
        </button>
        <p style={{ fontSize: '0.9rem', color: 'var(--text-dim)', marginBottom: '30px', marginTop: '5px' }}>
          يضيف (القناص، المختل) ونظام الوصية الإجبارية.
        </p>

        <button className="btn btn-secondary" onClick={() => setShowRules(true)}>
          كيفية اللعب (التعليمات)
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
  const minPlayers = mode === MODES.ADVANCED ? 6 : 4;

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
      
      <div className="card" style={{ marginBottom: "20px" }}>
        <div style={{ display: 'flex' }}>
          <input 
            type="text" 
            className="input-field" 
            placeholder="اسم اللاعب..." 
            value={name} 
            onChange={(e) => setName(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleAdd()}
          />
          <button className="btn btn-secondary" onClick={handleAdd} style={{ width: '80px', marginTop: 0, borderRadius: '0 4px 0 0' }}>تسجيل</button>
        </div>
      </div>

      <div className="scroll-container" style={{ width: '100%', maxHeight: '30vh', overflowY: 'auto' }}>
        {players.map((p, i) => (
          <div key={i} style={{ padding: '10px', borderBottom: '1px solid #333', fontSize: '1.2rem' }}>{p}</div>
        ))}
      </div>

      <button 
        className="btn btn-primary" 
        onClick={startGame} 
        disabled={players.length < minPlayers}
        style={{ marginTop: "20px" }}
      >
        توزيع الأدوار وبدء اللعبة
      </button>
    </div>
  );
};

// ==========================================
// 4. مرحلة كشف الأدوار (جديدة - لتصحيح الخلل المنطقي)
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
      onComplete(); // الجميع عرفوا أدوارهم، ننتقل لليوم الأول
    }
  };

  return (
    <div className="center-content fade-in">
      <div className="card">
        {!showRole ? (
          <>
            <h2 style={{ color: 'var(--text-dim)' }}>توزيع الأدوار</h2>
            <p>الرجاء تمرير الجهاز بسرية إلى اللاعب:</p>
            <h1 style={{ color: 'var(--primary-gold)', fontSize: '3rem', margin: '20px 0' }}>{player.name}</h1>
            <button className="btn btn-primary" onClick={() => setShowRole(true)}>أنا {player.name}، اكشف دوري</button>
          </>
        ) : (
          <>
            <RoleCard role={player.role} />
            <button className="btn btn-danger" onClick={handleNext} style={{ marginTop: '30px' }}>
              إخفاء الدور وتمرير الجهاز
            </button>
          </>
        )}
      </div>
    </div>
  );
};

// ==========================================
// 5. شاشة تمهيد اليوم الأول
// ==========================================
export const FirstDayIntroScreen = ({ onContinue }) => (
  <div className="center-content fade-in">
    <div className="card">
      <h1 style={{ color: 'var(--primary-gold)' }}>اليوم الأول</h1>
      <p className="typewriter-text" style={{ fontSize: '1.2rem', lineHeight: '1.6' }}>
        الآن، الجميع يعرف دوره. المافيا بينكم وتعرف بعضها البعض.<br/>
        لديكم وقت قصير للتعارف وبناء الانطباعات الأولية قبل أن يحل الظلام الأول.
      </p>
      
      <CountdownTimer initialSeconds={60} onExpire={onContinue} />
      
      <button className="btn btn-secondary" onClick={onContinue} style={{ marginTop: '20px' }}>
        إنهاء النقاش (قدوم الليل)
      </button>
    </div>
  </div>
);

// ==========================================
// 6. شاشات التوجيه الجماعي لمدير الجلسة (جديدة)
// ==========================================
export const GroupSleepScreen = ({ onContinue }) => (
  <div className="center-content fade-in">
    <h1 style={{ color: "var(--primary-gold)", fontSize: "3rem", marginBottom: "10px" }}>المدينة تنام</h1>
    <p style={{ fontSize: "1.3rem", marginBottom: "40px", color: "var(--text-main)" }}>
      أيها اللاعبون، حان وقت النوم. أغمضوا أعينكم جميعاً والتزموا الصمت، وسنبدأ بتمرير الجهاز.
    </p>
    <button className="btn btn-primary" onClick={onContinue}>بدء الليل السري</button>
  </div>
);

export const GroupWakeScreen = ({ onContinue }) => (
  <div className="center-content fade-in">
    <h1 style={{ color: "var(--primary-gold)", fontSize: "3rem", marginBottom: "10px" }}>المدينة تستيقظ</h1>
    <p style={{ fontSize: "1.3rem", marginBottom: "40px", color: "var(--text-main)" }}>
      أيها اللاعبون، افتحوا أعينكم. لقد انتهت الليلة، وسنرى ما حدث.
    </p>
    <button className="btn btn-primary" onClick={onContinue}>عرض تقرير الصباح</button>
  </div>
);

// ==========================================
// 7. شاشات الليل والتمرير السري
// ==========================================
export const NightTransitionScreen = ({ targetPlayer, onReady }) => (
  <div className="center-content fade-in">
    <CitySkyline />
    <div className="card" style={{ zIndex: 1 }}>
      <p style={{ color: 'var(--text-dim)' }}>الرجاء تمرير الجهاز بسرية تامة إلى:</p>
      <h1 style={{ color: "var(--primary-gold)", fontSize: "3rem", margin: "20px 0" }}>{targetPlayer.name}</h1>
      <button className="btn btn-primary" onClick={onReady}>استلمت الجهاز</button>
    </div>
  </div>
);

export const NightTurnScreen = ({ player, players, mode, onActionComplete }) => {
  const [targetId, setTargetId] = useState(null);
  const [willTargetId, setWillTargetId] = useState(null);
  const [investigationResult, setInvestigationResult] = useState(null);

  const aliveOthers = players.filter(p => p.id !== player.id && p.isAlive);
  const allOthers = players.filter(p => p.id !== player.id); 

  const isAdvanced = mode === MODES.ADVANCED;

  const handleConfirm = () => {
    onActionComplete({ targetId, willTargetId });
  };

  const renderRoleAction = () => {
    if (investigationResult) {
      return (
        <div style={{ padding: "20px", border: "1px solid var(--primary-gold)" }}>
          <p>نتائج التحقيق تؤكد أن:</p>
          <h2 style={{ color: investigationResult.role === ROLES.MAFIA ? "var(--crimson-red)" : "var(--primary-gold)", marginTop: "10px" }}>
            [ {investigationResult.name} ] هو {investigationResult.role === ROLES.MAFIA ? "مافيا" : "بريء"}
          </h2>
        </div>
      );
    }

    if (player.role === ROLES.CITIZEN || player.role === ROLES.JESTER) {
      return <p style={{ fontSize: '1.2rem' }}>التزم الصمت. المافيا تتجول في الخارج، راقب وانتظر الصباح.</p>;
    }

    let promptText = "";
    let targetList = aliveOthers;

    if (player.role === ROLES.MAFIA) {
      promptText = "اختر الهدف الذي تريد قتله الليلة:";
    } else if (player.role === ROLES.DOCTOR) {
      promptText = player.hasSelfHealed ? "من تريد إنقاذه الليلة؟ (استنفدت العلاج الذاتي)" : "من تريد إنقاذه الليلة؟";
      if (!player.hasSelfHealed) targetList = players.filter(p => p.isAlive); 
    } else if (player.role === ROLES.DETECTIVE) {
      promptText = "اختر شخصاً للتحقيق في هويته:";
    } else if (player.role === ROLES.VIGILANTE) {
      promptText = player.bullets > 0 ? "هل ترغب في قنص أحدهم الليلة؟" : "لقد نفدت ذخيرتك.";
      if (player.bullets === 0) targetList = [];
    }

    return (
      <>
        <p style={{ color: "var(--primary-gold)", fontWeight: "bold", marginBottom: "15px" }}>{promptText}</p>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px', justifyContent: 'center' }}>
          {targetList.map(p => (
            <PlayerButton 
              key={p.id} 
              player={p} 
              selected={targetId === p.id} 
              onClick={() => {
                setTargetId(p.id);
                if (player.role === ROLES.DETECTIVE) setInvestigationResult(p);
              }}
            />
          ))}
          {(player.role === ROLES.DOCTOR || player.role === ROLES.VIGILANTE) && (
            <button className={`btn ${targetId === null ? "btn-primary" : "btn-secondary"}`} style={{ outline: 'none' }} onClick={() => setTargetId(null)}>
              تخطي (لا أريد استخدام قدرتي)
            </button>
          )}
        </div>
      </>
    );
  };

  return (
    <div className="center-content fade-in scroll-container" style={{ overflowY: 'auto' }}>
      <RoleCard role={player.role} />
      
      <div className="card" style={{ marginTop: "15px" }}>
        {renderRoleAction()}
      </div>

      {isAdvanced && !investigationResult && (
        <div className="card" style={{ marginTop: "15px", border: "1px dashed #555" }}>
          <p style={{ fontSize: "0.9rem", color: "var(--text-dim)" }}>الوصية (تُقرأ للجميع غداً إذا مت الليلة):</p>
          <select 
            className="input-field" 
            style={{ fontSize: "1rem", padding: "10px", marginTop: "10px" }}
            value={willTargetId || ""}
            onChange={(e) => setWillTargetId(Number(e.target.value))}
          >
            <option value="" disabled>وجه اتهامك نحو...</option>
            {allOthers.map(p => (
              <option key={p.id} value={p.id}>{p.name}</option>
            ))}
          </select>
        </div>
      )}

      <button className="btn btn-primary" style={{ marginTop: "20px" }} onClick={handleConfirm} disabled={(player.role === ROLES.MAFIA && targetId === null)}>
        تأكيد وإنهاء دوري
      </button>
    </div>
  );
};

// ==========================================
// 8. التقرير الصباحي والنقاش
// ==========================================
export const DayResultScreen = ({ killedPlayer, savedByDoctor, deathWillMessage, onContinue }) => {
  return (
    <div className="center-content fade-in">
      {killedPlayer ? <ShatteredGlassSVG /> : <CitySkyline />}
      
      <div className="card" style={{ zIndex: 11 }}>
        <h1 style={{ color: killedPlayer ? "var(--crimson-red)" : "var(--primary-gold)" }}>التقرير الصباحي</h1>
        
        {killedPlayer ? (
          <>
            <p className="typewriter-text" style={{ fontSize: "1.3rem" }}>بكل أسف.. تم العثور على [ {killedPlayer.name} ] مقتولاً الليلة الماضية.</p>
            {deathWillMessage && (
              <div style={{ marginTop: "20px", padding: "15px", border: "1px solid var(--text-dim)", background: "rgba(0,0,0,0.5)" }}>
                <h3 style={{ color: "var(--text-dim)", marginBottom: "10px" }}>الوصية التي تركها قبل موته:</h3>
                <p className="typewriter-text" style={{ color: "var(--primary-gold)" }}>"{deathWillMessage}"</p>
              </div>
            )}
          </>
        ) : savedByDoctor ? (
          <p className="typewriter-text" style={{ fontSize: "1.2rem", color: "var(--primary-gold)" }}>حاولت المافيا القتل الليلة، ولكن تدخل الطبيب الشجاع في اللحظة المناسبة وأنقذ الضحية!</p>
        ) : (
          <p className="typewriter-text" style={{ fontSize: "1.2rem" }}>مرت الليلة بسلام.. لم يمت أحد.</p>
        )}
        
        <button className="btn btn-primary" style={{ marginTop: "30px" }} onClick={onContinue}>بدء النقاش</button>
      </div>
    </div>
  );
};

export const DiscussionScreen = ({ aliveCount, onContinue }) => {
  const discussionTime = aliveCount > 6 ? 180 : (aliveCount > 4 ? 120 : 90); 

  return (
    <div className="center-content fade-in">
      <div className="card">
        <h1 style={{ color: "var(--primary-gold)" }}>وقت النقاش</h1>
        <p>تناقشوا، حللوا الأدلة، وحاولوا معرفة من هي المافيا قبل المحكمة.</p>
        
        <CountdownTimer initialSeconds={discussionTime} onExpire={onContinue} />

        <button className="btn btn-danger" onClick={onContinue} style={{ marginTop: "20px" }}>
          إنهاء النقاش والتوجه للمحكمة
        </button>
      </div>
    </div>
  );
};

// ==========================================
// 9. شاشة المحكمة والتصويت (تم إصلاح الخلل والربكة)
// ==========================================
export const VotingScreen = ({ alivePlayers, onVoteComplete }) => {
  const [votes, setVotes] = useState({});
  const [currentPlayerIndex, setCurrentPlayerIndex] = useState(0);
  const [step, setStep] = useState('call'); // 'call' للنداء ، 'vote' للتصويت الفعلي

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
      // إرجاع الشاشة إلى وضع النداء فورا لمسح أثر التصويت وحماية السرية
      setStep('call'); 
    } else {
      onVoteComplete(newVotes);
    }
  };

  // شاشة النداء البينية لتفادي الربكة
  if (step === 'call') {
    return (
      <div className="center-content fade-in">
        <div className="card">
          <h2 style={{ color: 'var(--text-dim)' }}>قاعة المحكمة</h2>
          <p>الرجاء تمرير الجهاز للتصويت السري إلى:</p>
          <h1 style={{ color: "var(--primary-gold)", fontSize: "3rem", margin: "20px 0" }}>{voter.name}</h1>
          <button className="btn btn-primary" onClick={() => setStep('vote')}>أنا {voter.name}، جاهز للتصويت</button>
        </div>
      </div>
    );
  }

  // شاشة التصويت الفعلية
  return (
    <div className="center-content fade-in">
      <div className="card">
        <h2>التصويت السري لـ: <span style={{ color: "var(--primary-gold)" }}>{voter.name}</span></h2>
        <p style={{ marginBottom: '20px' }}>صوّت ضد من تعتقد أنه مذنب:</p>
        
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px', justifyContent: 'center' }}>
          {targets.map(p => (
            <PlayerButton key={p.id} player={p} onClick={() => handleVote(p.id)} />
          ))}
        </div>
        <button className="btn btn-secondary" style={{ marginTop: "20px", outline: 'none' }} onClick={() => handleVote(null)}>
          الامتناع عن التصويت
        </button>
      </div>
    </div>
  );
};

// ==========================================
// 10. شاشة التنفيذ والنهاية
// ==========================================
export const ExecutionScreen = ({ executedPlayer, deathWillMessage, onContinue }) => (
  <div className="center-content fade-in blood-glow" style={{ padding: "20px", borderRadius: "10px", border: "1px solid var(--crimson-red)" }}>
    <NooseSVG />
    <div style={{ zIndex: 1, marginTop: "20px" }}>
      <h1 className="glitch-text" style={{ color: "var(--crimson-red)" }}>قرار المحكمة</h1>
      {executedPlayer ? (
        <>
          <p style={{ fontSize: "1.5rem" }}>بناءً على تصويت الأغلبية، تم إعدام: <strong style={{ color: "#fff" }}>{executedPlayer.name}</strong></p>
          <p style={{ color: "var(--text-dim)", marginTop: "10px" }}>وبعد تفتيشه، تبين أن دوره كان: {getRoleMeta(executedPlayer.role).title}</p>
          {deathWillMessage && (
            <div style={{ marginTop: "20px", padding: "10px", border: "1px solid var(--text-dim)", background: "rgba(0,0,0,0.5)" }}>
               <h3 style={{ color: "var(--text-dim)", marginBottom: "5px" }}>وصيته قبل الإعدام:</h3>
               <p style={{ color: "var(--primary-gold)" }}>"{deathWillMessage}"</p>
            </div>
          )}
        </>
      ) : (
        <p style={{ fontSize: "1.3rem", color: "var(--text-dim)" }}>تشتتت الأصوات.. لم يتفق الأغلبية على شخص واحد، ولذلك تم تأجيل الإعدام.</p>
      )}
      <button className="btn btn-danger" style={{ marginTop: "30px" }} onClick={onContinue}>إغلاق المحكمة</button>
    </div>
  </div>
);

export const GameOverScreen = ({ winner, jesterWon, players, onRestart }) => {
  let title = "";
  let color = "";

  if (jesterWon) {
    title = "المختل خدع الجميع!";
    color = "#a64dff";
  } else if (winner === "mafia") {
    title = "انتصار المافيا!";
    color = "var(--crimson-red)";
  } else {
    title = "انتصار المواطنين!";
    color = "var(--primary-gold)";
  }

  return (
    <div className="center-content fade-in scroll-container" style={{ overflowY: 'auto' }}>
      <h1 style={{ color, fontSize: "2.8rem", marginBottom: "5px" }} className={winner === "mafia" ? "glitch-text" : ""}>{title}</h1>
      <p style={{ marginBottom: "20px" }}>
        {jesterWon ? "لقد خطط ليتم إعدامه ونجح في ذلك!" : 
         winner === "mafia" ? "سيطرت المافيا على المدينة بأكملها." : 
         "تم القضاء على جميع أفراد المافيا، المدينة في أمان."}
      </p>
      
      <div className="card" style={{ width: "100%", padding: "15px" }}>
        <h3 style={{ marginBottom: "15px", color: "var(--text-main)", borderBottom: "1px solid #333", paddingBottom: "10px" }}>
          الأدوار الحقيقية للاعبين:
        </h3>
        {players.map(p => (
          <div key={p.id} style={{ display: "flex", justifyContent: "space-between", padding: "10px 0", borderBottom: "1px solid #222" }}>
            <span style={{ color: p.isAlive ? "#fff" : "var(--text-dim)", textDecoration: p.isAlive ? "none" : "line-through", fontWeight: "bold" }}>{p.name}</span>
            <span style={{ color: p.role === ROLES.MAFIA ? "var(--crimson-red)" : "var(--primary-gold)" }}>{getRoleMeta(p.role).title}</span>
          </div>
        ))}
      </div>

      <button className="btn btn-primary" style={{ marginTop: "30px" }} onClick={onRestart}>العودة للقائمة الرئيسية</button>
    </div>
  );
};
