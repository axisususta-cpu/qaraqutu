-- AlterTable
ALTER TABLE "TenantPolicy" ADD COLUMN     "roleOverrides" JSONB,
ADD COLUMN     "userOverrides" JSONB;
