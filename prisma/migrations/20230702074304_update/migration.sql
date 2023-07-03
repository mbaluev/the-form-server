/*
  Warnings:

  - Made the column `complete` on table `UserQuestion` required. This step will fail if there are existing NULL values in that column.

*/
-- AlterTable
ALTER TABLE "UserQuestion" ADD COLUMN     "error" BOOLEAN NOT NULL DEFAULT false,
ALTER COLUMN "complete" SET NOT NULL,
ALTER COLUMN "complete" SET DEFAULT false;

-- AlterTable
ALTER TABLE "UserQuestionAnswer" ADD COLUMN     "comment" TEXT,
ADD COLUMN     "error" BOOLEAN NOT NULL DEFAULT false;
