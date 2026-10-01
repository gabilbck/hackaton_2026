import { lazy, Suspense, type ReactNode } from 'react'
import { Link, useParams } from 'react-router-dom'
import { ArrowLeft, AtSign, CalendarPlus, Clock, MapPin, MessageCircle, Navigation, Star, Ticket } from 'lucide-react'
import { api } from '../../lib/api'
import { useCarregar } from '../../lib/useCarregar'
import { useFavoritos } from '../../lib/useFavoritos'
import { infoCategoria, linkAgenda, linkInstagram, linkMapa, linkWhatsApp, precoEvento, quandoLongo } from '../../lib/formato'
import type { Evento } from '../../types'
import { Vazio } from '../../components/ui'
import { BotaoFavorito, CapaEvento } from '../../components/publico/CartaoEvento'
import { Inscricao } from '../../components/publico/Inscricao'

const MapaEventos = lazy(() => import('../../components/publico/MapaEventos'))

const estiloAcao =
  'flex items-center justify-center gap-2 rounded-xl border border-stone-300 bg-white px-4 py-2.5 text-sm font-medium text-stone-700 hover:border-marca-500 hover:text-marca-700'

export function EventoDetalhe() {
  const id = Number(useParams().id)
  const { dados: e, erro } = useCarregar(() => api.get<Evento>(`/publico/eventos/${id}`), [id])
  const favoritos = useFavoritos()

  if (erro) {
    return (
      <div className="mx-auto max-w-3xl p-4 py-10">
        <Vazio>
          Esse evento não está mais disponível. <Link to="/" className="text-marca-700 underline">Ver a agenda</Link>
        </Vazio>
      </div>
    )
  }
  if (!e) return null

  const cat = infoCategoria(e.categoria)
  const onde = [e.local, e.endereco, e.bairro].filter(Boolean).join(' · ')
  const textoCompartilhar = `${e.titulo}\n${quandoLongo(e)}\n${onde}\n${window.location.href}`

  return (
    <article className="mx-auto max-w-3xl px-4 py-6">
      <Link to="/" className="mb-4 inline-flex items-center gap-1 text-sm text-stone-500 hover:text-stone-800">
        <ArrowLeft size={14} /> Voltar para a agenda
      </Link>

      <div className="relative overflow-hidden rounded-2xl">
        <CapaEvento evento={e} className="h-48 md:h-64" />
        <BotaoFavorito ativo={favoritos.ehFavorito(e.id)} aoClicar={() => favoritos.alternar(e.id)} className="absolute top-3 right-3" />
      </div>

      <div className="mt-5 flex flex-wrap gap-2">
        <span className="rounded-full bg-marca-50 px-2.5 py-0.5 text-sm font-medium text-marca-700">
          {cat.emoji} {cat.rotulo}
        </span>
        {e.destaque && (
          <span className="flex items-center gap-1 rounded-full bg-amber-100 px-2.5 py-0.5 text-sm font-semibold text-amber-800">
            <Star size={13} className="fill-current" /> Recomendado pelo Guia
          </span>
        )}
      </div>
      <h1 className="mt-2 text-3xl font-bold text-stone-900">{e.titulo}</h1>

      <dl className="mt-5 grid gap-3 rounded-2xl border border-stone-200 bg-white p-5 sm:grid-cols-2">
        <Info icone={<Clock size={18} />} rotulo="Quando" valor={quandoLongo(e)} />
        <Info icone={<Ticket size={18} />} rotulo="Valor" valor={precoEvento(e)} />
        <Info icone={<MapPin size={18} />} rotulo="Onde" valor={onde} />
        {e.marca && (
          <Info
            icone={<AtSign size={18} />}
            rotulo="Realização"
            valor={
              e.marca.instagram ? (
                <a href={linkInstagram(e.marca.instagram)} target="_blank" rel="noreferrer" className="text-marca-700 hover:underline">
                  {e.marca.nome} ({e.marca.instagram})
                </a>
              ) : (
                e.marca.nome
              )
            }
          />
        )}
      </dl>

      <div className="mt-4 grid gap-2 sm:grid-cols-2">
        {e.linkIngresso && (
          <a href={e.linkIngresso} target="_blank" rel="noreferrer" className="flex items-center justify-center gap-2 rounded-xl bg-marca-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-marca-700 sm:col-span-2">
            <Ticket size={16} /> Comprar ingresso
          </a>
        )}
        <a href={linkMapa(e)} target="_blank" rel="noreferrer" className={estiloAcao}>
          <Navigation size={16} /> Como chegar
        </a>
        <a href={linkAgenda(e)} target="_blank" rel="noreferrer" className={estiloAcao}>
          <CalendarPlus size={16} /> Adicionar à agenda
        </a>
        <a href={linkWhatsApp('', textoCompartilhar)} target="_blank" rel="noreferrer" className={`${estiloAcao} sm:col-span-2`}>
          <MessageCircle size={16} className="text-green-600" /> Chamar a turma no WhatsApp
        </a>
      </div>

      {e.descricao && (
        <section className="mt-6">
          <h2 className="mb-2 text-lg font-semibold">Sobre</h2>
          <p className="whitespace-pre-wrap text-stone-700">{e.descricao}</p>
        </section>
      )}

      {e.latitude != null && (
        <section className="mt-6">
          <Suspense fallback={<div className="h-64 animate-pulse rounded-2xl bg-stone-200" />}>
            <MapaEventos eventos={[e]} altura="h-64" />
          </Suspense>
        </section>
      )}

      <div className="mt-10">
        <Inscricao />
      </div>
    </article>
  )
}

function Info({ icone, rotulo, valor }: { icone: ReactNode; rotulo: string; valor: ReactNode }) {
  return (
    <div className="flex gap-3">
      <span className="mt-0.5 text-marca-600">{icone}</span>
      <div>
        <dt className="text-xs font-medium tracking-wide text-stone-500 uppercase">{rotulo}</dt>
        <dd className="text-stone-800 first-letter:uppercase">{valor}</dd>
      </div>
    </div>
  )
}
