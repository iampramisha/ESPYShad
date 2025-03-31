/*
  Warnings:

  - You are about to drop the column `createdAt` on the `User` table. All the data in the column will be lost.
  - You are about to drop the column `emailVerified` on the `User` table. All the data in the column will be lost.
  - You are about to drop the column `updatedAt` on the `User` table. All the data in the column will be lost.
  - You are about to drop the column `createdAt` on the `VerificationCode` table. All the data in the column will be lost.
  - You are about to drop the column `email` on the `VerificationCode` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[userId]` on the table `VerificationCode` will be added. If there are existing duplicate values, this will fail.
  - Made the column `name` on table `User` required. This step will fail if there are existing NULL values in that column.
  - Made the column `email` on table `User` required. This step will fail if there are existing NULL values in that column.
  - Made the column `password` on table `User` required. This step will fail if there are existing NULL values in that column.

*/
-- DropIndex
DROP INDEX "VerificationCode_email_key";

-- AlterTable
ALTER TABLE "User" DROP COLUMN "createdAt",
DROP COLUMN "emailVerified",
DROP COLUMN "updatedAt",
ALTER COLUMN "name" SET NOT NULL,
ALTER COLUMN "email" SET NOT NULL,
ALTER COLUMN "password" SET NOT NULL;

-- AlterTable
ALTER TABLE "VerificationCode" DROP COLUMN "createdAt",
DROP COLUMN "email",
ADD COLUMN     "userId" TEXT;

-- CreateIndex
CREATE UNIQUE INDEX "VerificationCode_userId_key" ON "VerificationCode"("userId");
