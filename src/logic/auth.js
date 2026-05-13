import validCodes from '../data/hashedcodes.json';

async function hashString(str) {
  const encoder = new TextEncoder();
  const data = encoder.encode(str);
  const hashBuffer = await crypto.subtle.digest('SHA-256', data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
}

export async function verifyAccessCode(inputCode) {
  try {
    if (!inputCode || inputCode.trim() === "") return false;
    
    // دعم جميع بيئات البناء (Vite, Webpack, CRA)
    const hashesArray = validCodes.valid_hashes || validCodes.default?.valid_hashes;
    
    if (!hashesArray) {
      console.error("خطأ: لم يتم قراءة ملف الأكواد بشكل صحيح.", validCodes);
      return false;
    }

    const hashedInput = await hashString(inputCode.trim());
    console.log("الهاش المدخل:", hashedInput); // سيظهر في الكونسول الآن
    
    return hashesArray.includes(hashedInput);
  } catch (error) {
    console.error("Authentication Error:", error);
    return false;
  }
}
