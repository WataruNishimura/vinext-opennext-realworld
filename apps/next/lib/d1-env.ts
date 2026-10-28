import type { D1HttpOptions } from '@realworld/db/d1-http';

/** Server-only environment variables that reach D1 over the Cloudflare REST API. */
const REQUIRED = [
  'CLOUDFLARE_ACCOUNT_ID',
  'CLOUDFLARE_D1_DATABASE_ID',
  'CLOUDFLARE_D1_API_TOKEN',
] as const;

type Env = Readonly<Record<string, string | undefined>>;

export class MissingD1EnvError extends Error {
  constructor(missing: readonly string[]) {
    super(
      `Missing ${missing.join(', ')}. Set them in .env.local or the Vercel project settings ` +
        '(see apps/next/.env.example).',
    );
    this.name = 'MissingD1EnvError';
  }
}

/**
 * The D1 REST API options from the environment. `CLOUDFLARE_API_BASE_URL` is optional and only
 * points local runs at the Miniflare emulator (scripts/with-d1.ts).
 */
export function d1HttpOptionsFromEnv(env: Env): D1HttpOptions {
  const missing = REQUIRED.filter(name => !env[name]);
  const accountId = env['CLOUDFLARE_ACCOUNT_ID'];
  const databaseId = env['CLOUDFLARE_D1_DATABASE_ID'];
  const apiToken = env['CLOUDFLARE_D1_API_TOKEN'];
  if (!accountId || !databaseId || !apiToken) throw new MissingD1EnvError(missing);

  const baseUrl = env['CLOUDFLARE_API_BASE_URL'];
  return { accountId, databaseId, apiToken, ...(baseUrl ? { baseUrl } : {}) };
}
