import { prisma } from '../lib/prisma';
import { env } from '../config/env';
import { enviarEmail, type Email } from '../lib/mailer';
import type { Evento, Inscrito } from '../generated/prisma/client';
import { emailInscricaoConfirmada, emailNovoEvento } from '../views/emails';

type ConteudoEmail = Omit<Email, 'para'>;
type MontarEmail = (contatoNome: string, marcaNome: string) => ConteudoEmail;

interface Vinculos {
  contatoId?: number;
  parceriaId?: number;
  inscritoId?: number;
  eventoId?: number;
}

export class NotificacaoService {
  /** Envia um e-mail e registra o resultado (sucesso, teste ou falha) na tabela Notificacao. */
  private async enviarERegistrar(para: string, conteudo: ConteudoEmail, vinculos: Vinculos) {
    const base = { ...vinculos, destinatario: para, assunto: conteudo.assunto };
    try {
      const r = await enviarEmail({ para, ...conteudo });
      return prisma.notificacao.create({ data: { ...base, status: r.status, previewUrl: r.previewUrl } });
    } catch (e) {
      return prisma.notificacao.create({ data: { ...base, status: 'FALHOU', erro: (e as Error).message } });
    }
  }

  /**
   * Envia um e-mail a cada contato da marca que aceitou receber atualizações.
   */
  async notificarMarca(opcoes: {
    marcaId: number;
    parceriaId?: number;
    contatoIds?: number[];
    montar: MontarEmail;
  }) {
    const marca = await prisma.marca.findUnique({
      where: { id: opcoes.marcaId },
      include: {
        contatos: {
          where: {
            receberEmails: true,
            email: { not: null },
            ...(opcoes.contatoIds && { id: { in: opcoes.contatoIds } }),
          },
        },
      },
    });
    if (!marca) return [];

    return Promise.all(
      marca.contatos
        .filter((c) => c.email)
        .map((c) =>
          this.enviarERegistrar(c.email!, opcoes.montar(c.nome, marca.nome), {
            contatoId: c.id,
            parceriaId: opcoes.parceriaId,
          }),
        ),
    );
  }

  /** Avisa os inscritos interessados na categoria do evento (ou em todas). */
  async notificarNovoEvento(evento: Evento) {
    const inscritos = await prisma.inscrito.findMany({
      where: {
        ativo: true,
        OR: [{ categorias: { isEmpty: true } }, { categorias: { has: evento.categoria } }],
      },
    });
    // Sequencial para não estourar o limite de envio do provedor SMTP
    for (const inscrito of inscritos) {
      await this.enviarERegistrar(inscrito.email, emailNovoEvento(evento, inscrito.token), {
        inscritoId: inscrito.id,
        eventoId: evento.id,
      });
    }
    return inscritos.length;
  }

  confirmarInscricao(inscrito: Inscrito) {
    return this.enviarERegistrar(
      inscrito.email,
      emailInscricaoConfirmada(inscrito.token, inscrito.categorias),
      { inscritoId: inscrito.id },
    );
  }

  /** Avisa a própria influenciadora (INFLUENCER_EMAIL no .env). */
  notificarInfluenciadora(conteudo: ConteudoEmail, parceriaId?: number) {
    return this.enviarERegistrar(env.influenciadora.email, conteudo, { parceriaId });
  }

  /** Dispara sem bloquear a resposta HTTP. Falhas ficam registradas no histórico. */
  emSegundoPlano(tarefa: () => Promise<unknown>) {
    tarefa().catch((e) => console.error('[notificacao]', e));
  }

  notificarEmSegundoPlano(opcoes: Parameters<NotificacaoService['notificarMarca']>[0]) {
    this.emSegundoPlano(() => this.notificarMarca(opcoes));
  }

  listar(limite = 50) {
    return prisma.notificacao.findMany({
      orderBy: { criadoEm: 'desc' },
      take: limite,
      include: { contato: { select: { nome: true } }, inscrito: { select: { nome: true } } },
    });
  }
}

export const notificacaoService = new NotificacaoService();
