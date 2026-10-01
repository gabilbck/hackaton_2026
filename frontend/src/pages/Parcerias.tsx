import { useState, type DragEvent } from 'react'
import { CalendarDays, Globe, Plus } from 'lucide-react'
import { api } from '../lib/api'
import { useCarregar } from '../lib/useCarregar'
import { data, moeda, STATUS } from '../lib/formato'
import type { Parceria, StatusParceria } from '../types'
import { Botao, Cabecalho, Erro } from '../components/ui'
import { NovaParceriaModal } from '../components/NovaParceriaModal'
import { ParceriaModal } from '../components/ParceriaModal'

/** Quadro kanban: arraste o cartão para mudar a etapa (os contatos recebem e-mail). */
export function Parcerias() {
  const { dados, erro, recarregar } = useCarregar(() => api.get<Parceria[]>('/parcerias'))
  const [novaAberta, setNovaAberta] = useState(false)
  const [aberta, setAberta] = useState<number | null>(null)
  const [sobre, setSobre] = useState<StatusParceria | null>(null)
  const [erroMover, setErroMover] = useState<string | null>(null)

  async function soltar(e: DragEvent, status: StatusParceria) {
    e.preventDefault()
    setSobre(null)
    const id = Number(e.dataTransfer.getData('text/plain'))
    if (dados?.find((p) => p.id === id)?.status === status) return
    try {
      await api.patch(`/parcerias/${id}/status`, { status })
      recarregar()
    } catch (err) {
      setErroMover((err as Error).message)
    }
  }

  return (
    <>
      <Cabecalho
        titulo="Parcerias"
        subtitulo="Arraste os cartões entre as etapas"
        acoes={
          <Botao onClick={() => setNovaAberta(true)}>
            <Plus size={16} /> Nova proposta
          </Botao>
        }
      />
      <Erro mensagem={erro ?? erroMover} />

      <div className="flex gap-4 overflow-x-auto pb-4">
        {STATUS.map((s) => {
          const itens = dados?.filter((p) => p.status === s.valor) ?? []
          return (
            <section
              key={s.valor}
              onDragOver={(e) => {
                e.preventDefault()
                setSobre(s.valor)
              }}
              onDragLeave={() => setSobre(null)}
              onDrop={(e) => soltar(e, s.valor)}
              className={`w-64 shrink-0 rounded-xl p-3 transition ${sobre === s.valor ? 'bg-marca-100' : 'bg-stone-100'}`}
            >
              <header className="mb-3 flex items-center justify-between">
                <span className={`rounded-full px-2.5 py-0.5 text-xs font-semibold ${s.cor}`}>{s.rotulo}</span>
                <span className="text-xs text-stone-500">{itens.length}</span>
              </header>
              <div className="min-h-24 space-y-2">
                {itens.map((p) => (
                  <article
                    key={p.id}
                    draggable
                    onDragStart={(e) => e.dataTransfer.setData('text/plain', String(p.id))}
                    onClick={() => setAberta(p.id)}
                    className="cursor-pointer rounded-lg border border-stone-200 bg-white p-3 shadow-sm hover:border-marca-500"
                  >
                    <div className="flex items-start justify-between gap-2">
                      <p className="font-medium text-stone-900">{p.marca?.nome}</p>
                      {p.origem === 'SITE' && (
                        <span className="flex shrink-0 items-center gap-1 rounded-full bg-sky-100 px-1.5 py-0.5 text-[10px] font-semibold text-sky-800" title="A própria marca se cadastrou pelo site">
                          <Globe size={10} /> via site
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-stone-500">{p.pacote?.nome ?? 'Personalizada'}</p>
                    <div className="mt-2 flex items-center justify-between text-xs text-stone-600">
                      <span className="font-semibold">{moeda(p.valor)}</span>
                      {p.dataPublicacao && (
                        <span className="flex items-center gap-1">
                          <CalendarDays size={12} /> {data(p.dataPublicacao)}
                        </span>
                      )}
                    </div>
                  </article>
                ))}
              </div>
            </section>
          )
        })}
      </div>

      <NovaParceriaModal aberto={novaAberta} aoFechar={() => setNovaAberta(false)} aoCriar={recarregar} />
      <ParceriaModal id={aberta} aoFechar={() => setAberta(null)} aoAlterar={recarregar} />
    </>
  )
}
