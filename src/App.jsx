import React, { useState } from 'react';
import { 
  MODES, 
  PHASES, 
  ROLES, 
  distributeRoles, 
  createNightQueue, 
  resolveNight, 
  resolveVoting, 
  executePlayer, 
  checkWinCondition 
} from './logic/gameEngine';
import { 
  MainMenuScreen, 
  SetupScreen, 
  RoleRevealScreen,
  FirstDayIntroScreen,
  GroupSleepScreen,
  GroupWakeScreen,
  NightTransitionScreen, 
  NightTurnScreen, 
  MorningSequenceScreen, 
  DiscussionScreen,
  VotingScreen, 
  DefenseScreen, 
  FinalDecisionScreen, 
  ExecutionScreen, 
  GameOverScreen 
} from './ui/Screens';
import './index.css';

export default function App() {
  const [mode, setMode] = useState(null);
  const [phase, setPhase] = useState(PHASES.SETUP);
  
  const [players, setPlayers] = useState([]);
  const [nightQueue, setNightQueue] = useState([]);
  const [currentNightIndex, setCurrentNightIndex] = useState(0);
  const [nightActions, setNightActions] = useState({ wills: {} });
  
  // سجل أحداث الصباح
  const [mafiaKill, setMafiaKill] = useState(null);
  const [vigilanteKill, setVigilanteKill] = useState(null);
  const [vigilanteSuicide, setVigilanteSuicide] = useState(false);
  const [savedByDoctor, setSavedByDoctor] = useState(false);
  const [deathWillMessage, setDeathWillMessage] = useState(null);
  
  // المحكمة والنهاية
  const [accusedPlayerToDefend, setAccusedPlayerToDefend] = useState(null);
  const [executedPlayer, setExecutedPlayer] = useState(null);
  const [winner, setWinner] = useState(null);
  const [jesterWon, setJesterWon] = useState(false);

  const startGame = () => {
    const initializedPlayers = distributeRoles(players, mode);
    setPlayers(initializedPlayers);
    setPhase(PHASES.ROLE_REVEAL); 
  };

  const startNight = (currentPlayers) => {
    const queue = createNightQueue(currentPlayers);
    setNightQueue(queue);
    setCurrentNightIndex(0);
    setNightActions({ wills: {} });
    setPhase(PHASES.NIGHT_TRANSITION);
  };

  const handleNightActionComplete = (actions) => {
    const currentPlayer = nightQueue[currentNightIndex];
    const newActions = { ...nightActions };
    
    if (currentPlayer.role === ROLES.MAFIA && actions.targetId) newActions.mafiaTargetId = actions.targetId;
    if (currentPlayer.role === ROLES.DOCTOR && actions.targetId) newActions.doctorTargetId = actions.targetId;
    if (currentPlayer.role === ROLES.VIGILANTE && actions.targetId) newActions.vigilanteTargetId = actions.targetId;
    if (actions.willTargetId) newActions.wills[currentPlayer.id] = actions.willTargetId;

    setNightActions(newActions);

    if (currentNightIndex < nightQueue.length - 1) {
      setCurrentNightIndex(currentNightIndex + 1);
      setPhase(PHASES.NIGHT_TRANSITION);
    } else {
      const result = resolveNight(players, newActions);
      setPlayers(result.updatedPlayers);
      setMafiaKill(result.mafiaKill);
      setVigilanteKill(result.vigilanteKill);
      setVigilanteSuicide(result.vigilanteSuicide);
      setSavedByDoctor(result.savedByDoctor);

      // استخراج الوصية إن وجدت
      let willMsg = null;
      if (result.mafiaKill && result.mafiaKill.deathWillTargetId !== null) {
        const target = result.updatedPlayers.find(p => p.id === result.mafiaKill.deathWillTargetId);
        if (target) willMsg = `أنا أشك في: [ ${target.name} ]`;
      }
      setDeathWillMessage(willMsg);
      
      // إذا فاز المختل برصاصة القناص
      if (result.jesterWon) {
         setJesterWon(true);
         setPhase(PHASES.GAME_OVER);
         return;
      }

      const win = checkWinCondition(result.updatedPlayers);
      if (win) {
        setWinner(win);
        setPhase(PHASES.GAME_OVER);
      } else {
        setPhase(PHASES.GROUP_WAKE);
      }
    }
  };

  const handleVoteComplete = (votes) => {
    const result = resolveVoting(players, votes);
    // إذا حصل شخص على أغلبية (النصف + 1)
    if (result.accusedPlayer && result.reachedThreshold) {
      setAccusedPlayerToDefend(result.accusedPlayer);
      setPhase(PHASES.DEFENSE);
    } else {
      // تشتت الأصوات أو امتناع
      setExecutedPlayer(null);
      setPhase(PHASES.EXECUTION);
    }
  };

  const handleDecisionComplete = (isGuilty) => {
    if (isGuilty && accusedPlayerToDefend) {
      const execResult = executePlayer(players, accusedPlayerToDefend.id);
      setPlayers(execResult.updatedPlayers);
      setExecutedPlayer(execResult.executedPlayer);
      
      // إذا تم إعدام المختل، يفوز فوراً
      if (execResult.jesterWon) {
         setJesterWon(true);
         setPhase(PHASES.GAME_OVER);
         return;
      }

      const win = checkWinCondition(execResult.updatedPlayers);
      if (win) {
        setWinner(win);
        setPhase(PHASES.GAME_OVER);
      } else {
        setPhase(PHASES.EXECUTION);
      }
    } else {
      // قرار بالبراءة
      setExecutedPlayer(null);
      setPhase(PHASES.EXECUTION);
    }
    setAccusedPlayerToDefend(null);
  };

  const handleRestart = () => {
    setMode(null);
    setPhase(PHASES.SETUP);
    setPlayers([]);
    setWinner(null);
    setJesterWon(false);
  };

  const handlePlayAgain = () => {
    const playerNames = players.map(p => p.name);
    const newPlayers = distributeRoles(playerNames, mode);
    setPlayers(newPlayers);
    
    setWinner(null);
    setJesterWon(false);
    setMafiaKill(null);
    setVigilanteKill(null);
    setVigilanteSuicide(false);
    setSavedByDoctor(false);
    setExecutedPlayer(null);
    setDeathWillMessage(null);
    setAccusedPlayerToDefend(null);
    
    setPhase(PHASES.ROLE_REVEAL); 
  };

  // تم مسح سطر التحقق القديم هنا، واللعبة ستبدأ مباشرة من القائمة الرئيسية بعد اجتياز بوابة رقم الجوال
  if (!mode) return <MainMenuScreen onSelectMode={setMode} />;

  switch (phase) {
    case PHASES.SETUP:
      return <SetupScreen players={players} setPlayers={setPlayers} startGame={startGame} mode={mode} />;
    case PHASES.ROLE_REVEAL:
      return <RoleRevealScreen players={players} onComplete={() => setPhase(PHASES.FIRST_DAY_INTRO)} />;
    case PHASES.FIRST_DAY_INTRO:
      return <FirstDayIntroScreen onContinue={() => setPhase(PHASES.GROUP_SLEEP)} />;
    case PHASES.GROUP_SLEEP:
      return <GroupSleepScreen onContinue={() => startNight(players)} />;
    case PHASES.NIGHT_TRANSITION:
      return <NightTransitionScreen targetPlayer={nightQueue[currentNightIndex]} onReady={() => setPhase(PHASES.NIGHT_TURN)} />;
    case PHASES.NIGHT_TURN:
      return <NightTurnScreen player={nightQueue[currentNightIndex]} players={players} mode={mode} onActionComplete={handleNightActionComplete} />;
    case PHASES.GROUP_WAKE:
      return <GroupWakeScreen onContinue={() => setPhase(PHASES.MORNING_SEQUENCE)} />;
    case PHASES.MORNING_SEQUENCE:
      return <MorningSequenceScreen mafiaKill={mafiaKill} savedByDoctor={savedByDoctor} vigilanteKill={vigilanteKill} vigilanteSuicide={vigilanteSuicide} jesterWon={jesterWon} deathWillMessage={deathWillMessage} onComplete={() => setPhase(PHASES.DISCUSSION)} />;
    case PHASES.DISCUSSION:
      return <DiscussionScreen aliveCount={players.filter(p => p.isAlive).length} onContinue={() => setPhase(PHASES.VOTING)} />;
    case PHASES.VOTING:
      return <VotingScreen alivePlayers={players.filter(p => p.isAlive)} onVoteComplete={handleVoteComplete} />;
    case PHASES.DEFENSE:
      return <DefenseScreen accusedPlayer={accusedPlayerToDefend} onComplete={() => setPhase(PHASES.FINAL_DECISION)} />;
    case PHASES.FINAL_DECISION:
      return <FinalDecisionScreen accusedPlayer={accusedPlayerToDefend} onDecision={handleDecisionComplete} />;
    case PHASES.EXECUTION:
      return <ExecutionScreen executedPlayer={executedPlayer} onContinue={() => setPhase(PHASES.GROUP_SLEEP)} />;
    case PHASES.GAME_OVER:
      return <GameOverScreen winner={winner} jesterWon={jesterWon} players={players} onRestart={handleRestart} onPlayAgain={handlePlayAgain} />;
    default:
      return <div className="center-content"><h2 style={{ color: "var(--primary-gold)" }}>جاري التحميل...</h2></div>;
  }
}
