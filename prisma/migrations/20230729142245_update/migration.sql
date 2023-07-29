/*
  Warnings:

  - You are about to drop the column `refreshToken` on the `User` table. All the data in the column will be lost.

*/
-- DropIndex
DROP INDEX "UserRefreshToken_token_key";

-- AlterTable
ALTER TABLE "User" DROP COLUMN "refreshToken";
