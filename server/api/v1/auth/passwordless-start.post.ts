import {
  defineEventHandler,
  readBody,
  setResponseStatus,
  type H3Event,
} from 'h3';
import { isPasswordlessRateLimited } from '../../../utils/authPasswordless';
import {
  markLeadZohoFailed,
  markLeadZohoSynced,
  normalizeEmail,
  normalizeHoneypot,
  normalizeName,
  normalizePhone,
  safeErrorMessage,
  upsertLeadRegistration,
} from '../../../utils/leadRegistration';
import { createZohoLead, ZohoLeadSyncError } from '../../../utils/zohoLead';

type PasswordlessStartBody = {
  name?: unknown;
  email?: unknown;
  phone?: unknown;
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
  let body: PasswordlessStartBody;

  try {
    body = (await readBody(event)) as PasswordlessStartBody;
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

  const name = normalizeName(body.name);
  if (!name) {
    return badRequest(event, 'Name is required');
  }

  const emailNormalized = normalizeEmail(body.email);
  if (!emailNormalized) {
    return badRequest(event, 'Invalid email format');
  }

  const phone = normalizePhone(body.phone);

  if (isPasswordlessRateLimited(event, emailNormalized)) {
    setResponseStatus(event, 429);
    return {
      ok: false,
      error: 'Too many requests. Please try again shortly.',
    };
  }

  const lead = await upsertLeadRegistration({
    name,
    emailNormalized,
    phone,
  });

  if (!lead.zohoSyncedAt) {
    try {
      await createZohoLead({
        name,
        email: emailNormalized,
        phone,
      });

      await markLeadZohoSynced(lead.id);
      if (import.meta.dev) {
        console.info('[auth/passwordless-start]', {
          leadId: lead.id,
          emailNormalized,
          action: 'zoho_synced',
        });
      }
    } catch (error) {
      const message = safeErrorMessage(error);
      await markLeadZohoFailed(lead.id, message);

      console.error('[auth/passwordless-start] Zoho lead sync failed', {
        leadId: lead.id,
        email: emailNormalized,
        message,
        statusCode:
          error instanceof ZohoLeadSyncError ? error.statusCode : undefined,
      });

      setResponseStatus(event, 502);
      return {
        ok: false,
        error: 'Unable to process your request right now. Please try again.',
      };
    }
  }

  return genericSuccess();
});
