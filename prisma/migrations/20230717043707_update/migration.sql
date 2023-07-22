/*
  Warnings:

  - You are about to drop the column `sentTasksAdmin` on the `UserBlock` table. All the data in the column will be lost.
  - You are about to drop the column `sentTasksUser` on the `UserBlock` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "UserBlock" DROP COLUMN "sentTasksAdmin",
DROP COLUMN "sentTasksUser",
ADD COLUMN     "sentTasks" BOOLEAN;
