import {
  defineEventHandler,
  readBody,
  setResponseStatus,
  type H3Event,
} from 'h3';
import { isPasswordlessRateLimited } from '../../../utils/authPasswordless';
import {
  findLeadByEmailNormalized,
  markLeadZohoFailed,
  markLeadZohoSynced,
  normalizeEmail,
  normalizeHoneypot,
  safeErrorMessage,
} from '../../../utils/leadRegistration';
import { createZohoLead } from '../../../utils/zohoLead';

type RetryBody = {
  email?: unknown;
  hp?: unknown;
};

function genericSuccess() {
  return {
    ok: true as const,
  };
}

function badRequest(event: H3Event, error: string) {
  setResponseStatus(event, 400);
  return {
    ok: false,
    error,
  };
}

export default defineEventHandler(async (event) => {
  let body: RetryBody;

  try {
    body = (await readBody(event)) as RetryBody;
  } catch {
    return badRequest(event, 'Invalid JSON body');
  }

  if (!body || typeof body !== 'object' || Array.isArray(body)) {
    return badRequest(event, 'Body must be a JSON object');
  }

  const honeypot = normalizeHoneypot(body.hp);
  if (honeypot) {
    return genericSuccess();
  }

  const emailNormalized = normalizeEmail(body.email);
  if (!emailNormalized) {
    return badRequest(event, 'Invalid email format');
  }

  if (isPasswordlessRateLimited(event, emailNormalized)) {
    setResponseStatus(event, 429);
    return {
      ok: false,
      error: 'Too many requests. Please try again shortly.',
    };
  }

  const lead = await findLeadByEmailNormalized(emailNormalized);

  if (!lead) {
    return genericSuccess();
  }

  try {
    if (!lead.zohoSyncedAt) {
      await createZohoLead({
        name: lead.name,
        email: emailNormalized,
        phone: lead.phone || undefined,
      });

      await markLeadZohoSynced(lead.id);
    }
  } catch (error) {
    const message = safeErrorMessage(error);
    await markLeadZohoFailed(lead.id, message);

    console.error('[auth/retry] Zoho lead sync failed', {
      leadId: lead.id,
      email: emailNormalized,
      message,
    });

    return genericSuccess();
  }

  return genericSuccess();
});
