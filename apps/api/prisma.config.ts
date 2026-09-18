import path from 'node:path';
import dotenv from 'dotenv';
import { defineConfig } from 'prisma/config';

// Prisma 7 stopped reading .env on its own. Without this the CLI sees no
// DATABASE_URL and every migrate command refuses to run.
dotenv.config({ quiet: true });

/**
 * Prisma 7 removed `url` from the datasource block and dropped the `prisma`
 * key from package.json. Both live here now: the CLI reads the connection
 * string from this file, and the application opens its own connection through
 * a driver adapter (see src/lib/prisma.ts).
 */
const databaseUrl = process.env.DATABASE_URL;

export default defineConfig({
  schema: path.join('prisma', 'schema.prisma'),
  migrations: {
    path: path.join('prisma', 'migrations'),
    seed: 'tsx prisma/seed.ts',
  },
  // Omitted rather than empty when unset: `prisma generate` does not need a
  // database and has to keep working in a checkout with no .env, which is what
  // CI type-checks against. Migrate commands report the missing URL themselves,
  // with a better message than a blank one would produce.
  ...(databaseUrl ? { datasource: { url: databaseUrl } } : {}),
});
