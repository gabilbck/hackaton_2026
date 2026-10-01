-- CreateEnum
CREATE TYPE "CategoriaEvento" AS ENUM ('GASTRONOMIA', 'SHOW', 'FESTA', 'CULTURA', 'INFANTIL', 'FEIRA', 'ESPORTE', 'OUTRO');

-- AlterTable
ALTER TABLE "Notificacao" ADD COLUMN     "eventoId" INTEGER,
ADD COLUMN     "inscritoId" INTEGER;

-- CreateTable
CREATE TABLE "Evento" (
    "id" SERIAL NOT NULL,
    "titulo" TEXT NOT NULL,
    "descricao" TEXT,
    "inicio" TIMESTAMP(3) NOT NULL,
    "fim" TIMESTAMP(3),
    "categoria" "CategoriaEvento" NOT NULL,
    "gratuito" BOOLEAN NOT NULL DEFAULT false,
    "preco" DECIMAL(10,2),
    "local" TEXT,
    "endereco" TEXT NOT NULL,
    "bairro" TEXT,
    "latitude" DOUBLE PRECISION,
    "longitude" DOUBLE PRECISION,
    "linkIngresso" TEXT,
    "imagemUrl" TEXT,
    "destaque" BOOLEAN NOT NULL DEFAULT false,
    "publicado" BOOLEAN NOT NULL DEFAULT true,
    "marcaId" INTEGER,
    "criadoEm" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "atualizadoEm" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Evento_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Inscrito" (
    "id" SERIAL NOT NULL,
    "email" TEXT NOT NULL,
    "nome" TEXT,
    "categorias" "CategoriaEvento"[],
    "ativo" BOOLEAN NOT NULL DEFAULT true,
    "token" TEXT NOT NULL,
    "criadoEm" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Inscrito_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "Evento_inicio_idx" ON "Evento"("inicio");

-- CreateIndex
CREATE INDEX "Evento_categoria_idx" ON "Evento"("categoria");

-- CreateIndex
CREATE UNIQUE INDEX "Inscrito_email_key" ON "Inscrito"("email");

-- CreateIndex
CREATE UNIQUE INDEX "Inscrito_token_key" ON "Inscrito"("token");

-- AddForeignKey
ALTER TABLE "Evento" ADD CONSTRAINT "Evento_marcaId_fkey" FOREIGN KEY ("marcaId") REFERENCES "Marca"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Notificacao" ADD CONSTRAINT "Notificacao_inscritoId_fkey" FOREIGN KEY ("inscritoId") REFERENCES "Inscrito"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Notificacao" ADD CONSTRAINT "Notificacao_eventoId_fkey" FOREIGN KEY ("eventoId") REFERENCES "Evento"("id") ON DELETE SET NULL ON UPDATE CASCADE;
