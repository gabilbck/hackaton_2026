import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { AtSign, MapPin, Plus, Search } from 'lucide-react'
import { api } from '../lib/api'
import { useCarregar } from '../lib/useCarregar'
import type { Marca } from '../types'
import { Botao, Cabecalho, Cartao, Entrada, Erro, Selecao, Vazio } from '../components/ui'
import { MarcaFormModal } from '../components/MarcaFormModal'

export function Marcas() {
  const navigate = useNavigate()
  const [busca, setBusca] = useState('')
  const [bairro, setBairro] = useState('')
  const [segmento, setSegmento] = useState('')
  const [formAberto, setFormAberto] = useState(false)

  const filtros = useCarregar(() => api.get<{ bairros: string[]; segmentos: string[] }>('/marcas/filtros'))
  const query = new URLSearchParams({ busca, bairro, segmento }).toString()
  const { dados: marcas, carregando, erro } = useCarregar(() => api.get<Marca[]>(`/marcas?${query}`), [query])

  return (
    <>
      <Cabecalho
        titulo="Marcas"
        subtitulo="Restaurantes e empresas parceiras"
        acoes={
          <Botao onClick={() => setFormAberto(true)}>
            <Plus size={16} /> Nova marca
          </Botao>
        }
      />

      <div className="mb-5 grid gap-3 sm:grid-cols-[1fr_180px_180px]">
        <div className="relative">
          <Search className="absolute top-2.5 left-3 text-stone-400" size={16} />
          <Entrada
            className="pl-9"
            placeholder="Buscar por nome, @, contato..."
            value={busca}
            onChange={(e) => setBusca(e.target.value)}
          />
        </div>
        <Selecao value={bairro} onChange={(e) => setBairro(e.target.value)} aria-label="Filtrar por bairro">
          <option value="">Todos os bairros</option>
          {filtros.dados?.bairros.map((b) => <option key={b}>{b}</option>)}
        </Selecao>
        <Selecao value={segmento} onChange={(e) => setSegmento(e.target.value)} aria-label="Filtrar por segmento">
          <option value="">Todos os segmentos</option>
          {filtros.dados?.segmentos.map((s) => <option key={s}>{s}</option>)}
        </Selecao>
      </div>

      <Erro mensagem={erro} />
      {!carregando && marcas?.length === 0 && <Vazio>Nenhuma marca encontrada.</Vazio>}

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {marcas?.map((m) => (
          <Link key={m.id} to={`/admin/marcas/${m.id}`}>
            <Cartao className="h-full transition hover:border-marca-500 hover:shadow">
              <div className="flex items-start justify-between gap-2">
                <h3 className="font-semibold text-stone-900">{m.nome}</h3>
                {m.segmento && (
                  <span className="shrink-0 rounded-full bg-marca-50 px-2 py-0.5 text-xs text-marca-700">
                    {m.segmento}
                  </span>
                )}
              </div>
              <div className="mt-2 space-y-1 text-sm text-stone-500">
                {m.instagram && (
                  <p className="flex items-center gap-1.5">
                    <AtSign size={14} /> {m.instagram.replace('@', '')}
                  </p>
                )}
                {m.bairro && (
                  <p className="flex items-center gap-1.5">
                    <MapPin size={14} /> {m.bairro}
                  </p>
                )}
              </div>
              <div className="mt-3 flex justify-between border-t border-stone-100 pt-3 text-xs text-stone-500">
                <span>{m.contatos[0]?.nome ?? 'Sem contato'}</span>
                <span>{m._count?.parcerias ?? 0} parceria(s)</span>
              </div>
            </Cartao>
          </Link>
        ))}
      </div>

      <MarcaFormModal
        aberto={formAberto}
        aoFechar={() => setFormAberto(false)}
        aoSalvar={(m) => navigate(`/admin/marcas/${m.id}`)}
      />
    </>
  )
}
