import React, { useState } from 'react';
import { verifyAccessCode } from './logic/auth';
import { 
  MODES, 
  PHASES, 
  distributeRoles, 
  createNightQueue, 
  resolveNight, 
  resolveVoting, 
  executePlayer, 
  checkWinCondition 
} from './logic/gameEngine';
import { 
  GatewayScreen, 
  MainMenuScreen, 
  SetupScreen, 
  FirstDayIntroScreen,
  NightTransitionScreen, 
  NightTurnScreen, 
  DayResultScreen, 
  DiscussionScreen,
  VotingScreen, 
  ExecutionScreen, 
  GameOverScreen 
} from './ui/Screens';
import './index.css';

export default function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [mode, setMode] = useState(null);
  const [phase, setPhase] = useState(PHASES.SETUP);
  
  const [players, setPlayers] = useState([]);
  const [nightQueue, setNightQueue] = useState([]);
  const [currentNightIndex, setCurrentNightIndex] = useState(0);
  const [nightActions, setNightActions] = useState({ wills: {} });
  
  const [killedPlayer, setKilledPlayer] = useState(null);
  const [savedByDoctor, setSavedByDoctor] = useState(false);
  const [executedPlayer, setExecutedPlayer] = useState(null);
  const [deathWillMessage, setDeathWillMessage] = useState(null);
  
  const [winner, setWinner] = useState(null);
  const [jesterWon, setJesterWon] = useState(false);

  // 1. التحقق من الكود
  const handleVerify = async (code) => {
    const isValid = await verifyAccessCode(code);
    if (isValid) setIsAuthenticated(true);
    return isValid;
  };

  // 2. بدء اللعبة وتوزيع الأدوار
  const startGame = () => {
    const initializedPlayers = distributeRoles(players, mode);
    setPlayers(initializedPlayers);
    // التوجيه إلى مرحلة التمهيد والنقاش الأول بدلاً من الليل المباشر
    setPhase(PHASES.FIRST_DAY_INTRO); 
  };

  // 3. بدء دورة الليل (الترتيب أصبح عشوائياً في كل ليلة)
  const startNight = (currentPlayers) => {
    const queue = createNightQueue(currentPlayers);
    setNightQueue(queue);
    setCurrentNightIndex(0);
    setNightActions({ wills: {} });
    setPhase(PHASES.NIGHT_TRANSITION);
  };

  // 4. معالجة أوامر الليل
  const handleNightActionComplete = (actions) => {
    const currentPlayer = nightQueue[currentNightIndex];
    const newActions = { ...nightActions };
    
    if (currentPlayer.role === 'mafia' && actions.targetId) newActions.mafiaTargetId = actions.targetId;
    if (currentPlayer.role === 'doctor' && actions.targetId) newActions.doctorTargetId = actions.targetId;
    if (currentPlayer.role === 'vigilante' && actions.targetId) newActions.vigilanteTargetId = actions.targetId;
    if (actions.willTargetId) newActions.wills[currentPlayer.id] = actions.willTargetId;

    setNightActions(newActions);

    if (currentNightIndex < nightQueue.length - 1) {
      setCurrentNightIndex(currentNightIndex + 1);
      setPhase(PHASES.NIGHT_TRANSITION);
    } else {
      const result = resolveNight(players, newActions);
      setPlayers(result.updatedPlayers);
      setKilledPlayer(result.killedPlayer);
      setSavedByDoctor(result.savedByDoctor);
      setDeathWillMessage(result.deathWillMessage);
      
      const win = checkWinCondition(result.updatedPlayers);
      if (win) {
        setWinner(win);
        setPhase(PHASES.GAME_OVER);
      } else {
        setPhase(PHASES.DAY_RESULT);
      }
    }
  };

  // 5. معالجة التصويت في المحكمة
  const handleVoteComplete = (votes) => {
    const result = resolveVoting(players, votes);
    if (result.accusedPlayer) {
      const execResult = executePlayer(players, result.accusedPlayer.id);
      setPlayers(execResult.updatedPlayers);
      setExecutedPlayer(execResult.executedPlayer);
      setJesterWon(execResult.jesterWon);
      setDeathWillMessage(execResult.deathWillMessage);
      
      if (execResult.jesterWon) {
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
      setExecutedPlayer(null);
      setDeathWillMessage(null);
      setPhase(PHASES.EXECUTION);
    }
  };

  const handleRestart = () => {
    setMode(null);
    setPhase(PHASES.SETUP);
    setPlayers([]);
    setWinner(null);
    setJesterWon(false);
  };

  // ==========================================
  // توجيه الشاشات (Router Logic)
  // ==========================================
  if (!isAuthenticated) return <GatewayScreen onVerify={handleVerify} />;
  if (!mode) return <MainMenuScreen onSelectMode={setMode} />;

  switch (phase) {
    case PHASES.SETUP:
      return <SetupScreen players={players} setPlayers={setPlayers} startGame={startGame} mode={mode} />;
    case PHASES.FIRST_DAY_INTRO:
      return <FirstDayIntroScreen onContinue={() => startNight(players)} />;
    case PHASES.NIGHT_TRANSITION:
      return <NightTransitionScreen targetPlayer={nightQueue[currentNightIndex]} onReady={() => setPhase(PHASES.NIGHT_TURN)} />;
    case PHASES.NIGHT_TURN:
      return <NightTurnScreen player={nightQueue[currentNightIndex]} players={players} mode={mode} onActionComplete={handleNightActionComplete} />;
    case PHASES.DAY_RESULT:
      return <DayResultScreen killedPlayer={killedPlayer} savedByDoctor={savedByDoctor} deathWillMessage={deathWillMessage} onContinue={() => setPhase(PHASES.DISCUSSION)} />;
    case PHASES.DISCUSSION:
      return <DiscussionScreen aliveCount={players.filter(p => p.isAlive).length} onContinue={() => setPhase(PHASES.VOTING)} />;
    case PHASES.VOTING:
      return <VotingScreen alivePlayers={players.filter(p => p.isAlive)} onVoteComplete={handleVoteComplete} />;
    case PHASES.EXECUTION:
      return <ExecutionScreen executedPlayer={executedPlayer} deathWillMessage={deathWillMessage} onContinue={() => startNight(players)} />;
    case PHASES.GAME_OVER:
      return <GameOverScreen winner={winner} jesterWon={jesterWon} players={players} onRestart={handleRestart} />;
    default:
      return <div className="center-content"><h2 style={{ color: "var(--primary-gold)" }}>جاري تحميل ملفات القضية...</h2></div>;
  }
}
