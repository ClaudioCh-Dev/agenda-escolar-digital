import pg from 'pg';
import { existsSync, readFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const apiRoot = resolve(dirname(fileURLToPath(import.meta.url)), '..');

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

loadDotEnv();

const databaseUrl = process.env.DATABASE_URL;
if (!databaseUrl) {
  console.error('DATABASE_URL is required.');
  process.exit(1);
}

const sql = readFileSync(resolve(apiRoot, 'database', 'seed-dev.sql'), 'utf8');
const client = new pg.Client({ connectionString: databaseUrl });

const SUMMARY_SQL = `
  SELECT
    (SELECT COUNT(*)::int FROM entries) AS entries,
    (SELECT COUNT(*)::int FROM calendar_events) AS calendar_events,
    (SELECT COUNT(*)::int FROM notifications) AS notifications,
    (SELECT COUNT(*)::int FROM conversations) AS conversations,
    (SELECT COUNT(*)::int FROM messages) AS messages,
    (SELECT COUNT(*)::int FROM entry_reads) AS entry_reads
`;

try {
  await client.connect();
  await client.query(sql);

  const { rows } = await client.query(SUMMARY_SQL);
  const counts = rows[0];

  console.log('seed-dev.sql applied successfully.');
  console.log('Demo data (TODAY = 2026-06-13 en mobil/src/constants/config.ts):');
  console.log(`  entries:          ${counts.entries}`);
  console.log(`  calendar_events:  ${counts.calendar_events}`);
  console.log(`  notifications:    ${counts.notifications}`);
  console.log(`  conversations:    ${counts.conversations}`);
  console.log(`  messages:         ${counts.messages}`);
  console.log(`  entry_reads:      ${counts.entry_reads}`);
  console.log('');
  console.log('Logins: t10000001 | p10000001 | e10000001 — password: demo123');
} catch (error) {
  console.error('Failed to apply seed-dev.sql:', error);
  process.exit(1);
} finally {
  await client.end();
}
