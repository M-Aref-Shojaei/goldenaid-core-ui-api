import { describe, it, expect, afterEach, vi } from 'vitest';

describe('SESSION_CONFIG.EXPIRE_MS', () => {
  const ENV_KEY = 'NEXT_PUBLIC_SESSION_EXPIRE_MINUTES';
  const originalValue = process.env[ENV_KEY];

  afterEach(() => {
    if (originalValue === undefined) {
      delete process.env[ENV_KEY];
    } else {
      process.env[ENV_KEY] = originalValue;
    }
    vi.resetModules();
  });

  it('defaults to 15 minutes when the env var is unset', async () => {
    delete process.env[ENV_KEY];
    vi.resetModules();
    const { SESSION_CONFIG } = await import('../../utils/constants');
    expect(SESSION_CONFIG.EXPIRE_MS).toBe(15 * 60 * 1000);
  });

  it('reads the expiry from NEXT_PUBLIC_SESSION_EXPIRE_MINUTES when set', async () => {
    process.env[ENV_KEY] = '60';
    vi.resetModules();
    const { SESSION_CONFIG } = await import('../../utils/constants');
    expect(SESSION_CONFIG.EXPIRE_MS).toBe(60 * 60 * 1000);
  });
});
