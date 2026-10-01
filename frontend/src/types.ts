export type StatusParceria =
  | 'PROSPECCAO'
  | 'NEGOCIANDO'
  | 'FECHADO'
  | 'PUBLICADO'
  | 'PAGO'
  | 'CANCELADO'

export interface Contato {
  id: number
  marcaId: number
  nome: string
  cargo: string | null
  whatsapp: string | null
  email: string | null
  principal: boolean
  receberEmails: boolean
}

export interface Marca {
  id: number
  nome: string
  instagram: string | null
  segmento: string | null
  bairro: string | null
  endereco: string | null
  observacoes: string | null
  contatos: Contato[]
  parcerias?: Parceria[]
  _count?: { parcerias: number }
}

export interface PacoteItem {
  id?: number
  tipo: string
  quantidade: number
  descricao: string | null
}

export interface Pacote {
  id: number
  nome: string
  descricao: string | null
  preco: string
  ativo: boolean
  itens: PacoteItem[]
  _count?: { parcerias: number }
}

export interface Notificacao {
  id: number
  destinatario: string
  assunto: string
  status: 'ENVIADO' | 'SIMULADO' | 'FALHOU'
  previewUrl: string | null
  erro: string | null
  criadoEm: string
}

export interface Parceria {
  id: number
  marcaId: number
  pacoteId: number | null
  status: StatusParceria
  valor: string
  dataPublicacao: string | null
  briefing: string | null
  propostaTexto: string
  publicoNoGuia: boolean
  /** SITE = a própria marca se cadastrou pelo formulário "Seja parceiro" */
  origem: 'PAINEL' | 'SITE'
  criadoEm: string
  marca?: Pick<Marca, 'id' | 'nome' | 'instagram'> & { contatos?: Contato[] }
  pacote?: Pick<Pacote, 'id' | 'nome'> | null
  notificacoes?: Notificacao[]
}

export interface Dashboard {
  totalMarcas: number
  solicitacoesNovas: number
  eventosParaAprovar: number
  totalInscritos: number
  eventosFuturos: number
  parceriasPorStatus: Partial<Record<StatusParceria, number>>
  valorAReceber: number
  valorRecebido: number
  proximasPublicacoes: (Parceria & { marca: { id: number; nome: string } })[]
  ultimasNotificacoes: Notificacao[]
}

export type CategoriaEvento =
  | 'GASTRONOMIA'
  | 'SHOW'
  | 'FESTA'
  | 'CULTURA'
  | 'INFANTIL'
  | 'FEIRA'
  | 'ESPORTE'
  | 'OUTRO'

export type Periodo = 'hoje' | 'amanha' | 'fds' | 'semana'

export interface Evento {
  id: number
  titulo: string
  descricao: string | null
  inicio: string
  fim: string | null
  categoria: CategoriaEvento
  gratuito: boolean
  preco: string | null
  local: string | null
  endereco: string
  bairro: string | null
  latitude: number | null
  longitude: number | null
  linkIngresso: string | null
  imagemUrl: string | null
  destaque: boolean
  publicado: boolean
  marcaId: number | null
  marca?: { id?: number; nome: string; instagram?: string | null } | null
}
