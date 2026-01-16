import React, { useState, useEffect } from 'react';
import { SetupScreen, NightPhase, DayResult, VotingPhase } from './ui/Screens';
import { Button, PassDeviceScreen } from './ui/Components';
import { 
  PHASES, ROLES, 
  distributeRoles, createNightQueue, checkWinCondition 
} from './logic/gameEngine';

function App() {
  // ==========================================
  // 1. Game State (حالة اللعبة)
  // ==========================================
  const [phase, setPhase] = useState(PHASES.SETUP);
  const [players, setPlayers] = useState([]);
  const [nightQueue, setNightQueue] = useState([]);
  
  // تتبع أحداث الليلة (من قتل من؟ من عالج من؟)
  const [nightActions, setNightActions] = useState({ mafiaTarget: null, doctorTarget: null });
  
  // نتيجة الصباح (اسم المقتول أو null)
  const [morningVictim, setMorningVictim] = useState(null);
  
  // المتهم في التصويت
  const [suspect, setSuspect] = useState(null);
  const [winner, setWinner] = useState(null);

  // ==========================================
  // 2. Handlers (التحكم في اللعبة)
  // ==========================================

  // --- بدء اللعبة ---
  const handleStartGame = (names) => {
    const newPlayers = distributeRoles(names);
    setPlayers(newPlayers);
    startNight(newPlayers);
  };

  // --- بدء الليل ---
  const startNight = (currentPlayers) => {
    // تجهيز طابور عشوائي لليل
    const queue = createNightQueue(currentPlayers);
    setNightQueue(queue);
    setNightActions({ mafiaTarget: null, doctorTarget: null });
    setPhase(PHASES.NIGHT_TURN);
  };

  // --- استلام أكشن من لاعب في الليل ---
  const handleNightAction = (player, targetId) => {
    // تحديث حالة الطبيب إذا عالج نفسه
    if (player.role === ROLES.DOCTOR && player.id === targetId) {
      setPlayers(prev => prev.map(p => p.id === player.id ? { ...p, hasSelfHealed: true } : p));
    }

    // تسجيل الأكشن
    setNightActions(prev => {
      const newActions = { ...prev };
      if (player.role === ROLES.MAFIA) newActions.mafiaTarget = targetId; // آخر مافيا يقرر
      if (player.role === ROLES.DOCTOR) newActions.doctorTarget = targetId;
      return newActions;
    });
  };

  // --- نهاية الليل وحساب النتائج ---
  const handleNightEnd = () => {
    const { mafiaTarget, doctorTarget } = nightActions;
    let victimName = null;

    // المنطق: هل نجح القتل؟
    if (mafiaTarget !== null) {
      if (mafiaTarget !== doctorTarget) {
        // القتل نجح
        const victimIndex = players.findIndex(p => p.id === mafiaTarget);
        victimName = players[victimIndex].name;
        
        // تحديث اللاعب ليصبح ميت
        const updatedPlayers = players.map(p => 
          p.id === mafiaTarget ? { ...p, isAlive: false } : p
        );
        setPlayers(updatedPlayers);

        // التحقق من الفوز فوراً
        const winResult = checkWinCondition(updatedPlayers);
        if (winResult) {
          setWinner(winResult);
          setPhase(PHASES.GAME_OVER);
          return;
        }
      } else {
        // الطبيب أنقذه! (ليلة هادئة)
        // لا نفعل شيئاً، victimName يبقى null
      }
    }

    setMorningVictim(victimName);
    setPhase(PHASES.DAY_RESULT);
  };

  // --- التعامل مع نتائج التصويت ---
  const handleVoteComplete = (votes) => {
    // حساب الأصوات
    let maxVotes = 0;
    let topCandidateId = null;
    let isTie = false;

    Object.entries(votes).forEach(([id, count]) => {
      if (count > maxVotes) {
        maxVotes = count;
        topCandidateId = id;
        isTie = false;
      } else if (count === maxVotes) {
        isTie = true; // تعادل
      }
    });

    if (isTie || topCandidateId === null) {
      alert("تعادل في الأصوات! الجميع يذهب للنوم.. 😴");
      startNight(players);
    } else {
      // وجدنا متهماً
      const suspectPlayer = players.find(p => p.id === parseInt(topCandidateId));
      setSuspect(suspectPlayer);
      setPhase(PHASES.EXECUTION);
    }
  };

  // --- تنفيذ الإعدام ---
  const executeSuspect = (shouldExecute) => {
    if (shouldExecute) {
      // قتل المتهم
      const updatedPlayers = players.map(p => 
        p.id === suspect.id ? { ...p, isAlive: false } : p
      );
      setPlayers(updatedPlayers);
      
      const winResult = checkWinCondition(updatedPlayers);
      if (winResult) {
        setWinner(winResult);
        setPhase(PHASES.GAME_OVER);
      } else {
        startNight(updatedPlayers);
      }
    } else {
      // العفو عنه
      alert("تم العفو عن المتهم! يحل الظلام..");
      startNight(players);
    }
  };

  // ==========================================
  // 3. Rendering (عرض الشاشات حسب المرحلة)
  // ==========================================
  return (
    <div className="App">
      {/* 1. شاشة الإعداد */}
      {phase === PHASES.SETUP && (
        <SetupScreen onStartGame={handleStartGame} />
      )}

      {/* 2. شاشة الليل (حلقة التمرير) */}
      {phase === PHASES.NIGHT_TURN && (
        <NightPhase 
          queue={nightQueue} 
          players={players} 
          onAction={handleNightAction}
          onNightEnd={handleNightEnd}
        />
      )}

      {/* 3. شاشة الصباح (النتيجة) */}
      {phase === PHASES.DAY_RESULT && (
        <DayResult 
          killedPlayerName={morningVictim} 
          onStartDiscussion={() => setPhase(PHASES.DISCUSSION)} 
        />
      )}

      {/* 4. شاشة النقاش (مؤقت) */}
      {phase === PHASES.DISCUSSION && (
        <div className="center-content">
          <h1>🗣️ وقت النقاش</h1>
          <p>لديك 3 دقائق لإقناع الآخرين..</p>
          {/* يمكنك إضافة عداد تنازلي هنا لاحقاً */}
          <Button text="انتهى النقاش -> التصويت" onClick={() => setPhase(PHASES.VOTING)} />
        </div>
      )}

      {/* 5. شاشة التصويت */}
      {phase === PHASES.VOTING && (
        <VotingPhase players={players} onVoteComplete={handleVoteComplete} />
      )}

      {/* 6. شاشة الإعدام (الحكم النهائي) */}
      {phase === PHASES.EXECUTION && (
        <div className="center-content">
          <h1 style={{color: 'red'}}>المتهم: {suspect?.name}</h1>
          <p>لديه 30 ثانية للدفاع عن نفسه...</p>
          <h2>هل نعدمه؟</h2>
          <Button text="👍 نعم، إعدام" onClick={() => executeSuspect(true)} variant="danger" />
          <Button text="👎 لا، عفو" onClick={() => executeSuspect(false)} variant="secondary" />
        </div>
      )}

      {/* 7. شاشة نهاية اللعبة */}
      {phase === PHASES.GAME_OVER && (
        <div className="center-content">
          <h1 style={{fontSize: '4rem'}}>🏆</h1>
          <h1>فاز فريق {winner === 'mafia' ? "المافيا 😈" : "المدينة 👮‍♂️"}!</h1>
          <div style={{textAlign: 'right', width: '100%', marginTop: '20px'}}>
            <h3>كشف الأدوار:</h3>
            {players.map(p => (
              <div key={p.id} style={{borderBottom: '1px solid #333', padding: '10px'}}>
                {p.name} - <span style={{color: p.role === ROLES.MAFIA ? 'red' : 'white'}}>{p.role}</span>
              </div>
            ))}
          </div>
          <Button text="لعبة جديدة" onClick={() => setPhase(PHASES.SETUP)} />
        </div>
      )}
    </div>
  );
}

export default App;
