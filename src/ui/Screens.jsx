import React, { useState, useEffect } from 'react';
import { ROLES, MODES } from '../logic/gameEngine';
import { RoleCard, PlayerButton, getRoleMeta } from './Components';
import { CitySkyline, NooseSVG, ShatteredGlassSVG, SmokeBackground } from './SVGGraphics';

// ==========================================
// 1. شاشة البوابة (التحقق من الكود)
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
        <h1 style={{ color: "var(--primary-gold)" }}>ريشة للألعاب</h1>
        <p>الرجاء إدخال كود التفعيل السري للبدء</p>
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
export const MainMenuScreen = ({ onSelectMode }) => (
  <div className="center-content fade-in">
    <SmokeBackground />
    <div style={{ zIndex: 1, width: '100%' }}>
      <h1>مدينة المافيا</h1>
      <CitySkyline />
      <p style={{ marginBottom: "30px" }}>اختر نظام اللعب الذي يناسب مجموعتك</p>
      
      <button className="btn btn-primary" onClick={() => onSelectMode(MODES.CLASSIC)}>
        الطور الكلاسيكي (أساسي)
      </button>
      <button className="btn" onClick={() => onSelectMode(MODES.ADVANCED)} style={{ marginTop: "15px", borderColor: "var(--crimson-red)" }}>
        الطور المطور (أدوار ووصايا)
      </button>
    </div>
  </div>
);

// ==========================================
// 3. شاشة الإعداد وتسجيل اللاعبين
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
      <h1>تسجيل الأسماء</h1>
      <p>الحد الأدنى: {minPlayers} لاعبين | العدد الحالي: {players.length}</p>
      
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
          <button className="btn btn-secondary" onClick={handleAdd} style={{ width: '80px', marginTop: 0, borderRadius: '0 4px 0 0' }}>إضافة</button>
        </div>
      </div>

      <div className="scroll-container" style={{ width: '100%', maxHeight: '30vh', overflowY: 'auto' }}>
        {players.map((p, i) => (
          <div key={i} style={{ padding: '10px', borderBottom: '1px solid #333' }}>{p}</div>
        ))}
      </div>

      <button 
        className="btn btn-primary" 
        onClick={startGame} 
        disabled={players.length < minPlayers}
        style={{ marginTop: "20px" }}
      >
        بدء اللعب
      </button>
    </div>
  );
};

// ==========================================
// 4. شاشات الليل والتمرير (للأحياء فقط)
// ==========================================
export const NightTransitionScreen = ({ targetPlayer, onReady }) => (
  <div className="center-content fade-in">
    <h2>المدينة تنام...</h2>
    <CitySkyline />
    <div className="card">
      <p>مرر الجهاز سراً إلى:</p>
      <h1 style={{ color: "var(--primary-gold)", fontSize: "3rem" }}>{targetPlayer.name}</h1>
      <button className="btn btn-primary" onClick={onReady}>استلمت الجهاز</button>
    </div>
  </div>
);

export const NightTurnScreen = ({ player, players, mode, onActionComplete }) => {
  const [targetId, setTargetId] = useState(null);
  const [willTargetId, setWillTargetId] = useState(null);
  const [investigationResult, setInvestigationResult] = useState(null);

  const aliveOthers = players.filter(p => p.id !== player.id && p.isAlive);
  const allOthers = players.filter(p => p.id !== player.id); // للوصية، يمكن اتهام أي شخص

  const isAdvanced = mode === MODES.ADVANCED;

  const handleConfirm = () => {
    onActionComplete({ targetId, willTargetId });
  };

  const renderRoleAction = () => {
    if (investigationResult) {
      return (
        <div style={{ padding: "20px", border: "1px solid var(--primary-gold)" }}>
          <p>نتيجة التحري:</p>
          <h2 style={{ color: investigationResult.role === ROLES.MAFIA ? "var(--crimson-red)" : "var(--primary-gold)" }}>
            {investigationResult.name} هو {investigationResult.role === ROLES.MAFIA ? "مافيا" : "بريء"}
          </h2>
        </div>
      );
    }

    if (player.role === ROLES.CITIZEN || player.role === ROLES.JESTER) {
      return <p>التزم الصمت، راقب، وانتظر الصباح.</p>;
    }

    let promptText = "";
    let isDanger = false;
    let targetList = aliveOthers;

    if (player.role === ROLES.MAFIA) {
      promptText = "اختر ضحيتك لهذه الليلة:";
      isDanger = true;
    } else if (player.role === ROLES.DOCTOR) {
      promptText = player.hasSelfHealed ? "من ستعالج الليلة؟ (لا يمكنك علاج نفسك مجدداً)" : "من ستعالج الليلة؟";
      if (!player.hasSelfHealed) targetList = players.filter(p => p.isAlive); // يمكنه اختيار نفسه
    } else if (player.role === ROLES.DETECTIVE) {
      promptText = "اختر شخصاً للتحري عن هويته:";
    } else if (player.role === ROLES.VIGILANTE) {
      promptText = player.bullets > 0 ? "لديك رصاصة واحدة.. هل تريد قنص أحدهم؟" : "نفدت ذخيرتك.";
      isDanger = true;
      if (player.bullets === 0) targetList = [];
    }

    return (
      <>
        <p style={{ color: "var(--primary-gold)", fontWeight: "bold" }}>{promptText}</p>
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
              isDanger={isDanger}
            />
          ))}
          {(player.role === ROLES.DOCTOR || player.role === ROLES.VIGILANTE) && (
            <button className={`btn ${targetId === null ? "btn-primary" : "btn-secondary"}`} onClick={() => setTargetId(null)}>
              تخطي / لا أحد
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

      {/* نظام الوصية الإجباري للطور المطور */}
      {isAdvanced && !investigationResult && (
        <div className="card" style={{ marginTop: "15px", border: "1px dashed #555" }}>
          <p style={{ fontSize: "0.9rem", color: "var(--text-dim)" }}>الوصية الجنائية (اختر شخصاً تتهمه بحال تم غدرك الليلة):</p>
          <select 
            className="input-field" 
            style={{ fontSize: "1rem", padding: "10px" }}
            value={willTargetId || ""}
            onChange={(e) => setWillTargetId(Number(e.target.value))}
          >
            <option value="" disabled>اختر المشتبه به...</option>
            {allOthers.map(p => (
              <option key={p.id} value={p.id}>{p.name}</option>
            ))}
          </select>
        </div>
      )}

      <button className="btn btn-primary" style={{ marginTop: "20px" }} onClick={handleConfirm} disabled={(player.role === ROLES.MAFIA && targetId === null)}>
        {investigationResult ? "إخفاء النتيجة والمتابعة" : "تأكيد وإنهاء الدور"}
      </button>
    </div>
  );
};

// ==========================================
// 5. شاشة نتيجة الصباح والوصية
// ==========================================
export const DayResultScreen = ({ killedPlayer, savedByDoctor, deathWillMessage, onContinue }) => {
  return (
    <div className="center-content fade-in">
      {killedPlayer ? <ShatteredGlassSVG /> : <CitySkyline />}
      
      <div className="card" style={{ zIndex: 11 }}>
        <h1 style={{ color: killedPlayer ? "var(--crimson-red)" : "var(--primary-gold)" }}>الصباح</h1>
        
        {killedPlayer ? (
          <>
            <p className="typewriter-text" style={{ fontSize: "1.3rem" }}>تم العثور على جثة [ {killedPlayer.name} ] في ظروف غامضة.</p>
            {deathWillMessage && (
              <div style={{ marginTop: "20px", padding: "15px", border: "1px solid var(--text-dim)", background: "rgba(0,0,0,0.5)" }}>
                <h3 style={{ color: "var(--text-dim)", marginBottom: "10px" }}>دليل جنائي:</h3>
                <p className="typewriter-text" style={{ color: "var(--primary-gold)" }}>"{deathWillMessage}"</p>
              </div>
            )}
          </>
        ) : savedByDoctor ? (
          <p className="typewriter-text" style={{ fontSize: "1.2rem", color: "var(--primary-gold)" }}>حاولت المافيا القتل الليلة، لكن تدخل طبيب المدينة حال دون وقوع الكارثة.</p>
        ) : (
          <p className="typewriter-text" style={{ fontSize: "1.2rem" }}>مرت الليلة بسلام، لم يُسجل أي اعتداء.</p>
        )}
        
        <button className="btn btn-primary" style={{ marginTop: "30px" }} onClick={onContinue}>بدء النقاش</button>
      </div>
    </div>
  );
};

// ==========================================
// 6. شاشة المحكمة والتصويت
// ==========================================
export const VotingScreen = ({ alivePlayers, onVoteComplete }) => {
  const [votes, setVotes] = useState({});
  const [currentPlayerIndex, setCurrentPlayerIndex] = useState(0);

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
    } else {
      onVoteComplete(newVotes);
    }
  };

  return (
    <div className="center-content fade-in">
      <div className="card">
        <h2>تصويت المحكمة</h2>
        <p style={{ color: "var(--crimson-red)" }}>المصوت الحالي: <span style={{ fontWeight: "bold", fontSize: "1.3rem" }}>{voter.name}</span></p>
        <p>من ترغب في إعدامه؟ (بسرعة وبدون لفت انتباه)</p>
        
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px', justifyContent: 'center', marginTop: "20px" }}>
          {targets.map(p => (
            <PlayerButton key={p.id} player={p} onClick={() => handleVote(p.id)} isDanger={true} />
          ))}
        </div>
        <button className="btn btn-secondary" style={{ marginTop: "20px" }} onClick={() => handleVote(null)}>
          امتناع عن التصويت
        </button>
      </div>
    </div>
  );
};

// ==========================================
// 7. شاشة الإعدام
// ==========================================
export const ExecutionScreen = ({ executedPlayer, deathWillMessage, onContinue }) => (
  <div className="center-content fade-in blood-glow" style={{ padding: "20px", borderRadius: "10px", border: "1px solid var(--crimson-red)" }}>
    <NooseSVG />
    <div style={{ zIndex: 1, marginTop: "20px" }}>
      <h1 className="glitch-text" style={{ color: "var(--crimson-red)" }}>قرار الإعدام</h1>
      {executedPlayer ? (
        <>
          <p style={{ fontSize: "1.5rem" }}>تم تنفيذ حكم الإعدام بحق: <strong style={{ color: "#fff" }}>{executedPlayer.name}</strong></p>
          <p style={{ color: "var(--text-dim)", marginTop: "10px" }}>كان دوره: {getRoleMeta(executedPlayer.role).title}</p>
          {deathWillMessage && (
            <div style={{ marginTop: "20px", padding: "10px", border: "1px solid var(--text-dim)", background: "rgba(0,0,0,0.5)" }}>
               <h3 style={{ color: "var(--text-dim)", marginBottom: "5px" }}>الكلمة الأخيرة:</h3>
               <p style={{ color: "var(--primary-gold)" }}>"{deathWillMessage}"</p>
            </div>
          )}
        </>
      ) : (
        <p style={{ fontSize: "1.3rem", color: "var(--text-dim)" }}>تشتتت الأصوات.. لم يتم إعدام أحد اليوم.</p>
      )}
      <button className="btn btn-danger" style={{ marginTop: "30px" }} onClick={onContinue}>إنهاء النهار</button>
    </div>
  </div>
);

// ==========================================
// 8. شاشة النهاية
// ==========================================
export const GameOverScreen = ({ winner, jesterWon, players, onRestart }) => {
  let title = "";
  let color = "";

  if (jesterWon) {
    title = "فوز المجنون!";
    color = "#a64dff";
  } else if (winner === "mafia") {
    title = "انتصار المافيا!";
    color = "var(--crimson-red)";
  } else {
    title = "انتصار المدينة!";
    color = "var(--primary-gold)";
  }

  return (
    <div className="center-content fade-in scroll-container" style={{ overflowY: 'auto' }}>
      <h1 style={{ color, fontSize: "3rem", marginBottom: "5px" }} className={winner === "mafia" ? "glitch-text" : ""}>{title}</h1>
      <p style={{ marginBottom: "20px" }}>{jesterWon ? "لقد خدعكم جميعاً وتم إعدامه كما خطط!" : winner === "mafia" ? "الظلام يبتلع المدينة." : "عادت العدالة إلى الشوارع."}</p>
      
      <div className="card" style={{ width: "100%", padding: "15px" }}>
        <h3 style={{ marginBottom: "15px", color: "var(--text-main)" }}>الأدوار الحقيقية:</h3>
        {players.map(p => (
          <div key={p.id} style={{ display: "flex", justifyContent: "space-between", padding: "8px 0", borderBottom: "1px solid #333" }}>
            <span style={{ color: p.isAlive ? "#fff" : "var(--text-dim)", textDecoration: p.isAlive ? "none" : "line-through" }}>{p.name}</span>
            <span style={{ color: p.role === ROLES.MAFIA ? "var(--crimson-red)" : "var(--primary-gold)" }}>{getRoleMeta(p.role).title}</span>
          </div>
        ))}
      </div>

      <button className="btn btn-primary" style={{ marginTop: "30px" }} onClick={onRestart}>العودة للقائمة الرئيسية</button>
    </div>
  );
};
