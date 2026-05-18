// ==========================================
// الثوابت والمراحل (Constants & Phases)
// ==========================================

export const MODES = {
  CLASSIC: "classic",
  ADVANCED: "advanced",
};

export const ROLES = {
  MAFIA: "mafia",
  DOCTOR: "doctor",
  DETECTIVE: "detective",
  CITIZEN: "citizen",
  JESTER: "jester",       
  VIGILANTE: "vigilante", 
};

// المراحل مفصلة بدقة لتمكين مدير الجلسة من السرد خطوة بخطوة
export const PHASES = {
  SETUP: "setup",             
  ROLE_REVEAL: "role_reveal", 
  FIRST_DAY_INTRO: "first_day_intro", 
  GROUP_SLEEP: "group_sleep", 
  NIGHT_TRANSITION: "night_transition", 
  NIGHT_TURN: "night_turn",   
  GROUP_WAKE: "group_wake",   
  MORNING_SEQUENCE: "morning_sequence", // السرد الدرامي لأحداث الليل (ضحية المافيا، القناص، إلخ)
  DISCUSSION: "discussion",   
  VOTING: "voting",           
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
  // مافيا واحد لكل 3-4 لاعبين تقريباً
  const mafiaCount = Math.max(1, Math.floor(total / 3)); 
  
  let roles = [];
  
  // الأدوار الأساسية (في كلا الطورين)
  for (let i = 0; i < mafiaCount; i++) roles.push(ROLES.MAFIA);
  roles.push(ROLES.DOCTOR);
  roles.push(ROLES.DETECTIVE);

  // الأدوار المطورة (تُضاف فقط إذا كان الطور مطوراً والعدد يسمح)
  if (mode === MODES.ADVANCED) {
    if (total >= 6) roles.push(ROLES.JESTER);
    if (total >= 7) roles.push(ROLES.VIGILANTE);
  }

  // الباقي مواطنون
  while (roles.length < total) {
    roles.push(ROLES.CITIZEN);
  }

  const shuffledRoles = shuffleArray(roles);

  return playerNames.map((name, index) => ({
    id: index,
    name: name,
    role: shuffledRoles[index],
    isAlive: true,
    hasSelfHealed: false, // ذاكرة الطبيب
    bullets: shuffledRoles[index] === ROLES.VIGILANTE ? 1 : 0, // ذخيرة القناص
    deathWillTargetId: null // الوصية الجنائية
  }));
};

// ==========================================
// شروط الفوز
// ==========================================
export const checkWinCondition = (players) => {
  const activePlayers = players.filter(p => p.isAlive);
  const mafiaCount = activePlayers.filter(p => p.role === ROLES.MAFIA).length;
  const citizenBlockCount = activePlayers.length - mafiaCount;

  if (mafiaCount === 0) return "citizen"; // انتصار المواطنين
  if (mafiaCount >= citizenBlockCount) return "mafia"; // سيطرة المافيا (نصف الأصوات أو أكثر)

  return null; // اللعبة مستمرة
};

export const createNightQueue = (players) => {
    const alivePlayers = players.filter(p => p.isAlive);
    return shuffleArray([...alivePlayers]); // خلط عشوائي حقيقي في كل ليلة
};

// ==========================================
// حسم أحداث الليل (Night Resolution)
// ==========================================
export const resolveNight = (players, nightActions) => {
  let mafiaKill = null;
  let vigilanteKill = null;
  let vigilanteSuicide = false;
  let savedByDoctor = false;

  const doctor = players.find(p => p.role === ROLES.DOCTOR && p.isAlive);
  const actualDoctorTarget = doctor ? nightActions.doctorTargetId : null;

  const updatedPlayers = players.map(player => {
    const newPlayer = { ...player };

    // 1. تسجيل الوصايا (للأحياء فقط في الطور المطور)
    if (nightActions.wills && nightActions.wills[newPlayer.id] !== undefined) {
      newPlayer.deathWillTargetId = nightActions.wills[newPlayer.id];
    }

    // 2. تحديث ذاكرة الطبيب (إذا اختار نفسه)
    if (newPlayer.role === ROLES.DOCTOR && newPlayer.id === actualDoctorTarget) {
      newPlayer.hasSelfHealed = true;
    }

    return newPlayer;
  });

  // 3. تنفيذ جريمة المافيا
  if (nightActions.mafiaTargetId !== null) {
    if (nightActions.mafiaTargetId !== actualDoctorTarget) {
      const victimIndex = updatedPlayers.findIndex(p => p.id === nightActions.mafiaTargetId);
      if (victimIndex !== -1 && updatedPlayers[victimIndex].isAlive) {
        updatedPlayers[victimIndex].isAlive = false;
        mafiaKill = updatedPlayers[victimIndex];
      }
    } else {
      savedByDoctor = true; // الطبيب أنقذه
    }
  }

  // 4. تنفيذ رصاصة القناص (الطور المطور)
  if (nightActions.vigilanteTargetId !== null) {
    const vigIndex = updatedPlayers.findIndex(p => p.role === ROLES.VIGILANTE && p.isAlive);
    if (vigIndex !== -1) {
      updatedPlayers[vigIndex].bullets -= 1; // خصم الرصاصة
      const victimIndex = updatedPlayers.findIndex(p => p.id === nightActions.vigilanteTargetId);
      
      if (victimIndex !== -1 && updatedPlayers[victimIndex].isAlive) {
        updatedPlayers[victimIndex].isAlive = false;
        vigilanteKill = updatedPlayers[victimIndex];

        // العقاب: إذا كان القتيل بريئاً (ليس مافيا)، القناص ينتحر
        if (vigilanteKill.role !== ROLES.MAFIA) {
          vigilanteSuicide = true;
          updatedPlayers[vigIndex].isAlive = false;
        }
      }
    }
  }

  return { updatedPlayers, mafiaKill, vigilanteKill, vigilanteSuicide, savedByDoctor };
};

// ==========================================
// حسم التصويت والإعدام
// ==========================================
export const resolveVoting = (players, votes) => {
  if (Object.keys(votes).length === 0) return { accusedPlayer: null, isTie: false };

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

  if (targetsWithMaxVotes.length > 1) return { accusedPlayer: null, isTie: true }; // تعادل

  const accusedId = targetsWithMaxVotes[0];
  const accusedPlayer = players.find(p => p.id === accusedId);

  return { accusedPlayer, isTie: false };
};

export const executePlayer = (players, playerId) => {
  let executedPlayer = null;
  let jesterWon = false;

  const updatedPlayers = players.map(player => {
    if (player.id === playerId) {
      executedPlayer = { ...player, isAlive: false };
      // إذا تم إعدام المختل، يفوز فوراً
      if (executedPlayer.role === ROLES.JESTER) {
        jesterWon = true;
      }
      return executedPlayer;
    }
    return player;
  });

  return { updatedPlayers, executedPlayer, jesterWon };
};
