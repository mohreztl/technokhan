// Import WordPress users into the new site's database.
//
//   pnpm --filter api migrate:users
//   pnpm --filter api migrate:users -- --dry-run
//
// Input: data/exports/users.json — produced on the WordPress side, because the
// REST API never exposes password hashes:
//   wp user list --format=json --fields=ID,user_login,user_email,display_name,user_pass
//   plus billing phone (export plugin / wp eval from user_meta _billing_phone):
//   [{ "ID": 1, "user_login": "ali", "user_email": "a@b.c", "display_name": "Ali",
//      "user_pass": "$P$9...", "billing_phone": "0912..." }]
//
// Passwords stay as WordPress phpass hashes in `wpPassHash`; the first
// successful login rehashes them to bcrypt automatically (lib/phpass.ts).
import { prisma } from '../src/lib/prisma';
import { readExport, saveExport } from './migration-utils';

interface WpUser {
  ID: number | string;
  user_login: string;
  user_email?: string;
  display_name?: string;
  user_pass?: string;
  billing_phone?: string;
}

const dryRun = process.argv.includes('--dry-run');

/** 0912… / +98912… / 98912… → 09123456789 */
function normalizePhone(raw: string | undefined): string | null {
  if (!raw) return null;
  let digits = raw.replace(/\D/g, '');
  if (digits.startsWith('0098')) digits = digits.slice(4);
  if (digits.startsWith('98')) digits = digits.slice(2);
  if (digits.startsWith('9')) digits = `0${digits}`;
  return /^09\d{9}$/.test(digits) ? digits : null;
}

async function run() {
  const users = readExport<WpUser>('users.json');
  const skipped: Array<{ id: string | number; reason: string }> = [];
  let created = 0;
  let existing = 0;

  for (const wpUser of users) {
    const phoneNumber = normalizePhone(wpUser.billing_phone);
    const username = wpUser.user_login?.toLowerCase();
    if (!phoneNumber) {
      skipped.push({ id: wpUser.ID, reason: 'no valid mobile number (_billing_phone)' });
      continue;
    }
    if (!username) {
      skipped.push({ id: wpUser.ID, reason: 'empty user_login' });
      continue;
    }

    const data = {
      username,
      phoneNumber,
      name: wpUser.display_name || null,
      email: wpUser.user_email || null,
      wpPassHash: wpUser.user_pass?.startsWith('$P$') || wpUser.user_pass?.startsWith('$H$') ? wpUser.user_pass : null,
    };

    const found = await prisma.user.findFirst({
      where: { OR: [{ phoneNumber }, { username }] },
      select: { id: true },
    });
    if (found) {
      existing++;
      if (!dryRun) await prisma.user.update({ where: { id: found.id }, data });
      continue;
    }

    created++;
    if (!dryRun) await prisma.user.create({ data });
  }

  saveExport('users-skipped.json', skipped as unknown as never[]);
  console.log(JSON.stringify({ total: users.length, created, existing, skipped: skipped.length, dryRun }, null, 2));
}

run()
  .catch((error) => {
    console.error(error);
    process.exitCode = 1;
  })
  .finally(() => prisma.$disconnect());
