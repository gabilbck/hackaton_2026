import { lazy, Suspense, useEffect, useState, type ReactNode } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { AtSign, Handshake, Heart, List, Map as MapIcon, MapPin, Search } from 'lucide-react'
import { api } from '../../lib/api'
import { useCarregar } from '../../lib/useCarregar'
import { useFavoritos } from '../../lib/useFavoritos'
import { CATEGORIAS, linkInstagram, PERIODOS } from '../../lib/formato'
import type { CategoriaEvento, Evento } from '../../types'
import { Entrada, Selecao, Vazio } from '../../components/ui'
import { CartaoEvento } from '../../components/publico/CartaoEvento'
import { Inscricao } from '../../components/publico/Inscricao'

// O mapa (Leaflet) só é baixado quando a pessoa abre a visualização de mapa
const MapaEventos = lazy(() => import('../../components/publico/MapaEventos'))

interface Filtros {
  categorias: { categoria: CategoriaEvento; total: number }[]
  bairros: string[]
}

interface Lugar {
  id: number
  marca: { nome: string; instagram: string | null; segmento: string | null; bairro: string | null }
}

function Chip({ ativo, onClick, children }: { ativo: boolean; onClick: () => void; children: ReactNode }) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={ativo}
      className={`shrink-0 rounded-full border px-3.5 py-1.5 text-sm font-medium transition ${
        ativo ? 'border-marca-600 bg-marca-600 text-white' : 'border-stone-300 bg-white text-stone-700 hover:border-marca-500'
      }`}
    >
      {children}
    </button>
  )
}

/** Página inicial: todos os eventos de Joinville em um só lugar. */
export function Agenda() {
  // Filtros ficam na URL: dá para compartilhar "o que fazer neste fim de semana"
  const [params, setParams] = useSearchParams()
  const periodo = params.get('periodo') ?? ''
  const categoria = params.get('categoria') ?? ''
  const bairro = params.get('bairro') ?? ''
  const busca = params.get('busca') ?? ''
  const gratuito = params.get('gratuito') === 'true'
  const soFavoritos = params.get('favoritos') === 'true'
  const verMapa = params.get('ver') === 'mapa'

  const definir = (chave: string, valor: string | boolean) => {
    const novos = new URLSearchParams(params)
    if (valor === '' || valor === false) novos.delete(chave)
    else novos.set(chave, String(valor))
    setParams(novos, { replace: true })
  }

  // Busca espera a pessoa parar de digitar antes de consultar a API
  const [textoBusca, setTextoBusca] = useState(busca)
  useEffect(() => {
    if (textoBusca === busca) return
    const t = setTimeout(() => definir('busca', textoBusca.trim()), 350)
    return () => clearTimeout(t)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [textoBusca])

  const query = new URLSearchParams(
    Object.entries({ periodo, categoria, bairro, busca, gratuito: gratuito ? 'true' : '' }).filter(([, v]) => v),
  ).toString()

  const { dados: eventos, carregando } = useCarregar(() => api.get<Evento[]>(`/publico/eventos?${query}`), [query])
  const filtros = useCarregar(() => api.get<Filtros>('/publico/filtros'))
  const lugares = useCarregar(() => api.get<Lugar[]>('/publico/lugares'))
  const favoritos = useFavoritos()

  const visiveis = (eventos ?? []).filter((e) => !soFavoritos || favoritos.ehFavorito(e.id))
  const totalPorCategoria = (c: CategoriaEvento) => filtros.dados?.categorias.find((x) => x.categoria === c)?.total

  return (
    <>
      <section className="bg-gradient-to-b from-marca-50 to-stone-50 px-4 pt-10 pb-6">
        <div className="mx-auto max-w-6xl">
          <h1 className="text-3xl font-bold tracking-tight text-stone-900 md:text-4xl">O que fazer em Joinville</h1>
          <p className="mt-1 text-stone-600">Eventos, gastronomia e cultura da cidade reunidos em um só lugar.</p>

          <div className="relative mt-5 max-w-xl">
            <Search className="absolute top-3 left-3 text-stone-400" size={18} />
            <Entrada
              className="py-2.5 pl-10 text-base"
              placeholder="Buscar por evento, lugar ou bairro"
              value={textoBusca}
              onChange={(e) => setTextoBusca(e.target.value)}
              aria-label="Buscar eventos"
            />
          </div>

          <div className="-mx-4 mt-5 flex gap-2 overflow-x-auto px-4 pb-1 [scrollbar-width:none]" role="group" aria-label="Quando">
            {PERIODOS.map((p) => (
              <Chip key={p.valor} ativo={periodo === p.valor} onClick={() => definir('periodo', p.valor)}>
                {p.rotulo}
              </Chip>
            ))}
          </div>

          <div className="-mx-4 mt-2 flex gap-2 overflow-x-auto px-4 pb-1 [scrollbar-width:none]" role="group" aria-label="Categoria">
            <Chip ativo={!categoria} onClick={() => definir('categoria', '')}>
              Todas
            </Chip>
            {CATEGORIAS.filter((c) => totalPorCategoria(c.valor) || categoria === c.valor).map((c) => (
              <Chip key={c.valor} ativo={categoria === c.valor} onClick={() => definir('categoria', c.valor)}>
                {c.emoji} {c.rotulo}
              </Chip>
            ))}
          </div>

          <div className="mt-4 flex flex-wrap items-center gap-3">
            <div className="w-full sm:w-52">
              <Selecao value={bairro} onChange={(e) => definir('bairro', e.target.value)} aria-label="Bairro">
                <option value="">Todos os bairros</option>
                {filtros.dados?.bairros.map((b) => <option key={b}>{b}</option>)}
              </Selecao>
            </div>
            <label className="flex items-center gap-2 text-sm font-medium text-stone-700">
              <input type="checkbox" checked={gratuito} onChange={(e) => definir('gratuito', e.target.checked)} />
              Só gratuitos
            </label>
            <label className="flex items-center gap-2 text-sm font-medium text-stone-700">
              <input type="checkbox" checked={soFavoritos} onChange={(e) => definir('favoritos', e.target.checked)} />
              <Heart size={14} className="fill-rose-500 text-rose-500" /> Meus favoritos ({favoritos.ids.length})
            </label>

            <div className="ml-auto flex rounded-lg border border-stone-300 bg-white p-0.5" role="group" aria-label="Visualização">
              {[
                { valor: false, rotulo: 'Lista', icone: List },
                { valor: true, rotulo: 'Mapa', icone: MapIcon },
              ].map(({ valor, rotulo, icone: Icone }) => (
                <button
                  key={rotulo}
                  type="button"
                  onClick={() => definir('ver', valor ? 'mapa' : '')}
                  aria-pressed={verMapa === valor}
                  className={`flex items-center gap-1.5 rounded-md px-3 py-1.5 text-sm font-medium ${
                    verMapa === valor ? 'bg-stone-900 text-white' : 'text-stone-600'
                  }`}
                >
                  <Icone size={15} /> {rotulo}
                </button>
              ))}
            </div>
          </div>
        </div>
      </section>

      <div className="mx-auto max-w-6xl space-y-10 px-4 py-6">
        <section aria-live="polite">
          <p className="mb-3 text-sm text-stone-500">
            {carregando ? 'Buscando eventos...' : `${visiveis.length} evento(s) encontrado(s)`}
          </p>

          {!carregando && visiveis.length === 0 && (
            <Vazio>
              {soFavoritos
                ? 'Você ainda não salvou eventos com esses filtros. Toque no ❤️ de um evento para guardar.'
                : 'Nenhum evento com esses filtros. Tente outro período ou categoria.'}
            </Vazio>
          )}

          {verMapa ? (
            <Suspense fallback={<div className="h-[480px] animate-pulse rounded-2xl bg-stone-200" />}>
              <MapaEventos eventos={visiveis} />
            </Suspense>
          ) : (
            <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {visiveis.map((e) => (
                <CartaoEvento key={e.id} evento={e} favorito={favoritos.ehFavorito(e.id)} aoFavoritar={favoritos.alternar} />
              ))}
            </div>
          )}
        </section>

        <Inscricao />

        <section className="flex flex-col items-start gap-4 rounded-2xl border border-stone-200 bg-white p-6 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-start gap-3">
            <Handshake size={26} className="mt-0.5 shrink-0 text-marca-600" />
            <div>
              <h2 className="text-lg font-semibold">Tem um restaurante, bar ou evento?</h2>
              <p className="text-sm text-stone-600">
                Cadastre sua marca, escolha como quer aparecer no Guia e receba a proposta na hora.
              </p>
            </div>
          </div>
          <Link to="/parceiros" className="shrink-0 rounded-lg bg-marca-600 px-4 py-2 text-sm font-medium text-white hover:bg-marca-700">
            Quero ser parceiro
          </Link>
        </section>

        {!!lugares.dados?.length && (
          <section>
            <h2 className="mb-1 text-xl font-semibold">Lugares recomendados pelo Guia</h2>
            <p className="mb-4 text-sm text-stone-500">Restaurantes e cafés que a gente visitou e aprovou.</p>
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
              {lugares.dados.map((l) => (
                <article key={l.id} className="rounded-xl border border-stone-200 bg-white p-4">
                  {l.marca.segmento && <p className="text-xs font-medium text-marca-700">{l.marca.segmento}</p>}
                  <h3 className="font-semibold">{l.marca.nome}</h3>
                  {l.marca.bairro && (
                    <p className="mt-1 flex items-center gap-1 text-sm text-stone-500">
                      <MapPin size={13} /> {l.marca.bairro}
                    </p>
                  )}
                  {l.marca.instagram && (
                    <a href={linkInstagram(l.marca.instagram)} target="_blank" rel="noreferrer" className="mt-1 flex items-center gap-1 text-sm text-marca-700 hover:underline">
                      <AtSign size={13} /> {l.marca.instagram.replace('@', '')}
                    </a>
                  )}
                </article>
              ))}
            </div>
          </section>
        )}
      </div>
    </>
  )
}
