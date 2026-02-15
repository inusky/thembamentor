import type { LeadRegistration } from '@prisma/client';
import { prisma } from './prisma';

const EMAIL_REGEX =
  /^(?=.{1,254}$)(?=.{1,64}@)[A-Za-z0-9!#$%&'*+/=?^_`{|}~-]+(?:\.[A-Za-z0-9!#$%&'*+/=?^_`{|}~-]+)*@(?:[A-Za-z0-9](?:[A-Za-z0-9-]{0,61}[A-Za-z0-9])?\.)+[A-Za-z]{2,63}$/;

function cleanString(value: unknown, maxLength = 120) {
  if (typeof value !== 'string') return undefined;
  const trimmed = value.trim();
  if (!trimmed) return undefined;
  return trimmed.slice(0, maxLength);
}

export function normalizeEmail(value: unknown) {
  const email = cleanString(value, 254)?.toLowerCase();
  if (!email || !EMAIL_REGEX.test(email)) return undefined;
  return email;
}

export function normalizeName(value: unknown) {
  return cleanString(value, 120);
}

export function normalizePhone(value: unknown) {
  return cleanString(value, 40);
}

export function normalizeHoneypot(value: unknown) {
  return cleanString(value, 300) || '';
}

export function safeErrorMessage(error: unknown, maxLength = 500) {
  const message = error instanceof Error ? error.message : 'Unknown error';
  return message.slice(0, maxLength);
}

export function getPasswordlessCooldownSeconds() {
  const config = useRuntimeConfig();
  const value = Number(config.authPasswordlessResendCooldownSeconds ?? 90);

  if (!Number.isFinite(value) || value <= 0) {
    return 90;
  }

  return Math.floor(value);
}

export function isLoginInitiationInCooldown(
  lead: Pick<LeadRegistration, 'loginInitiatedAt'>,
  cooldownSeconds = getPasswordlessCooldownSeconds(),
) {
  if (!lead.loginInitiatedAt) return false;

  const nextAllowedAt =
    lead.loginInitiatedAt.getTime() + cooldownSeconds * 1000;

  return Date.now() < nextAllowedAt;
}

export async function upsertLeadRegistration(input: {
  name: string;
  emailNormalized: string;
  phone?: string;
}) {
  return prisma.leadRegistration.upsert({
    where: {
      emailNormalized: input.emailNormalized,
    },
    update: {
      name: input.name,
      email: input.emailNormalized,
      phone: input.phone,
    },
    create: {
      name: input.name,
      email: input.emailNormalized,
      emailNormalized: input.emailNormalized,
      phone: input.phone,
    },
  });
}

export async function findLeadByEmailNormalized(emailNormalized: string) {
  return prisma.leadRegistration.findUnique({
    where: {
      emailNormalized,
    },
  });
}

export async function markLeadZohoSynced(leadId: string) {
  return prisma.leadRegistration.update({
    where: {
      id: leadId,
    },
    data: {
      zohoSyncedAt: new Date(),
      zohoLastError: null,
    },
  });
}

export async function markLeadZohoFailed(leadId: string, errorMessage: string) {
  return prisma.leadRegistration.update({
    where: {
      id: leadId,
    },
    data: {
      zohoLastError: errorMessage,
    },
  });
}

export async function markLoginInitiated(leadId: string) {
  return prisma.leadRegistration.update({
    where: {
      id: leadId,
    },
    data: {
      loginInitiatedCount: {
        increment: 1,
      },
      loginInitiatedAt: new Date(),
    },
  });
}

export async function syncUserZohoSubscribedFromLead(input: {
  userId: string;
  email: string | null;
  userZohoSubscribedAt: Date | null;
}) {
  if (!input.email) return;
  if (input.userZohoSubscribedAt) return;

  const lead = await prisma.leadRegistration.findUnique({
    where: {
      emailNormalized: input.email.trim().toLowerCase(),
    },
    select: {
      zohoSyncedAt: true,
    },
  });

  if (!lead?.zohoSyncedAt) return;

  await prisma.user.update({
    where: {
      id: input.userId,
    },
    data: {
      zohoSubscribedAt: lead.zohoSyncedAt,
    },
  });
}
