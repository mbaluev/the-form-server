/*
  Warnings:

  - You are about to drop the column `questionId` on the `UserQuestionAnswer` table. All the data in the column will be lost.
  - You are about to drop the column `taskId` on the `UserTaskDocument` table. All the data in the column will be lost.

*/
-- DropForeignKey
ALTER TABLE "UserQuestionAnswer" DROP CONSTRAINT "UserQuestionAnswer_questionId_fkey";

-- DropForeignKey
ALTER TABLE "UserTaskDocument" DROP CONSTRAINT "UserTaskDocument_taskId_fkey";

-- AlterTable
ALTER TABLE "UserQuestionAnswer" DROP COLUMN "questionId";

-- AlterTable
ALTER TABLE "UserTaskDocument" DROP COLUMN "taskId";
