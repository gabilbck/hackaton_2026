import type { CategoriaEvento, Evento, Periodo, StatusParceria } from '../types'

const moedaFmt = new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' })
const dataFmt = new Intl.DateTimeFormat('pt-BR', { timeZone: 'UTC' })

export const moeda = (v: number | string) => moedaFmt.format(Number(v))
export const data = (v: string | null) => (v ? dataFmt.format(new Date(v)) : 'Sem data')

/** Converte ISO para o valor aceito por <input type="date"> */
export const paraInputData = (v: string | null) => (v ? v.slice(0, 10) : '')

export const STATUS: { valor: StatusParceria; rotulo: string; cor: string }[] = [
  { valor: 'PROSPECCAO', rotulo: 'Prospecção', cor: 'bg-sky-100 text-sky-800' },
  { valor: 'NEGOCIANDO', rotulo: 'Negociando', cor: 'bg-amber-100 text-amber-800' },
  { valor: 'FECHADO', rotulo: 'Fechado', cor: 'bg-violet-100 text-violet-800' },
  { valor: 'PUBLICADO', rotulo: 'Publicado', cor: 'bg-emerald-100 text-emerald-800' },
  { valor: 'PAGO', rotulo: 'Pago', cor: 'bg-green-200 text-green-900' },
  { valor: 'CANCELADO', rotulo: 'Cancelado', cor: 'bg-stone-200 text-stone-600' },
]

export const infoStatus = (s: StatusParceria) => STATUS.find((x) => x.valor === s)!

/** Link do WhatsApp com a mensagem preenchida. Assume DDI 55 quando o número não tem. */
export function linkWhatsApp(numero: string | null | undefined, texto: string) {
  const digitos = (numero ?? '').replace(/\D/g, '')
  const comDdi = digitos && !digitos.startsWith('55') ? `55${digitos}` : digitos
  return `https://wa.me/${comDdi}?text=${encodeURIComponent(texto)}`
}

export const linkInstagram = (arroba: string | null) =>
  arroba ? `https://instagram.com/${arroba.replace('@', '')}` : undefined

// ---------- Eventos ----------


export const CATEGORIAS: { valor: CategoriaEvento; rotulo: string; emoji: string; fundo: string }[] = [
  { valor: 'GASTRONOMIA', rotulo: 'Gastronomia', emoji: '🍽️', fundo: 'from-orange-400 to-rose-500' },
  { valor: 'SHOW', rotulo: 'Shows', emoji: '🎵', fundo: 'from-violet-500 to-fuchsia-500' },
  { valor: 'FESTA', rotulo: 'Festas', emoji: '🎉', fundo: 'from-pink-500 to-purple-600' },
  { valor: 'CULTURA', rotulo: 'Cultura', emoji: '🎭', fundo: 'from-sky-500 to-indigo-500' },
  { valor: 'INFANTIL', rotulo: 'Infantil', emoji: '🧸', fundo: 'from-amber-300 to-orange-400' },
  { valor: 'FEIRA', rotulo: 'Feiras', emoji: '🧺', fundo: 'from-lime-500 to-emerald-600' },
  { valor: 'ESPORTE', rotulo: 'Esportes', emoji: '🏃', fundo: 'from-cyan-500 to-blue-600' },
  { valor: 'OUTRO', rotulo: 'Outros', emoji: '📌', fundo: 'from-stone-400 to-stone-600' },
]

export const infoCategoria = (c: CategoriaEvento) => CATEGORIAS.find((x) => x.valor === c)!

export const PERIODOS: { valor: Periodo | ''; rotulo: string }[] = [
  { valor: '', rotulo: 'Próximos' },
  { valor: 'hoje', rotulo: 'Hoje' },
  { valor: 'amanha', rotulo: 'Amanhã' },
  { valor: 'fds', rotulo: 'Fim de semana' },
  { valor: 'semana', rotulo: 'Próximos 7 dias' },
]

const FUSO = 'America/Sao_Paulo'
const diaFmt = new Intl.DateTimeFormat('pt-BR', { timeZone: FUSO, weekday: 'short', day: '2-digit', month: '2-digit' })
const horaFmt = new Intl.DateTimeFormat('pt-BR', { timeZone: FUSO, hour: '2-digit', minute: '2-digit' })
const diaLongoFmt = new Intl.DateTimeFormat('pt-BR', { timeZone: FUSO, weekday: 'long', day: 'numeric', month: 'long' })
const chaveDia = new Intl.DateTimeFormat('en-CA', { timeZone: FUSO })

/** "20h" ou "20h30" */
export const hora = (iso: string) => horaFmt.format(new Date(iso)).replace(':00', 'h').replace(':', 'h')

/** "Hoje · 20h", "Amanhã · 19h" ou "sáb., 03/10 · 11h" */
export function quandoCurto(e: Pick<Evento, 'inicio'>) {
  const dia = chaveDia.format(new Date(e.inicio))
  const hoje = chaveDia.format(new Date())
  const amanha = chaveDia.format(new Date(Date.now() + 86_400_000))
  const rotulo = dia === hoje ? 'Hoje' : dia === amanha ? 'Amanhã' : diaFmt.format(new Date(e.inicio))
  return `${rotulo} · ${hora(e.inicio)}`
}

/** "sábado, 3 de outubro · 11h às 22h" */
export function quandoLongo(e: Pick<Evento, 'inicio' | 'fim'>) {
  const inicio = new Date(e.inicio)
  const fim = e.fim ? ` às ${hora(e.fim)}` : ''
  return `${diaLongoFmt.format(inicio)} · ${hora(e.inicio)}${fim}`
}

export const precoEvento = (e: Pick<Evento, 'gratuito' | 'preco'>) =>
  e.gratuito ? 'Gratuito' : e.preco && Number(e.preco) > 0 ? `A partir de ${moeda(e.preco)}` : 'Consulte o valor'

export const linkMapa = (e: Pick<Evento, 'endereco' | 'bairro' | 'latitude' | 'longitude'>) =>
  e.latitude != null
    ? `https://www.google.com/maps/search/?api=1&query=${e.latitude},${e.longitude}`
    : `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(`${e.endereco}, ${e.bairro ?? ''}, Joinville - SC`)}`

/** Link "Adicionar ao Google Agenda" (não precisa de login no nosso site) */
export function linkAgenda(e: Evento) {
  const fmt = (d: Date) => d.toISOString().replace(/[-:]/g, '').replace(/\.\d{3}/, '')
  const inicio = new Date(e.inicio)
  const fim = e.fim ? new Date(e.fim) : new Date(inicio.getTime() + 2 * 3_600_000)
  const params = new URLSearchParams({
    action: 'TEMPLATE',
    text: e.titulo,
    dates: `${fmt(inicio)}/${fmt(fim)}`,
    location: [e.local, e.endereco, e.bairro, 'Joinville'].filter(Boolean).join(', '),
    details: e.descricao ?? '',
  })
  return `https://calendar.google.com/calendar/render?${params}`
}

/** Valor para <input type="datetime-local"> no horário de Brasília */
export function paraInputDataHora(iso: string | null) {
  if (!iso) return ''
  const local = new Date(new Date(iso).getTime() - 3 * 3_600_000)
  return local.toISOString().slice(0, 16)
}

/** Converte o valor do <input type="datetime-local"> (horário de Brasília) para ISO */
export const deInputDataHora = (valor: string) => (valor ? new Date(`${valor}:00-03:00`).toISOString() : null)
