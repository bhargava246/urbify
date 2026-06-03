/**
 * Frontend environment validation.
 * Runs at module-load time (server & client) so missing vars surface
 * immediately as a clear error rather than a cryptic runtime failure.
 *
 * Add any new NEXT_PUBLIC_* vars to the `required` list below.
 */

const required = [
  'NEXT_PUBLIC_APP_URL',
  'NEXT_PUBLIC_API_URL',
] as const;

// Optional — app works without these, specific features degrade gracefully
const optional = {
  NEXT_PUBLIC_OLA_MAPS_API_KEY: '',
};

type RequiredEnvKey = (typeof required)[number];

function validateEnv(): Record<RequiredEnvKey, string> {
  const missing: string[] = [];

  for (const key of required) {
    if (!process.env[key]) missing.push(key);
  }

  if (missing.length > 0) {
    const msg =
      `[Urbify] Missing required environment variables:\n` +
      missing.map((k) => `  • ${k}`).join('\n') +
      `\n\nCopy .env.example to .env.local and fill in the values.`;

    // In production throw hard so the build/deploy fails visibly.
    // In development print a loud warning but let the dev server start.
    if (process.env.NODE_ENV === 'production') {
      throw new Error(msg);
    } else {
      console.warn('\x1b[33m' + msg + '\x1b[0m');
    }
  }

  return required.reduce(
    (acc, key) => {
      acc[key] = process.env[key] ?? '';
      return acc;
    },
    {} as Record<RequiredEnvKey, string>,
  );
}

export const env = validateEnv();

// Typed convenience accessors
export const APP_URL = env.NEXT_PUBLIC_APP_URL;
export const API_URL = env.NEXT_PUBLIC_API_URL;
export const OLA_MAPS_API_KEY = env.NEXT_PUBLIC_OLA_MAPS_API_KEY;
