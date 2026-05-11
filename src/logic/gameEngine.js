// ==========================================
// Constants & Types (الثوابت)
// ==========================================

export const ROLES = {
  MAFIA: "mafia",
  DOCTOR: "doctor",
  DETECTIVE: "detective",
  CITIZEN: "citizen",
};

// تمت إضافة مراحل جديدة لتناسب "مدير الجلسة" (الراوي، الفرز الدرامي، الدفاع)
export const PHASES = {
  SETUP: "setup",             // إدخال الأسماء
  NIGHT_TRANSITION: "night_transition", // شاشة الراوي: حلول الظلام
  NIGHT_TURN: "night_turn",   // تمرير الجوال السري
  DAY_TRANSITION: "day_transition", // شاشة الراوي: إشراقة الشمس
  DAY_RESULT: "day_result",   // إعلان من مات
  DISCUSSION: "discussion",   // مؤقت المحكمة (مثال: دقيقتين)
  VOTING: "voting",           // التصويت السري
  VOTE_REVEAL: "vote_reveal", // الفرز السينمائي البطيء
  DEFENSE: "defense",         // منصة الدفاع (المتهم يتحدث لـ 30 ثانية)
  EXECUTION: "execution",     // قرار الإعدام
  GAME_OVER: "game_over",     // نهاية اللعبة
};

// ==========================================
// Helper Functions (دوال مساعدة)
// ==========================================

// خوارزمية فيشر-ييتس للخلط العشوائي (الأقوى عالمياً)
export const shuffleArray = (array) => {
  let currentIndex = array.length, randomIndex;
  while (currentIndex !== 0) {
    randomIndex = Math.floor(Math.random() * currentIndex);
    currentIndex--;
    [array[currentIndex], array[randomIndex]] = [
      array[randomIndex], array[currentIndex]];
  }
  return array;
};

// ==========================================
// Core Logic (المنطق الأساسي)
// ==========================================

/**
 * دالة توزيع الأدوار بناءً على عدد اللاعبين
 * Rule: Mafia = floor(Total / 3.5)
 */
export const distributeRoles = (playerNames) => {
  const total = playerNames.length;
  const mafiaCount = Math.max(1, Math.floor(total / 3.5)); // على الأقل 1 مافيا
  
  // مصفوفة الأدوار المبدئية
  let roles = Array(total).fill(ROLES.CITIZEN);
  
  // تعيين المافيا
  for (let i = 0; i < mafiaCount; i++) roles[i] = ROLES.MAFIA;
  
  // تعيين الطبيب والمحقق (دائماً واحد فقط)
  roles[mafiaCount] = ROLES.DOCTOR;
  roles[mafiaCount + 1] = ROLES.DETECTIVE;

  // خلط الأدوار جيداً
  roles = shuffleArray(roles);

  // إنشاء كائنات اللاعبين
  return playerNames.map((name, index) => ({
    id: index,
    name: name,
    role: roles[index],
    isAlive: true,
    // خاصية للطبيب: هل عالج نفسه سابقاً؟
    hasSelfHealed: false, 
    // خاصية لتتبع الدور في الليل (هل لعب أم لا؟)
    hasActedTonight: false 
  }));
};

/**
 * دالة التحقق من شروط الفوز
 * تعيد: "mafia", "citizen", أو null (اللعبة مستمرة)
 */
export const checkWinCondition = (players) => {
  const activePlayers = players.filter(p => p.isAlive);
  const mafiaCount = activePlayers.filter(p => p.role === ROLES.MAFIA).length;
  const citizenCount = activePlayers.length - mafiaCount;

  // شرط فوز المواطنين: القضاء على كل المافيا
  if (mafiaCount === 0) return "citizen";

  // شرط فوز المافيا: عددهم يساوي أو يفوق المواطنين
  if (mafiaCount >= citizenCount) return "mafia";

  // اللعبة مستمرة
  return null;
};

/**
 * تجهيز طابور الليل (Night Queue)
 * تعيد قائمة اللاعبين الأحياء بترتيب عشوائي للتمرير
 * + الموتى (ليقوموا بالتمويه)
 */
export const createNightQueue = (players) => {
    return shuffleArray([...players]);
};

// ==========================================
// Game Resolvers (دوال حسم النتائج الجديدة)
// ==========================================

/**
 * معالجة أحداث الليل بناءً على اختيارات المافيا والطبيب
 */
export const resolveNight = (players, nightActions) => {
  let killedPlayer = null;
  const updatedPlayers = players.map(player => {
    const newPlayer = { ...player };

    // 1. تحديث حالة الطبيب إذا اختار علاج نفسه هذه الليلة
    if (newPlayer.role === ROLES.DOCTOR && newPlayer.id === nightActions.doctorTargetId) {
      newPlayer.hasSelfHealed = true;
    }

    // 2. التحقق من هدف المافيا ومقارنته بحماية الطبيب
    if (newPlayer.id === nightActions.mafiaTargetId) {
      if (newPlayer.id !== nightActions.doctorTargetId) {
        // الطبيب لم يحمه، إذن يموت
        newPlayer.isAlive = false;
        killedPlayer = newPlayer;
      }
    }

    // تصفير حالة اللعب في الليل لليوم التالي
    newPlayer.hasActedTonight = false; 

    return newPlayer;
  });

  return { updatedPlayers, killedPlayer };
};

/**
 * معالجة نتائج التصويت (تحديد المتهم فقط دون إعدامه ليتمكن من الدفاع عن نفسه)
 */
export const resolveVoting = (players, votes) => {
  // إذا لم يصوت أحد
  if (Object.keys(votes).length === 0) {
    return { accusedPlayer: null, isTie: false };
  }

  let maxVotes = 0;
  let targetsWithMaxVotes = [];

  // حساب أعلى الأصوات
  for (const [targetId, count] of Object.entries(votes)) {
    if (count > maxVotes) {
      maxVotes = count;
      targetsWithMaxVotes = [Number(targetId)];
    } else if (count === maxVotes) {
      targetsWithMaxVotes.push(Number(targetId));
    }
  }

  // إذا تعادل شخصان أو أكثر بأعلى الأصوات، لا يوجد متهم واضح
  if (targetsWithMaxVotes.length > 1) {
    return { accusedPlayer: null, isTie: true };
  }

  // تحديد المتهم الأول
  const accusedId = targetsWithMaxVotes[0];
  const accusedPlayer = players.find(p => p.id === accusedId);

  return { accusedPlayer, isTie: false };
};

/**
 * تنفيذ الإعدام الفعلي (بعد استنفاد وقت منصة الدفاع)
 */
export const executePlayer = (players, playerId) => {
  let executedPlayer = null;
  const updatedPlayers = players.map(player => {
    if (player.id === playerId) {
      executedPlayer = { ...player, isAlive: false };
      return executedPlayer;
    }
    return player;
  });

  return { updatedPlayers, executedPlayer };
};
