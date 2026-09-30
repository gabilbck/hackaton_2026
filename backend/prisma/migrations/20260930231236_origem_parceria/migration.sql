-- CreateEnum
CREATE TYPE "OrigemParceria" AS ENUM ('PAINEL', 'SITE');

-- AlterTable
ALTER TABLE "Parceria" ADD COLUMN     "origem" "OrigemParceria" NOT NULL DEFAULT 'PAINEL';
