/*
  Warnings:

  - Made the column `completeQuestions` on table `UserBlock` required. This step will fail if there are existing NULL values in that column.

*/
-- AlterTable
ALTER TABLE "UserBlock" ALTER COLUMN "completeQuestions" SET NOT NULL;
