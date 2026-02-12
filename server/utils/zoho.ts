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
  'duplicate_data',
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
  if (!payload || typeof payload !== 'object') return undefined;
  const maybeCode = (payload as ZohoApiResponse).code;
  if (maybeCode == null) return undefined;
  return String(maybeCode);
}

function looksLikeAlreadyExists(payload: unknown) {
  if (!payload || typeof payload !== 'object') return false;

  const zohoPayload = payload as ZohoApiResponse;
  const code = zohoPayload.code ? String(zohoPayload.code).toLowerCase() : '';
  const message =
    typeof zohoPayload.message === 'string'
      ? zohoPayload.message.toLowerCase()
      : '';

  if (IDEMPOTENT_ZOHO_CODES.has(code)) return true;
  return (
    message.includes('already') &&
    (message.includes('exist') || message.includes('subscribed'))
  );
}

function isZohoSuccess(payload: unknown) {
  if (!payload || typeof payload !== 'object') return false;
  const zohoPayload = payload as ZohoApiResponse;
  const code = zohoPayload.code == null ? '' : String(zohoPayload.code);
  if (code === '0') return true;

  if (typeof zohoPayload.status === 'string') {
    if (zohoPayload.status.toLowerCase() === 'success') return true;
  }

  const message =
    typeof zohoPayload.message === 'string'
      ? zohoPayload.message.toLowerCase()
      : '';

  return (
    message.includes('success') ||
    message.includes('created') ||
    message.includes('updated')
  );
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
  if (
    response.ok &&
    (isZohoSuccess(payload) || looksLikeAlreadyExists(payload))
  ) {
    return {
      ok: true as const,
      alreadyExists: looksLikeAlreadyExists(payload),
    };
  }

  if (looksLikeAlreadyExists(payload)) {
    return {
      ok: true as const,
      alreadyExists: true,
    };
  }

  const zohoCode = sanitizeZohoCode(payload);

  throw new ZohoApiError(
    'Zoho Campaigns subscribe API request failed',
    response.status || 502,
    zohoCode,
  );
}
