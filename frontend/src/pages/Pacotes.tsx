import { useEffect, useState, type FormEvent } from 'react'
import { Pencil, Plus, Trash2 } from 'lucide-react'
import { api } from '../lib/api'
import { useCarregar } from '../lib/useCarregar'
import { moeda } from '../lib/formato'
import type { Pacote, PacoteItem } from '../types'
import { AreaTexto, Botao, Cabecalho, Campo, Cartao, Entrada, Erro, Modal, Vazio } from '../components/ui'

/** Área administrativa dos pacotes: a cliente define o que oferece e por quanto. */
export function Pacotes() {
  const { dados: pacotes, erro, recarregar } = useCarregar(() => api.get<Pacote[]>('/pacotes'))
  const [editando, setEditando] = useState<Pacote | null>(null)
  const [formAberto, setFormAberto] = useState(false)

  function abrir(p: Pacote | null) {
    setEditando(p)
    setFormAberto(true)
  }

  async function remover(p: Pacote) {
    if (!confirm(`Remover o pacote "${p.nome}"?`)) return
    const r = await api.delete<{ desativado: boolean }>(`/pacotes/${p.id}`)
    if (r.desativado) alert('Este pacote já foi usado em propostas, então foi desativado em vez de excluído.')
    recarregar()
  }

  async function alternarAtivo(p: Pacote) {
    await api.put(`/pacotes/${p.id}`, { ...p, preco: Number(p.preco), ativo: !p.ativo })
    recarregar()
  }

  return (
    <>
      <Cabecalho
        titulo="Pacotes"
        subtitulo="Monte as ofertas que aparecem nas propostas"
        acoes={
          <Botao onClick={() => abrir(null)}>
            <Plus size={16} /> Novo pacote
          </Botao>
        }
      />
      <Erro mensagem={erro} />
      {pacotes?.length === 0 && <Vazio>Nenhum pacote. Crie o primeiro para agilizar suas propostas.</Vazio>}

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {pacotes?.map((p) => (
          <Cartao key={p.id} className={p.ativo ? '' : 'opacity-60'}>
            <div className="flex items-start justify-between gap-2">
              <h3 className="font-semibold">{p.nome}</h3>
              <span className="text-lg font-semibold text-marca-700">{moeda(p.preco)}</span>
            </div>
            {p.descricao && <p className="mt-1 text-sm text-stone-500">{p.descricao}</p>}
            <ul className="mt-3 space-y-1 text-sm">
              {p.itens.map((i) => (
                <li key={i.id}>
                  • <strong>{i.quantidade}x</strong> {i.tipo}
                  {i.descricao && <span className="text-stone-500">: {i.descricao}</span>}
                </li>
              ))}
            </ul>
            <div className="mt-4 flex items-center justify-between border-t border-stone-100 pt-3">
              <label className="flex items-center gap-2 text-sm">
                <input type="checkbox" checked={p.ativo} onChange={() => alternarAtivo(p)} />
                Ativo
              </label>
              <div className="flex gap-1">
                <Botao variante="fantasma" onClick={() => abrir(p)} aria-label="Editar">
                  <Pencil size={16} />
                </Botao>
                <Botao variante="fantasma" onClick={() => remover(p)} aria-label="Remover">
                  <Trash2 size={16} />
                </Botao>
              </div>
            </div>
          </Cartao>
        ))}
      </div>

      <PacoteFormModal aberto={formAberto} pacote={editando} aoFechar={() => setFormAberto(false)} aoSalvar={recarregar} />
    </>
  )
}

const itemVazio = (): PacoteItem => ({ tipo: '', quantidade: 1, descricao: '' })

function PacoteFormModal({
  aberto,
  pacote,
  aoFechar,
  aoSalvar,
}: {
  aberto: boolean
  pacote: Pacote | null
  aoFechar: () => void
  aoSalvar: () => void
}) {
  const [nome, setNome] = useState('')
  const [descricao, setDescricao] = useState('')
  const [preco, setPreco] = useState('')
  const [itens, setItens] = useState<PacoteItem[]>([itemVazio()])
  const [erro, setErro] = useState<string | null>(null)

  useEffect(() => {
    if (!aberto) return
    setErro(null)
    setNome(pacote?.nome ?? '')
    setDescricao(pacote?.descricao ?? '')
    setPreco(pacote ? String(Number(pacote.preco)) : '')
    setItens(pacote?.itens.length ? pacote.itens.map((i) => ({ ...i, descricao: i.descricao ?? '' })) : [itemVazio()])
  }, [aberto, pacote])

  const alterarItem = (idx: number, campo: keyof PacoteItem, valor: string) =>
    setItens(itens.map((it, i) => (i === idx ? { ...it, [campo]: campo === 'quantidade' ? Number(valor) : valor } : it)))

  async function enviar(e: FormEvent) {
    e.preventDefault()
    const corpo = {
      nome,
      descricao,
      preco: Number(preco),
      ativo: pacote?.ativo ?? true,
      itens: itens.filter((i) => i.tipo.trim()).map(({ tipo, quantidade, descricao }) => ({ tipo, quantidade, descricao })),
    }
    try {
      if (pacote) await api.put(`/pacotes/${pacote.id}`, corpo)
      else await api.post('/pacotes', corpo)
      aoSalvar()
      aoFechar()
    } catch (err) {
      setErro((err as Error).message)
    }
  }

  return (
    <Modal aberto={aberto} titulo={pacote ? 'Editar pacote' : 'Novo pacote'} aoFechar={aoFechar} largo>
      <form onSubmit={enviar} className="space-y-4">
        <div className="grid gap-3 sm:grid-cols-[1fr_160px]">
          <Campo rotulo="Nome *">
            <Entrada required value={nome} onChange={(e) => setNome(e.target.value)} placeholder="Ex.: Experiência Completa" />
          </Campo>
          <Campo rotulo="Preço (R$) *">
            <Entrada required type="number" min={0} step="0.01" value={preco} onChange={(e) => setPreco(e.target.value)} />
          </Campo>
        </div>
        <Campo rotulo="Descrição">
          <AreaTexto value={descricao} onChange={(e) => setDescricao(e.target.value)} />
        </Campo>

        <div>
          <span className="text-sm font-medium text-stone-700">O que está incluso *</span>
          <div className="mt-2 space-y-2">
            {itens.map((it, idx) => (
              <div key={idx} className="grid grid-cols-[70px_1fr_auto] gap-2 sm:grid-cols-[70px_1fr_1.3fr_auto]">
                <Entrada type="number" min={1} value={it.quantidade} onChange={(e) => alterarItem(idx, 'quantidade', e.target.value)} aria-label="Quantidade" />
                <Entrada value={it.tipo} onChange={(e) => alterarItem(idx, 'tipo', e.target.value)} placeholder="Reels, Stories, Post..." aria-label="Tipo" />
                <Entrada
                  className="col-span-3 row-start-2 sm:col-span-1 sm:row-start-auto"
                  value={it.descricao ?? ''}
                  onChange={(e) => alterarItem(idx, 'descricao', e.target.value)}
                  placeholder="Detalhe (opcional)"
                  aria-label="Detalhe"
                />
                <Botao type="button" variante="fantasma" onClick={() => setItens(itens.filter((_, i) => i !== idx))} disabled={itens.length === 1} aria-label="Remover item">
                  <Trash2 size={16} />
                </Botao>
              </div>
            ))}
          </div>
          <Botao type="button" variante="fantasma" className="mt-2" onClick={() => setItens([...itens, itemVazio()])}>
            <Plus size={16} /> Adicionar item
          </Botao>
        </div>

        <Erro mensagem={erro} />
        <div className="flex justify-end gap-2">
          <Botao type="button" variante="secundario" onClick={aoFechar}>
            Cancelar
          </Botao>
          <Botao type="submit">Salvar pacote</Botao>
        </div>
      </form>
    </Modal>
  )
}
