-- Phase 2 (D-045, D-046). Both statements are additive: no existing row loses
-- data, and Postgres allows unlimited NULLs under a unique index, so every
-- Phase 1 account keeps its password and gets a NULL telegramId.
ALTER TABLE "User" ADD COLUMN "telegramId" TEXT;
ALTER TABLE "User" ALTER COLUMN "password" DROP NOT NULL;

CREATE UNIQUE INDEX "User_telegramId_key" ON "User"("telegramId");
