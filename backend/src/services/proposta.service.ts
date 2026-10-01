import { env } from '../config/env';

interface DadosProposta {
  marcaNome: string;
  contatoNome?: string;
  pacote?: {
    nome: string;
    descricao: string | null;
    itens: { tipo: string; quantidade: number; descricao: string | null }[];
  } | null;
  valor: number;
  dataPublicacao?: Date | null;
  briefing?: string | null;
}

const moeda = new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' });
const data = new Intl.DateTimeFormat('pt-BR', { timeZone: 'UTC' });

export class PropostaService {
  /** Monta o texto da proposta a partir do pacote escolhido e dos dados da marca. */
  gerarTexto(d: DadosProposta): string {
    const { nome, instagram } = env.influenciadora;
    const linhas: string[] = [
      `Olá${d.contatoNome ? `, ${d.contatoNome}` : ''}! Tudo bem?`,
      '',
      `Aqui é do ${nome} (${instagram}). Adoraríamos apresentar ${d.marcaNome} para o nosso público apaixonado por gastronomia em Joinville!`,
      '',
    ];

    if (d.pacote) {
      linhas.push(`📦 Proposta: ${d.pacote.nome}`);
      if (d.pacote.descricao) linhas.push(d.pacote.descricao);
      linhas.push('', 'O que está incluso:');
      for (const item of d.pacote.itens) {
        linhas.push(`• ${item.quantidade}x ${item.tipo}${item.descricao ? `: ${item.descricao}` : ''}`);
      }
      linhas.push('');
    }

    linhas.push(`💰 Investimento: ${moeda.format(d.valor)}`);
    if (d.dataPublicacao) linhas.push(`📅 Publicação prevista: ${data.format(d.dataPublicacao)}`);
    if (d.briefing) linhas.push('', `📝 Observações: ${d.briefing}`);

    linhas.push('', 'Ficamos à disposição para ajustar a proposta ao que fizer mais sentido para vocês. Vamos juntos?');
    return linhas.join('\n');
  }
}

export const propostaService = new PropostaService();
