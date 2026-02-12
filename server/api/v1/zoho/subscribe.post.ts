import {
  addSubscriberToZohoList,
  isZohoTestModeEnabled,
  ZohoApiError,
} from '~~/server/utils/zoho';

import {
  defineEventHandler,
  readBody,
  setResponseStatus,
  getRequestIP,
  type H3Event,
} from 'h3';

type SubscribeBody = {
  email?: unknown;
  firstName?: unknown;
  lastName?: unknown;
  phone?: unknown;
};

type SubscribePayload = {
  email: string;
  firstName?: string;
  lastName?: string;
  phone?: string;
};

type RateLimitEntry = {
  count: number;
  resetAt: number;
};

const EMAIL_REGEX =
  /^(?=.{1,254}$)(?=.{1,64}@)[A-Za-z0-9!#$%&'*+/=?^_`{|}~-]+(?:\.[A-Za-z0-9!#$%&'*+/=?^_`{|}~-]+)*@(?:[A-Za-z0-9](?:[A-Za-z0-9-]{0,61}[A-Za-z0-9])?\.)+[A-Za-z]{2,63}$/;
const RATE_LIMIT_WINDOW_MS = 60_000;
const RATE_LIMIT_MAX_REQUESTS = 15;
const rateLimitStore = new Map<string, RateLimitEntry>();

function getClientIp(event: H3Event) {
  return getRequestIP(event, { xForwardedFor: true }) || 'unknown';
}

function isRateLimited(ip: string) {
  const now = Date.now();
  const current = rateLimitStore.get(ip);

  if (!current || current.resetAt <= now) {
    rateLimitStore.set(ip, {
      count: 1,
      resetAt: now + RATE_LIMIT_WINDOW_MS,
    });
    return false;
  }

  current.count += 1;
  rateLimitStore.set(ip, current);
  return current.count > RATE_LIMIT_MAX_REQUESTS;
}

function cleanString(value: unknown, maxLength = 120) {
  if (typeof value !== 'string') return undefined;
  const trimmed = value.trim();
  if (!trimmed) return undefined;
  return trimmed.slice(0, maxLength);
}

function normalizeAndValidate(body: SubscribeBody):
  | {
      ok: true;
      payload: SubscribePayload;
    }
  | {
      ok: false;
      message: string;
    } {
  const email = cleanString(body.email, 254)?.toLowerCase();

  if (!email || !EMAIL_REGEX.test(email)) {
    return { ok: false, message: 'Invalid email format' };
  }

  const firstName = cleanString(body.firstName, 100);
  const lastName = cleanString(body.lastName, 100);
  const phone = cleanString(body.phone, 40);

  return {
    ok: true,
    payload: {
      email,
      firstName,
      lastName,
      phone,
    },
  };
}

function safeErrorMessage(error: unknown) {
  if (error instanceof Error) return error.message;
  return 'Unknown error';
}

export default defineEventHandler(async (event) => {
  const ip = getClientIp(event);

  if (isRateLimited(ip)) {
    setResponseStatus(event, 429);
    return {
      ok: false,
      error: 'Too many requests. Please try again shortly.',
    };
  }

  let body: SubscribeBody;
  try {
    body = (await readBody(event)) as SubscribeBody;
  } catch {
    setResponseStatus(event, 400);
    return {
      ok: false,
      error: 'Invalid JSON body',
    };
  }

  if (!body || typeof body !== 'object' || Array.isArray(body)) {
    setResponseStatus(event, 400);
    return {
      ok: false,
      error: 'Body must be a JSON object',
    };
  }

  const validation = normalizeAndValidate(body);
  if (!validation.ok) {
    setResponseStatus(event, 400);
    return {
      ok: false,
      error: validation.message,
    };
  }

  const payload = validation.payload;

  if (isZohoTestModeEnabled()) {
    console.info('[subscribe] TEST_MODE=true; skipping Zoho API call', {
      email: payload.email,
      firstName: payload.firstName,
      lastName: payload.lastName,
      phone: payload.phone,
      ip,
    });
    return { ok: true };
  }

  try {
    const result = await addSubscriberToZohoList(payload);

    if (result.alreadyExists) {
      console.info(
        '[subscribe] Contact already exists in list; treated as success',
        {
          email: payload.email,
        },
      );
    }

    return { ok: true };
  } catch (error) {
    if (error instanceof ZohoApiError) {
      console.error('[subscribe] Zoho API error', {
        statusCode: error.statusCode,
        zohoCode: error.zohoCode,
        message: error.message,
        email: payload.email,
      });

      setResponseStatus(event, 502);
      return {
        ok: false,
        error: `Failed to subscribe via Zoho${error.zohoCode ? ` (code: ${error.zohoCode})` : ''}`,
      };
    }

    console.error('[subscribe] Unexpected server error', {
      message: safeErrorMessage(error),
      email: payload.email,
    });

    setResponseStatus(event, 500);
    return {
      ok: false,
      error: 'Internal server error',
    };
  }
});
