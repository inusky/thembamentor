-- Rename legacy magic-link tracking fields to login initiation semantics.
ALTER TABLE "LeadRegistration"
RENAME COLUMN "magicLinkAttempts" TO "loginInitiatedCount";

ALTER TABLE "LeadRegistration"
RENAME COLUMN "magicLinkLastSentAt" TO "loginInitiatedAt";

ALTER TABLE "LeadRegistration"
DROP COLUMN "magicLinkLastError";
