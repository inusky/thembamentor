import { parse, serialize } from 'cookie';
import type { H3Event } from 'h3';

const prod = process.env.NODE_ENV === 'production';
const opts = {
  httpOnly: true,
  secure: prod,
  sameSite: 'lax' as const,
  path: '/',
};

export function setAuthTemp(event: H3Event, data: Record<string, string>) {
  const set = Object.entries(data).map(([k, v]) => serialize(k, v, opts));
  setHeader(event, 'Set-Cookie', set);
}

export function readAuthTemp(event: H3Event) {
  return parse(getHeader(event, 'cookie') || '');
}

export function clearAuthTemp(event: H3Event, keys: string[]) {
  const set = keys.map((k) =>
    serialize(k, '', { path: '/', expires: new Date(0) }),
  );
  setHeader(event, 'Set-Cookie', set);
}
