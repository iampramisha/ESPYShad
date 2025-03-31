/*
  Warnings:

  - You are about to drop the column `otpExpiresAt` on the `User` table. All the data in the column will be lost.
  - You are about to drop the column `verificationCode` on the `User` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[verificationCodeId]` on the table `User` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE "User" DROP COLUMN "otpExpiresAt",
DROP COLUMN "verificationCode",
ADD COLUMN     "verificationCodeId" TEXT;

-- CreateTable
CREATE TABLE "VerificationCode" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "VerificationCode_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "VerificationCode_email_key" ON "VerificationCode"("email");

-- CreateIndex
CREATE UNIQUE INDEX "User_verificationCodeId_key" ON "User"("verificationCodeId");

-- AddForeignKey
ALTER TABLE "User" ADD CONSTRAINT "User_verificationCodeId_fkey" FOREIGN KEY ("verificationCodeId") REFERENCES "VerificationCode"("id") ON DELETE SET NULL ON UPDATE CASCADE;
