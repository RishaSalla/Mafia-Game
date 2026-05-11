import React, { useState, useEffect } from 'react';
import { Button, HoldToRevealBtn, PassDeviceScreen, RoleIcon } from './Components';
import { ROLES } from '../logic/gameEngine';

// ==========================================
// Sound Helper (نظام الصوت المبدئي)
// ==========================================
const playSFX = (soundName) => {
  // هذه الدالة جاهزة للعمل بمجرد إضافة الأصوات لمجلد public
  // مثلاً: /sounds/gavel.mp3
  try {
    // const audio = new Audio(`/sounds/${soundName}.mp3`);
    // audio.play();
  } catch (error) {
    console.log("Audio not loaded yet");
  }
};

// ==========================================
// 1. شاشة الإعداد (Setup Screen)
// ==========================================
export const SetupScreen = ({ onStartGame }) => {
  const [names, setNames] = useState(["", "", "", ""]); // 4 لاعبين مبدئياً

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
      <h1>لعبة المافيا</h1>
      <h2 style={{ color: 'var(--text-dim)' }}>إعداد اللاعبين</h2>
      <div className="scroll-container" style={{ width: '100%', maxHeight: '50vh', overflowY: 'auto', padding: '10px' }}>
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
      <Button text="بدء الجلسة الساحقة" onClick={startGame} />
    </div>
  );
};

// ==========================================
// 2. شاشات الراوي (Transitions)
// ==========================================
export const NightTransition = ({ onProceed }) => {
  useEffect(() => { playSFX('night_wind'); }, []);
  return (
    <div className="center-content card fade-in">
      <h1 style={{ fontSize: '4rem', color: '#555' }}>🌃</h1>
      <h2 className="typewriter-text" style={{ lineHeight: '1.8' }}>
        "الشمس تغيب، والظلال تطول..<br/> فليغمض الجميع أعينهم،<br/> وليبدأ تمرير الجوال سراً."
      </h2>
      <Button text="بدء التمرير" onClick={onProceed} />
    </div>
  );
};

// ==========================================
// 3. شاشة الليل (Night Loop)
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
          
          <div className="scroll-container" style={{ width: '100%', marginTop: '20px', maxHeight: '50vh', overflowY: 'auto' }}>
            
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
// 4. شاشة الصباح (إعلان النتائج)
// ==========================================
export const DayResult = ({ killedPlayerName, onStartDiscussion }) => {
  useEffect(() => { playSFX(killedPlayerName ? 'rooster_shock' : 'rooster'); }, []);
  return (
    <div className="center-content card fade-in" style={{ borderColor: killedPlayerName ? 'var(--crimson-red)' : 'var(--primary-gold)' }}>
      <h1 style={{ fontSize: '5rem', margin: 0 }}>{killedPlayerName ? "💀" : "🌅"}</h1>
      <h2 className="typewriter-text" style={{ color: 'white', lineHeight: '1.8', margin: '20px 0' }}>
        {killedPlayerName ? `استيقظت المدينة على فاجعة...\nلقد تم اغتيال [ ${killedPlayerName} ] الليلة الماضية.` : "أشرقت الشمس.. ليلة هادئة وسلام يعم المدينة!"}
      </h2>
      <Button text="بدء المحكمة" onClick={onStartDiscussion} variant={killedPlayerName ? "danger" : "primary"} />
    </div>
  );
};

// ==========================================
// 5. مؤقت النقاش (Discussion Timer)
// ==========================================
export const DiscussionPhase = ({ onTimeUp }) => {
  const [timeLeft, setTimeLeft] = useState(120); // دقيقتين للنقاش

  useEffect(() => {
    if (timeLeft <= 0) {
      playSFX('gavel'); // ضربة المطرقة
      onTimeUp();
      return;
    }
    const timer = setInterval(() => setTimeLeft(prev => prev - 1), 1000);
    if (timeLeft === 10) playSFX('clock_ticking'); // صوت التكتكة في آخر 10 ثواني
    
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
// 6. شاشة التصويت (Voting Loop)
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
// 7. شاشة فرز الأصوات السينمائية
// ==========================================
export const VoteRevealPhase = ({ accusedPlayer, isTie, onProceed }) => {
  const [revealed, setRevealed] = useState(false);

  useEffect(() => {
    playSFX('drumroll');
    const timer = setTimeout(() => {
      playSFX(isTie ? 'gasp' : 'gavel');
      setRevealed(true);
    }, 4000); // 4 ثواني من التوتر
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
// 8. منصة الدفاع (The Last Stand)
// ==========================================
export const DefensePhase = ({ accusedPlayer, onDefenseEnd }) => {
  const [timeLeft, setTimeLeft] = useState(30); // 30 ثانية للدفاع

  useEffect(() => {
    if (timeLeft <= 0) {
      onDefenseEnd();
      return;
    }
    const timer = setInterval(() => setTimeLeft(prev => prev - 1), 1000);
    return () => clearInterval(timer);
  }, [timeLeft, onDefenseEnd]);

  return (
    <div className="center-content card blood-glow fade-in">
      <h1 style={{ color: 'var(--crimson-red)', fontSize: '2rem' }}>الكلمة الأخيرة</h1>
      <h2 style={{ fontSize: '2.5rem', margin: '10px 0' }}>{accusedPlayer.name}</h2>
      <p style={{ color: 'var(--text-main)' }}>تحدث الآن! أقنعهم ببراءتك قبل تنفيذ الحكم.</p>
      <h2 style={{ fontSize: '6rem', fontFamily: 'monospace', color: 'var(--bright-red)', margin: '15px 0' }}>
        {timeLeft}
      </h2>
      <Button text="تنفيذ الإعدام فوراً" onClick={onDefenseEnd} variant="danger" />
    </div>
  );
};

// ==========================================
// 9. Helper: اسم الدور بالعربي
// ==========================================
function getRoleName(role) {
  switch(role) {
    case ROLES.MAFIA: return "زعيم المافيا 🔪";
    case ROLES.DOCTOR: return "طبيب المدينة 💉";
    case ROLES.DETECTIVE: return "المحقق 🕵️‍♂️";
    default: return "مواطن صالح 👷";
  }
}
