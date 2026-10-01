import { z } from 'zod';

z.config(z.locales.pt());

const textoOpcional = z.string().trim().max(2000).optional().nullable();

export const loginSchema = z.object({
  email: z.string().trim().toLowerCase().email(),
  senha: z.string().min(1),
});

export const contatoSchema = z.object({
  nome: z.string().trim().min(1, 'Informe o nome'),
  cargo: textoOpcional,
  whatsapp: textoOpcional,
  email: z.string().email('E-mail inválido').optional().nullable().or(z.literal('')),
  principal: z.boolean().optional(),
  receberEmails: z.boolean().optional(),
});

export const marcaSchema = z.object({
  nome: z.string().trim().min(1, 'Informe o nome da marca'),
  instagram: textoOpcional,
  segmento: textoOpcional,
  bairro: textoOpcional,
  endereco: textoOpcional,
  observacoes: textoOpcional,
  contatos: z.array(contatoSchema).optional(),
});

export const pacoteItemSchema = z.object({
  tipo: z.string().trim().min(1, 'Informe o tipo (ex.: Reels, Stories)'),
  quantidade: z.coerce.number().int().min(1).default(1),
  descricao: textoOpcional,
});

export const pacoteSchema = z.object({
  nome: z.string().trim().min(1, 'Informe o nome do pacote'),
  descricao: textoOpcional,
  preco: z.coerce.number().min(0),
  ativo: z.boolean().optional(),
  itens: z.array(pacoteItemSchema).min(1, 'Adicione ao menos um item ao pacote'),
});

export const statusParceria = z.enum([
  'PROSPECCAO',
  'NEGOCIANDO',
  'FECHADO',
  'PUBLICADO',
  'PAGO',
  'CANCELADO',
]);

export const parceriaSchema = z.object({
  marcaId: z.coerce.number().int(),
  pacoteId: z.coerce.number().int().optional().nullable(),
  valor: z.coerce.number().min(0).optional(),
  dataPublicacao: z.coerce.date().optional().nullable(),
  briefing: textoOpcional,
  publicoNoGuia: z.boolean().optional(),
  enviarEmail: z.boolean().optional(),
});

export const parceriaUpdateSchema = parceriaSchema
  .omit({ marcaId: true, pacoteId: true, enviarEmail: true })
  .extend({ propostaTexto: z.string().optional() })
  .partial();

export const statusSchema = z.object({
  status: statusParceria,
  notificar: z.boolean().optional(),
});

export const idParam = z.object({ id: z.coerce.number().int().positive() });

export const categoriaEvento = z.enum([
  'GASTRONOMIA',
  'SHOW',
  'FESTA',
  'CULTURA',
  'INFANTIL',
  'FEIRA',
  'ESPORTE',
  'OUTRO',
]);

const urlOpcional = z.string().trim().url('URL inválida').optional().nullable().or(z.literal(''));

const eventoBase = z.object({
    titulo: z.string().trim().min(1, 'Informe o título'),
    descricao: textoOpcional,
    inicio: z.coerce.date(),
    fim: z.coerce.date().optional().nullable(),
    categoria: categoriaEvento,
    gratuito: z.boolean().default(false),
    preco: z.coerce.number().min(0).optional().nullable(),
    local: textoOpcional,
    endereco: z.string().trim().min(1, 'Informe o endereço'),
    bairro: textoOpcional,
    latitude: z.coerce.number().min(-90).max(90).optional().nullable(),
    longitude: z.coerce.number().min(-180).max(180).optional().nullable(),
    linkIngresso: urlOpcional,
    imagemUrl: urlOpcional,
    destaque: z.boolean().optional(),
    publicado: z.boolean().optional(),
    marcaId: z.coerce.number().int().optional().nullable(),
    notificarInscritos: z.boolean().optional(),
});

export const eventoSchema = eventoBase.refine((e) => !e.fim || e.fim >= e.inicio, {
  message: 'O fim deve ser depois do início',
  path: ['fim'],
});

export const eventoUpdateSchema = eventoBase.partial();

export const periodoSchema = z.enum(['hoje', 'amanha', 'fds', 'semana']);

export const filtrosEventoSchema = z.object({
  periodo: periodoSchema.optional(),
  categoria: categoriaEvento.optional(),
  bairro: z.string().trim().optional(),
  gratuito: z.enum(['true']).optional(),
  busca: z.string().trim().optional(),
});

export const inscricaoSchema = z.object({
  email: z.string().trim().toLowerCase().email('E-mail inválido'),
  nome: textoOpcional,
  categorias: z.array(categoriaEvento).default([]),
});

export type MarcaInput = z.infer<typeof marcaSchema>;
export type ContatoInput = z.infer<typeof contatoSchema>;
export type PacoteInput = z.infer<typeof pacoteSchema>;
export type ParceriaInput = z.infer<typeof parceriaSchema>;
export type ParceriaUpdateInput = z.infer<typeof parceriaUpdateSchema>;
export type StatusParceria = z.infer<typeof statusParceria>;
export type EventoInput = z.infer<typeof eventoSchema>;
export type FiltrosEvento = z.infer<typeof filtrosEventoSchema>;
export type Periodo = z.infer<typeof periodoSchema>;
export type InscricaoInput = z.infer<typeof inscricaoSchema>;
export type CategoriaEvento = z.infer<typeof categoriaEvento>;

/** Formulário público "Seja parceiro": a marca interessada se cadastra e pede uma parceria. */
export const solicitacaoParceriaSchema = z.object({
  marca: z.object({
    nome: z.string().trim().min(1, 'Informe o nome do estabelecimento'),
    instagram: textoOpcional,
    segmento: textoOpcional,
    bairro: textoOpcional,
    endereco: textoOpcional,
  }),
  contato: z.object({
    nome: z.string().trim().min(1, 'Informe seu nome'),
    cargo: textoOpcional,
    whatsapp: textoOpcional,
    email: z.string().trim().toLowerCase().email('E-mail inválido'),
  }),
  /** Nulo = quer uma proposta personalizada */
  pacoteId: z.coerce.number().int().optional().nullable(),
  mensagem: textoOpcional,
  /** Evento opcional que a marca quer divulgar na agenda (entra como rascunho) */
  evento: z
    .object({
      titulo: z.string().trim().min(1, 'Informe o nome do evento'),
      inicio: z.coerce.date(),
      categoria: categoriaEvento,
      gratuito: z.boolean().default(false),
      preco: z.coerce.number().min(0).optional().nullable(),
      linkIngresso: z.string().trim().url('Link inválido').optional().nullable().or(z.literal('')),
      descricao: textoOpcional,
    })
    .optional()
    .nullable(),
  /** Campo invisível no formulário: robôs preenchem, pessoas não (anti-spam) */
  site: z.string().optional(),
});

export type SolicitacaoParceriaInput = z.infer<typeof solicitacaoParceriaSchema>;
