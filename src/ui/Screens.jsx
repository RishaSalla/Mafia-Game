import React, { useState, useEffect } from 'react';
import { Button, HoldToRevealBtn, PassDeviceScreen, RoleIcon } from './Components';
import { ROLES, NARRATOR } from '../logic/gameEngine';

// ==========================================
// Sound Helper (نظام الصوت المبدئي)
// ==========================================
const playSFX = (soundName) => {
  try {
    // const audio = new Audio(`/sounds/${soundName}.mp3`);
    // audio.play();
  } catch (error) {
    console.log("Audio not loaded yet");
  }
};

// ==========================================
// SVG Art Components (الرسومات الفنية)
// ==========================================
const CitySkyline = () => (
  <svg viewBox="0 0 100 40" width="100%" height="80px" style={{ opacity: 0.6, marginBottom: '20px' }}>
    <rect x="10" y="15" width="15" height="25" fill="#111" />
    <rect x="26" y="5" width="20" height="35" fill="#0a0a0a" />
    <rect x="47" y="20" width="12" height="20" fill="#111" />
    <rect x="60" y="10" width="18" height="30" fill="#050505" />
    <rect x="79" y="18" width="15" height="22" fill="#111" />
    <circle cx="85" cy="8" r="4" fill="var(--primary-gold)" opacity="0.8" />
  </svg>
);

const NooseSVG = () => (
  <svg viewBox="0 0 50 100" width="60px" height="120px" style={{ margin: '0 auto', display: 'block' }}>
    <path d="M25 0 V 50" stroke="var(--text-dim)" strokeWidth="3" fill="none" />
    <circle cx="25" cy="65" r="15" stroke="var(--text-dim)" strokeWidth="3" fill="none" />
    <path d="M25 50 Q 30 55 25 60 Q 20 55 25 50" fill="var(--text-dim)" />
  </svg>
);

const DetectiveEye = () => (
  <svg viewBox="0 0 24 24" width="60px" height="60px" fill="none" stroke="var(--primary-gold)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" style={{ margin: '10px auto' }}>
    <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
    <circle cx="12" cy="12" r="3" />
  </svg>
);

// ==========================================
// 1. شاشة الإعداد (Setup Screen)
// ==========================================
export const SetupScreen = ({ onStartGame }) => {
  const [names, setNames] = useState(["", "", "", ""]);

  const handleNameChange = (index, val) => {
    const newNames = [...names];
    newNames[index] = val;
    setNames(newNames);
  };

  const addPlayer = () => setNames([...names, ""]);
  
  const startGame = () => {
    const validNames = names.filter(n => n.trim() !== "");
    if (validNames.length < 4) return alert("الحد الأدنى 4 لاعبين لبدء الجلسة!");
    onStartGame(validNames);
  };

  return (
    <div className="center-content card fade-in">
      <CitySkyline />
      <h1>لعبة المافيا</h1>
      <h2 style={{ color: 'var(--text-dim)' }}>إعداد اللاعبين</h2>
      <div className="scroll-container" style={{ width: '100%', maxHeight: '40vh', overflowY: 'auto', padding: '10px' }}>
        {names.map((name, i) => (
          <input
            key={i}
            className="input-field"
            placeholder={`اسم اللاعب ${i + 1}`}
            value={name}
            onChange={(e) => handleNameChange(i, e.target.value)}
            style={{ marginBottom: '15px' }}
          />
        ))}
      </div>
      <Button text="+ إضافة لاعب" onClick={addPlayer} variant="secondary" />
      <Button text="دخول المدينة" onClick={startGame} />
    </div>
  );
};

// ==========================================
// 2. اليوم الصفر: كشف الأدوار
// ==========================================
export const RoleRevealPhase = ({ queue, onRevealComplete }) => {
  const [turnIndex, setTurnIndex] = useState(0);
  const [isReady, setIsReady] = useState(false);
  const [isRevealed, setIsRevealed] = useState(false);

  const currentPlayer = queue[turnIndex];

  const handleNext = () => {
    setIsReady(false);
    setIsRevealed(false);
    if (turnIndex + 1 < queue.length) {
      setTurnIndex(turnIndex + 1);
    } else {
      onRevealComplete();
    }
  };

  if (!isReady) {
    return <PassDeviceScreen nextPlayerName={currentPlayer.name} onReady={() => {
      if (navigator.vibrate) navigator.vibrate(50);
      setIsReady(true);
    }} />;
  }

  return (
    <div className="center-content">
      {!isRevealed ? (
        <>
          <h2 style={{ color: 'var(--text-dim)' }}>لمعرفة دورك السري: <span style={{color: 'white'}}>{currentPlayer.name}</span></h2>
          <HoldToRevealBtn 
            onRevealStart={() => {
              playSFX('heartbeat_single');
              if (navigator.vibrate) navigator.vibrate([30, 50, 30]);
              setIsRevealed(true);
            }} 
            onRevealEnd={() => setIsRevealed(false)} 
          />
        </>
      ) : (
        <div className="role-card fade-in">
          <RoleIcon role={currentPlayer.role} />
          <h2 style={{color: 'var(--primary-gold)', fontSize: '2.5rem', margin: '20px 0'}}>
            أنت {getRoleName(currentPlayer.role)}
          </h2>
          <p className="typewriter-text" style={{ fontSize: '1.2rem' }}>
            احفظ دورك جيداً، ولا تخبر أحداً به مهما حدث.
          </p>
          <Button text="فهمت، دور التالي" onClick={handleNext} style={{ marginTop: '30px' }} />
        </div>
      )}
    </div>
  );
};

// ==========================================
// 3. التعارف المريب (First Day Intro)
// ==========================================
export const FirstDayIntro = ({ onTimeUp }) => {
  const [timeLeft, setTimeLeft] = useState(60);

  useEffect(() => {
    playSFX('suspense_intro');
    if (timeLeft <= 0) {
      onTimeUp();
      return;
    }
    const timer = setInterval(() => setTimeLeft(prev => prev - 1), 1000);
    return () => clearInterval(timer);
  }, [timeLeft, onTimeUp]);

  return (
    <div className="center-content card fade-in">
      <CitySkyline />
      <h1 className="glitch-text" style={{ color: 'var(--bright-red)' }}>بينكم خونة!</h1>
      <p style={{ fontSize: '1.2rem', lineHeight: '1.8' }}>
        انظروا في أعين بعضكم البعض...<br/>
        المافيا تجلس معكم الآن، تبتسم في وجوهكم.<br/>
        لديكم دقيقة واحدة لتشتيت الانتباه قبل حلول الظلام.
      </p>
      <h2 style={{ fontSize: '5rem', fontFamily: 'monospace', margin: '20px 0' }}>
        {timeLeft}
      </h2>
      <Button text="تخطي وبدء الليل" onClick={() => setTimeLeft(0)} variant="secondary" />
    </div>
  );
};

// ==========================================
// 4. شاشة الراوي (الليل)
// ==========================================
export const NightTransition = ({ onProceed }) => {
  useEffect(() => { playSFX('night_wind'); }, []);
  return (
    <div className="center-content card fade-in" style={{ backgroundColor: 'black' }}>
      <CitySkyline />
      <h2 className="typewriter-text" style={{ lineHeight: '1.8', color: 'var(--text-dim)', fontSize: '1.4rem' }}>
        "الشمس تغيب، والظلال تطول..<br/> فليغمض الجميع أعينهم،<br/> وليبدأ تمرير الجوال سراً."
      </h2>
      <Button text="بدء التمرير الدامي" onClick={onProceed} />
    </div>
  );
};

// ==========================================
// 5. شاشة الليل (Night Loop)
// ==========================================
export const NightPhase = ({ queue, players, onAction, onNightEnd }) => {
  const [turnIndex, setTurnIndex] = useState(0);
  const [isReady, setIsReady] = useState(false);
  const [isRevealed, setIsRevealed] = useState(false);
  const [detectiveResult, setDetectiveResult] = useState(null);

  const currentPlayer = queue[turnIndex];
  const aliveTargets = players.filter(p => p.isAlive && p.id !== currentPlayer.id);

  const handleNext = (targetId = null) => {
    onAction(currentPlayer, targetId);
    setIsReady(false);
    setIsRevealed(false);
    setDetectiveResult(null);

    if (turnIndex + 1 < queue.length) {
      setTurnIndex(turnIndex + 1);
    } else {
      onNightEnd();
    }
  };

  if (!isReady) {
    return <PassDeviceScreen nextPlayerName={currentPlayer.name} onReady={() => {
      if (navigator.vibrate) navigator.vibrate(50);
      setIsReady(true);
    }} />;
  }

  return (
    <div className="center-content">
      {!isRevealed ? (
        <>
          <h2 style={{ color: 'var(--text-dim)' }}>الجهاز مع: <span style={{color: 'white'}}>{currentPlayer.name}</span></h2>
          <HoldToRevealBtn 
            onRevealStart={() => {
              playSFX('heartbeat_single');
              if (navigator.vibrate) navigator.vibrate([30, 50, 30]);
              setIsRevealed(true);
            }} 
            onRevealEnd={() => setIsRevealed(false)} 
          />
        </>
      ) : (
        <div className="role-card fade-in">
          <RoleIcon role={currentPlayer.role} />
          <h2 style={{color: 'var(--primary-gold)', fontSize: '2rem', margin: '10px 0'}}>
            {currentPlayer.isAlive ? getRoleName(currentPlayer.role) : "أنت ميت 💀"}
          </h2>
          
          <div className="scroll-container" style={{ width: '100%', marginTop: '20px', maxHeight: '45vh', overflowY: 'auto' }}>
            
            {(!currentPlayer.isAlive || currentPlayer.role === ROLES.CITIZEN) && (
              <>
                <p className="typewriter-text">المدينة نائمة.. التزم الصمت تماماً للتمويه.</p>
                <Button text="تأمين المنزل 🔒" onClick={() => setTimeout(() => handleNext(null), 800)} variant="secondary" />
              </>
            )}

            {currentPlayer.isAlive && currentPlayer.role === ROLES.MAFIA && (
              <>
                <p className="glitch-text" style={{fontSize: '1.2rem', marginBottom: '15px'}}>حدد ضحيتك:</p>
                <div style={{display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px'}}>
                  {aliveTargets.map(p => (
                    <Button key={p.id} text={p.name} onClick={() => { playSFX('gun_silencer'); handleNext(p.id); }} variant="danger" />
                  ))}
                </div>
              </>
            )}

            {currentPlayer.isAlive && currentPlayer.role === ROLES.DOCTOR && (
              <>
                <p style={{color: '#00d2ff'}}>من ستنقذ الليلة؟</p>
                <div style={{display: 'flex', flexDirection: 'column', gap: '10px'}}>
                  {players.filter(p => p.isAlive).map(p => (
                    <Button 
                      key={p.id} 
                      text={p.name + (p.id === currentPlayer.id ? " (أنت)" : "")} 
                      disabled={p.id === currentPlayer.id && currentPlayer.hasSelfHealed}
                      onClick={() => handleNext(p.id)} 
                    />
                  ))}
                </div>
              </>
            )}

             {currentPlayer.isAlive && currentPlayer.role === ROLES.DETECTIVE && (
              <>
                {!detectiveResult ? (
                  <>
                    <DetectiveEye />
                    <p>اختر مشتبهاً به للكشف:</p>
                    <div style={{display: 'flex', flexDirection: 'column', gap: '10px'}}>
                      {aliveTargets.map(p => (
                        <Button 
                          key={p.id} 
                          text={`كشف ${p.name}`} 
                          onClick={() => {
                            const isMafia = p.role === ROLES.MAFIA;
                            if(isMafia) playSFX('suspense_shock');
                            setDetectiveResult(isMafia ? "⚠️ هذا الشخص مافيا!" : "✅ هذا الشخص بريء");
                          }} 
                        />
                      ))}
                      <Button text="تخطيط (لا أريد الكشف)" onClick={() => handleNext(null)} variant="secondary" />
                    </div>
                  </>
                ) : (
                  <div className="fade-in">
                    <h2 style={{ fontSize: '1.8rem', color: detectiveResult.includes('مافيا') ? 'var(--bright-red)' : '#00ff88' }}>
                      {detectiveResult}
                    </h2>
                    <Button text="إنهاء دوري" onClick={() => handleNext(null)} />
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

// ==========================================
// 6. شاشة الصباح الديناميكية (إعلان النتائج)
// ==========================================
export const DayResult = ({ killedPlayerName, savedByDoctor, onStartDiscussion }) => {
  const [message, setMessage] = useState('');

  useEffect(() => {
    if (savedByDoctor) {
      playSFX('angel_choir');
      setMessage(NARRATOR.getSaveMessage());
    } else if (killedPlayerName) {
      playSFX('rooster_shock');
      setMessage(NARRATOR.getKillMessage(killedPlayerName));
    } else {
      playSFX('rooster');
      setMessage("أشرقت الشمس.. ليلة هادئة وسلام يعم المدينة!");
    }
  }, [killedPlayerName, savedByDoctor]);

  return (
    <div className="center-content card fade-in" style={{ borderColor: killedPlayerName && !savedByDoctor ? 'var(--crimson-red)' : 'var(--primary-gold)' }}>
      <h1 style={{ fontSize: '5rem', margin: 0 }}>
        {savedByDoctor ? "🛡️" : (killedPlayerName ? "💀" : "🌅")}
      </h1>
      <h2 className="typewriter-text" style={{ color: 'white', lineHeight: '1.8', margin: '20px 0' }}>
        {message}
      </h2>
      <Button text="بدء المحكمة" onClick={onStartDiscussion} variant={killedPlayerName && !savedByDoctor ? "danger" : "primary"} />
    </div>
  );
};

// ==========================================
// 7. مؤقت النقاش (Discussion Timer)
// ==========================================
export const DiscussionPhase = ({ onTimeUp }) => {
  const [timeLeft, setTimeLeft] = useState(120);

  useEffect(() => {
    if (timeLeft <= 0) {
      playSFX('gavel');
      onTimeUp();
      return;
    }
    const timer = setInterval(() => setTimeLeft(prev => prev - 1), 1000);
    if (timeLeft === 10) playSFX('clock_ticking');
    
    return () => clearInterval(timer);
  }, [timeLeft, onTimeUp]);

  const formatTime = (sec) => {
    const m = Math.floor(sec / 60);
    const s = sec % 60;
    return `${m}:${s < 10 ? '0' : ''}${s}`;
  };

  const isDanger = timeLeft <= 10;

  return (
    <div className={`center-content card fade-in ${isDanger ? 'blood-glow' : ''}`}>
      <h1 style={{ color: 'var(--bright-red)' }}>وقت المحكمة</h1>
      <p>تبادلوا الاتهامات! من تظنون أنه القاتل؟</p>
      <h2 style={{ fontSize: '5rem', fontFamily: 'monospace', margin: '20px 0' }} className={isDanger ? 'heartbeat glitch-text' : ''}>
        {formatTime(timeLeft)}
      </h2>
      <Button text="إنهاء النقاش والتصويت" onClick={() => setTimeLeft(0)} variant="secondary" />
    </div>
  );
};

// ==========================================
// 8. شاشة التصويت (Voting Loop)
// ==========================================
export const VotingPhase = ({ players, onVoteComplete }) => {
  const [voterIndex, setVoterIndex] = useState(0);
  const [isReady, setIsReady] = useState(false);
  const [votes, setVotes] = useState({});

  const currentVoter = players[voterIndex];

  const handleVote = (targetId) => {
    if (targetId !== null && currentVoter.isAlive) {
      setVotes(prev => ({ ...prev, [targetId]: (prev[targetId] || 0) + 1 }));
    }
    
    setIsReady(false);
    if (voterIndex + 1 < players.length) {
      setVoterIndex(voterIndex + 1);
    } else {
      onVoteComplete(votes);
    }
  };

  if (!isReady) {
    return <PassDeviceScreen nextPlayerName={currentVoter.name} onReady={() => setIsReady(true)} />;
  }

  return (
    <div className="center-content">
      <h2 style={{ color: 'var(--text-dim)' }}>التصويت السري: <span style={{color: 'white'}}>{currentVoter.name}</span></h2>
      
      {!currentVoter.isAlive ? (
        <div className="card fade-in">
          <p>أنت ميت.. لا يحق لك التصويت.</p>
          <Button text="تمرير صامت للتمويه" onClick={() => handleVote(null)} variant="secondary" />
        </div>
      ) : (
        <div className="card fade-in">
          <p className="glitch-text">من تتهم بالخيانة؟</p>
          <div className="scroll-container" style={{ maxHeight: '50vh', overflowY: 'auto', width: '100%', marginTop: '15px' }}>
            {players.filter(p => p.isAlive && p.id !== currentVoter.id).map(target => (
              <Button key={target.id} text={`اتهام ${target.name}`} onClick={() => handleVote(target.id)} variant="danger" />
            ))}
            <Button text="امتناع عن التصويت" onClick={() => handleVote(null)} variant="secondary" />
          </div>
        </div>
      )}
    </div>
  );
};

// ==========================================
// 9. شاشة فرز الأصوات السينمائية
// ==========================================
export const VoteRevealPhase = ({ accusedPlayer, isTie, onProceed }) => {
  const [revealed, setRevealed] = useState(false);

  useEffect(() => {
    playSFX('drumroll');
    const timer = setTimeout(() => {
      playSFX(isTie ? 'gasp' : 'gavel');
      setRevealed(true);
    }, 4000); 
    return () => clearTimeout(timer);
  }, [isTie]);

  return (
    <div className="center-content card">
      {!revealed ? (
        <div className="heartbeat">
          <h1 style={{fontSize: '5rem'}}>⚖️</h1>
          <h2 className="typewriter-text" style={{ marginTop: '20px' }}>المدينة تتحدث...<br/>جاري الفرز...</h2>
        </div>
      ) : (
        <div className="fade-in">
          {isTie || !accusedPlayer ? (
            <>
              <h1 style={{ color: 'var(--primary-gold)' }}>تعادل!</h1>
              <p>اختلفت الآراء ولم تتفق المدينة على متهم محدد.</p>
              <Button text="إلغاء المحكمة والعودة للنوم" onClick={onProceed} />
            </>
          ) : (
            <>
              <h1 className="glitch-text" style={{ color: 'var(--bright-red)', fontSize: '2rem' }}>الأغلبية تتهم</h1>
              <h2 style={{ fontSize: '3rem', margin: '20px 0' }}>{accusedPlayer.name}</h2>
              <Button text="إرساله لمنصة الدفاع" onClick={onProceed} variant="danger" />
            </>
          )}
        </div>
      )}
    </div>
  );
};

// ==========================================
// 10. منصة الدفاع (The Last Stand)
// ==========================================
export const DefensePhase = ({ accusedPlayer, onDefenseEnd }) => {
  const [timeLeft, setTimeLeft] = useState(30);

  useEffect(() => {
    if (timeLeft <= 0) {
      onDefenseEnd();
      return;
    }
    const timer = setInterval(() => setTimeLeft(prev => prev - 1), 1000);
    return () => clearInterval(timer);
  }, [timeLeft, onDefenseEnd]);

  return (
    <div className="center-content card blood-glow fade-in" style={{ position: 'relative', overflow: 'hidden' }}>
      <div style={{ position: 'absolute', top: '-10px', left: '0', right: '0', opacity: 0.2 }}>
        <NooseSVG />
      </div>
      <h1 style={{ color: 'var(--crimson-red)', fontSize: '2rem', position: 'relative', zIndex: 2 }}>الكلمة الأخيرة</h1>
      <h2 style={{ fontSize: '2.5rem', margin: '10px 0', position: 'relative', zIndex: 2 }}>{accusedPlayer.name}</h2>
      <p style={{ color: 'var(--text-main)', position: 'relative', zIndex: 2 }}>تحدث الآن! أقنعهم ببراءتك قبل تنفيذ الحكم.</p>
      <h2 style={{ fontSize: '6rem', fontFamily: 'monospace', color: 'var(--bright-red)', margin: '15px 0', position: 'relative', zIndex: 2 }}>
        {timeLeft}
      </h2>
      <Button text="تنفيذ الإعدام فوراً" onClick={onDefenseEnd} variant="danger" style={{ position: 'relative', zIndex: 2 }} />
    </div>
  );
};

// ==========================================
// Helper: اسم الدور بالعربي
// ==========================================
function getRoleName(role) {
  switch(role) {
    case ROLES.MAFIA: return "زعيم المافيا 🔪";
    case ROLES.DOCTOR: return "طبيب المدينة 💉";
    case ROLES.DETECTIVE: return "المحقق 🕵️‍♂️";
    default: return "مواطن صالح 👷";
  }
}
