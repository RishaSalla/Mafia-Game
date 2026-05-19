// ==========================================
// الثوابت والمراحل (Constants & Phases)
// ==========================================

export const MODES = {
  CLASSIC: "classic", // المافيا الأصلية
  CHAOS: "chaos",     // مافيا الفوضى
};

export const ROLES = {
  MAFIA: "mafia",
  DOCTOR: "doctor",
  DETECTIVE: "detective",
  CITIZEN: "citizen",
  JESTER: "jester",       
  VIGILANTE: "vigilante", 
};

// المراحل السردية الشاملة
export const PHASES = {
  SETUP: "setup",             
  ROLE_REVEAL: "role_reveal", 
  FIRST_DAY_INTRO: "first_day_intro", 
  GROUP_SLEEP: "group_sleep", 
  NIGHT_TRANSITION: "night_transition", 
  NIGHT_TURN: "night_turn",   
  GROUP_WAKE: "group_wake",   
  MORNING_SEQUENCE: "morning_sequence", 
  DISCUSSION: "discussion",   
  VOTING: "voting",           
  DEFENSE: "defense",           // مرحلة قفص الاتهام (30 ثانية للتبرير)
  FINAL_DECISION: "final_decision", // قرار الإعدام النهائي (نعم/لا)
  EXECUTION: "execution",     
  GAME_OVER: "game_over",     
};

// ==========================================
// دوال مساعدة (Helper Functions)
// ==========================================
export const shuffleArray = (array) => {
  let currentIndex = array.length, randomIndex;
  while (currentIndex !== 0) {
    randomIndex = Math.floor(Math.random() * currentIndex);
    currentIndex--;
    [array[currentIndex], array[randomIndex]] = [array[randomIndex], array[currentIndex]];
  }
  return array;
};

// ==========================================
// توزيع الأدوار (آمن ومفصول للأطوار)
// ==========================================
export const distributeRoles = (playerNames, mode) => {
  const total = playerNames.length;
  const mafiaCount = Math.max(1, Math.floor(total / 3)); 
  
  let roles = [];
  
  for (let i = 0; i < mafiaCount; i++) roles.push(ROLES.MAFIA);
  roles.push(ROLES.DOCTOR);
  roles.push(ROLES.DETECTIVE);

  if (mode === MODES.CHAOS) {
    if (total >= 6) roles.push(ROLES.JESTER);
    if (total >= 7) roles.push(ROLES.VIGILANTE);
  }

  while (roles.length < total) {
    roles.push(ROLES.CITIZEN);
  }

  const shuffledRoles = shuffleArray(roles);

  return playerNames.map((name, index) => ({
    id: index,
    name: name,
    role: shuffledRoles[index],
    isAlive: true,
    hasSelfHealed: false, 
    bullets: shuffledRoles[index] === ROLES.VIGILANTE ? 1 : 0, 
    deathWillTargetId: null 
  }));
};

// ==========================================
// شروط الفوز الأساسية
// ==========================================
export const checkWinCondition = (players) => {
  const activePlayers = players.filter(p => p.isAlive);
  const mafiaCount = activePlayers.filter(p => p.role === ROLES.MAFIA).length;
  const citizenBlockCount = activePlayers.length - mafiaCount;

  if (mafiaCount === 0) return "citizen"; 
  if (mafiaCount >= citizenBlockCount) return "mafia"; 

  return null; 
};

export const createNightQueue = (players) => {
    const alivePlayers = players.filter(p => p.isAlive);
    return shuffleArray([...alivePlayers]); 
};

// ==========================================
// حسم أحداث الليل (مع فوز المختل وعقاب القناص)
// ==========================================
export const resolveNight = (players, nightActions) => {
  let mafiaKill = null;
  let vigilanteKill = null;
  let vigilanteSuicide = false;
  let savedByDoctor = false;
  let jesterWon = false; // فوز المختل عبر القناص

  const doctor = players.find(p => p.role === ROLES.DOCTOR && p.isAlive);
  const actualDoctorTarget = doctor ? nightActions.doctorTargetId : null;

  const updatedPlayers = players.map(player => {
    const newPlayer = { ...player };
    if (nightActions.wills && nightActions.wills[newPlayer.id] !== undefined) {
      newPlayer.deathWillTargetId = nightActions.wills[newPlayer.id];
    }
    if (newPlayer.role === ROLES.DOCTOR && newPlayer.id === actualDoctorTarget) {
      newPlayer.hasSelfHealed = true;
    }
    return newPlayer;
  });

  // 1. تنفيذ جريمة المافيا
  if (nightActions.mafiaTargetId !== null) {
    if (nightActions.mafiaTargetId !== actualDoctorTarget) {
      const victimIndex = updatedPlayers.findIndex(p => p.id === nightActions.mafiaTargetId);
      if (victimIndex !== -1 && updatedPlayers[victimIndex].isAlive) {
        updatedPlayers[victimIndex].isAlive = false;
        mafiaKill = updatedPlayers[victimIndex];
      }
    } else {
      savedByDoctor = true;
    }
  }

  // 2. تنفيذ رصاصة القناص
  if (nightActions.vigilanteTargetId !== null) {
    const vigIndex = updatedPlayers.findIndex(p => p.role === ROLES.VIGILANTE && p.isAlive);
    if (vigIndex !== -1) {
      updatedPlayers[vigIndex].bullets -= 1; 
      const victimIndex = updatedPlayers.findIndex(p => p.id === nightActions.vigilanteTargetId);
      
      if (victimIndex !== -1 && updatedPlayers[victimIndex].isAlive) {
        updatedPlayers[victimIndex].isAlive = false;
        vigilanteKill = updatedPlayers[victimIndex];

        // التحقق من هوية ضحية القناص
        if (vigilanteKill.role === ROLES.JESTER) {
          jesterWon = true; // فاز المختل لأنه خدع القناص
        } else if (vigilanteKill.role !== ROLES.MAFIA) {
          vigilanteSuicide = true; // انتحار القناص لقتله بريئاً
          updatedPlayers[vigIndex].isAlive = false;
        }
      }
    }
  }

  return { updatedPlayers, mafiaKill, vigilanteKill, vigilanteSuicide, savedByDoctor, jesterWon };
};

// ==========================================
// حسم التصويت (قانون النصف + 1)
// ==========================================
export const resolveVoting = (players, votes) => {
  const alivePlayers = players.filter(p => p.isAlive);
  const threshold = Math.floor(alivePlayers.length / 2) + 1; // الأغلبية الكاسحة

  if (Object.keys(votes).length === 0) return { accusedPlayer: null, isTie: false, reachedThreshold: false };

  let maxVotes = 0;
  let targetsWithMaxVotes = [];

  for (const [targetId, count] of Object.entries(votes)) {
    if (count > maxVotes) {
      maxVotes = count;
      targetsWithMaxVotes = [Number(targetId)];
    } else if (count === maxVotes) {
      targetsWithMaxVotes.push(Number(targetId));
    }
  }

  const isTie = targetsWithMaxVotes.length > 1;
  const reachedThreshold = maxVotes >= threshold;

  if (isTie || !reachedThreshold) {
    return { accusedPlayer: null, isTie, reachedThreshold };
  }

  const accusedId = targetsWithMaxVotes[0];
  const accusedPlayer = alivePlayers.find(p => p.id === accusedId);

  return { accusedPlayer, isTie, reachedThreshold };
};

// ==========================================
// الإعدام النهائي وفوز المختل
// ==========================================
export const executePlayer = (players, playerId) => {
  let executedPlayer = null;
  let jesterWon = false;

  const updatedPlayers = players.map(player => {
    if (player.id === playerId) {
      executedPlayer = { ...player, isAlive: false };
      if (executedPlayer.role === ROLES.JESTER) {
        jesterWon = true; // المختل الأناني يفوز فوراً
      }
      return executedPlayer;
    }
    return player;
  });

  return { updatedPlayers, executedPlayer, jesterWon };
};
