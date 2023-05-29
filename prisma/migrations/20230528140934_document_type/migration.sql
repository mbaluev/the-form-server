/*
  Warnings:

  - Added the required column `documentTypeId` to the `UserTask` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "UserTask" ADD COLUMN     "documentTypeId" TEXT NOT NULL;

-- AddForeignKey
ALTER TABLE "UserTask" ADD CONSTRAINT "UserTask_documentTypeId_fkey" FOREIGN KEY ("documentTypeId") REFERENCES "DocumentType"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
