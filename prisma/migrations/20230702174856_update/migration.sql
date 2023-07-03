-- AlterTable
ALTER TABLE "UserBlock" ADD COLUMN     "errorQuestions" BOOLEAN NOT NULL DEFAULT false,
ALTER COLUMN "enable" SET DEFAULT false,
ALTER COLUMN "complete" SET DEFAULT false,
ALTER COLUMN "completeMaterials" SET DEFAULT false,
ALTER COLUMN "completeQuestions" SET DEFAULT false,
ALTER COLUMN "completeTasks" SET DEFAULT false;

-- AlterTable
ALTER TABLE "UserModule" ALTER COLUMN "enable" SET DEFAULT false,
ALTER COLUMN "complete" SET DEFAULT false;
