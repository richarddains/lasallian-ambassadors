-- AlterEnum: Replace COORDINATOR/LEAD/ADMIN with ASPIRING_CORE/CORE
-- NOTE: Applied manually via Supabase SQL Editor due to existing data migration.

-- Change role column to text temporarily
ALTER TABLE "Profile" ALTER COLUMN "role" DROP DEFAULT;
ALTER TABLE "Profile" ALTER COLUMN "role" TYPE text;

-- Remap old values to new
UPDATE "Profile" SET role = 'CORE' WHERE role IN ('ADMIN', 'LEAD');
UPDATE "Profile" SET role = 'ASPIRING_CORE' WHERE role = 'COORDINATOR';

-- Drop old enum, create new one
DROP TYPE "Role" CASCADE;
CREATE TYPE "Role" AS ENUM ('AMBASSADOR', 'ASPIRING_CORE', 'CORE');

-- Cast column back to the new enum
ALTER TABLE "Profile" ALTER COLUMN "role" TYPE "Role" USING (role::"Role");
ALTER TABLE "Profile" ALTER COLUMN "role" SET DEFAULT 'AMBASSADOR';
