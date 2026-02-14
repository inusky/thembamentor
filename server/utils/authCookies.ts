import { parse, serialize } from 'cookie';
import { appendHeader, getHeader, type H3Event } from 'h3';

export const PASSWORDLESS_SUCCESS_COOKIE = 'pwl_success';

function cookieBaseOptions() {
  const prod = process.env.NODE_ENV === 'production';

  return {
    secure: prod,
    sameSite: 'lax' as const,
    path: '/',
  };
}

function appendSetCookie(event: H3Event, value: string) {
  appendHeader(event, 'Set-Cookie', value);
}

export function setPasswordlessSuccessCookie(event: H3Event, ttlSeconds: number) {
  appendSetCookie(
    event,
    serialize(PASSWORDLESS_SUCCESS_COOKIE, '1', {
      ...cookieBaseOptions(),
      httpOnly: false,
      maxAge: ttlSeconds,
    }),
  );
}

export function clearPasswordlessSuccessCookie(event: H3Event) {
  appendSetCookie(
    event,
    serialize(PASSWORDLESS_SUCCESS_COOKIE, '', {
      ...cookieBaseOptions(),
      httpOnly: false,
      expires: new Date(0),
    }),
  );
}

export function setAuthTemp(event: H3Event, data: Record<string, string>) {
  for (const [key, value] of Object.entries(data)) {
    appendSetCookie(
      event,
      serialize(key, value, {
        ...cookieBaseOptions(),
        httpOnly: true,
      }),
    );
  }
}

export function readAuthTemp(event: H3Event) {
  return parse(getHeader(event, 'cookie') || '');
}

export function clearAuthTemp(event: H3Event, keys: string[]) {
  for (const key of keys) {
    appendSetCookie(
      event,
      serialize(key, '', {
        ...cookieBaseOptions(),
        httpOnly: true,
        expires: new Date(0),
      }),
    );
  }
}
