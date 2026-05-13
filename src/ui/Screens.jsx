import React, { useState } from 'react';
import { ROLES, MODES } from '../logic/gameEngine';
import { RoleCard, PlayerButton, getRoleMeta, CountdownTimer, RulesModal } from './Components';
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
        <h1 style={{ color: "var(--primary-gold)" }}>إدارة التحقيقات</h1>
        <p>الرجاء إدخال رمز الوصول السري للسجلات</p>
        <input 
          type="text" 
          className="input-field" 
          placeholder="أدخل الكود هنا..." 
          value={code} 
          onChange={(e) => { setCode(e.target.value); setError(false); }}
        />
        {error && <p style={{ color: "var(--bright-red)", marginTop: "10px" }}>الرمز غير صحيح أو التصريح منتهي.</p>}
        <button className="btn btn-primary" onClick={handleSubmit} style={{ marginTop: "20px" }}>
          توثيق الدخول
        </button>
      </div>
    </div>
  );
};

// ==========================================
// 2. القائمة الرئيسية (اختيار الطور والتعليمات)
// ==========================================
export const MainMenuScreen = ({ onSelectMode }) => {
  const [showRules, setShowRules] = useState(false);

  return (
    <div className="center-content fade-in">
      <SmokeBackground />
      <div style={{ zIndex: 1, width: '100%' }}>
        <h1>المدينة الفاسدة</h1>
        <CitySkyline />
        <p style={{ marginBottom: "30px" }}>اختر بروتوكول التحقيق المناسب لجلستكم</p>
        
        <button className="btn btn-primary" onClick={() => onSelectMode(MODES.CLASSIC)}>
          التحقيق الكلاسيكي (أساسي)
        </button>
        <p style={{ fontSize: '0.8rem', color: 'var(--text-dim)', marginBottom: '15px', marginTop: '5px' }}>
          لعب سريع، أدوار أساسية، وقوانين صارمة.
        </p>

        <button className="btn" onClick={() => onSelectMode(MODES.ADVANCED)} style={{ borderColor: "var(--crimson-red)" }}>
          التحقيق المطور (أدوار ووصايا)
        </button>
        <p style={{ fontSize: '0.8rem', color: 'var(--text-dim)', marginBottom: '30px', marginTop: '5px' }}>
          يضيف القناص، المختل، ونظام الوصية الجنائية الإجبارية.
        </p>

        <button className="btn btn-secondary" onClick={() => setShowRules(true)}>
          قراءة ملف التعليمات
        </button>

        {showRules && <RulesModal onClose={() => setShowRules(false)} />}
      </div>
    </div>
  );
};

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
      <h1>سجل المشتبه بهم</h1>
      <p>الحد الأدنى للملف: {minPlayers} | المسجلون: {players.length}</p>
      
      <div className="card" style={{ marginBottom: "20px" }}>
        <div style={{ display: 'flex' }}>
          <input 
            type="text" 
            className="input-field" 
            placeholder="اسم المشتبه به..." 
            value={name} 
            onChange={(e) => setName(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleAdd()}
          />
          <button className="btn btn-secondary" onClick={handleAdd} style={{ width: '80px', marginTop: 0, borderRadius: '0 4px 0 0' }}>تسجيل</button>
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
        اعتماد الملف وتوزيع الأدوار
      </button>
    </div>
  );
};

// ==========================================
// 4. شاشة تمهيد اليوم الأول (جديدة)
// ==========================================
export const FirstDayIntroScreen = ({ onContinue }) => (
  <div className="center-content fade-in">
    <div className="card">
      <h1 style={{ color: 'var(--primary-gold)' }}>اليوم الأول</h1>
      <p className="typewriter-text" style={{ fontSize: '1.2rem', lineHeight: '1.6' }}>
        تم توزيع الأدوار بسرية تامة. العصابة الآن بينكم وتعرف بعضها البعض.<br/>
        لديكم وقت قصير لتبادل النظرات وبناء الانطباعات الأولية قبل أن يحل الظلام وتُرتكب الجريمة الأولى.
      </p>
      
      <CountdownTimer initialSeconds={60} onExpire={onContinue} />
      
      <button className="btn btn-secondary" onClick={onContinue} style={{ marginTop: '20px' }}>
        إنهاء النقاش مبكراً (بدء الليل)
      </button>
    </div>
  </div>
);

// ==========================================
// 5. شاشات الليل والتمرير (للأحياء فقط)
// ==========================================
export const NightTransitionScreen = ({ targetPlayer, onReady }) => (
  <div className="center-content fade-in">
    <h2>المدينة تنام...</h2>
    <CitySkyline />
    <div className="card">
      <p>يُرجى تسليم ملف القضية (الجهاز) سراً إلى:</p>
      <h1 style={{ color: "var(--primary-gold)", fontSize: "3rem" }}>{targetPlayer.name}</h1>
      <button className="btn btn-primary" onClick={onReady}>استلمت الملف</button>
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
          <p>السجل الجنائي يوضح:</p>
          <h2 style={{ color: investigationResult.role === ROLES.MAFIA ? "var(--crimson-red)" : "var(--primary-gold)" }}>
            [ {investigationResult.name} ] هو {investigationResult.role === ROLES.MAFIA ? "عضو عصابة (مافيا)" : "مواطن بريء"}
          </h2>
        </div>
      );
    }

    if (player.role === ROLES.CITIZEN || player.role === ROLES.JESTER) {
      return <p>التزم الصمت في غرفتك. العصابة تتجول في الخارج. راقب ما يحدث وانتظر الصباح.</p>;
    }

    let promptText = "";
    let isDanger = false;
    let targetList = aliveOthers;

    if (player.role === ROLES.MAFIA) {
      promptText = "اختر الهدف الذي سيتم تصفيته الليلة:";
      isDanger = true;
    } else if (player.role === ROLES.DOCTOR) {
      promptText = player.hasSelfHealed ? "من ستسعى لإنقاذه الليلة؟ (استنفدت علاجك الذاتي)" : "من ستسعى لإنقاذه الليلة؟";
      if (!player.hasSelfHealed) targetList = players.filter(p => p.isAlive); 
    } else if (player.role === ROLES.DETECTIVE) {
      promptText = "حدد المشتبه به لفحص هويته في السجلات:";
    } else if (player.role === ROLES.VIGILANTE) {
      promptText = player.bullets > 0 ? "ذخيرتك جاهزة. هل ترغب في إعدام أحدهم خارج إطار القانون؟" : "نفدت ذخيرتك.";
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
              تخطي / لا تدخل
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
          <p style={{ fontSize: "0.9rem", color: "var(--text-dim)" }}>تسجيل الوصية الجنائية (تُفتح فقط إذا تم اغتيالك الليلة):</p>
          <select 
            className="input-field" 
            style={{ fontSize: "1rem", padding: "10px" }}
            value={willTargetId || ""}
            onChange={(e) => setWillTargetId(Number(e.target.value))}
          >
            <option value="" disabled>وجه الاتهام نحو المشتبه به...</option>
            {allOthers.map(p => (
              <option key={p.id} value={p.id}>{p.name}</option>
            ))}
          </select>
        </div>
      )}

      <button className="btn btn-primary" style={{ marginTop: "20px" }} onClick={handleConfirm} disabled={(player.role === ROLES.MAFIA && targetId === null)}>
        {investigationResult ? "إخفاء السجل وإغلاق الملف" : "تأكيد وإغلاق الملف"}
      </button>
    </div>
  );
};

// ==========================================
// 6. شاشة التقرير الصباحي
// ==========================================
export const DayResultScreen = ({ killedPlayer, savedByDoctor, deathWillMessage, onContinue }) => {
  return (
    <div className="center-content fade-in">
      {killedPlayer ? <ShatteredGlassSVG /> : <CitySkyline />}
      
      <div className="card" style={{ zIndex: 11 }}>
        <h1 style={{ color: killedPlayer ? "var(--crimson-red)" : "var(--primary-gold)" }}>التقرير الصباحي</h1>
        
        {killedPlayer ? (
          <>
            <p className="typewriter-text" style={{ fontSize: "1.3rem" }}>تم العثور على جثة [ {killedPlayer.name} ] في ظروف غامضة.</p>
            {deathWillMessage && (
              <div style={{ marginTop: "20px", padding: "15px", border: "1px solid var(--text-dim)", background: "rgba(0,0,0,0.5)" }}>
                <h3 style={{ color: "var(--text-dim)", marginBottom: "10px" }}>دليل جنائي مع الضحية:</h3>
                <p className="typewriter-text" style={{ color: "var(--primary-gold)" }}>"{deathWillMessage}"</p>
              </div>
            )}
          </>
        ) : savedByDoctor ? (
          <p className="typewriter-text" style={{ fontSize: "1.2rem", color: "var(--primary-gold)" }}>رصدت بلاغات عن محاولة اغتيال الليلة، لكن تدخل طبيب الطوارئ السريع أنقذ الموقف.</p>
        ) : (
          <p className="typewriter-text" style={{ fontSize: "1.2rem" }}>مرت الليلة بهدوء، لم تُسجل أي أحداث أمنية.</p>
        )}
        
        <button className="btn btn-primary" style={{ marginTop: "30px" }} onClick={onContinue}>فتح باب التحقيق (النقاش)</button>
      </div>
    </div>
  );
};

// ==========================================
// 7. مرحلة النقاش مع العداد الزمني (جديدة)
// ==========================================
export const DiscussionScreen = ({ aliveCount, onContinue }) => {
  // تقليل الوقت ديناميكياً كلما قل عدد اللاعبين
  const discussionTime = aliveCount > 6 ? 180 : (aliveCount > 4 ? 120 : 90); 

  return (
    <div className="center-content fade-in">
      <div className="card">
        <h1 style={{ color: "var(--primary-gold)" }}>التحقيق المفتوح</h1>
        <p>الأدلة مطروحة أمامكم. تناقشوا لتحديد هوية المشتبه به قبل رفع الجلسة للمحكمة.</p>
        
        <CountdownTimer initialSeconds={discussionTime} onExpire={onContinue} />

        <button className="btn btn-danger" onClick={onContinue} style={{ marginTop: "20px" }}>
          إنهاء التحقيق مبكراً والتوجه للمحكمة
        </button>
      </div>
    </div>
  );
};

// ==========================================
// 8. شاشة المحكمة والتصويت
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
        <h2>قاعة المحكمة</h2>
        <p style={{ color: "var(--crimson-red)" }}>السجل الجنائي لـ: <span style={{ fontWeight: "bold", fontSize: "1.3rem" }}>{voter.name}</span></p>
        <p>أشر بإصبع الاتهام نحو من تعتقد أنه مذنب (بسرعة وسرية):</p>
        
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px', justifyContent: 'center', marginTop: "20px" }}>
          {targets.map(p => (
            <PlayerButton key={p.id} player={p} onClick={() => handleVote(p.id)} isDanger={true} />
          ))}
        </div>
        <button className="btn btn-secondary" style={{ marginTop: "20px" }} onClick={() => handleVote(null)}>
          الامتناع عن توجيه الاتهام
        </button>
      </div>
    </div>
  );
};

// ==========================================
// 9. شاشة قرار الإعدام
// ==========================================
export const ExecutionScreen = ({ executedPlayer, deathWillMessage, onContinue }) => (
  <div className="center-content fade-in blood-glow" style={{ padding: "20px", borderRadius: "10px", border: "1px solid var(--crimson-red)" }}>
    <NooseSVG />
    <div style={{ zIndex: 1, marginTop: "20px" }}>
      <h1 className="glitch-text" style={{ color: "var(--crimson-red)" }}>الحكم النهائي</h1>
      {executedPlayer ? (
        <>
          <p style={{ fontSize: "1.5rem" }}>تم تنفيذ الإعدام بحق المشتبه به: <strong style={{ color: "#fff" }}>{executedPlayer.name}</strong></p>
          <p style={{ color: "var(--text-dim)", marginTop: "10px" }}>كشفت السجلات أن دوره كان: {getRoleMeta(executedPlayer.role).title}</p>
          {deathWillMessage && (
            <div style={{ marginTop: "20px", padding: "10px", border: "1px solid var(--text-dim)", background: "rgba(0,0,0,0.5)" }}>
               <h3 style={{ color: "var(--text-dim)", marginBottom: "5px" }}>أقوال ما قبل التنفيذ:</h3>
               <p style={{ color: "var(--primary-gold)" }}>"{deathWillMessage}"</p>
            </div>
          )}
        </>
      ) : (
        <p style={{ fontSize: "1.3rem", color: "var(--text-dim)" }}>عدم كفاية الأدلة.. تشتتت الأصوات وتم رفع الجلسة بدون إعدام.</p>
      )}
      <button className="btn btn-danger" style={{ marginTop: "30px" }} onClick={onContinue}>إغلاق المحكمة (بدء الليل)</button>
    </div>
  </div>
);

// ==========================================
// 10. شاشة النهاية وإغلاق القضية
// ==========================================
export const GameOverScreen = ({ winner, jesterWon, players, onRestart }) => {
  let title = "";
  let color = "";

  if (jesterWon) {
    title = "المختل يتلاعب بالعدالة!";
    color = "#a64dff";
  } else if (winner === "mafia") {
    title = "العصابة تحكم المدينة!";
    color = "var(--crimson-red)";
  } else {
    title = "العدالة تنتصر!";
    color = "var(--primary-gold)";
  }

  return (
    <div className="center-content fade-in scroll-container" style={{ overflowY: 'auto' }}>
      <h1 style={{ color, fontSize: "2.8rem", marginBottom: "5px" }} className={winner === "mafia" ? "glitch-text" : ""}>{title}</h1>
      <p style={{ marginBottom: "20px" }}>
        {jesterWon ? "لقد خدعكم جميعاً ونجح في جعلكم تعدمونه كما خطط!" : 
         winner === "mafia" ? "تمت تصفية الشرطة والمواطنين، الظلام يبتلع المدينة." : 
         "تم القضاء على آخر أفراد العصابة، المدينة الآن آمنة."}
      </p>
      
      <div className="card" style={{ width: "100%", padding: "15px" }}>
        <h3 style={{ marginBottom: "15px", color: "var(--text-main)", borderBottom: "1px solid #333", paddingBottom: "10px" }}>
          السجلات السرية المكشوفة:
        </h3>
        {players.map(p => (
          <div key={p.id} style={{ display: "flex", justifyContent: "space-between", padding: "10px 0", borderBottom: "1px solid #222" }}>
            <span style={{ color: p.isAlive ? "#fff" : "var(--text-dim)", textDecoration: p.isAlive ? "none" : "line-through", fontWeight: "bold" }}>{p.name}</span>
            <span style={{ color: p.role === ROLES.MAFIA ? "var(--crimson-red)" : "var(--primary-gold)" }}>{getRoleMeta(p.role).title}</span>
          </div>
        ))}
      </div>

      <button className="btn btn-primary" style={{ marginTop: "30px" }} onClick={onRestart}>بدء تحقيق جديد</button>
    </div>
  );
};
