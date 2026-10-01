import { prisma } from '../lib/prisma';
import { AppError } from '../errors/AppError';
import type { PacoteInput } from '../validators/schemas';

const incluirItens = { itens: { orderBy: { id: 'asc' as const } } };

export class PacoteService {
  listar(apenasAtivos = false) {
    return prisma.pacote.findMany({
      where: apenasAtivos ? { ativo: true } : undefined,
      orderBy: [{ ativo: 'desc' }, { preco: 'asc' }],
      include: { ...incluirItens, _count: { select: { parcerias: true } } },
    });
  }

  async buscar(id: number) {
    const pacote = await prisma.pacote.findUnique({ where: { id }, include: incluirItens });
    if (!pacote) throw AppError.naoEncontrado('Pacote');
    return pacote;
  }

  criar({ itens, ...dados }: PacoteInput) {
    return prisma.pacote.create({
      data: { ...dados, itens: { create: itens } },
      include: incluirItens,
    });
  }

  /** Substitui a lista de itens inteira: é o jeito mais simples de refletir o formulário. */
  atualizar(id: number, { itens, ...dados }: PacoteInput) {
    return prisma.$transaction(async (tx) => {
      await tx.pacoteItem.deleteMany({ where: { pacoteId: id } });
      return tx.pacote.update({
        where: { id },
        data: { ...dados, itens: { create: itens } },
        include: incluirItens,
      });
    });
  }

  /**
   * Pacote já usado em parcerias é apenas desativado, para preservar o histórico.
   * Pacote sem uso é excluído de fato.
   */
  async remover(id: number) {
    const emUso = await prisma.parceria.count({ where: { pacoteId: id } });
    if (emUso > 0) {
      await prisma.pacote.update({ where: { id }, data: { ativo: false } });
      return { desativado: true };
    }
    await prisma.pacote.delete({ where: { id } });
    return { desativado: false };
  }
}

export const pacoteService = new PacoteService();
