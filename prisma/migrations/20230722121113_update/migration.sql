/*
  Warnings:

  - You are about to drop the column `sentTasks` on the `UserBlock` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "UserBlock" DROP COLUMN "sentTasks",
ADD COLUMN     "sentTasksAdmin" BOOLEAN,
ADD COLUMN     "sentTasksUser" BOOLEAN;
