/*
  Warnings:

  - You are about to drop the column `documentId` on the `Task` table. All the data in the column will be lost.

*/
-- DropForeignKey
ALTER TABLE "Task" DROP CONSTRAINT "Task_documentId_fkey";

-- DropIndex
DROP INDEX "Task_documentId_key";

-- AlterTable
ALTER TABLE "Task" DROP COLUMN "documentId";
