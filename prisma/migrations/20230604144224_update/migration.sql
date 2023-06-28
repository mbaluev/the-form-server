/*
  Warnings:

  - A unique constraint covering the columns `[optionId]` on the table `UserQuestionAnswer` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "UserQuestionAnswer_optionId_key" ON "UserQuestionAnswer"("optionId");
