/*
  Warnings:

  - Changed the type of `enable` on the `UserBlock` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.
  - Changed the type of `complete` on the `UserBlock` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.
  - Changed the type of `completeMaterials` on the `UserBlock` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.
  - Changed the type of `completeQuestions` on the `UserBlock` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.
  - Changed the type of `completeTasks` on the `UserBlock` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.
  - Changed the type of `complete` on the `UserMaterial` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.
  - Changed the type of `enable` on the `UserModule` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.
  - Changed the type of `complete` on the `UserModule` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.
  - Changed the type of `complete` on the `UserQuestion` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.
  - Changed the type of `complete` on the `UserQuestionAnswer` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.
  - Changed the type of `complete` on the `UserTask` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.
  - Changed the type of `complete` on the `UserTaskDocument` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.

*/
-- AlterTable
ALTER TABLE "UserBlock" DROP COLUMN "enable",
ADD COLUMN     "enable" BOOLEAN NOT NULL,
DROP COLUMN "complete",
ADD COLUMN     "complete" BOOLEAN NOT NULL,
DROP COLUMN "completeMaterials",
ADD COLUMN     "completeMaterials" BOOLEAN NOT NULL,
DROP COLUMN "completeQuestions",
ADD COLUMN     "completeQuestions" BOOLEAN NOT NULL,
DROP COLUMN "completeTasks",
ADD COLUMN     "completeTasks" BOOLEAN NOT NULL;

-- AlterTable
ALTER TABLE "UserMaterial" DROP COLUMN "complete",
ADD COLUMN     "complete" BOOLEAN NOT NULL;

-- AlterTable
ALTER TABLE "UserModule" DROP COLUMN "enable",
ADD COLUMN     "enable" BOOLEAN NOT NULL,
DROP COLUMN "complete",
ADD COLUMN     "complete" BOOLEAN NOT NULL;

-- AlterTable
ALTER TABLE "UserQuestion" DROP COLUMN "complete",
ADD COLUMN     "complete" BOOLEAN NOT NULL;

-- AlterTable
ALTER TABLE "UserQuestionAnswer" DROP COLUMN "complete",
ADD COLUMN     "complete" BOOLEAN NOT NULL;

-- AlterTable
ALTER TABLE "UserTask" DROP COLUMN "complete",
ADD COLUMN     "complete" BOOLEAN NOT NULL;

-- AlterTable
ALTER TABLE "UserTaskDocument" DROP COLUMN "complete",
ADD COLUMN     "complete" BOOLEAN NOT NULL;
