import { useState, type FormEvent } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { ArrowLeft, AtSign, Mail, MapPin, MessageCircle, Pencil, Plus, Star, Trash2 } from 'lucide-react'
import { api } from '../lib/api'
import { useCarregar } from '../lib/useCarregar'
import { data, linkInstagram, linkWhatsApp, moeda } from '../lib/formato'
import type { Contato, Marca } from '../types'
import { Botao, Cabecalho, Campo, Cartao, Entrada, Erro, Modal, Selo, Vazio } from '../components/ui'
import { MarcaFormModal } from '../components/MarcaFormModal'
import { NovaParceriaModal } from '../components/NovaParceriaModal'
import { ParceriaModal } from '../components/ParceriaModal'

export function MarcaDetalhe() {
  const id = Number(useParams().id)
  const navigate = useNavigate()
  const { dados: marca, erro, recarregar } = useCarregar(() => api.get<Marca>(`/marcas/${id}`), [id])
  const [editando, setEditando] = useState(false)
  const [novoContato, setNovoContato] = useState(false)
  const [novaParceria, setNovaParceria] = useState(false)
  const [parceriaAberta, setParceriaAberta] = useState<number | null>(null)

  async function excluir() {
    if (!confirm(`Excluir ${marca!.nome}? Contatos e parcerias também serão removidos.`)) return
    await api.delete(`/marcas/${id}`)
    navigate('/admin/marcas')
  }

  async function tornarPrincipal(c: Contato) {
    await api.put(`/contatos/${c.id}`, { principal: true })
    recarregar()
  }

  async function removerContato(c: Contato) {
    if (!confirm(`Remover o contato ${c.nome}?`)) return
    await api.delete(`/contatos/${c.id}`)
    recarregar()
  }

  if (erro) return <Erro mensagem={erro} />
  if (!marca) return null

  return (
    <>
      <Link to="/admin/marcas" className="mb-3 inline-flex items-center gap-1 text-sm text-stone-500 hover:text-stone-800">
        <ArrowLeft size={14} /> Marcas
      </Link>
      <Cabecalho
        titulo={marca.nome}
        subtitulo={[marca.segmento, marca.bairro].filter(Boolean).join(' · ')}
        acoes={
          <>
            <Botao variante="secundario" onClick={() => setEditando(true)}>
              <Pencil size={16} /> Editar
            </Botao>
            <Botao onClick={() => setNovaParceria(true)}>
              <Plus size={16} /> Nova proposta
            </Botao>
          </>
        }
      />

      <div className="grid gap-6 lg:grid-cols-[1fr_1.4fr]">
        <div className="space-y-6">
          <Cartao>
            <h2 className="mb-3 font-semibold">Dados</h2>
            <dl className="space-y-2 text-sm">
              {marca.instagram && (
                <div className="flex items-center gap-2">
                  <AtSign size={14} className="text-stone-400" />
                  <a href={linkInstagram(marca.instagram)} target="_blank" rel="noreferrer" className="text-marca-700 hover:underline">
                    {marca.instagram}
                  </a>
                </div>
              )}
              {marca.endereco && (
                <div className="flex items-center gap-2">
                  <MapPin size={14} className="text-stone-400" /> {marca.endereco}
                </div>
              )}
              {marca.observacoes && <p className="whitespace-pre-wrap text-stone-600">{marca.observacoes}</p>}
            </dl>
          </Cartao>

          <Cartao>
            <div className="mb-3 flex items-center justify-between">
              <h2 className="font-semibold">Contatos</h2>
              <Botao variante="fantasma" onClick={() => setNovoContato(true)}>
                <Plus size={16} /> Adicionar
              </Botao>
            </div>
            {marca.contatos.length === 0 && <Vazio>Nenhum contato cadastrado.</Vazio>}
            <ul className="divide-y divide-stone-100">
              {marca.contatos.map((c) => (
                <li key={c.id} className="py-3">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <p className="flex items-center gap-1.5 font-medium">
                        {c.nome}
                        {c.principal && <Star size={14} className="fill-amber-400 text-amber-400" aria-label="Principal" />}
                      </p>
                      {c.cargo && <p className="text-xs text-stone-500">{c.cargo}</p>}
                    </div>
                    <div className="flex gap-1">
                      {!c.principal && (
                        <button onClick={() => tornarPrincipal(c)} className="rounded p-1 text-stone-400 hover:text-amber-500" title="Tornar principal">
                          <Star size={16} />
                        </button>
                      )}
                      <button onClick={() => removerContato(c)} className="rounded p-1 text-stone-400 hover:text-red-600" title="Remover">
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </div>
                  <div className="mt-1.5 flex flex-wrap gap-3 text-sm">
                    {c.whatsapp && (
                      <a href={linkWhatsApp(c.whatsapp, '')} target="_blank" rel="noreferrer" className="flex items-center gap-1 text-green-700 hover:underline">
                        <MessageCircle size={14} /> {c.whatsapp}
                      </a>
                    )}
                    {c.email && (
                      <a href={`mailto:${c.email}`} className="flex items-center gap-1 text-stone-600 hover:underline">
                        <Mail size={14} /> {c.email}
                      </a>
                    )}
                  </div>
                </li>
              ))}
            </ul>
          </Cartao>

          <Botao variante="perigo" onClick={excluir}>
            <Trash2 size={16} /> Excluir marca
          </Botao>
        </div>

        <Cartao>
          <h2 className="mb-3 font-semibold">Histórico de parcerias</h2>
          {marca.parcerias?.length === 0 && <Vazio>Nenhuma parceria ainda. Que tal enviar uma proposta?</Vazio>}
          <ul className="divide-y divide-stone-100">
            {marca.parcerias?.map((p) => (
              <li key={p.id}>
                <button onClick={() => setParceriaAberta(p.id)} className="flex w-full items-center justify-between gap-3 py-3 text-left hover:bg-stone-50">
                  <div>
                    <p className="font-medium">{p.pacote?.nome ?? 'Proposta personalizada'}</p>
                    <p className="text-sm text-stone-500">
                      {moeda(p.valor)} · {data(p.dataPublicacao)}
                    </p>
                  </div>
                  <Selo status={p.status} />
                </button>
              </li>
            ))}
          </ul>
        </Cartao>
      </div>

      <MarcaFormModal aberto={editando} aoFechar={() => setEditando(false)} aoSalvar={recarregar} marca={marca} />
      <NovoContatoModal aberto={novoContato} marcaId={id} aoFechar={() => setNovoContato(false)} aoSalvar={recarregar} />
      <NovaParceriaModal aberto={novaParceria} marcaIdInicial={id} aoFechar={() => setNovaParceria(false)} aoCriar={recarregar} />
      <ParceriaModal id={parceriaAberta} aoFechar={() => setParceriaAberta(null)} aoAlterar={recarregar} />
    </>
  )
}

function NovoContatoModal({
  aberto,
  marcaId,
  aoFechar,
  aoSalvar,
}: {
  aberto: boolean
  marcaId: number
  aoFechar: () => void
  aoSalvar: () => void
}) {
  const vazio = { nome: '', cargo: '', whatsapp: '', email: '', receberEmails: true }
  const [form, setForm] = useState(vazio)
  const [erro, setErro] = useState<string | null>(null)

  async function enviar(e: FormEvent) {
    e.preventDefault()
    try {
      await api.post(`/marcas/${marcaId}/contatos`, form)
      setForm(vazio)
      aoSalvar()
      aoFechar()
    } catch (err) {
      setErro((err as Error).message)
    }
  }

  return (
    <Modal aberto={aberto} titulo="Novo contato" aoFechar={aoFechar}>
      <form onSubmit={enviar} className="space-y-4">
        <Campo rotulo="Nome *">
          <Entrada required value={form.nome} onChange={(e) => setForm({ ...form, nome: e.target.value })} />
        </Campo>
        <Campo rotulo="Cargo">
          <Entrada value={form.cargo} onChange={(e) => setForm({ ...form, cargo: e.target.value })} />
        </Campo>
        <div className="grid grid-cols-2 gap-3">
          <Campo rotulo="WhatsApp">
            <Entrada value={form.whatsapp} onChange={(e) => setForm({ ...form, whatsapp: e.target.value })} />
          </Campo>
          <Campo rotulo="E-mail">
            <Entrada type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
          </Campo>
        </div>
        <label className="flex items-center gap-2 text-sm">
          <input
            type="checkbox"
            checked={form.receberEmails}
            onChange={(e) => setForm({ ...form, receberEmails: e.target.checked })}
          />
          Recebe propostas e atualizações por e-mail
        </label>
        <Erro mensagem={erro} />
        <div className="flex justify-end gap-2">
          <Botao type="button" variante="secundario" onClick={aoFechar}>
            Cancelar
          </Botao>
          <Botao type="submit">Salvar</Botao>
        </div>
      </form>
    </Modal>
  )
}
