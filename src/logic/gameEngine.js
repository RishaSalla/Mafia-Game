// ==========================================
// Constants & Types (الثوابت)
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
  JESTER: "jester",       // المجنون
  VIGILANTE: "vigilante", // القناص
};

export const PHASES = {
  SETUP: "setup",             
  ROLE_REVEAL: "role_reveal", 
  FIRST_DAY_INTRO: "first_day_intro", 
  NIGHT_TRANSITION: "night_transition", 
  NIGHT_TURN: "night_turn",   
  DAY_RESULT: "day_result",   
  DISCUSSION: "discussion",   
  VOTING: "voting",           
  VOTE_REVEAL: "vote_reveal", 
  DEFENSE: "defense",         
  EXECUTION: "execution",     
  GAME_OVER: "game_over",     
};

// ==========================================
// السرد الديناميكي الصارم (بدون إيموجي)
// ==========================================
export const NARRATOR = {
  getKillMessage: (name) => {
    const msgs = [
      `تم العثور على جثة [ ${name} ] في زقاق مظلم.. المافيا لا ترحم.`,
      `رصاصة غادرة في جنح الظلام أنهت حياة [ ${name} ] الليلة الماضية.`,
      `فاجعة تهز المدينة، تم تصفية [ ${name} ] بدم بارد.`
    ];
    return msgs[Math.floor(Math.random() * msgs.length)];
  },
  getSaveMessage: () => {
    const msgs = [
      `حاولت المافيا اغتيال أحدهم الليلة، لكن طبيب المدينة تدخل في اللحظة الأخيرة.`,
      `رصاصة المافيا أخطأت الهدف بفضل يقظة طبيب المدينة.. لا ضحايا.`,
      `ليلة دموية، لكن براعة الطبيب حالت دون وقوع كارثة.`
    ];
    return msgs[Math.floor(Math.random() * msgs.length)];
  },
  getExecutionMessage: (name) => {
    const msgs = [
      `حكمت المحكمة بإعدام المتهم [ ${name} ].. حبل المشنقة لا يكذب.`,
      `المدينة قالت كلمتها.. [ ${name} ] يواجه مصيره المحتوم.`,
      `لا عذر للخونة، تم تنفيذ حكم الإعدام بحق [ ${name} ].`
    ];
    return msgs[Math.floor(Math.random() * msgs.length)];
  },
  getWillMessage: (deadName, targetName) => {
    const msgs = [
      `وجدنا بجانب جثة ${deadName} دليلا يشير إلى: [ ${targetName} ].`,
      `قبل أن يلفظ ${deadName} أنفاسه، ترك رسالة يتهم فيها: [ ${targetName} ].`
    ];
    return msgs[Math.floor(Math.random() * msgs.length)];
  }
};

// ==========================================
// Helper Functions (دوال مساعدة)
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
// Core Logic (المنطق الأساسي)
// ==========================================

export const distributeRoles = (playerNames, mode) => {
  const total = playerNames.length;
  const mafiaCount = Math.max(1, Math.floor(total / 3.5)); 
  
  let roles = Array(total).fill(ROLES.CITIZEN);
  
  // توزيع الأساسيات
  for (let i = 0; i < mafiaCount; i++) roles[i] = ROLES.MAFIA;
  roles[mafiaCount] = ROLES.DOCTOR;
  roles[mafiaCount + 1] = ROLES.DETECTIVE;

  // إضافة أدوار الطور المطور إذا كان العدد يسمح
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
    bullets: roles[index] === ROLES.VIGILANTE ? 1 : 0, // القناص يملك رصاصة واحدة
    deathWillTargetId: null // الوصية الأخيرة
  }));
};

/**
 * قانون الفوز السريع
 */
export const checkWinCondition = (players) => {
  const activePlayers = players.filter(p => p.isAlive);
  const mafiaCount = activePlayers.filter(p => p.role === ROLES.MAFIA).length;
  // المجنون لا يُحسب مع المواطنين
  const citizenCount = activePlayers.filter(p => p.role !== ROLES.MAFIA && p.role !== ROLES.JESTER).length;

  if (mafiaCount === 0) return "citizen";
  // قانون تسريع اللعب: فوز المافيا إذا كان المواطنون ضعف المافيا أو أقل
  if (citizenCount <= mafiaCount * 2) return "mafia";

  return null;
};

/**
 * تجهيز طابور الليل (الأحياء فقط) - تم طرد الأموات
 */
export const createNightQueue = (players) => {
    const alivePlayers = players.filter(p => p.isAlive);
    return shuffleArray([...alivePlayers]);
};

// ==========================================
// Game Resolvers (حسم النتائج)
// ==========================================

export const resolveNight = (players, nightActions) => {
  let killedPlayer = null;
  let savedByDoctor = false;
  let vigilanteSuicide = false;

  // التحقق مما إذا كان الطبيب حياً بالأصل ليعالج
  const doctor = players.find(p => p.role === ROLES.DOCTOR && p.isAlive);
  const actualDoctorTarget = doctor ? nightActions.doctorTargetId : null;

  const updatedPlayers = players.map(player => {
    const newPlayer = { ...player };

    // تحديث الوصية للجميع
    if (nightActions.wills && nightActions.wills[newPlayer.id] !== undefined) {
      newPlayer.deathWillTargetId = nightActions.wills[newPlayer.id];
    }

    // علاج الطبيب لنفسه
    if (newPlayer.role === ROLES.DOCTOR && newPlayer.id === actualDoctorTarget) {
      newPlayer.hasSelfHealed = true;
    }

    // القتل من المافيا
    if (newPlayer.id === nightActions.mafiaTargetId) {
      if (newPlayer.id !== actualDoctorTarget) {
        newPlayer.isAlive = false;
        killedPlayer = newPlayer;
      } else {
        savedByDoctor = true;
      }
    }

    // رصاصة القناص (الطور المطور)
    if (nightActions.vigilanteTargetId && newPlayer.id === nightActions.vigilanteTargetId) {
      if (newPlayer.isAlive) {
        newPlayer.isAlive = false; // القناص يقتل فوراً دون حماية طبيب
        // إذا قتل بريئاً، يموت القناص منتحراً
        if (newPlayer.role !== ROLES.MAFIA) {
          vigilanteSuicide = true;
        }
      }
    }

    return newPlayer;
  });

  // تنفيذ انتحار القناص إذا أخطأ
  if (vigilanteSuicide) {
    const vigIndex = updatedPlayers.findIndex(p => p.role === ROLES.VIGILANTE);
    if (vigIndex !== -1) updatedPlayers[vigIndex].isAlive = false;
  }

  // استخراج الوصية إذا مات شخص
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
      // إذا كان المعدوم هو المجنون، يفوز هو فوراً
      if (executedPlayer.role === ROLES.JESTER) {
        jesterWon = true;
      }
      return executedPlayer;
    }
    return player;
  });

  // استخراج الوصية
  let deathWillMessage = null;
  if (executedPlayer && executedPlayer.deathWillTargetId !== null) {
    const accused = updatedPlayers.find(p => p.id === executedPlayer.deathWillTargetId);
    if (accused) {
      deathWillMessage = NARRATOR.getWillMessage(executedPlayer.name, accused.name);
    }
  }

  return { updatedPlayers, executedPlayer, jesterWon, deathWillMessage };
};
