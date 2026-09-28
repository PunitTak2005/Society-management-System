/**
 * Generates a secure temporary password with uppercase, lowercase, numbers, and special characters.
 * @param {number} length - Desired password length (defaults to 10 characters, between 10-12)
 * @returns {string} - Generated secure password
 */
export const generatePassword = (length = 10) => {
  const finalLength = Math.max(10, Math.min(length, 12));
  const upper = 'ABCDEFGHJKLMNPQRSTUVWXYZ'; // Excluded confusing chars like I, O
  const lower = 'abcdefghijkmnpqrstuvwxyz'; // Excluded confusing chars like l, o
  const digits = '23456789'; // Excluded 0, 1
  const special = '!@#$%&*?';
  const allChars = upper + lower + digits + special;

  // Guarantee at least one from each character class
  const required = [
    upper[Math.floor(Math.random() * upper.length)],
    lower[Math.floor(Math.random() * lower.length)],
    digits[Math.floor(Math.random() * digits.length)],
    special[Math.floor(Math.random() * special.length)],
  ];

  const remaining = [];
  for (let i = required.length; i < finalLength; i++) {
    remaining.push(allChars[Math.floor(Math.random() * allChars.length)]);
  }

  // Shuffle the password characters using Fisher-Yates algorithm
  const passwordArray = [...required, ...remaining];
  for (let i = passwordArray.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [passwordArray[i], passwordArray[j]] = [passwordArray[j], passwordArray[i]];
  }

  return passwordArray.join('');
};

export default generatePassword;
