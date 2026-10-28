import { describe, expect, it } from 'vitest';
import { d1HttpOptionsFromEnv, MissingD1EnvError } from '../lib/d1-env.ts';

const env = {
  CLOUDFLARE_ACCOUNT_ID: 'account',
  CLOUDFLARE_D1_DATABASE_ID: 'database',
  CLOUDFLARE_D1_API_TOKEN: 'token',
};

describe('d1HttpOptionsFromEnv', () => {
  it('reads the account, database and token', () => {
    expect(d1HttpOptionsFromEnv(env)).toEqual({
      accountId: 'account',
      databaseId: 'database',
      apiToken: 'token',
    });
  });

  it('points at another API base URL only when one is set', () => {
    expect(
      d1HttpOptionsFromEnv({ ...env, CLOUDFLARE_API_BASE_URL: 'http://127.0.0.1:8788/client/v4' }),
    ).toEqual({
      accountId: 'account',
      databaseId: 'database',
      apiToken: 'token',
      baseUrl: 'http://127.0.0.1:8788/client/v4',
    });
    expect(d1HttpOptionsFromEnv({ ...env, CLOUDFLARE_API_BASE_URL: '' })).not.toHaveProperty(
      'baseUrl',
    );
  });

  it('names every missing or empty variable', () => {
    expect(() => d1HttpOptionsFromEnv({ CLOUDFLARE_ACCOUNT_ID: 'account' })).toThrow(
      MissingD1EnvError,
    );
    expect(() =>
      d1HttpOptionsFromEnv({ CLOUDFLARE_ACCOUNT_ID: '', CLOUDFLARE_D1_DATABASE_ID: 'database' }),
    ).toThrow('CLOUDFLARE_ACCOUNT_ID, CLOUDFLARE_D1_API_TOKEN');
  });
});
