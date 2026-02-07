import Iron from '@hapi/iron';
import { parse, serialize } from 'cookie';
import type { H3Event } from 'h3';

export type AppSession = {
  sub: string;
  email?: string;
  name?: string;
  picture?: string;
  iat: number;
};

function cookieBaseOptions() {
  const prod = process.env.NODE_ENV === 'production';
  return {
    httpOnly: true,
    secure: prod,
    sameSite: 'lax' as const,
    path: '/',
  };
}

export async function setSession(event: H3Event, session: AppSession) {
  const config = useRuntimeConfig();
  if (!config.authSessionPassword)
    throw new Error('Missing AUTH_SESSION_PASSWORD');

  const sealed = await Iron.seal(
    session,
    config.authSessionPassword,
    Iron.defaults,
  );

  setHeader(
    event,
    'Set-Cookie',
    serialize(config.authCookieName, sealed, {
      ...cookieBaseOptions(),
      // e.g. 7 days:
      maxAge: 60 * 60 * 24 * 7,
    }),
  );
}

export async function getUserSession(
  event: H3Event,
): Promise<AppSession | null> {
  const config = useRuntimeConfig();
  if (!config.authSessionPassword)
    throw new Error('Missing AUTH_SESSION_PASSWORD');

  const cookies = parse(getHeader(event, 'cookie') || '');
  const sealed = cookies[config.authCookieName];
  if (!sealed) return null;

  try {
    return (await Iron.unseal(
      sealed,
      config.authSessionPassword,
      Iron.defaults,
    )) as AppSession;
  } catch {
    return null;
  }
}

export function clearUserSession(event: H3Event) {
  const config = useRuntimeConfig();
  setHeader(
    event,
    'Set-Cookie',
    serialize(config.authCookieName, '', {
      ...cookieBaseOptions(),
      expires: new Date(0),
    }),
  );
}
