import { prisma } from '../lib/prisma';
import { AppError } from '../errors/AppError';
import type { ParceriaInput, ParceriaUpdateInput, StatusParceria } from '../validators/schemas';
import { propostaService } from './proposta.service';
import { notificacaoService } from './notificacao.service';
import { emailProposta, emailStatus } from '../views/emails';

interface FiltrosParceria {
  status?: StatusParceria;
  marcaId?: number;
}

export class ParceriaService {
  listar({ status, marcaId }: FiltrosParceria) {
    return prisma.parceria.findMany({
      where: { status, marcaId },
      orderBy: [{ dataPublicacao: 'asc' }, { criadoEm: 'desc' }],
      include: {
        marca: { select: { id: true, nome: true, instagram: true } },
        pacote: { select: { id: true, nome: true } },
      },
    });
  }

  async buscar(id: number) {
    const parceria = await prisma.parceria.findUnique({
      where: { id },
      include: {
        marca: { include: { contatos: true } },
        pacote: { include: { itens: true } },
        notificacoes: { orderBy: { criadoEm: 'desc' } },
      },
    });
    if (!parceria) throw AppError.naoEncontrado('Parceria');
    return parceria;
  }

  /** Carrega marca e pacote e monta o texto. Usado na prévia e na criação. */
  private async montarProposta(dados: ParceriaInput) {
    const marca = await prisma.marca.findUnique({
      where: { id: dados.marcaId },
      include: { contatos: { orderBy: { principal: 'desc' }, take: 1 } },
    });
    if (!marca) throw AppError.naoEncontrado('Marca');

    const pacote = dados.pacoteId
      ? await prisma.pacote.findUnique({ where: { id: dados.pacoteId }, include: { itens: true } })
      : null;
    if (dados.pacoteId && !pacote) throw AppError.naoEncontrado('Pacote');
    if (pacote && !pacote.ativo) throw new AppError('Este pacote está desativado');

    const valor = dados.valor ?? (pacote ? Number(pacote.preco) : undefined);
    if (valor === undefined) throw new AppError('Informe o valor ou escolha um pacote');

    const texto = propostaService.gerarTexto({
      marcaNome: marca.nome,
      contatoNome: marca.contatos[0]?.nome,
      pacote,
      valor,
      dataPublicacao: dados.dataPublicacao,
      briefing: dados.briefing,
    });
    return { texto, valor };
  }

  async previa(dados: ParceriaInput) {
    const { texto, valor } = await this.montarProposta(dados);
    return { propostaTexto: texto, valor };
  }

  async criar({ enviarEmail = true, ...dados }: ParceriaInput) {
    const { texto, valor } = await this.montarProposta(dados);
    const parceria = await prisma.parceria.create({
      data: { ...dados, valor, propostaTexto: texto },
    });

    if (enviarEmail) this.enviarProposta(parceria.id, parceria.marcaId, texto);
    return parceria;
  }

  atualizar(id: number, dados: ParceriaUpdateInput) {
    return prisma.parceria.update({ where: { id }, data: dados });
  }

  async alterarStatus(id: number, status: StatusParceria, notificar = true) {
    const atual = await prisma.parceria.findUnique({ where: { id } });
    if (!atual) throw AppError.naoEncontrado('Parceria');

    const parceria = await prisma.parceria.update({ where: { id }, data: { status } });
    if (notificar && atual.status !== status) {
      notificacaoService.notificarEmSegundoPlano({
        marcaId: parceria.marcaId,
        parceriaId: parceria.id,
        montar: (contato, marca) => emailStatus(contato, marca, status),
      });
    }
    return parceria;
  }

  async reenviarProposta(id: number) {
    const parceria = await prisma.parceria.findUnique({ where: { id } });
    if (!parceria) throw AppError.naoEncontrado('Parceria');
    this.enviarProposta(parceria.id, parceria.marcaId, parceria.propostaTexto);
  }

  async remover(id: number) {
    await prisma.parceria.delete({ where: { id } });
  }

  private enviarProposta(parceriaId: number, marcaId: number, texto: string) {
    notificacaoService.notificarEmSegundoPlano({
      marcaId,
      parceriaId,
      montar: (contato, marca) => emailProposta(contato, marca, texto),
    });
  }
}

export const parceriaService = new ParceriaService();
