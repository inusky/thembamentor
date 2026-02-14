-- CreateTable
CREATE TABLE "LeadRegistration" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "emailNormalized" TEXT NOT NULL,
    "phone" TEXT,
    "zohoSyncedAt" TIMESTAMP(3),
    "zohoLastError" TEXT,
    "magicLinkAttempts" INTEGER NOT NULL DEFAULT 0,
    "magicLinkLastSentAt" TIMESTAMP(3),
    "magicLinkLastError" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "LeadRegistration_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "LeadRegistration_emailNormalized_key" ON "LeadRegistration"("emailNormalized");

-- CreateIndex
CREATE INDEX "LeadRegistration_createdAt_idx" ON "LeadRegistration"("createdAt");
