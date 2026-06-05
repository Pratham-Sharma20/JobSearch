import bcrypt from 'bcryptjs';

/**
 * Hashes a plaintext password using bcrypt.
 * @param password The plaintext password to hash.
 * @returns A promise that resolves to the hashed password.
 */
export async function hashPassword(password: string): Promise<string> {
  const salt = await bcrypt.genSalt(12);
  return bcrypt.hash(password, salt);
}

/**
 * Compares a plaintext password with a hash.
 * @param password The plaintext password to verify.
 * @param hash The hashed password to compare against.
 * @returns A promise that resolves to true if they match, false otherwise.
 */
export async function comparePassword(password: string, hash: string): Promise<boolean> {
  return bcrypt.compare(password, hash);
}
