import { getRequestIP, type H3Event } from 'h3';

type TurnstileVerifyResponse = {
  success?: boolean;
  'error-codes'?: string[];
};

const TURNSTILE_VERIFY_URL =
  'https://challenges.cloudflare.com/turnstile/v0/siteverify';

function formatError(error: unknown) {
  return error instanceof Error ? error.message : String(error);
}

export function isTurnstileEnabled(event: H3Event) {
  const config = useRuntimeConfig(event);

  return Boolean(
    config.turnstileSecretKey && config.public.turnstileSiteKey,
  );
}

export async function verifyTurnstileToken(
  event: H3Event,
  token: unknown,
) {
  const config = useRuntimeConfig(event);

  if (!isTurnstileEnabled(event)) {
    return false;
  }

  if (typeof token !== 'string' || !token.trim()) {
    return false;
  }

  const body = new URLSearchParams();
  body.set('secret', config.turnstileSecretKey);
  body.set('response', token.trim());

  const remoteIp = getRequestIP(event, { xForwardedFor: true });
  if (remoteIp) {
    body.set('remoteip', remoteIp);
  }

  try {
    const response = await fetch(TURNSTILE_VERIFY_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: body.toString(),
    });

    if (!response.ok) {
      console.error('[turnstile] Verification request failed', {
        status: response.status,
      });
      return false;
    }

    const payload = (await response.json()) as TurnstileVerifyResponse;

    if (!payload.success && import.meta.dev) {
      console.info('[turnstile] Verification rejected token', {
        errors: payload['error-codes'] || [],
      });
    }

    return Boolean(payload.success);
  } catch (error) {
    console.error('[turnstile] Verification failed', {
      message: formatError(error),
    });
    return false;
  }
}
