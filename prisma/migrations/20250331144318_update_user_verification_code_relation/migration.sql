-- DropIndex
DROP INDEX "VerificationCode_userId_key";

-- AlterTable
ALTER TABLE "VerificationCode" ALTER COLUMN "userId" DROP DEFAULT;
