import React, { useState, useEffect } from 'react';
import { Button, HoldToRevealBtn, PassDeviceScreen, RoleIcon } from './Components';
import { ROLES } from '../logic/gameEngine';

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
    if (validNames.length < 4) return alert("تحتاج 4 لاعبين على الأقل!");
    onStartGame(validNames);
  };

  return (
    <div className="center-content">
      <h1>لعبة المافيا</h1>
      <h2>إعداد اللاعبين</h2>
      <div style={{ width: '100%', maxHeight: '60vh', overflowY: 'auto' }}>
        {names.map((name, i) => (
          <input
            key={i}
            className="input-field"
            placeholder={`اسم اللاعب ${i + 1}`}
            value={name}
            onChange={(e) => handleNameChange(i, e.target.value)}
            style={{ marginBottom: '10px' }}
          />
        ))}
      </div>
      <Button text="+ إضافة لاعب" onClick={addPlayer} variant="secondary" />
      <Button text="ابدأ اللعبة" onClick={startGame} />
    </div>
  );
};

// ==========================================
// 2. شاشة الليل (Night Loop) - الأخطر والأعقد
// ==========================================
export const NightPhase = ({ queue, players, onAction, onNightEnd }) => {
  const [turnIndex, setTurnIndex] = useState(0);
  const [isReady, setIsReady] = useState(false); // هل اللاعب استلم الجهاز؟
  const [isRevealed, setIsRevealed] = useState(false); // هل يضغط مطولاً؟

  const currentPlayer = queue[turnIndex];
  // فلترة قائمة الأحياء فقط لاختيارهم كأهداف
  const aliveTargets = players.filter(p => p.isAlive && p.id !== currentPlayer.id);

  // الانتقال للاعب التالي
  const handleNext = (targetId = null) => {
    // تسجيل الأكشن (إرسال الهدف المختار للمحرك)
    onAction(currentPlayer, targetId);

    setIsReady(false);
    setIsRevealed(false);

    if (turnIndex + 1 < queue.length) {
      setTurnIndex(turnIndex + 1);
    } else {
      onNightEnd(); // انتهى طابور الليل
    }
  };

  // شاشة التمرير
  if (!isReady) {
    return <PassDeviceScreen nextPlayerName={currentPlayer.name} onReady={() => setIsReady(true)} />;
  }

  // شاشة الدور (الضغط المطول)
  return (
    <div className="center-content">
      {!isRevealed ? (
        <>
          <h2>دور: {currentPlayer.name}</h2>
          <HoldToRevealBtn 
            onRevealStart={() => setIsRevealed(true)} 
            onRevealEnd={() => setIsRevealed(false)} 
          />
        </>
      ) : (
        <div className="role-card">
          <RoleIcon role={currentPlayer.role} />
          <h2 style={{color: 'var(--accent-gold)'}}>
            {currentPlayer.isAlive ? "أنت " + getRoleName(currentPlayer.role) : "أنت ميت 💀"}
          </h2>
          
          {/* محتوى الدور بناءً على الحالة والوظيفة */}
          <div style={{ width: '100%', marginTop: '20px' }}>
            
            {/* 1. إذا كان ميت أو مواطن: أزرار وهمية */}
            {(!currentPlayer.isAlive || currentPlayer.role === ROLES.CITIZEN) && (
              <>
                <p>المدينة نائمة.. انتظر قليلاً للتمويه</p>
                <Button text="تأمين المنزل 🔒" onClick={() => setTimeout(() => handleNext(null), 2000)} />
              </>
            )}

            {/* 2. إذا كان مافيا وحي */}
            {currentPlayer.isAlive && currentPlayer.role === ROLES.MAFIA && (
              <>
                <p style={{color: 'red'}}>اختر ضحية الليلة:</p>
                <div style={{display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px'}}>
                  {aliveTargets.map(p => (
                    <Button key={p.id} text={p.name} onClick={() => handleNext(p.id)} variant="danger" />
                  ))}
                </div>
              </>
            )}

            {/* 3. إذا كان طبيب وحي */}
            {currentPlayer.isAlive && currentPlayer.role === ROLES.DOCTOR && (
              <>
                <p style={{color: 'cyan'}}>اختر شخصاً لحمايته:</p>
                {players.filter(p => p.isAlive).map(p => (
                  <Button 
                    key={p.id} 
                    text={p.name + (p.id === currentPlayer.id ? " (أنت)" : "")} 
                    // التحقق من قاعدة علاج النفس مرة واحدة
                    disabled={p.id === currentPlayer.id && currentPlayer.hasSelfHealed}
                    onClick={() => handleNext(p.id)} 
                  />
                ))}
              </>
            )}

             {/* 4. إذا كان محقق وحي */}
             {currentPlayer.isAlive && currentPlayer.role === ROLES.DETECTIVE && (
              <>
                <p>اختر مشتبهاً به للكشف:</p>
                {aliveTargets.map(p => (
                  <Button 
                    key={p.id} 
                    text={`كشف ${p.name}`} 
                    onClick={() => alert(p.role === ROLES.MAFIA ? "⚠️ هذا الشخص مافيا!" : "✅ هذا الشخص بريء")} 
                    // ملاحظة: الـ alert هنا سيوقف التنفيذ حتى يضغط موافق، ثم يكمل
                    // يمكن استبداله بشاشة نتيجة داخلية لتحسين التجربة لاحقاً
                  />
                ))}
                <Button text="تخطيط (لا أريد الكشف)" onClick={() => handleNext(null)} />
              </>
            )}

          </div>
        </div>
      )}
    </div>
  );
};

// ==========================================
// 3. شاشة الصباح (إعلان النتائج)
// ==========================================
export const DayResult = ({ killedPlayerName, onStartDiscussion }) => (
  <div className="center-content" style={{ backgroundColor: killedPlayerName ? '#300' : '#111' }}>
    <h1 style={{ fontSize: '4rem' }}>{killedPlayerName ? "💀" : "🌅"}</h1>
    <h1>
      {killedPlayerName ? `استيقظنا على مقتل ${killedPlayerName}` : "أشرقت الشمس.. ليلة هادئة!"}
    </h1>
    <Button text="بدء النقاش" onClick={onStartDiscussion} />
  </div>
);

// ==========================================
// 4. شاشة التصويت (Voting Loop)
// ==========================================
export const VotingPhase = ({ players, onVoteComplete }) => {
  const [voterIndex, setVoterIndex] = useState(0);
  const [isReady, setIsReady] = useState(false);
  const [votes, setVotes] = useState({}); // { targetId: count }

  // تخطي الأموات في التصويت (أو جعلهم يصوتون وهمياً كما اتفقنا، هنا سأجعلهم يمررون فقط)
  const currentVoter = players[voterIndex];

  const handleVote = (targetId) => {
    if (targetId !== null) {
      setVotes(prev => ({ ...prev, [targetId]: (prev[targetId] || 0) + 1 }));
    }
    
    setIsReady(false);
    if (voterIndex + 1 < players.length) {
      setVoterIndex(voterIndex + 1);
    } else {
      onVoteComplete(votes); // إرسال النتائج للمحرك
    }
  };

  if (!isReady) {
    return <PassDeviceScreen nextPlayerName={currentVoter.name} onReady={() => setIsReady(true)} />;
  }

  return (
    <div className="center-content">
      <h2>التصويت: {currentVoter.name}</h2>
      <p>من تشك فيه؟ (سري)</p>
      <div style={{ maxHeight: '60vh', overflowY: 'auto', width: '100%' }}>
        {players.filter(p => p.isAlive && p.id !== currentVoter.id).map(target => (
          <Button key={target.id} text={`اتهام ${target.name}`} onClick={() => handleVote(target.id)} variant="danger" />
        ))}
        <Button text="امتناع عن التصويت" onClick={() => handleVote(null)} variant="secondary" />
      </div>
    </div>
  );
};

// ==========================================
// 5. Helper: اسم الدور بالعربي
// ==========================================
function getRoleName(role) {
  switch(role) {
    case ROLES.MAFIA: return "زعيم مافيا 🔪";
    case ROLES.DOCTOR: return "طبيب 💉";
    case ROLES.DETECTIVE: return "محقق 🕵️‍♂️";
    default: return "مواطن صالح 👷";
  }
}
