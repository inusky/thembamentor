type ZohoSubscribeInput = {
  email: string;
  firstName?: string;
  lastName?: string;
  phone?: string;
};

type ZohoConfig = {
  clientId: string;
  clientSecret: string;
  refreshToken: string;
  listKey: string;
  dc: string;
  campaignsBaseUrl: string;
  tokenEndpoint: string;
};

type ZohoTokenResponse = {
  access_token?: string;
  expires_in?: number;
  api_domain?: string;
  token_type?: string;
  error?: string;
  error_description?: string;
};

type ZohoApiResponse = {
  code?: string | number;
  message?: string;
  status?: string;
  [key: string]: unknown;
};

type ZohoAdapterRequest = {
  url: string;
  options: RequestInit;
};

let accessTokenCache: {
  accessToken: string;
  expiresAt: number;
} | null = null;

const ACCESS_TOKEN_EXPIRY_BUFFER_MS = 60_000;
const IDEMPOTENT_ZOHO_CODES = new Set([
  // Keep this list small and explicit. Add account-specific duplicate codes here if needed.
  'already_exists',
  'already_exist',
  'duplicate_data',
  'duplicate',
]);

export class ZohoApiError extends Error {
  statusCode: number;
  zohoCode?: string;

  constructor(message: string, statusCode: number, zohoCode?: string) {
    super(message);
    this.name = 'ZohoApiError';
    this.statusCode = statusCode;
    this.zohoCode = zohoCode;
  }
}

function toBoolean(value: string | undefined, defaultValue = false) {
  if (value == null) return defaultValue;
  return value.toLowerCase() === 'true';
}

export function isZohoTestModeEnabled() {
  return toBoolean(process.env.TEST_MODE, false);
}

function requireEnv(name: string) {
  const value = process.env[name];
  if (!value) {
    throw new Error(`Missing required environment variable: ${name}`);
  }
  return value;
}

function getZohoConfig(): ZohoConfig {
  const dc = process.env.ZOHO_DC || 'zoho.in';
  const campaignsBaseUrl = (
    process.env.ZOHO_CAMPAIGNS_BASE_URL || 'campaigns.zoho.in'
  )
    .replace(/^https?:\/\//, '')
    .replace(/\/+$/, '');

  return {
    clientId: requireEnv('ZOHO_CLIENT_ID'),
    clientSecret: requireEnv('ZOHO_CLIENT_SECRET'),
    refreshToken: requireEnv('ZOHO_REFRESH_TOKEN'),
    listKey: requireEnv('ZOHO_CAMPAIGNS_LIST_KEY'),
    dc,
    campaignsBaseUrl,
    tokenEndpoint: `https://accounts.${dc}/oauth/v2/token`,
  };
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

function sanitizeZohoCode(payload: unknown) {
  const topLevel = readZohoCode(payload);
  if (topLevel) return topLevel;

  const firstRecordCode = getZohoRecords(payload)
    .map((record) => readZohoCode(record))
    .find(Boolean);

  return firstRecordCode;
}

function isObjectRecord(value: unknown): value is Record<string, unknown> {
  return Boolean(value) && typeof value === 'object' && !Array.isArray(value);
}

function readZohoCode(payload: unknown) {
  if (!isObjectRecord(payload)) return undefined;
  const maybeCode = (payload as ZohoApiResponse).code;
  if (maybeCode == null) return undefined;
  return String(maybeCode);
}

function readZohoStatus(payload: unknown) {
  if (!isObjectRecord(payload)) return '';
  const maybeStatus = (payload as ZohoApiResponse).status;
  return typeof maybeStatus === 'string' ? maybeStatus.toLowerCase() : '';
}

function readZohoMessage(payload: unknown) {
  if (!isObjectRecord(payload)) return '';
  const maybeMessage = (payload as ZohoApiResponse).message;
  return typeof maybeMessage === 'string' ? maybeMessage.toLowerCase() : '';
}

function normalizeZohoCode(code: string | undefined) {
  return code ? code.toLowerCase() : '';
}

function getZohoRecords(payload: unknown): ZohoApiResponse[] {
  if (!isObjectRecord(payload)) return [];

  const root = payload as Record<string, unknown>;
  const records: ZohoApiResponse[] = [];

  const candidates = [root.data, root.response];

  for (const candidate of candidates) {
    if (Array.isArray(candidate)) {
      for (const entry of candidate) {
        if (isObjectRecord(entry)) {
          records.push(entry as ZohoApiResponse);
        }
      }
      continue;
    }

    if (!isObjectRecord(candidate)) continue;

    if (Array.isArray(candidate.data)) {
      for (const entry of candidate.data) {
        if (isObjectRecord(entry)) {
          records.push(entry as ZohoApiResponse);
        }
      }
      continue;
    }

    if (Array.isArray(candidate.result)) {
      for (const entry of candidate.result) {
        if (isObjectRecord(entry)) {
          records.push(entry as ZohoApiResponse);
        }
      }
      continue;
    }

    records.push(candidate as ZohoApiResponse);
  }

  return records;
}

function isZohoCodeSuccess(code: string) {
  const normalizedCode = normalizeZohoCode(code);
  return normalizedCode === '0' || normalizedCode === 'success';
}

function isZohoCodeIdempotent(code: string) {
  return IDEMPOTENT_ZOHO_CODES.has(normalizeZohoCode(code));
}

function isZohoMessageIdempotent(message: string) {
  return (
    message.includes('already') &&
    (message.includes('exist') || message.includes('subscribed'))
  );
}

function isZohoRecordSuccess(record: ZohoApiResponse) {
  const code = readZohoCode(record);
  const status = readZohoStatus(record);
  const message = readZohoMessage(record);

  if (code && isZohoCodeSuccess(code)) return true;
  if (status === 'success') return true;

  return (
    message.includes('success') ||
    message.includes('created') ||
    message.includes('updated') ||
    message.includes('added')
  );
}

function getFirstZohoRecordError(payload: unknown) {
  const records = getZohoRecords(payload);

  for (const record of records) {
    const code = readZohoCode(record);
    const status = readZohoStatus(record);
    const message = readZohoMessage(record);

    if (isZohoRecordSuccess(record)) continue;
    if (code && isZohoCodeIdempotent(code)) continue;
    if (isZohoMessageIdempotent(message)) continue;

    if (status === 'error' || code || message) {
      return {
        code,
        status,
        message:
          typeof record.message === 'string' ? record.message : 'Unknown Zoho error',
        details: record.details,
      };
    }
  }

  return undefined;
}

function isZohoDevLoggingEnabled() {
  return process.env.NODE_ENV !== 'production';
}

function looksLikeAlreadyExists(payload: unknown) {
  const topCode = readZohoCode(payload);
  const topMessage = readZohoMessage(payload);

  if (topCode && isZohoCodeIdempotent(topCode)) return true;
  if (isZohoMessageIdempotent(topMessage)) return true;

  return getZohoRecords(payload).some((record) => {
    const code = readZohoCode(record);
    const message = readZohoMessage(record);
    return (code && isZohoCodeIdempotent(code)) || isZohoMessageIdempotent(message);
  });
}

function isZohoSuccess(payload: unknown) {
  const code = readZohoCode(payload);
  const status = readZohoStatus(payload);
  const message = readZohoMessage(payload);

  if (code && isZohoCodeSuccess(code)) return true;
  if (status === 'success') return true;
  if (
    message.includes('success') ||
    message.includes('created') ||
    message.includes('updated') ||
    message.includes('added')
  ) {
    return true;
  }

  const records = getZohoRecords(payload);
  if (records.length === 0) return false;

  return records.some((record) => isZohoRecordSuccess(record));
}

type ContactInfoFormat = 'json' | 'legacy';

function buildContactInfo(
  input: ZohoSubscribeInput,
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

  // Some Zoho Campaigns accounts only accept the legacy contactinfo format.
  const entries = Object.entries(contactInfo).map(([key, value]) => {
    const safeValue = value.replace(/[,{}]/g, ' ').trim();
    return `${key}:${safeValue}`;
  });

  return `{${entries.join(',')}}`;
}

function buildAddSubscriberRequest(
  config: ZohoConfig,
  accessToken: string,
  input: ZohoSubscribeInput,
  format: ContactInfoFormat = 'json',
): ZohoAdapterRequest {
  // Default implementation uses Zoho Campaigns "listsubscribe" endpoint.
  // If your account uses a different endpoint/payload, replace URL and params here.
  const url = `https://${config.campaignsBaseUrl}/api/v1.1/json/listsubscribe`;

  const body = new URLSearchParams({
    resfmt: 'JSON',
    listkey: config.listKey,
    source: 'Nuxt Signup',
    contactinfo: buildContactInfo(input, format),
  });

  return {
    url,
    options: {
      method: 'POST',
      headers: {
        Authorization: `Zoho-oauthtoken ${accessToken}`,
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body,
    },
  };
}

async function fetchZohoAccessToken(forceRefresh = false) {
  if (
    !forceRefresh &&
    accessTokenCache &&
    accessTokenCache.expiresAt > Date.now() + ACCESS_TOKEN_EXPIRY_BUFFER_MS
  ) {
    return accessTokenCache.accessToken;
  }

  const config = getZohoConfig();

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
    const zohoCode = payload.error ? String(payload.error) : undefined;
    throw new ZohoApiError(
      'Failed to retrieve Zoho OAuth access token',
      response.status || 502,
      zohoCode,
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

async function runZohoSubscribeRequest(
  config: ZohoConfig,
  input: ZohoSubscribeInput,
  forceTokenRefresh = false,
  format: ContactInfoFormat = 'json',
) {
  const accessToken = await fetchZohoAccessToken(forceTokenRefresh);
  const request = buildAddSubscriberRequest(config, accessToken, input, format);
  const response = await fetch(request.url, request.options);
  const payload = await parseResponseBody(response);

  return { response, payload };
}

export async function addSubscriberToZohoList(input: ZohoSubscribeInput) {
  const config = getZohoConfig();

  let firstAttempt = await runZohoSubscribeRequest(
    config,
    input,
    false,
    'json',
  );

  // Retry with legacy contactinfo formatting if account rejects JSON structure.
  if (
    typeof firstAttempt.payload === 'object' &&
    firstAttempt.payload &&
    String((firstAttempt.payload as ZohoApiResponse).code || '') === '2001'
  ) {
    firstAttempt = await runZohoSubscribeRequest(
      config,
      input,
      false,
      'legacy',
    );
  }

  if (
    firstAttempt.response.status === 401 ||
    (typeof firstAttempt.payload === 'object' &&
      firstAttempt.payload &&
      String((firstAttempt.payload as ZohoApiResponse).code || '')
        .toLowerCase()
        .includes('invalid_oauthtoken'))
  ) {
    const retry = await runZohoSubscribeRequest(config, input, true);
    return handleSubscribeResponse(retry.response, retry.payload);
  }

  return handleSubscribeResponse(firstAttempt.response, firstAttempt.payload);
}

function handleSubscribeResponse(response: Response, payload: unknown) {
  if (isZohoDevLoggingEnabled()) {
    console.info('[zoho] Parsed lead sync response', {
      statusCode: response.status,
      ok: response.ok,
      payload,
    });
  }

  const alreadyExists = looksLikeAlreadyExists(payload);
  const success = isZohoSuccess(payload);

  if (response.ok && (success || alreadyExists)) {
    return {
      ok: true as const,
      alreadyExists,
    };
  }

  if (alreadyExists) {
    return {
      ok: true as const,
      alreadyExists: true,
    };
  }

  const recordError = getFirstZohoRecordError(payload);
  if (recordError) {
    console.error('[zoho] Record-level lead sync error', {
      statusCode: response.status,
      code: recordError.code,
      status: recordError.status,
      message: recordError.message,
      details: recordError.details,
    });
  }

  const zohoCode = sanitizeZohoCode(payload);
  const errorMessage = recordError
    ? `Zoho lead sync failed: ${recordError.message}`
    : 'Zoho Campaigns subscribe API request failed';

  throw new ZohoApiError(
    errorMessage,
    response.ok ? 502 : response.status || 502,
    zohoCode,
  );
}
