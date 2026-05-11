import React, { useState } from 'react';
import { 
  SetupScreen, 
  NightTransition, 
  NightPhase, 
  DayResult, 
  DiscussionPhase, 
  VotingPhase, 
  VoteRevealPhase, 
  DefensePhase 
} from './ui/Screens';
import { 
  PHASES, 
  ROLES, 
  distributeRoles, 
  createNightQueue, 
  resolveNight, 
  resolveVoting,
  executePlayer, 
  checkWinCondition 
} from './logic/gameEngine';

function App() {
  // الحالات الأساسية للعبة
  const [phase, setPhase] = useState(PHASES.SETUP);
  const [players, setPlayers] = useState([]);
  const [nightQueue, setNightQueue] = useState([]);
  const [nightActions, setNightActions] = useState({ mafiaTargetId: null, doctorTargetId: null });
  
  // حالات مؤقتة لعرض النتائج الدرامية
  const [killedLastNight, setKilledLastNight] = useState(null);
  const [accusedPlayer, setAccusedPlayer] = useState(null);
  const [isTie, setIsTie] = useState(false);
  const [winner, setWinner] = useState(null);

  // ==========================================
  // 1. بدء اللعبة
  // ==========================================
  const handleStartGame = (names) => {
    const newPlayers = distributeRoles(names);
    setPlayers(newPlayers);
    setPhase(PHASES.NIGHT_TRANSITION); // الذهاب لشاشة الراوي أولاً
  };

  // ==========================================
  // 2. تجهيز وبدء طابور الليل
  // ==========================================
  const startNight = () => {
    setNightQueue(createNightQueue(players));
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
  // 4. نهاية الليل وإعلان الصباح
  // ==========================================
  const handleNightEnd = () => {
    const { updatedPlayers, killedPlayer } = resolveNight(players, nightActions);
    setPlayers(updatedPlayers);
    setKilledLastNight(killedPlayer ? killedPlayer.name : null);

    // هل فاز أحد بعد القتل الليلي؟
    const winStatus = checkWinCondition(updatedPlayers);
    if (winStatus) {
      setWinner(winStatus);
      setPhase(PHASES.GAME_OVER);
    } else {
      setPhase(PHASES.DAY_RESULT);
    }
  };

  // ==========================================
  // 5. نهاية التصويت والفرز
  // ==========================================
  const handleVoteComplete = (votes) => {
    const { accusedPlayer, isTie } = resolveVoting(players, votes);
    setAccusedPlayer(accusedPlayer);
    setIsTie(isTie);
    setPhase(PHASES.VOTE_REVEAL); // الذهاب للفرز البطيء للتشويق
  };

  // قرار ما بعد الفرز (إما دفاع أو عودة للنوم)
  const handleRevealProceed = () => {
    if (isTie || !accusedPlayer) {
      // تعادل = لا إعدام = ليلة جديدة
      setPhase(PHASES.NIGHT_TRANSITION);
    } else {
      // يوجد متهم = منصة الدفاع
      setPhase(PHASES.DEFENSE);
    }
  };

  // ==========================================
  // 6. نهاية الدفاع وتنفيذ الإعدام
  // ==========================================
  const handleDefenseEnd = () => {
    const { updatedPlayers, executedPlayer } = executePlayer(players, accusedPlayer.id);
    setPlayers(updatedPlayers);

    // هل فاز أحد بعد الإعدام؟
    const winStatus = checkWinCondition(updatedPlayers);
    if (winStatus) {
      setWinner(winStatus);
    }
    
    setPhase(PHASES.EXECUTION);
  };

  const closeExecution = () => {
    if (winner) {
      setPhase(PHASES.GAME_OVER);
    } else {
      setPhase(PHASES.NIGHT_TRANSITION); // ليلة جديدة
    }
  };

  // ==========================================
  // 7. إعادة اللعب
  // ==========================================
  const resetGame = () => {
    setPhase(PHASES.SETUP);
    setPlayers([]);
    setWinner(null);
    setAccusedPlayer(null);
  };

  // ==========================================
  // واجهة المستخدم المركزية (Game Router)
  // ==========================================
  return (
    <div style={{ width: '100%', height: '100%', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
      
      {phase === PHASES.SETUP && (
        <SetupScreen onStartGame={handleStartGame} />
      )}

      {phase === PHASES.NIGHT_TRANSITION && (
        <NightTransition onProceed={startNight} />
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
          onStartDiscussion={() => setPhase(PHASES.DISCUSSION)} 
        />
      )}

      {phase === PHASES.DISCUSSION && (
        <DiscussionPhase onTimeUp={() => setPhase(PHASES.VOTING)} />
      )}

      {phase === PHASES.VOTING && (
        <VotingPhase 
          players={players} 
          onVoteComplete={handleVoteComplete} 
        />
      )}

      {phase === PHASES.VOTE_REVEAL && (
        <VoteRevealPhase 
          accusedPlayer={accusedPlayer}
          isTie={isTie}
          onProceed={handleRevealProceed} 
        />
      )}

      {phase === PHASES.DEFENSE && (
        <DefensePhase 
          accusedPlayer={accusedPlayer}
          onDefenseEnd={handleDefenseEnd} 
        />
      )}

      {/* شاشة الإعدام */}
      {phase === PHASES.EXECUTION && (
        <div className="center-content fade-in card">
          <h1 className="glitch-text" style={{ fontSize: '3rem', color: 'var(--crimson-red)' }}>تم الإعدام</h1>
          <h2 style={{ lineHeight: '1.6', margin: '20px 0' }}>لقد تم إعدام المتهم:<br/><span style={{color: 'var(--primary-gold)', fontSize: '2rem'}}>{accusedPlayer?.name}</span> 💀</h2>
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
          <h1 className="glitch-text" style={{ color: winner === 'mafia' ? 'var(--crimson-red)' : 'var(--primary-gold)' }}>
            {winner === 'mafia' ? 'انتصرت المافيا!' : 'انتصر المواطنون!'}
          </h1>
          <p style={{ margin: '20px 0' }}>انتهت اللعبة، لقد تم حسم المعركة.</p>
          <button className="btn" onClick={resetGame}>بدء جلسة جديدة 🔄</button>
        </div>
      )}

    </div>
  );
}

export default App;
