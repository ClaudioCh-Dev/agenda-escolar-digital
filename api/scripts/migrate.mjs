import pg from 'pg';
import { createHash } from 'node:crypto';
import { existsSync, readdirSync, readFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const apiRoot = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const migrationsDir = resolve(apiRoot, 'database', 'migrations');

function loadDotEnv() {
  const envPath = resolve(apiRoot, '.env');
  if (!existsSync(envPath)) {
    return;
  }

  for (const line of readFileSync(envPath, 'utf8').split('\n')) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith('#')) {
      continue;
    }
    const separator = trimmed.indexOf('=');
    if (separator === -1) {
      continue;
    }
    const key = trimmed.slice(0, separator).trim();
    const value = trimmed.slice(separator + 1).trim();
    if (!process.env[key]) {
      process.env[key] = value;
    }
  }
}

function listMigrationFiles() {
  const files = readdirSync(migrationsDir)
    .filter((name) => /^V\d+__.+\.sql$/i.test(name) || /^R__.+\.sql$/i.test(name))
    .sort((a, b) => {
      const rank = (name) => {
        if (name.startsWith('R__')) return [1, name];
        const version = Number(name.match(/^V(\d+)__/)?.[1] ?? 0);
        return [0, version, name];
      };
      const [kindA, ...restA] = rank(a);
      const [kindB, ...restB] = rank(b);
      if (kindA !== kindB) return kindA - kindB;
      for (let i = 0; i < Math.max(restA.length, restB.length); i += 1) {
        if (restA[i] === restB[i]) continue;
        return restA[i] < restB[i] ? -1 : 1;
      }
      return 0;
    });

  return files;
}

function checksum(content) {
  return createHash('sha256').update(content).digest('hex');
}

loadDotEnv();

const databaseUrl = process.env.DATABASE_URL;
if (!databaseUrl) {
  console.error('DATABASE_URL is required (set in api/.env).');
  process.exit(1);
}

const client = new pg.Client({ connectionString: databaseUrl });

try {
  await client.connect();

  await client.query(`
    CREATE TABLE IF NOT EXISTS _schema_migrations (
      name TEXT PRIMARY KEY,
      checksum TEXT NOT NULL,
      applied_at TIMESTAMPTZ NOT NULL DEFAULT now()
    )
  `);

  const files = listMigrationFiles();
  if (!files.length) {
    console.log('No migration files found.');
    process.exit(0);
  }

  for (const file of files) {
    const sql = readFileSync(resolve(migrationsDir, file), 'utf8');
    const fileChecksum = checksum(sql);
    const isRepeatable = file.startsWith('R__');

    const { rows } = await client.query(
      'SELECT checksum FROM _schema_migrations WHERE name = $1',
      [file],
    );

    if (!isRepeatable && rows.length > 0) {
      console.log(`skip  ${file} (already applied)`);
      continue;
    }

    if (isRepeatable && rows[0]?.checksum === fileChecksum) {
      console.log(`skip  ${file} (unchanged)`);
      continue;
    }

    console.log(`apply ${file}...`);
    await client.query('BEGIN');
    try {
      await client.query(sql);
      await client.query(
        `INSERT INTO _schema_migrations (name, checksum)
         VALUES ($1, $2)
         ON CONFLICT (name) DO UPDATE
         SET checksum = EXCLUDED.checksum, applied_at = now()`,
        [file, fileChecksum],
      );
      await client.query('COMMIT');
      console.log(`ok    ${file}`);
    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    }
  }

  console.log('Migrations applied successfully.');
} catch (error) {
  console.error('Migration failed:', error.message ?? error);
  process.exit(1);
} finally {
  await client.end();
}
