/*
  Warnings:

  - Added the required column `userModuleId` to the `UserBlock` table without a default value. This is not possible if the table is not empty.
  - Added the required column `userBlockId` to the `UserMaterial` table without a default value. This is not possible if the table is not empty.
  - Added the required column `userBlockId` to the `UserQuestion` table without a default value. This is not possible if the table is not empty.
  - Added the required column `userQuestionId` to the `UserQuestionAnswer` table without a default value. This is not possible if the table is not empty.
  - Added the required column `userBlockId` to the `UserTask` table without a default value. This is not possible if the table is not empty.
  - Added the required column `userTaskId` to the `UserTaskDocument` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "UserBlock" ADD COLUMN     "userModuleId" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "UserMaterial" ADD COLUMN     "userBlockId" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "UserQuestion" ADD COLUMN     "userBlockId" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "UserQuestionAnswer" ADD COLUMN     "userQuestionId" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "UserTask" ADD COLUMN     "userBlockId" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "UserTaskDocument" ADD COLUMN     "userTaskId" TEXT NOT NULL;

-- AddForeignKey
ALTER TABLE "UserBlock" ADD CONSTRAINT "UserBlock_userModuleId_fkey" FOREIGN KEY ("userModuleId") REFERENCES "UserModule"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UserMaterial" ADD CONSTRAINT "UserMaterial_userBlockId_fkey" FOREIGN KEY ("userBlockId") REFERENCES "UserBlock"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UserTask" ADD CONSTRAINT "UserTask_userBlockId_fkey" FOREIGN KEY ("userBlockId") REFERENCES "UserBlock"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UserTaskDocument" ADD CONSTRAINT "UserTaskDocument_userTaskId_fkey" FOREIGN KEY ("userTaskId") REFERENCES "UserTask"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UserQuestion" ADD CONSTRAINT "UserQuestion_userBlockId_fkey" FOREIGN KEY ("userBlockId") REFERENCES "UserBlock"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UserQuestionAnswer" ADD CONSTRAINT "UserQuestionAnswer_userQuestionId_fkey" FOREIGN KEY ("userQuestionId") REFERENCES "UserQuestion"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
