import { defineEventHandler, readBody } from 'h3';
import {
  markLeadZohoFailed,
  markLeadZohoSynced,
  normalizeEmail,
  normalizeHoneypot,
  normalizeName,
  normalizePhone,
  safeErrorMessage,
  upsertLeadRegistration,
} from '../../utils/leadRegistration';
import {
  subscribeZohoList,
  ZohoSubscribeError,
} from '../../utils/zohoSubscribe';

type LeadBody = {
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

export default defineEventHandler(async (event) => {
  let body: LeadBody = {};

  try {
    body = (await readBody(event)) as LeadBody;
  } catch {
    return genericSuccess();
  }

  if (!body || typeof body !== 'object' || Array.isArray(body)) {
    return genericSuccess();
  }

  const honeypot = normalizeHoneypot(body.hp);
  if (honeypot) {
    return genericSuccess();
  }

  const name = normalizeName(body.name);
  const emailNormalized = normalizeEmail(body.email);
  const phone = normalizePhone(body.phone);

  if (!name || !emailNormalized) {
    return genericSuccess();
  }

  let leadId: string | undefined;

  try {
    const lead = await upsertLeadRegistration({
      name,
      emailNormalized,
      phone,
    });

    leadId = lead.id;

    try {
      const subscribeResult = await subscribeZohoList({
        name,
        email: emailNormalized,
        phone,
      });

      if (import.meta.dev) {
        console.info('[lead] Zoho Campaigns subscribe result', {
          leadId: lead.id,
          emailNormalized,
          alreadyExists: Boolean(subscribeResult.alreadyExists),
        });
      }

      await markLeadZohoSynced(lead.id);
    } catch (error) {
      const message = safeErrorMessage(error);
      await markLeadZohoFailed(lead.id, message);

      console.error('[lead] Zoho Campaigns subscribe failed', {
        leadId: lead.id,
        emailNormalized,
        message,
        statusCode:
          error instanceof ZohoSubscribeError ? error.statusCode : undefined,
      });
    }
  } catch (error) {
    console.error('[lead] Failed to process lead', {
      leadId,
      emailNormalized,
      message: safeErrorMessage(error),
    });
  }

  return genericSuccess();
});
