/*
  Warnings:

  - You are about to drop the column `documentTypeId` on the `UserTask` table. All the data in the column will be lost.
  - Added the required column `documentTypeId` to the `Task` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "UserTask" DROP CONSTRAINT "UserTask_documentTypeId_fkey";

-- AlterTable
ALTER TABLE "Task" ADD COLUMN     "documentTypeId" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "UserTask" DROP COLUMN "documentTypeId";

-- AddForeignKey
ALTER TABLE "Task" ADD CONSTRAINT "Task_documentTypeId_fkey" FOREIGN KEY ("documentTypeId") REFERENCES "DocumentType"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
