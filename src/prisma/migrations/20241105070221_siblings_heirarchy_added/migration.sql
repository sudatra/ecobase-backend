-- DropForeignKey
ALTER TABLE "Hierarchy" DROP CONSTRAINT "Hierarchy_parentId_fkey";

-- AlterTable
ALTER TABLE "Hierarchy" ADD COLUMN     "siblings" TEXT[],
ALTER COLUMN "parentId" DROP NOT NULL;

-- AddForeignKey
ALTER TABLE "Hierarchy" ADD CONSTRAINT "Hierarchy_parentId_fkey" FOREIGN KEY ("parentId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
