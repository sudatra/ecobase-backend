-- AlterTable
ALTER TABLE "User" ALTER COLUMN "firstName" DROP NOT NULL,
ALTER COLUMN "lastName" DROP NOT NULL,
ALTER COLUMN "aadharNumber" DROP NOT NULL,
ALTER COLUMN "panNumber" DROP NOT NULL,
ALTER COLUMN "aadharImageLink" DROP NOT NULL,
ALTER COLUMN "panImageLink" DROP NOT NULL,
ALTER COLUMN "isMembershipActive" SET DEFAULT false,
ALTER COLUMN "password" DROP NOT NULL;
