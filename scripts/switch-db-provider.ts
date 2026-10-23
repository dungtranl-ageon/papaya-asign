import * as fs from 'fs';
import * as path from 'path';
import { execSync } from 'child_process';

const SCHEMA_PATH = path.resolve(__dirname, '../apps/api/prisma/schema.prisma');
const ENV_PATH = path.resolve(__dirname, '../.env');

type Provider = 'sqlite' | 'postgresql';

function detectProviderFromEnv(): Provider {
  if (!fs.existsSync(ENV_PATH)) {
    return 'sqlite';
  }
  const envContent = fs.readFileSync(ENV_PATH, 'utf-8');
  const match = envContent.match(/DATABASE_URL=["']?([^"'\r\n]+)["']?/);
  if (!match) return 'sqlite';

  const dbUrl = match[1].trim();
  if (dbUrl.startsWith('postgresql://') || dbUrl.startsWith('postgres://')) {
    return 'postgresql';
  }
  return 'sqlite';
}

function switchProvider(target: Provider) {
  if (!fs.existsSync(SCHEMA_PATH)) {
    console.error(`❌ Schema file not found at: ${SCHEMA_PATH}`);
    process.exit(1);
  }

  let content = fs.readFileSync(SCHEMA_PATH, 'utf-8');
  const currentProviderMatch = content.match(/provider\s*=\s*"([^"]+)"/);
  const currentProvider = currentProviderMatch ? currentProviderMatch[1] : 'unknown';

  if (currentProvider === target) {
    console.log(`ℹ️  Prisma schema already configured for provider: "${target}".`);
  } else {
    console.log(
      `🔄 Switching Prisma datasource provider from "${currentProvider}" -> "${target}"...`,
    );
    content = content.replace(
      /datasource db\s*\{\s*provider\s*=\s*"[^"]+"/m,
      `datasource db {\n  provider = "${target}"`,
    );
    fs.writeFileSync(SCHEMA_PATH, content, 'utf-8');
    console.log(`✅ Updated ${SCHEMA_PATH}`);
  }

  console.log(`📦 Regenerating Prisma Client for "${target}"...`);
  try {
    execSync('pnpm --filter @papaya/api prisma generate', { stdio: 'inherit' });
    console.log(`🎉 Successfully synchronized Prisma for "${target}"!`);
  } catch (error) {
    console.error('❌ Failed to regenerate Prisma client:', error);
    process.exit(1);
  }
}

// CLI argument parsing
const arg = process.argv[2]?.toLowerCase();
if (arg === 'sqlite') {
  switchProvider('sqlite');
} else if (arg === 'postgres' || arg === 'postgresql') {
  switchProvider('postgresql');
} else if (arg === 'auto' || !arg) {
  const detected = detectProviderFromEnv();
  console.log(`🔍 Detected database provider from .env: "${detected}"`);
  switchProvider(detected);
} else {
  console.error(`Usage: tsx scripts/switch-db-provider.ts [sqlite|postgres|auto]`);
  process.exit(1);
}
