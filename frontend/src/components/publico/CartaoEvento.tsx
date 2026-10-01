import { Link } from 'react-router-dom'
import { Clock, Heart, MapPin, Star, Ticket } from 'lucide-react'
import { infoCategoria, precoEvento, quandoCurto } from '../../lib/formato'
import type { Evento } from '../../types'

interface Props {
  evento: Evento
  favorito: boolean
  aoFavoritar: (id: number) => void
}

export function CapaEvento({ evento, className = 'h-32' }: { evento: Evento; className?: string }) {
  const cat = infoCategoria(evento.categoria)
  if (evento.imagemUrl) {
    return <img src={evento.imagemUrl} alt="" className={`w-full object-cover ${className}`} />
  }
  return (
    <div className={`flex w-full items-center justify-center bg-gradient-to-br text-5xl ${cat.fundo} ${className}`} aria-hidden>
      {cat.emoji}
    </div>
  )
}

export function BotaoFavorito({ ativo, aoClicar, className = '' }: { ativo: boolean; aoClicar: () => void; className?: string }) {
  return (
    <button
      type="button"
      onClick={(e) => {
        e.preventDefault()
        e.stopPropagation()
        aoClicar()
      }}
      aria-pressed={ativo}
      aria-label={ativo ? 'Remover dos favoritos' : 'Salvar nos favoritos'}
      className={`rounded-full bg-white/90 p-2 shadow transition hover:scale-110 ${className}`}
    >
      <Heart size={18} className={ativo ? 'fill-rose-500 text-rose-500' : 'text-stone-600'} />
    </button>
  )
}

/** Card da agenda: mostra de cara o que decide a saída (quando, onde, quanto). */
export function CartaoEvento({ evento, favorito, aoFavoritar }: Props) {
  const cat = infoCategoria(evento.categoria)
  return (
    <Link
      to={`/evento/${evento.id}`}
      className="group flex flex-col overflow-hidden rounded-2xl border border-stone-200 bg-white shadow-sm transition hover:-translate-y-0.5 hover:shadow-md"
    >
      <div className="relative">
        <CapaEvento evento={evento} />
        <BotaoFavorito ativo={favorito} aoClicar={() => aoFavoritar(evento.id)} className="absolute top-2 right-2" />
        <div className="absolute bottom-2 left-2 flex gap-1.5">
          <span className="rounded-full bg-white/95 px-2 py-0.5 text-xs font-medium text-stone-700">
            {cat.emoji} {cat.rotulo}
          </span>
          {evento.destaque && (
            <span className="flex items-center gap-1 rounded-full bg-amber-400 px-2 py-0.5 text-xs font-semibold text-amber-950">
              <Star size={11} className="fill-current" /> Recomendado
            </span>
          )}
        </div>
      </div>

      <div className="flex flex-1 flex-col gap-1.5 p-4">
        <h3 className="font-semibold text-stone-900 group-hover:text-marca-700">{evento.titulo}</h3>
        <p className="flex items-center gap-1.5 text-sm font-medium text-marca-700">
          <Clock size={14} /> {quandoCurto(evento)}
        </p>
        <p className="flex items-start gap-1.5 text-sm text-stone-600">
          <MapPin size={14} className="mt-0.5 shrink-0" />
          {[evento.local ?? evento.endereco, evento.bairro].filter(Boolean).join(' · ')}
        </p>
        <p className={`mt-auto flex items-center gap-1.5 pt-1 text-sm font-semibold ${evento.gratuito ? 'text-emerald-700' : 'text-stone-800'}`}>
          <Ticket size={14} /> {precoEvento(evento)}
        </p>
      </div>
    </Link>
  )
}
