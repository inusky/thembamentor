type ZohoSubscribeInput = {
  name: string;
  email: string;
  phone?: string;
};

type ZohoSubscribeResult = {
  ok: true;
  alreadyExists?: boolean;
};

type ZohoCampaignsConfig = {
  clientId: string;
  clientSecret: string;
  refreshToken: string;
  listKey: string;
  orgId?: string;
  dc: string;
  baseUrl: string;
  tokenEndpoint: string;
};

type ZohoTokenResponse = {
  access_token?: string;
  expires_in?: number;
  error?: string;
  error_description?: string;
};

type ZohoApiRecord = {
  code?: string | number;
  message?: string;
  status?: string;
  [key: string]: unknown;
};

type ContactInfoFormat = 'json' | 'legacy';

const ACCESS_TOKEN_EXPIRY_BUFFER_MS = 60_000;
const IDEMPOTENT_ZOHO_CODES = new Set([
  'already_exists',
  'already_exist',
  'already_subscribed',
  'duplicate_data',
  'duplicate',
  'contact_already_exists',
]);

let accessTokenCache: {
  accessToken: string;
  expiresAt: number;
} | null = null;

export class ZohoSubscribeError extends Error {
  statusCode: number;
  code?: string;

  constructor(message: string, statusCode: number, code?: string) {
    super(message);
    this.name = 'ZohoSubscribeError';
    this.statusCode = statusCode;
    this.code = code;
  }
}

function cleanOptionalString(value: unknown) {
  if (typeof value !== 'string') return undefined;
  const trimmed = value.trim();
  return trimmed || undefined;
}

function requireString(value: unknown, key: string) {
  const cleaned = cleanOptionalString(value);
  if (!cleaned) {
    throw new ZohoSubscribeError(
      `Missing required runtime config: ${key}`,
      500,
    );
  }
  return cleaned;
}

function getZohoCampaignsConfig(): ZohoCampaignsConfig {
  const runtimeConfig = useRuntimeConfig();
  const zohoCampaigns = runtimeConfig.zohoCampaigns as
    | Record<string, unknown>
    | undefined;

  const dc = cleanOptionalString(zohoCampaigns?.dc) || 'zoho.in';
  const baseUrl = (cleanOptionalString(zohoCampaigns?.baseUrl) ||
    'campaigns.zoho.in')
    .replace(/^https?:\/\//, '')
    .replace(/\/+$/, '');

  return {
    clientId: requireString(
      zohoCampaigns?.clientId,
      'runtimeConfig.zohoCampaigns.clientId',
    ),
    clientSecret: requireString(
      zohoCampaigns?.clientSecret,
      'runtimeConfig.zohoCampaigns.clientSecret',
    ),
    refreshToken: requireString(
      zohoCampaigns?.refreshToken,
      'runtimeConfig.zohoCampaigns.refreshToken',
    ),
    listKey: requireString(
      zohoCampaigns?.listKey,
      'runtimeConfig.zohoCampaigns.listKey',
    ),
    orgId: cleanOptionalString(zohoCampaigns?.orgId),
    dc,
    baseUrl,
    tokenEndpoint: `https://accounts.${dc}/oauth/v2/token`,
  };
}

function isTestModeEnabled() {
  return process.env.TEST_MODE?.toLowerCase() === 'true';
}

function splitName(name: string) {
  const parts = name
    .trim()
    .split(/\s+/)
    .filter(Boolean);

  if (parts.length === 0) {
    return {
      firstName: undefined,
      lastName: undefined,
    };
  }

  if (parts.length === 1) {
    return {
      firstName: parts[0],
      lastName: undefined,
    };
  }

  return {
    firstName: parts[0],
    lastName: parts.slice(1).join(' '),
  };
}

function buildContactInfo(
  input: {
    email: string;
    firstName?: string;
    lastName?: string;
    phone?: string;
  },
  format: ContactInfoFormat,
) {
  const contactInfo: Record<string, string> = {
    'Contact Email': input.email,
  };

  if (input.firstName) contactInfo['First Name'] = input.firstName;
  if (input.lastName) contactInfo['Last Name'] = input.lastName;
  if (input.phone) contactInfo.Phone = input.phone;

  if (format === 'json') {
    return JSON.stringify(contactInfo);
  }

  const entries = Object.entries(contactInfo).map(([key, value]) => {
    const safeValue = value.replace(/[{},]/g, ' ').trim();
    return `${key}:${safeValue}`;
  });

  return `{${entries.join(',')}}`;
}

function isObjectRecord(value: unknown): value is Record<string, unknown> {
  return Boolean(value) && typeof value === 'object' && !Array.isArray(value);
}

function normalizeCode(code: string | undefined) {
  return code ? code.toLowerCase() : '';
}

function readCode(payload: unknown) {
  if (!isObjectRecord(payload)) return undefined;
  const value = payload.code;
  if (value == null) return undefined;
  return String(value);
}

function readMessage(payload: unknown) {
  if (!isObjectRecord(payload)) return '';
  return typeof payload.message === 'string' ? payload.message : '';
}

function readStatus(payload: unknown) {
  if (!isObjectRecord(payload)) return '';
  return typeof payload.status === 'string' ? payload.status : '';
}

function collectZohoRecords(payload: unknown): ZohoApiRecord[] {
  const records: ZohoApiRecord[] = [];
  const queue: unknown[] = [payload];
  const seen = new Set<object>();

  while (queue.length > 0) {
    const current = queue.shift();
    if (!isObjectRecord(current)) continue;
    if (seen.has(current)) continue;
    seen.add(current);

    if (
      readCode(current) ||
      typeof current.message === 'string' ||
      typeof current.status === 'string'
    ) {
      records.push(current as ZohoApiRecord);
    }

    for (const value of Object.values(current)) {
      if (Array.isArray(value)) {
        for (const item of value) {
          if (isObjectRecord(item)) queue.push(item);
        }
        continue;
      }

      if (isObjectRecord(value)) {
        queue.push(value);
      }
    }
  }

  return records;
}

function isSuccessCode(code: string) {
  const normalizedCode = normalizeCode(code);
  return normalizedCode === '0' || normalizedCode === 'success';
}

function isIdempotentCode(code: string) {
  return IDEMPOTENT_ZOHO_CODES.has(normalizeCode(code));
}

function isAlreadyExistsMessage(message: string) {
  const normalized = message.toLowerCase();
  return (
    normalized.includes('already') &&
    (normalized.includes('exist') ||
      normalized.includes('subscribed') ||
      normalized.includes('member'))
  );
}

function isSuccessRecord(record: ZohoApiRecord) {
  const code = readCode(record);
  const status = readStatus(record).toLowerCase();
  const message = readMessage(record).toLowerCase();

  if (code && isSuccessCode(code)) return true;
  if (status === 'success') return true;

  return (
    message.includes('success') ||
    message.includes('added') ||
    message.includes('subscribed') ||
    message.includes('updated') ||
    message.includes('created')
  );
}

function isAlreadyExistsRecord(record: ZohoApiRecord) {
  const code = readCode(record);
  const message = readMessage(record);
  if (code && isIdempotentCode(code)) return true;
  return isAlreadyExistsMessage(message);
}

function getFirstCode(payload: unknown) {
  const topLevelCode = readCode(payload);
  if (topLevelCode) return topLevelCode;

  return collectZohoRecords(payload)
    .map((record) => readCode(record))
    .find((code): code is string => Boolean(code));
}

function getFirstMessage(payload: unknown) {
  const topLevelMessage = readMessage(payload);
  if (topLevelMessage) return topLevelMessage;

  return collectZohoRecords(payload)
    .map((record) => readMessage(record))
    .find((message) => Boolean(message));
}

function shouldRetryLegacyContactInfo(payload: unknown) {
  return getFirstCode(payload) === '2001';
}

function isInvalidOAuthToken(payload: unknown) {
  const code = normalizeCode(getFirstCode(payload));
  const message = (getFirstMessage(payload) || '').toLowerCase();

  return (
    code.includes('invalid_oauthtoken') || message.includes('invalid_oauthtoken')
  );
}

function parseSubscribeResult(response: Response, payload: unknown) {
  const records = collectZohoRecords(payload);
  const hasSuccess = records.some((record) => isSuccessRecord(record));
  const alreadyExists = records.some((record) => isAlreadyExistsRecord(record));

  if ((response.ok && hasSuccess) || alreadyExists) {
    return {
      ok: true as const,
      alreadyExists: alreadyExists || undefined,
    };
  }

  const code = getFirstCode(payload);
  const message = getFirstMessage(payload);
  const errorMessage = message
    ? `Zoho Campaigns list subscribe failed: ${message}`
    : 'Zoho Campaigns list subscribe API request failed';

  throw new ZohoSubscribeError(
    errorMessage,
    response.ok ? 502 : response.status || 502,
    code,
  );
}

async function parseResponseBody(response: Response) {
  const text = await response.text();
  if (!text) return {};

  try {
    return JSON.parse(text) as Record<string, unknown>;
  } catch {
    return { raw: text };
  }
}

async function fetchZohoAccessToken(
  config: ZohoCampaignsConfig,
  forceRefresh = false,
) {
  if (
    !forceRefresh &&
    accessTokenCache &&
    accessTokenCache.expiresAt > Date.now() + ACCESS_TOKEN_EXPIRY_BUFFER_MS
  ) {
    return accessTokenCache.accessToken;
  }

  const body = new URLSearchParams({
    refresh_token: config.refreshToken,
    client_id: config.clientId,
    client_secret: config.clientSecret,
    grant_type: 'refresh_token',
  });

  const response = await fetch(config.tokenEndpoint, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body,
  });

  const payload = (await parseResponseBody(response)) as ZohoTokenResponse;

  if (!response.ok || !payload.access_token) {
    throw new ZohoSubscribeError(
      'Failed to retrieve Zoho OAuth access token',
      response.status || 502,
      payload.error ? String(payload.error) : undefined,
    );
  }

  const expiresInSeconds =
    typeof payload.expires_in === 'number' ? payload.expires_in : 3600;
  accessTokenCache = {
    accessToken: payload.access_token,
    expiresAt: Date.now() + expiresInSeconds * 1000,
  };

  return payload.access_token;
}

async function runSubscribeRequest(
  config: ZohoCampaignsConfig,
  input: {
    email: string;
    firstName?: string;
    lastName?: string;
    phone?: string;
  },
  options: {
    forceTokenRefresh?: boolean;
    format?: ContactInfoFormat;
  } = {},
) {
  const accessToken = await fetchZohoAccessToken(
    config,
    options.forceTokenRefresh,
  );
  const format = options.format || 'json';

  const body = new URLSearchParams({
    resfmt: 'JSON',
    listkey: config.listKey,
    source: 'Nuxt Lead Signup',
    contactinfo: buildContactInfo(input, format),
  });

  const headers: Record<string, string> = {
    Authorization: `Zoho-oauthtoken ${accessToken}`,
    'Content-Type': 'application/x-www-form-urlencoded',
  };

  if (config.orgId) {
    headers['X-com-zoho-campaigns-organizationid'] = config.orgId;
  }

  const response = await fetch(
    `https://${config.baseUrl}/api/v1.1/json/listsubscribe`,
    {
      method: 'POST',
      headers,
      body,
    },
  );

  const payload = await parseResponseBody(response);

  if (import.meta.dev) {
    console.info('[zoho-subscribe] Zoho Campaigns listsubscribe response', {
      statusCode: response.status,
      ok: response.ok,
      listKey: config.listKey,
      orgId: config.orgId || null,
      payload,
    });
  }

  return { response, payload, format };
}

export async function subscribeZohoList(
  input: ZohoSubscribeInput,
): Promise<ZohoSubscribeResult> {
  const config = getZohoCampaignsConfig();

  if (isTestModeEnabled()) {
    if (import.meta.dev) {
      console.info('[zoho-subscribe] TEST_MODE=true; skipping Zoho call', {
        email: input.email,
        listKey: config.listKey,
        orgId: config.orgId || null,
      });
    }

    return {
      ok: true,
    };
  }

  const { firstName, lastName } = splitName(input.name);
  const subscribeInput = {
    email: input.email,
    firstName,
    lastName,
    phone: input.phone,
  };

  let result = await runSubscribeRequest(config, subscribeInput, {
    forceTokenRefresh: false,
    format: 'json',
  });

  if (shouldRetryLegacyContactInfo(result.payload)) {
    result = await runSubscribeRequest(config, subscribeInput, {
      forceTokenRefresh: false,
      format: 'legacy',
    });
  }

  if (result.response.status === 401 || isInvalidOAuthToken(result.payload)) {
    result = await runSubscribeRequest(config, subscribeInput, {
      forceTokenRefresh: true,
      format: result.format,
    });

    if (result.format !== 'legacy' && shouldRetryLegacyContactInfo(result.payload)) {
      result = await runSubscribeRequest(config, subscribeInput, {
        forceTokenRefresh: true,
        format: 'legacy',
      });
    }
  }

  return parseSubscribeResult(result.response, result.payload);
}
