import { X } from 'lucide-react'
import type {
  ButtonHTMLAttributes,
  InputHTMLAttributes,
  ReactNode,
  SelectHTMLAttributes,
  TextareaHTMLAttributes,
} from 'react'
import type { StatusParceria } from '../types'
import { infoStatus } from '../lib/formato'

const cx = (...classes: (string | false | undefined)[]) => classes.filter(Boolean).join(' ')

type Variante = 'primario' | 'secundario' | 'perigo' | 'fantasma'
const variantes: Record<Variante, string> = {
  primario: 'bg-marca-600 text-white hover:bg-marca-700',
  secundario: 'bg-white text-stone-700 border border-stone-300 hover:bg-stone-50',
  perigo: 'bg-white text-red-600 border border-red-200 hover:bg-red-50',
  fantasma: 'text-stone-600 hover:bg-stone-100',
}

export function Botao({
  variante = 'primario',
  className,
  ...props
}: ButtonHTMLAttributes<HTMLButtonElement> & { variante?: Variante }) {
  return (
    <button
      className={cx(
        'inline-flex items-center justify-center gap-2 rounded-lg px-3.5 py-2 text-sm font-medium transition disabled:opacity-50 disabled:cursor-not-allowed',
        variantes[variante],
        className,
      )}
      {...props}
    />
  )
}

const estiloCampo =
  'w-full rounded-lg border border-stone-300 bg-white px-3 py-2 text-sm outline-none focus:border-marca-500 focus:ring-2 focus:ring-marca-100'

export function Campo({ rotulo, children, dica }: { rotulo: string; children: ReactNode; dica?: string }) {
  return (
    <label className="block space-y-1">
      <span className="text-sm font-medium text-stone-700">{rotulo}</span>
      {children}
      {dica && <span className="block text-xs text-stone-500">{dica}</span>}
    </label>
  )
}

export const Entrada = ({ className, ...p }: InputHTMLAttributes<HTMLInputElement>) => (
  <input className={cx(estiloCampo, className)} {...p} />
)

export const AreaTexto = ({ className, ...p }: TextareaHTMLAttributes<HTMLTextAreaElement>) => (
  <textarea className={cx(estiloCampo, 'min-h-20', className)} {...p} />
)

export const Selecao = ({ className, ...p }: SelectHTMLAttributes<HTMLSelectElement>) => (
  <select className={cx(estiloCampo, className)} {...p} />
)

export function Cartao({ children, className }: { children: ReactNode; className?: string }) {
  return <div className={cx('rounded-xl border border-stone-200 bg-white p-5 shadow-sm', className)}>{children}</div>
}

export function Selo({ status }: { status: StatusParceria }) {
  const s = infoStatus(status)
  return <span className={cx('rounded-full px-2.5 py-0.5 text-xs font-medium', s.cor)}>{s.rotulo}</span>
}

export function Cabecalho({ titulo, subtitulo, acoes }: { titulo: string; subtitulo?: string; acoes?: ReactNode }) {
  return (
    <div className="mb-6 flex flex-wrap items-end justify-between gap-3">
      <div>
        <h1 className="text-2xl font-semibold text-stone-900">{titulo}</h1>
        {subtitulo && <p className="text-sm text-stone-500">{subtitulo}</p>}
      </div>
      {acoes && <div className="flex gap-2">{acoes}</div>}
    </div>
  )
}

export function Vazio({ children }: { children: ReactNode }) {
  return (
    <div className="rounded-xl border border-dashed border-stone-300 p-10 text-center text-sm text-stone-500">
      {children}
    </div>
  )
}

export function Erro({ mensagem }: { mensagem: string | null }) {
  if (!mensagem) return null
  return <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">{mensagem}</p>
}

export function Modal({
  aberto,
  titulo,
  aoFechar,
  children,
  largo,
}: {
  aberto: boolean
  titulo: string
  aoFechar: () => void
  children: ReactNode
  largo?: boolean
}) {
  if (!aberto) return null
  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto bg-black/40 p-4" onClick={aoFechar}>
      <div
        className={cx('my-8 w-full rounded-xl bg-white shadow-xl', largo ? 'max-w-3xl' : 'max-w-lg')}
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
        aria-label={titulo}
      >
        <div className="flex items-center justify-between border-b border-stone-200 px-5 py-4">
          <h2 className="text-lg font-semibold">{titulo}</h2>
          <button onClick={aoFechar} className="rounded p-1 text-stone-500 hover:bg-stone-100" aria-label="Fechar">
            <X size={18} />
          </button>
        </div>
        <div className="p-5">{children}</div>
      </div>
    </div>
  )
}
