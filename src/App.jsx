import React, { useState } from 'react';
import { SetupScreen, NightPhase, DayResult, VotingPhase } from './ui/Screens';
import { 
  PHASES, 
  ROLES, 
  distributeRoles, 
  createNightQueue, 
  resolveNight, 
  resolveVoting, 
  checkWinCondition 
} from './logic/gameEngine';

function App() {
  // الحالات الأساسية للعبة
  const [phase, setPhase] = useState(PHASES.SETUP);
  const [players, setPlayers] = useState([]);
  const [nightQueue, setNightQueue] = useState([]);
  const [nightActions, setNightActions] = useState({ mafiaTargetId: null, doctorTargetId: null });
  
  // حالات مؤقتة لعرض النتائج
  const [killedLastNight, setKilledLastNight] = useState(null);
  const [executionMsg, setExecutionMsg] = useState(null);
  const [winner, setWinner] = useState(null);

  // ==========================================
  // 1. بدء اللعبة وتوزيع الأدوار
  // ==========================================
  const handleStartGame = (names) => {
    const newPlayers = distributeRoles(names);
    setPlayers(newPlayers);
    startNight(newPlayers);
  };

  // ==========================================
  // 2. تجهيز وبدء طابور الليل
  // ==========================================
  const startNight = (currentPlayers) => {
    setNightQueue(createNightQueue(currentPlayers));
    setNightActions({ mafiaTargetId: null, doctorTargetId: null });
    setPhase(PHASES.NIGHT_TURN);
  };

  // ==========================================
  // 3. تسجيل خيارات الليل
  // ==========================================
  const handleNightAction = (player, targetId) => {
    if (player.role === ROLES.MAFIA) {
      setNightActions(prev => ({ ...prev, mafiaTargetId: targetId }));
    } else if (player.role === ROLES.DOCTOR) {
      setNightActions(prev => ({ ...prev, doctorTargetId: targetId }));
    }
  };

  // ==========================================
  // 4. نهاية الليل ومعالجة الأحداث
  // ==========================================
  const handleNightEnd = () => {
    const { updatedPlayers, killedPlayer } = resolveNight(players, nightActions);
    setPlayers(updatedPlayers);
    setKilledLastNight(killedPlayer ? killedPlayer.name : null);

    // هل فاز أحد؟
    const winStatus = checkWinCondition(updatedPlayers);
    if (winStatus) {
      setWinner(winStatus);
      setPhase(PHASES.GAME_OVER);
    } else {
      setPhase(PHASES.DAY_RESULT);
    }
  };

  // ==========================================
  // 5. نهاية التصويت ومعالجة الإعدام
  // ==========================================
  const handleVoteComplete = (votes) => {
    const { updatedPlayers, executedPlayer, isTie } = resolveVoting(players, votes);
    setPlayers(updatedPlayers);

    // تجهيز رسالة الإعدام
    let msg = "لم يتم إعدام أحد.";
    if (isTie) {
      msg = "تعادلت الأصوات! لن يتم إعدام أحد اليوم.";
    } else if (executedPlayer) {
      msg = `بناءً على تصويت الأغلبية، تم إعدام: ${executedPlayer.name} 💀`;
    }
    
    setExecutionMsg(msg);

    // هل فاز أحد بعد الإعدام؟
    const winStatus = checkWinCondition(updatedPlayers);
    if (winStatus) {
      setWinner(winStatus);
    }
    
    // الانتقال لشاشة الإعدام المؤقتة
    setPhase(PHASES.EXECUTION);
  };

  // إغلاق شاشة الإعدام والانتقال لليل أو إنهاء اللعبة
  const closeExecution = () => {
    if (winner) {
      setPhase(PHASES.GAME_OVER);
    } else {
      startNight(players); // بدء ليلة جديدة
    }
  };

  // ==========================================
  // 6. إعادة اللعب
  // ==========================================
  const resetGame = () => {
    setPhase(PHASES.SETUP);
    setPlayers([]);
    setWinner(null);
  };

  // ==========================================
  // واجهة المستخدم المركزية (Router)
  // ==========================================
  return (
    <div style={{ width: '100%', height: '100%', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
      
      {phase === PHASES.SETUP && (
        <SetupScreen onStartGame={handleStartGame} />
      )}
      
      {phase === PHASES.NIGHT_TURN && (
        <NightPhase 
          queue={nightQueue} 
          players={players} 
          onAction={handleNightAction} 
          onNightEnd={handleNightEnd} 
        />
      )}

      {phase === PHASES.DAY_RESULT && (
        <DayResult 
          killedPlayerName={killedLastNight} 
          onStartDiscussion={() => setPhase(PHASES.VOTING)} 
        />
      )}

      {phase === PHASES.VOTING && (
        <VotingPhase 
          players={players} 
          onVoteComplete={handleVoteComplete} 
        />
      )}

      {/* شاشة الإعدام (النتيجة بعد التصويت) */}
      {phase === PHASES.EXECUTION && (
        <div className="center-content fade-in card">
          <h1 style={{ fontSize: '3rem' }}>⚖️ قرار المدينة</h1>
          <h2 className="typewriter-text" style={{ lineHeight: '1.6', margin: '20px 0' }}>{executionMsg}</h2>
          <button className="btn btn-primary" onClick={closeExecution}>
            {winner ? "عرض النتيجة النهائية" : "العودة للنوم 🌃"}
          </button>
        </div>
      )}

      {/* شاشة النهاية */}
      {phase === PHASES.GAME_OVER && (
        <div className="center-content fade-in card">
          <h1 style={{ fontSize: '5rem', marginBottom: '10px' }}>
            {winner === 'mafia' ? '🕶️' : '🕊️'}
          </h1>
          <h1 style={{ color: winner === 'mafia' ? 'var(--accent-pink)' : 'var(--primary-color)' }}>
            {winner === 'mafia' ? 'انتصرت المافيا!' : 'انتصر المواطنون!'}
          </h1>
          <p style={{ margin: '20px 0' }}>انتهت اللعبة، لقد تم حسم المعركة.</p>
          <button className="btn" onClick={resetGame}>لعب مرة أخرى 🔄</button>
        </div>
      )}

    </div>
  );
}

export default App;
