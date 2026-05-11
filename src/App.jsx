import React, { useState } from 'react';
import { 
  SetupScreen, 
  RoleRevealPhase,
  FirstDayIntro,
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
  NARRATOR,
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
  const [savedByDoctor, setSavedByDoctor] = useState(false);
  const [accusedPlayer, setAccusedPlayer] = useState(null);
  const [isTie, setIsTie] = useState(false);
  const [winner, setWinner] = useState(null);
  const [executionMsg, setExecutionMsg] = useState("");

  // ==========================================
  // 1. بدء اللعبة (توزيع الأدوار والتمرير الأول)
  // ==========================================
  const handleStartGame = (names) => {
    const newPlayers = distributeRoles(names);
    setPlayers(newPlayers);
    // نجهز طابور التمرير لمعرفة الأدوار
    setNightQueue(createNightQueue(newPlayers)); 
    setPhase(PHASES.ROLE_REVEAL); 
  };

  // ==========================================
  // 2. بعد كشف الأدوار -> التعارف المريب
  // ==========================================
  const handleRevealComplete = () => {
    setPhase(PHASES.FIRST_DAY_INTRO);
  };

  // ==========================================
  // 3. بعد التعارف -> شاشة الراوي (الليل)
  // ==========================================
  const handleIntroComplete = () => {
    setPhase(PHASES.NIGHT_TRANSITION);
  };

  // ==========================================
  // 4. تجهيز وبدء طابور الليل للعب
  // ==========================================
  const startNight = () => {
    setNightQueue(createNightQueue(players));
    setNightActions({ mafiaTargetId: null, doctorTargetId: null });
    setPhase(PHASES.NIGHT_TURN);
  };

  // ==========================================
  // 5. تسجيل خيارات الليل
  // ==========================================
  const handleNightAction = (player, targetId) => {
    if (player.role === ROLES.MAFIA) {
      setNightActions(prev => ({ ...prev, mafiaTargetId: targetId }));
    } else if (player.role === ROLES.DOCTOR) {
      setNightActions(prev => ({ ...prev, doctorTargetId: targetId }));
    }
  };

  // ==========================================
  // 6. نهاية الليل وإعلان الصباح
  // ==========================================
  const handleNightEnd = () => {
    const { updatedPlayers, killedPlayer, savedByDoctor: isSaved } = resolveNight(players, nightActions);
    setPlayers(updatedPlayers);
    setKilledLastNight(killedPlayer ? killedPlayer.name : null);
    setSavedByDoctor(isSaved);

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
  // 7. نهاية التصويت والفرز
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
  // 8. نهاية الدفاع وتنفيذ الإعدام
  // ==========================================
  const handleDefenseEnd = () => {
    const { updatedPlayers, executedPlayer } = executePlayer(players, accusedPlayer.id);
    setPlayers(updatedPlayers);
    
    // جلب نص درامي عشوائي للإعدام
    setExecutionMsg(NARRATOR.getExecutionMessage(executedPlayer.name));

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
  // 9. إعادة اللعب
  // ==========================================
  const resetGame = () => {
    setPhase(PHASES.SETUP);
    setPlayers([]);
    setWinner(null);
    setAccusedPlayer(null);
    setSavedByDoctor(false);
  };

  // ==========================================
  // واجهة المستخدم المركزية (Game Router)
  // ==========================================
  return (
    <div style={{ width: '100%', height: '100%', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
      
      {phase === PHASES.SETUP && (
        <SetupScreen onStartGame={handleStartGame} />
      )}

      {/* اليوم الصفر: كشف الأدوار */}
      {phase === PHASES.ROLE_REVEAL && (
        <RoleRevealPhase queue={nightQueue} onRevealComplete={handleRevealComplete} />
      )}

      {/* اليوم الصفر: التعارف المريب */}
      {phase === PHASES.FIRST_DAY_INTRO && (
        <FirstDayIntro onTimeUp={handleIntroComplete} />
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
          savedByDoctor={savedByDoctor}
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
        <div className="center-content fade-in card blood-glow">
          <h1 className="glitch-text" style={{ fontSize: '3rem', color: 'var(--crimson-red)' }}>تم الإعدام</h1>
          <h2 className="typewriter-text" style={{ lineHeight: '1.6', margin: '20px 0', fontSize: '1.5rem', color: 'white' }}>
            {executionMsg}
          </h2>
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
