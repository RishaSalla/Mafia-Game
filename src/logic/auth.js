import validCodes from '../data/hashedcodes.json';

// دالة لتشفير النص المدخل باستخدام خوارزمية SHA-256
async function hashString(str) {
  const encoder = new TextEncoder();
  const data = encoder.encode(str);
  const hashBuffer = await crypto.subtle.digest('SHA-256', data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  const hashHex = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
  return hashHex;
}

// دالة التحقق من الكود المدخل
export async function verifyAccessCode(inputCode) {
  try {
    if (!inputCode || inputCode.trim() === "") return false;
    
    // تشفير المدخل ومقارنته بالمصفوفة المعتمدة
    const hashedInput = await hashString(inputCode.trim());
    const isValid = validCodes.valid_hashes.includes(hashedInput);
    
    return isValid;
  } catch (error) {
    console.error("Authentication Error:", error);
    return false;
  }
}
