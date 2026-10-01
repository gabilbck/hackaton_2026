-- CreateSchema
CREATE SCHEMA IF NOT EXISTS "public";

-- CreateEnum
CREATE TYPE "StatusParceria" AS ENUM ('PROSPECCAO', 'NEGOCIANDO', 'FECHADO', 'PUBLICADO', 'PAGO', 'CANCELADO');

-- CreateTable
CREATE TABLE "Usuario" (
    "id" SERIAL NOT NULL,
    "nome" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "senhaHash" TEXT NOT NULL,
    "criadoEm" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Usuario_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Marca" (
    "id" SERIAL NOT NULL,
    "nome" TEXT NOT NULL,
    "instagram" TEXT,
    "segmento" TEXT,
    "bairro" TEXT,
    "endereco" TEXT,
    "observacoes" TEXT,
    "criadoEm" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "atualizadoEm" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Marca_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Contato" (
    "id" SERIAL NOT NULL,
    "marcaId" INTEGER NOT NULL,
    "nome" TEXT NOT NULL,
    "cargo" TEXT,
    "whatsapp" TEXT,
    "email" TEXT,
    "principal" BOOLEAN NOT NULL DEFAULT false,
    "receberEmails" BOOLEAN NOT NULL DEFAULT true,

    CONSTRAINT "Contato_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Pacote" (
    "id" SERIAL NOT NULL,
    "nome" TEXT NOT NULL,
    "descricao" TEXT,
    "preco" DECIMAL(10,2) NOT NULL,
    "ativo" BOOLEAN NOT NULL DEFAULT true,
    "criadoEm" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "atualizadoEm" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Pacote_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PacoteItem" (
    "id" SERIAL NOT NULL,
    "pacoteId" INTEGER NOT NULL,
    "tipo" TEXT NOT NULL,
    "quantidade" INTEGER NOT NULL DEFAULT 1,
    "descricao" TEXT,

    CONSTRAINT "PacoteItem_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Parceria" (
    "id" SERIAL NOT NULL,
    "marcaId" INTEGER NOT NULL,
    "pacoteId" INTEGER,
    "status" "StatusParceria" NOT NULL DEFAULT 'PROSPECCAO',
    "valor" DECIMAL(10,2) NOT NULL,
    "dataPublicacao" TIMESTAMP(3),
    "briefing" TEXT,
    "propostaTexto" TEXT NOT NULL,
    "publicoNoGuia" BOOLEAN NOT NULL DEFAULT false,
    "criadoEm" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "atualizadoEm" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Parceria_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Notificacao" (
    "id" SERIAL NOT NULL,
    "contatoId" INTEGER,
    "parceriaId" INTEGER,
    "destinatario" TEXT NOT NULL,
    "assunto" TEXT NOT NULL,
    "status" TEXT NOT NULL,
    "previewUrl" TEXT,
    "erro" TEXT,
    "criadoEm" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Notificacao_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Usuario_email_key" ON "Usuario"("email");

-- CreateIndex
CREATE INDEX "Marca_nome_idx" ON "Marca"("nome");

-- CreateIndex
CREATE INDEX "Contato_marcaId_idx" ON "Contato"("marcaId");

-- CreateIndex
CREATE INDEX "PacoteItem_pacoteId_idx" ON "PacoteItem"("pacoteId");

-- CreateIndex
CREATE INDEX "Parceria_marcaId_idx" ON "Parceria"("marcaId");

-- CreateIndex
CREATE INDEX "Parceria_status_idx" ON "Parceria"("status");

-- AddForeignKey
ALTER TABLE "Contato" ADD CONSTRAINT "Contato_marcaId_fkey" FOREIGN KEY ("marcaId") REFERENCES "Marca"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PacoteItem" ADD CONSTRAINT "PacoteItem_pacoteId_fkey" FOREIGN KEY ("pacoteId") REFERENCES "Pacote"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Parceria" ADD CONSTRAINT "Parceria_marcaId_fkey" FOREIGN KEY ("marcaId") REFERENCES "Marca"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Parceria" ADD CONSTRAINT "Parceria_pacoteId_fkey" FOREIGN KEY ("pacoteId") REFERENCES "Pacote"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Notificacao" ADD CONSTRAINT "Notificacao_contatoId_fkey" FOREIGN KEY ("contatoId") REFERENCES "Contato"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Notificacao" ADD CONSTRAINT "Notificacao_parceriaId_fkey" FOREIGN KEY ("parceriaId") REFERENCES "Parceria"("id") ON DELETE SET NULL ON UPDATE CASCADE;
