/*
  Warnings:

  - You are about to drop the column `documentTypeId` on the `Task` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[documentId]` on the table `Task` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `documentId` to the `Task` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "Task" DROP CONSTRAINT "Task_documentTypeId_fkey";

-- AlterTable
ALTER TABLE "Task" DROP COLUMN "documentTypeId",
ADD COLUMN     "documentId" TEXT NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "Task_documentId_key" ON "Task"("documentId");

-- AddForeignKey
ALTER TABLE "Task" ADD CONSTRAINT "Task_documentId_fkey" FOREIGN KEY ("documentId") REFERENCES "Document"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
