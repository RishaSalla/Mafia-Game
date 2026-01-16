// ==========================================
// Constants & Types (الثوابت)
// ==========================================

export const ROLES = {
  MAFIA: "mafia",
  DOCTOR: "doctor",
  DETECTIVE: "detective",
  CITIZEN: "citizen",
};

export const PHASES = {
  SETUP: "setup",             // إدخال الأسماء
  NIGHT_INIT: "night_init",   // تجهيز الليلة (خلط الترتيب)
  NIGHT_TURN: "night_turn",   // دور اللاعب الحالي
  DAY_RESULT: "day_result",   // إعلان من مات
  DISCUSSION: "discussion",   // وقت النقاش
  VOTING: "voting",           // التصويت
  DEFENSE: "defense",         // دفاع المتهم
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
    // نأخذ نسخة من اللاعبين ونخلطهم
    // ملاحظة: الميت يدخل في الطابور للتمويه كما اتفقنا
    return shuffleArray([...players]);
};
