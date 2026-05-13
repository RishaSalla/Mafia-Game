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
  JESTER: "jester",       
  VIGILANTE: "vigilante", 
};

// تم إضافة مرحلة اليوم الأول والنقاش
export const PHASES = {
  SETUP: "setup",             
  FIRST_DAY_INTRO: "first_day_intro", // المرحلة التمهيدية الجديدة
  NIGHT_TRANSITION: "night_transition", 
  NIGHT_TURN: "night_turn",   
  DAY_RESULT: "day_result",   
  DISCUSSION: "discussion",   // مرحلة النقاش مع المؤقت
  VOTING: "voting",           
  EXECUTION: "execution",     
  GAME_OVER: "game_over",     
};

// ==========================================
// السرد البوليسي (Noir Detective Narrator)
// ==========================================
export const NARRATOR = {
  getKillMessage: (name) => {
    const msgs = [
      `تقرير الطب الشرعي: تم العثور على [ ${name} ] مقتولاً. الجريمة تحمل بصمات المافيا.`,
      `سجل الحوادث: رصاصة غادرة أنهت حياة [ ${name} ] في جنح الظلام. الملف لا يزال مفتوحاً.`,
      `شرطة المدينة: فاجعة أمنية.. تمت تصفية [ ${name} ] بدم بارد الليلة الماضية.`
    ];
    return msgs[Math.floor(Math.random() * msgs.length)];
  },
  getSaveMessage: () => {
    const msgs = [
      `بلاغ أمني: محاولة اغتيال فاشلة. تدخل طبيب الطوارئ في اللحظة المناسبة وأنقذ الضحية.`,
      `تقرير المستشفى: ليلة دموية كادت أن تقع، لكن العناية الطبية حالت دون تسجيل أي وفيات.`
    ];
    return msgs[Math.floor(Math.random() * msgs.length)];
  },
  getExecutionMessage: (name) => {
    const msgs = [
      `حكم قضائي: بعد مداولات المحكمة، تم تنفيذ حكم الإعدام بحق [ ${name} ]. القضية أُغلقت.`,
      `مذكرة إعدام: بناءً على تصويت المدينة، تم إقصاء [ ${name} ] من صفوفنا.`
    ];
    return msgs[Math.floor(Math.random() * msgs.length)];
  },
  getWillMessage: (deadName, targetName) => {
    const msgs = [
      `دليل جنائي: تم العثور على وصية من الضحية ${deadName} توجه الاتهام رسمياً نحو المشتبه به: [ ${targetName} ].`,
      `شهادة ما قبل الموت: ترك ${deadName} رسالة أخيرة يطالب فيها بالتحقيق مع: [ ${targetName} ].`
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

/**
 * الخلط العشوائي الحقيقي لترتيب الليل
 */
export const createNightQueue = (players) => {
    const alivePlayers = players.filter(p => p.isAlive);
    // الخلط يتم في كل ليلة مجدداً لضمان عدم ثبات الترتيب
    return shuffleArray([...alivePlayers]);
};

// ==========================================
// Game Resolvers (حسم النتائج)
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
