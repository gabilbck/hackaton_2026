import { env } from '../config/env';
import type { CategoriaEvento, StatusParceria } from '../validators/schemas';

// Camada de "view" dos e-mails: só monta assunto, HTML e texto.

export const rotuloStatus: Record<StatusParceria, string> = {
  PROSPECCAO: 'Em prospecção',
  NEGOCIANDO: 'Em negociação',
  FECHADO: 'Parceria fechada',
  PUBLICADO: 'Conteúdo publicado',
  PAGO: 'Pagamento confirmado',
  CANCELADO: 'Parceria cancelada',
};

const mensagemStatus: Record<StatusParceria, string> = {
  PROSPECCAO: 'Recebemos o seu contato e em breve enviaremos uma proposta.',
  NEGOCIANDO: 'Estamos alinhando os detalhes da proposta. Qualquer dúvida, é só responder este e-mail.',
  FECHADO: 'Parceria confirmada! Em breve combinaremos a data da visita e da publicação.',
  PUBLICADO: 'O conteúdo da parceria já está no ar. Obrigada pela confiança!',
  PAGO: 'Recebemos o pagamento. Foi um prazer trabalhar com vocês!',
  CANCELADO: 'A parceria foi cancelada. Ficamos à disposição para futuras oportunidades.',
};

const RODAPE_CONTATO = 'Você recebe este e-mail por estar cadastrado(a) como contato de uma marca parceira.';

function layout(titulo: string, corpoHtml: string, rodape = RODAPE_CONTATO) {
  const { nome, instagram } = env.influenciadora;
  return `
  <div style="font-family:Arial,sans-serif;max-width:560px;margin:auto;color:#222">
    <div style="background:#c2410c;color:#fff;padding:16px 20px;border-radius:8px 8px 0 0">
      <strong>${nome}</strong> · ${instagram}
    </div>
    <div style="border:1px solid #eee;border-top:0;padding:20px;border-radius:0 0 8px 8px">
      <h2 style="margin-top:0">${escapar(titulo)}</h2>
      ${corpoHtml}
      <p style="color:#888;font-size:12px;margin-top:24px">${rodape}</p>
    </div>
  </div>`;
}

const escapar = (s: string) =>
  s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');

const paragrafos = (texto: string) =>
  texto
    .split('\n')
    .map((l) => (l.trim() ? `<p style="margin:4px 0">${escapar(l)}</p>` : '<br/>'))
    .join('');

export function emailBoasVindas(contatoNome: string, marcaNome: string) {
  const assunto = `${marcaNome}: cadastro recebido pelo ${env.influenciadora.nome}`;
  const texto = `Olá, ${contatoNome}!\n\nA ${marcaNome} foi cadastrada na nossa lista de parceiros. Você vai receber por aqui as propostas e as atualizações de cada parceria.`;
  return { assunto, texto, html: layout('Cadastro recebido', paragrafos(texto)) };
}

export function emailProposta(contatoNome: string, marcaNome: string, propostaTexto: string) {
  const assunto = `Proposta de parceria para ${marcaNome}`;
  const texto = `Olá, ${contatoNome}!\n\n${propostaTexto}`;
  return { assunto, texto, html: layout('Nova proposta de parceria', paragrafos(texto)) };
}

export function emailStatus(contatoNome: string, marcaNome: string, status: StatusParceria) {
  const assunto = `${marcaNome}: ${rotuloStatus[status]}`;
  const texto = `Olá, ${contatoNome}!\n\n${mensagemStatus[status]}`;
  return { assunto, texto, html: layout(rotuloStatus[status], paragrafos(texto)) };
}

/** Para a marca que pediu proposta personalizada pelo site. */
export function emailSolicitacaoRecebida(contatoNome: string, marcaNome: string) {
  const assunto = `Recebemos o interesse de ${marcaNome} em uma parceria`;
  const texto =
    `Olá, ${contatoNome}!\n\n` +
    `Recebemos o cadastro de ${marcaNome} e o pedido de uma proposta personalizada. ` +
    'Vamos analisar e responder em breve. Você também vai receber por aqui cada atualização da parceria.';
  return { assunto, texto, html: layout('Cadastro recebido', paragrafos(texto)) };
}

/** Para a influenciadora: uma marca se cadastrou pelo site. */
export function emailNovaSolicitacao(d: {
  marcaNome: string;
  contatoNome: string;
  contatoEmail: string;
  whatsapp?: string | null;
  pacoteNome?: string | null;
  mensagem?: string | null;
  eventoTitulo?: string | null;
}) {
  const linhas = [
    `${d.marcaNome} quer uma parceria com o Guia.`,
    '',
    `Contato: ${d.contatoNome} · ${d.contatoEmail}${d.whatsapp ? ` · ${d.whatsapp}` : ''}`,
    `Interesse: ${d.pacoteNome ?? 'Proposta personalizada'}`,
    ...(d.eventoTitulo ? [`Evento sugerido (rascunho na agenda): ${d.eventoTitulo}`] : []),
    ...(d.mensagem ? ['', `Mensagem: ${d.mensagem}`] : []),
  ];
  const link = `${env.urlPublica}/admin/parcerias`;
  return {
    assunto: `Nova solicitação de parceria: ${d.marcaNome}`,
    texto: `${linhas.join('\n')}\n\nVer no painel: ${link}`,
    html: layout(
      'Nova solicitação pelo site',
      paragrafos(linhas.join('\n')) + `<p style="margin-top:16px"><a href="${link}">Abrir o painel</a></p>`,
      'Aviso automático do seu painel do Guia.',
    ),
  };
}

// ---------- E-mails para o público inscrito na agenda ----------

const rotuloCategoria: Record<CategoriaEvento, string> = {
  GASTRONOMIA: 'Gastronomia',
  SHOW: 'Show',
  FESTA: 'Festa',
  CULTURA: 'Cultura',
  INFANTIL: 'Infantil',
  FEIRA: 'Feira',
  ESPORTE: 'Esporte',
  OUTRO: 'Outro',
};

const quando = new Intl.DateTimeFormat('pt-BR', {
  timeZone: 'America/Sao_Paulo',
  weekday: 'long',
  day: '2-digit',
  month: '2-digit',
  hour: '2-digit',
  minute: '2-digit',
});
const moeda = new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' });

const rodapeInscrito = (token: string) =>
  `Você se inscreveu para receber a agenda do ${env.influenciadora.nome}. ` +
  `<a href="${env.urlPublica}/descadastrar/${token}" style="color:#888">Não quero mais receber</a>.`;

const botao = (href: string, texto: string) =>
  `<p style="margin:20px 0"><a href="${href}" style="background:#c2410c;color:#fff;padding:10px 18px;border-radius:6px;text-decoration:none">${texto}</a></p>`;

export function emailInscricaoConfirmada(token: string, categorias: CategoriaEvento[]) {
  const assunto = `Inscrição confirmada na agenda do ${env.influenciadora.nome}`;
  const interesses = categorias.length
    ? categorias.map((c) => rotuloCategoria[c]).join(', ')
    : 'todas as categorias';
  const texto = `Pronto! Você vai receber um e-mail sempre que um novo evento de ${interesses} entrar na agenda.`;
  return {
    assunto,
    texto: `${texto}\n\nVer a agenda: ${env.urlPublica}`,
    html: layout('Inscrição confirmada 🎉', paragrafos(texto) + botao(env.urlPublica, 'Ver a agenda'), rodapeInscrito(token)),
  };
}

interface EventoEmail {
  id: number;
  titulo: string;
  inicio: Date;
  categoria: CategoriaEvento;
  gratuito: boolean;
  preco: unknown;
  local: string | null;
  endereco: string;
  bairro: string | null;
  descricao: string | null;
}

export function emailNovoEvento(evento: EventoEmail, token: string) {
  const link = `${env.urlPublica}/evento/${evento.id}`;
  const preco = evento.gratuito ? 'Gratuito' : evento.preco ? `A partir de ${moeda.format(Number(evento.preco))}` : 'Consulte';
  const onde = [evento.local, evento.endereco, evento.bairro].filter(Boolean).join(' · ');
  const linhas = [
    `📅 ${quando.format(evento.inicio)}`,
    `📍 ${onde}`,
    `🎟️ ${preco}`,
    `🏷️ ${rotuloCategoria[evento.categoria]}`,
    ...(evento.descricao ? ['', evento.descricao] : []),
  ];
  return {
    assunto: `Novo na agenda: ${evento.titulo}`,
    texto: `${linhas.join('\n')}\n\nDetalhes: ${link}`,
    html: layout(evento.titulo, paragrafos(linhas.join('\n')) + botao(link, 'Ver detalhes'), rodapeInscrito(token)),
  };
}
