import { prisma } from '../lib/prisma';
import { AppError } from '../errors/AppError';
import type { ContatoInput } from '../validators/schemas';
import { notificacaoService } from './notificacao.service';
import { emailBoasVindas } from '../views/emails';

export class ContatoService {
  async criar(marcaId: number, dados: ContatoInput) {
    const marca = await prisma.marca.findUnique({
      where: { id: marcaId },
      include: { _count: { select: { contatos: true } } },
    });
    if (!marca) throw AppError.naoEncontrado('Marca');

    const principal = dados.principal || marca._count.contatos === 0;
    const contato = await prisma.$transaction(async (tx) => {
      if (principal) {
        await tx.contato.updateMany({ where: { marcaId }, data: { principal: false } });
      }
      return tx.contato.create({
        data: { ...dados, email: dados.email || null, principal, marcaId },
      });
    });

    notificacaoService.notificarEmSegundoPlano({
      marcaId,
      contatoIds: [contato.id],
      montar: emailBoasVindas,
    });
    return contato;
  }

  async atualizar(id: number, dados: Partial<ContatoInput>) {
    const atual = await prisma.contato.findUnique({ where: { id } });
    if (!atual) throw AppError.naoEncontrado('Contato');

    return prisma.$transaction(async (tx) => {
      if (dados.principal) {
        await tx.contato.updateMany({
          where: { marcaId: atual.marcaId, id: { not: id } },
          data: { principal: false },
        });
      }
      return tx.contato.update({
        where: { id },
        data: { ...dados, ...(dados.email !== undefined && { email: dados.email || null }) },
      });
    });
  }

  async remover(id: number) {
    await prisma.contato.delete({ where: { id } });
  }
}

export const contatoService = new ContatoService();
