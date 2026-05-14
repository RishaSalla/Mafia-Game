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

// تم إضافة مراحل كشف الأدوار والتوجيه الجماعي
export const PHASES = {
  SETUP: "setup",             
  ROLE_REVEAL: "role_reveal", // مرحلة تمرير الجهاز لمعرفة الأدوار
  FIRST_DAY_INTRO: "first_day_intro", 
  GROUP_SLEEP: "group_sleep", // شاشة توجيهية: "المدينة تنام"
  NIGHT_TRANSITION: "night_transition", 
  NIGHT_TURN: "night_turn",   
  GROUP_WAKE: "group_wake",   // شاشة توجيهية: "المدينة تستيقظ"
  DAY_RESULT: "day_result",   
  DISCUSSION: "discussion",   
  VOTING: "voting",           
  EXECUTION: "execution",     
  GAME_OVER: "game_over",     
};

// ==========================================
// سرد مدير الجلسة (Classic Storyteller NARRATOR)
// ==========================================
export const NARRATOR = {
  getKillMessage: (name) => {
    const msgs = [
      `استيقظت المدينة على فاجعة.. لقد قامت المافيا بتصفية [ ${name} ] بدم بارد الليلة الماضية.`,
      `كانت ليلة مرعبة.. عُثر على [ ${name} ] مقتولاً، ويبدو أن المافيا لا ترحم أحداً.`,
      `الظلام كان ستاراً لجريمة مروعة.. [ ${name} ] لن يستيقظ معنا هذا الصباح.`
    ];
    return msgs[Math.floor(Math.random() * msgs.length)];
  },
  getSaveMessage: () => {
    const msgs = [
      `حاولت المافيا القتل الليلة، ولكن بفضل براعة طبيب المدينة، تم إنقاذ الضحية في اللحظة الأخيرة!`,
      `سمعنا أصواتاً مريبة الليلة الماضية.. ولكن طبيبنا كان متيقظاً وعالج المصاب. لم يمت أحد.`
    ];
    return msgs[Math.floor(Math.random() * msgs.length)];
  },
  getExecutionMessage: (name) => {
    const msgs = [
      `قررت المدينة التخلص من [ ${name} ] عبر التصويت.. تم الإعدام.`,
      `بعد نقاش حاد ومحكمة صارمة، تم سحب [ ${name} ] إلى حبل المشنقة.`
    ];
    return msgs[Math.floor(Math.random() * msgs.length)];
  },
  getWillMessage: (deadName, targetName) => {
    const msgs = [
      `قبل أن يلفظ أنفاسه الأخيرة، ترك ${deadName} وصية يتهم فيها: [ ${targetName} ].`,
      `وجدنا رسالة ملوثة بالدماء في جيب ${deadName}، يطالب فيها بالانتقام من: [ ${targetName} ].`
    ];
    return msgs[Math.floor(Math.random() * msgs.length)];
  }
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
// المنطق الأساسي (Core Logic)
// ==========================================

export const distributeRoles = (playerNames, mode) => {
  const total = playerNames.length;
  const mafiaCount = Math.max(1, Math.floor(total / 3.5)); 
  
  let roles = Array(total).fill(ROLES.CITIZEN);
  
  for (let i = 0; i < mafiaCount; i++) roles[i] = ROLES.MAFIA;
  roles[mafiaCount] = ROLES.DOCTOR;
  roles[mafiaCount + 1] = ROLES.DETECTIVE;

  if (mode === MODES.ADVANCED && total >= 6) {
    roles[mafiaCount + 2] = ROLES.JESTER;
    if (total >= 7) roles[mafiaCount + 3] = ROLES.VIGILANTE;
  }

  roles = shuffleArray(roles);

  return playerNames.map((name, index) => ({
    id: index,
    name: name,
    role: roles[index],
    isAlive: true,
    hasSelfHealed: false, 
    bullets: roles[index] === ROLES.VIGILANTE ? 1 : 0,
    deathWillTargetId: null 
  }));
};

export const checkWinCondition = (players) => {
  const activePlayers = players.filter(p => p.isAlive);
  const mafiaCount = activePlayers.filter(p => p.role === ROLES.MAFIA).length;
  const citizenCount = activePlayers.filter(p => p.role !== ROLES.MAFIA && p.role !== ROLES.JESTER).length;

  if (mafiaCount === 0) return "citizen";
  if (citizenCount <= mafiaCount * 2) return "mafia";

  return null;
};

export const createNightQueue = (players) => {
    const alivePlayers = players.filter(p => p.isAlive);
    return shuffleArray([...alivePlayers]); // خلط عشوائي في كل ليلة
};

// ==========================================
// حسم النتائج (Game Resolvers)
// ==========================================

export const resolveNight = (players, nightActions) => {
  let killedPlayer = null;
  let savedByDoctor = false;
  let vigilanteSuicide = false;

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

    if (newPlayer.id === nightActions.mafiaTargetId) {
      if (newPlayer.id !== actualDoctorTarget) {
        newPlayer.isAlive = false;
        killedPlayer = newPlayer;
      } else {
        savedByDoctor = true;
      }
    }

    if (nightActions.vigilanteTargetId && newPlayer.id === nightActions.vigilanteTargetId) {
      if (newPlayer.isAlive) {
        newPlayer.isAlive = false;
        if (newPlayer.role !== ROLES.MAFIA) {
          vigilanteSuicide = true;
        }
      }
    }

    return newPlayer;
  });

  if (vigilanteSuicide) {
    const vigIndex = updatedPlayers.findIndex(p => p.role === ROLES.VIGILANTE);
    if (vigIndex !== -1) updatedPlayers[vigIndex].isAlive = false;
  }

  let deathWillMessage = null;
  if (killedPlayer && killedPlayer.deathWillTargetId !== null) {
    const accused = updatedPlayers.find(p => p.id === killedPlayer.deathWillTargetId);
    if (accused) {
      deathWillMessage = NARRATOR.getWillMessage(killedPlayer.name, accused.name);
    }
  }

  return { updatedPlayers, killedPlayer, savedByDoctor, deathWillMessage };
};

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

  if (targetsWithMaxVotes.length > 1) return { accusedPlayer: null, isTie: true };

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
      if (executedPlayer.role === ROLES.JESTER) {
        jesterWon = true;
      }
      return executedPlayer;
    }
    return player;
  });

  let deathWillMessage = null;
  if (executedPlayer && executedPlayer.deathWillTargetId !== null) {
    const accused = updatedPlayers.find(p => p.id === executedPlayer.deathWillTargetId);
    if (accused) {
      deathWillMessage = NARRATOR.getWillMessage(executedPlayer.name, accused.name);
    }
  }

  return { updatedPlayers, executedPlayer, jesterWon, deathWillMessage };
};
