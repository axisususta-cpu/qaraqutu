import crypto from "crypto";

export const TEMPORARY_ACCESS_TTL_MINUTES = 20;

const PASSWORD_ALPHABET = "ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz23456789";

export function createTemporaryPassword(length = 16): string {
  const bytes = crypto.randomBytes(length);
  let out = "";
  for (let index = 0; index < length; index += 1) {
    out += PASSWORD_ALPHABET[bytes[index] % PASSWORD_ALPHABET.length];
  }
  return out;
}

export function createPasswordSalt(): string {
  return crypto.randomBytes(16).toString("base64url");
}

export function hashTemporaryPassword(password: string, salt: string): string {
  return crypto.scryptSync(password, salt, 64).toString("base64url");
}

export function verifyTemporaryPassword(password: string, salt: string, expectedHash: string): boolean {
  const candidate = hashTemporaryPassword(password, salt);
  return crypto.timingSafeEqual(Buffer.from(candidate), Buffer.from(expectedHash));
}
