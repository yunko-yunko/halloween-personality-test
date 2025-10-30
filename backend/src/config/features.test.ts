/**
 * Feature flag tests
 * These tests verify that feature flags are correctly read from environment variables
 */

describe('Feature Flags', () => {
  const originalEnv = process.env;

  beforeEach(() => {
    jest.resetModules();
    process.env = { ...originalEnv };
  });

  afterAll(() => {
    process.env = originalEnv;
  });

  it('should enable email auth when ENABLE_EMAIL_AUTH is true', () => {
    process.env.ENABLE_EMAIL_AUTH = 'true';
    const { features } = require('./features');
    expect(features.emailAuth).toBe(true);
  });

  it('should disable email auth when ENABLE_EMAIL_AUTH is false', () => {
    process.env.ENABLE_EMAIL_AUTH = 'false';
    const { features } = require('./features');
    expect(features.emailAuth).toBe(false);
  });

  it('should disable email auth when ENABLE_EMAIL_AUTH is not set', () => {
    delete process.env.ENABLE_EMAIL_AUTH;
    const { features } = require('./features');
    expect(features.emailAuth).toBe(false);
  });

  it('should disable email auth for any value other than "true"', () => {
    process.env.ENABLE_EMAIL_AUTH = 'yes';
    const { features } = require('./features');
    expect(features.emailAuth).toBe(false);
  });
});
