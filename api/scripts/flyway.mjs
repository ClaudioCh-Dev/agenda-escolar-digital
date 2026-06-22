import { spawnSync } from 'node:child_process';
import { existsSync, readFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const apiRoot = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const command = process.argv[2] ?? 'migrate';

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

function parseDatabaseUrl(databaseUrl) {
  const parsed = new URL(databaseUrl);
  const dbName = parsed.pathname.replace(/^\//, '');

  return {
    jdbcUrl: `jdbc:postgresql://${parsed.hostname}:${parsed.port || '5432'}/${dbName}`,
    user: decodeURIComponent(parsed.username),
    password: decodeURIComponent(parsed.password),
  };
}

function dockerHostJdbcUrl(jdbcUrl) {
  return jdbcUrl
    .replace('localhost', 'host.docker.internal')
    .replace('127.0.0.1', 'host.docker.internal');
}

function runFlyway(executable, args, cwd) {
  const result = spawnSync(executable, args, {
    cwd,
    stdio: 'inherit',
    shell: process.platform === 'win32',
  });

  if (result.error) {
    return { ok: false, missing: true };
  }

  return { ok: result.status === 0, missing: false, status: result.status ?? 1 };
}

loadDotEnv();

const databaseUrl = process.env.DATABASE_URL;
if (!databaseUrl) {
  console.error('DATABASE_URL is required (set in .env or environment).');
  process.exit(1);
}

const { jdbcUrl, user, password } = parseDatabaseUrl(databaseUrl);
const migrationsDir = resolve(apiRoot, 'database', 'migrations');
const configFile = resolve(apiRoot, 'flyway.conf');

const flywayArgs = [
  command,
  `-url=${jdbcUrl}`,
  `-user=${user}`,
  `-password=${password}`,
  `-configFiles=${configFile}`,
  `-locations=filesystem:${migrationsDir}`,
];

const native = runFlyway('flyway', flywayArgs, apiRoot);
if (native.ok) {
  process.exit(0);
}

if (!native.missing) {
  process.exit(native.status);
}

console.log('Flyway CLI not found locally, trying Docker (flyway/flyway:11-alpine)...');

const dockerMigrations = migrationsDir.replace(/\\/g, '/');
const dockerConfig = configFile.replace(/\\/g, '/');
const dockerArgs = [
  'run',
  '--rm',
  '-v',
  `${dockerMigrations}:/flyway/sql`,
  '-v',
  `${dockerConfig}:/flyway/conf/flyway.conf`,
  'flyway/flyway:11-alpine',
  command,
  `-url=${dockerHostJdbcUrl(jdbcUrl)}`,
  `-user=${user}`,
  `-password=${password}`,
  '-configFiles=/flyway/conf/flyway.conf',
  '-locations=filesystem:/flyway/sql',
];

const docker = runFlyway('docker', dockerArgs, apiRoot);
if (docker.ok) {
  process.exit(0);
}

console.error(
  'Could not run Flyway. Install Flyway CLI or Docker, then retry: pnpm db:migrate',
);
process.exit(docker.status ?? 1);
