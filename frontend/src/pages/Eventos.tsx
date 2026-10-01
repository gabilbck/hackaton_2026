import { useState } from 'react'
import { ExternalLink, MapPinOff, Pencil, Plus, Star, Trash2 } from 'lucide-react'
import { api } from '../lib/api'
import { useCarregar } from '../lib/useCarregar'
import { infoCategoria, precoEvento, quandoCurto } from '../lib/formato'
import type { Evento } from '../types'
import { Botao, Cabecalho, Cartao, Erro, Vazio } from '../components/ui'
import { EventoFormModal } from '../components/EventoFormModal'

export function Eventos() {
  const [passados, setPassados] = useState(false)
  const { dados: eventos, erro, recarregar } = useCarregar(
    () => api.get<Evento[]>(`/eventos?passados=${passados}`),
    [passados],
  )
  const [formAberto, setFormAberto] = useState(false)
  const [editando, setEditando] = useState<Evento | null>(null)

  const abrir = (e: Evento | null) => {
    setEditando(e)
    setFormAberto(true)
  }

  async function remover(e: Evento) {
    if (!confirm(`Excluir o evento "${e.titulo}"?`)) return
    await api.delete(`/eventos/${e.id}`)
    recarregar()
  }

  return (
    <>
      <Cabecalho
        titulo="Eventos"
        subtitulo="O que aparece na agenda pública"
        acoes={
          <Botao onClick={() => abrir(null)}>
            <Plus size={16} /> Novo evento
          </Botao>
        }
      />

      <div className="mb-4 flex gap-1 rounded-lg bg-stone-100 p-1 text-sm font-medium sm:w-fit">
        {[
          { valor: false, rotulo: 'Próximos' },
          { valor: true, rotulo: 'Todos (inclui encerrados)' },
        ].map((o) => (
          <button
            key={o.rotulo}
            onClick={() => setPassados(o.valor)}
            className={`flex-1 rounded-md px-3 py-1.5 ${passados === o.valor ? 'bg-white shadow-sm' : 'text-stone-600'}`}
          >
            {o.rotulo}
          </button>
        ))}
      </div>

      <Erro mensagem={erro} />
      {eventos?.length === 0 && <Vazio>Nenhum evento. Cadastre o primeiro para ele aparecer na agenda.</Vazio>}

      {!!eventos?.length && (
        <Cartao className="divide-y divide-stone-100 p-0">
          {eventos.map((e) => {
            const cat = infoCategoria(e.categoria)
            return (
              <div key={e.id} className="flex flex-wrap items-center gap-3 px-4 py-3">
                <span className="text-2xl" aria-hidden>
                  {cat.emoji}
                </span>
                <div className="min-w-0 flex-1">
                  <p className="flex flex-wrap items-center gap-2 font-medium">
                    {e.titulo}
                    {e.destaque && <Star size={14} className="fill-amber-400 text-amber-400" aria-label="Recomendado" />}
                    {!e.publicado && <span className="rounded bg-stone-200 px-1.5 text-xs text-stone-600">Rascunho</span>}
                    {e.latitude == null && (
                      <span title="Sem coordenadas: não aparece no mapa" className="text-stone-400">
                        <MapPinOff size={14} />
                      </span>
                    )}
                  </p>
                  <p className="text-sm text-stone-500">
                    {quandoCurto(e)} · {[e.local, e.bairro].filter(Boolean).join(', ') || e.endereco} · {precoEvento(e)}
                  </p>
                </div>
                <div className="flex gap-1">
                  {e.publicado && (
                    <a href={`/evento/${e.id}`} target="_blank" rel="noreferrer" title="Ver na agenda" className="rounded-lg p-2 text-stone-500 hover:bg-stone-100">
                      <ExternalLink size={16} />
                    </a>
                  )}
                  <Botao variante="fantasma" onClick={() => abrir(e)} aria-label="Editar">
                    <Pencil size={16} />
                  </Botao>
                  <Botao variante="fantasma" onClick={() => remover(e)} aria-label="Excluir">
                    <Trash2 size={16} />
                  </Botao>
                </div>
              </div>
            )
          })}
        </Cartao>
      )}

      <EventoFormModal aberto={formAberto} evento={editando} aoFechar={() => setFormAberto(false)} aoSalvar={recarregar} />
    </>
  )
}
