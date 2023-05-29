/*
  Warnings:

  - You are about to drop the column `moduleId` on the `UserBlock` table. All the data in the column will be lost.
  - Added the required column `completeMaterials` to the `UserBlock` table without a default value. This is not possible if the table is not empty.
  - Added the required column `completeQuestions` to the `UserBlock` table without a default value. This is not possible if the table is not empty.
  - Added the required column `completeTasks` to the `UserBlock` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "UserBlock" DROP COLUMN "moduleId",
ADD COLUMN     "completeMaterials" TEXT NOT NULL,
ADD COLUMN     "completeQuestions" TEXT NOT NULL,
ADD COLUMN     "completeTasks" TEXT NOT NULL;
