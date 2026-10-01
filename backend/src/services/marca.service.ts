import { prisma } from '../lib/prisma';
import { AppError } from '../errors/AppError';
import type { ContatoInput, MarcaInput } from '../validators/schemas';
import { notificacaoService } from './notificacao.service';
import { emailBoasVindas } from '../views/emails';

interface FiltrosMarca {
  busca?: string;
  bairro?: string;
  segmento?: string;
}

const insensivel = (valor: string) => ({ contains: valor, mode: 'insensitive' as const });

/** Garante exatamente um contato principal quando houver contatos. */
function normalizarContatos(contatos: ContatoInput[] = []) {
  const temPrincipal = contatos.some((c) => c.principal);
  return contatos.map((c, i) => ({
    ...c,
    email: c.email || null,
    principal: temPrincipal ? !!c.principal : i === 0,
  }));
}

export class MarcaService {
  listar({ busca, bairro, segmento }: FiltrosMarca) {
    return prisma.marca.findMany({
      where: {
        ...(busca && {
          OR: [
            { nome: insensivel(busca) },
            { instagram: insensivel(busca) },
            { segmento: insensivel(busca) },
            { bairro: insensivel(busca) },
            { contatos: { some: { nome: insensivel(busca) } } },
          ],
        }),
        ...(bairro && { bairro: insensivel(bairro) }),
        ...(segmento && { segmento: insensivel(segmento) }),
      },
      orderBy: { nome: 'asc' },
      include: {
        contatos: { where: { principal: true }, take: 1 },
        _count: { select: { parcerias: true } },
      },
    });
  }

  async buscar(id: number) {
    const marca = await prisma.marca.findUnique({
      where: { id },
      include: {
        contatos: { orderBy: [{ principal: 'desc' }, { nome: 'asc' }] },
        parcerias: {
          orderBy: { criadoEm: 'desc' },
          include: { pacote: { select: { id: true, nome: true } } },
        },
      },
    });
    if (!marca) throw AppError.naoEncontrado('Marca');
    return marca;
  }

  async criar({ contatos, ...dados }: MarcaInput) {
    const marca = await prisma.marca.create({
      data: { ...dados, contatos: { create: normalizarContatos(contatos) } },
      include: { contatos: true },
    });

    notificacaoService.notificarEmSegundoPlano({ marcaId: marca.id, montar: emailBoasVindas });
    return marca;
  }

  atualizar(id: number, { contatos: _ignorado, ...dados }: Partial<MarcaInput>) {
    return prisma.marca.update({ where: { id }, data: dados });
  }

  async remover(id: number) {
    await prisma.marca.delete({ where: { id } });
  }

  /** Valores distintos para os filtros da tela. */
  async opcoesFiltro() {
    const marcas = await prisma.marca.findMany({ select: { bairro: true, segmento: true } });
    const unicos = (lista: (string | null)[]) =>
      [...new Set(lista.filter((v): v is string => !!v))].sort();
    return {
      bairros: unicos(marcas.map((m) => m.bairro)),
      segmentos: unicos(marcas.map((m) => m.segmento)),
    };
  }
}

export const marcaService = new MarcaService();
