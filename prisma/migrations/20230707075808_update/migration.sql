/*
  Warnings:

  - You are about to drop the column `comment` on the `UserQuestionAnswer` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "UserQuestionAnswer" DROP COLUMN "comment",
ADD COLUMN     "commentText" TEXT;
