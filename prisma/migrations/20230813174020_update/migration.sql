/*
  Warnings:

  - You are about to drop the column `commentText` on the `UserQuestionAnswer` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "UserQuestion" ADD COLUMN     "commentText" TEXT;

-- AlterTable
ALTER TABLE "UserQuestionAnswer" DROP COLUMN "commentText";
