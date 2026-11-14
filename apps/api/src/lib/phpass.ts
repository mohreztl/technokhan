import { createHash } from 'node:crypto';

/**
 * Verifier for WordPress password hashes (phpass "portable" format, `$P$`/`$H$`).
 *
 * Migrated users keep their WordPress hash in `User.wpPassHash`. On the first
 * successful password login the hash is checked here, then transparently
 * rehashed to bcrypt and `wpPassHash` is cleared — the old password keeps
 * working exactly once through the migration boundary.
 *
 * Port of phpass's `crypt_private()` (Openwall, public domain) using Node's md5.
 */

const ITOA64 = './0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz';

function md5Raw(input: string | Buffer): Buffer {
  return createHash('md5').update(input).digest();
}

function encode64(input: Buffer, count: number): string {
  let output = '';
  let i = 0;
  while (i < count) {
    let value = input[i]!;
    output += ITOA64[value & 0x3f];
    i++;
    if (i < count) value |= input[i]! << 8;
    output += ITOA64[(value >> 6) & 0x3f];
    if (i >= count) break;
    i++;
    if (i < count) value |= input[i]! << 16;
    output += ITOA64[(value >> 12) & 0x3f];
    if (i >= count) break;
    i++;
    output += ITOA64[(value >> 18) & 0x3f];
  }
  return output;
}

function cryptPrivate(password: string, setting: string): string {
  let output = '*0';
  if (setting.startsWith('*')) return '*1';
  if (setting.length < 12) return output;

  // WordPress only ever uses $P$; $H$ is the same algorithm.
  if (!setting.startsWith('$P$') && !setting.startsWith('$H$')) return output;

  const countLog2 = ITOA64.indexOf(setting[3]!);
  if (countLog2 < 7 || countLog2 > 30) return output;

  const count = 1 << countLog2;
  const salt = setting.slice(4, 12);
  if (salt.length !== 8) return output;

  let hash = md5Raw(Buffer.concat([Buffer.from(salt, 'binary'), Buffer.from(password, 'binary')]));
  for (let i = 0; i < count; i++) {
    hash = md5Raw(Buffer.concat([hash, Buffer.from(password, 'binary')]));
  }

  return setting.slice(0, 12) + encode64(hash, 16);
}

/** True when `password` matches a stored WordPress/phpass hash. */
export function verifyWpPassword(password: string, storedHash: string): boolean {
  if (!storedHash) return false;
  const computed = cryptPrivate(password, storedHash);
  // phpass compares in constant time; lengths are fixed so === is acceptable here.
  return computed.length === storedHash.length && computed === storedHash;
}
