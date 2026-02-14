import {
  addSubscriberToZohoList,
  isZohoTestModeEnabled,
  ZohoApiError,
} from './zoho';

type ZohoLeadInput = {
  name: string;
  email: string;
  phone?: string;
};

export class ZohoLeadSyncError extends Error {
  statusCode: number;
  code?: string;

  constructor(message: string, statusCode: number, code?: string) {
    super(message);
    this.name = 'ZohoLeadSyncError';
    this.statusCode = statusCode;
    this.code = code;
  }
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

export async function createZohoLead(input: ZohoLeadInput) {
  if (isZohoTestModeEnabled()) {
    console.info('[zoho-lead] TEST_MODE=true; skipping Zoho lead call', {
      email: input.email,
      name: input.name,
    });

    return {
      ok: true as const,
      alreadyExists: false,
    };
  }

  const { firstName, lastName } = splitName(input.name);

  try {
    const result = await addSubscriberToZohoList({
      email: input.email,
      firstName,
      lastName,
      phone: input.phone,
    });

    return {
      ok: true as const,
      alreadyExists: result.alreadyExists,
    };
  } catch (error) {
    if (error instanceof ZohoApiError) {
      throw new ZohoLeadSyncError(
        error.message || 'Failed to sync lead to Zoho',
        error.statusCode || 502,
        error.zohoCode,
      );
    }

    throw new ZohoLeadSyncError('Failed to sync lead to Zoho', 502);
  }
}
