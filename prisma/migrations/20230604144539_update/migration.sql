/*
  Warnings:

  - You are about to drop the column `optionId` on the `UserQuestionAnswer` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[questionOptionId]` on the table `UserQuestionAnswer` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `questionOptionId` to the `UserQuestionAnswer` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "UserQuestionAnswer" DROP CONSTRAINT "UserQuestionAnswer_optionId_fkey";

-- DropIndex
DROP INDEX "UserQuestionAnswer_optionId_key";

-- AlterTable
ALTER TABLE "UserQuestionAnswer" DROP COLUMN "optionId",
ADD COLUMN     "questionOptionId" TEXT NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "UserQuestionAnswer_questionOptionId_key" ON "UserQuestionAnswer"("questionOptionId");

-- AddForeignKey
ALTER TABLE "UserQuestionAnswer" ADD CONSTRAINT "UserQuestionAnswer_questionOptionId_fkey" FOREIGN KEY ("questionOptionId") REFERENCES "QuestionOption"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
