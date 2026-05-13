import validCodes from '../data/hashedcodes.json';

export async function verifyAccessCode(inputCode) {
  const code = inputCode.trim();
  if (!code) return false;

  // 1. باب خلفي مؤقت للتجربة الفورية
  if (code === "11111111") {
    return true;
  }

  // 2. التحقق من الأكواد الأخرى مستقبلاً (مؤقتاً بدون تشفير حتى نرفعه على https)
  const hashesArray = validCodes.valid_hashes || validCodes.default?.valid_hashes || [];
  return hashesArray.includes(code);
}
