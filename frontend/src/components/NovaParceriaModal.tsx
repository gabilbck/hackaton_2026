import { useEffect, useState, type FormEvent } from 'react'
import { MailCheck } from 'lucide-react'
import { api } from '../lib/api'
import { moeda } from '../lib/formato'
import type { Marca, Pacote, Parceria } from '../types'
import { AreaTexto, Botao, Campo, Entrada, Erro, Modal, Selecao } from './ui'
import { PropostaAcoes, TextoProposta } from './PropostaAcoes'

interface Props {
  aberto: boolean
  aoFechar: () => void
  aoCriar?: () => void
  marcaIdInicial?: number
}

const formVazio = {
  marcaId: '',
  pacoteId: '',
  valor: '',
  dataPublicacao: '',
  briefing: '',
  publicoNoGuia: true,
  enviarEmail: true,
}

/** Escolhe marca e pacote, mostra a prévia da proposta e cria a parceria. */
export function NovaParceriaModal({ aberto, aoFechar, aoCriar, marcaIdInicial }: Props) {
  const [marcas, setMarcas] = useState<Marca[]>([])
  const [pacotes, setPacotes] = useState<Pacote[]>([])
  const [form, setForm] = useState(formVazio)
  const [previa, setPrevia] = useState('')
  const [erro, setErro] = useState<string | null>(null)
  const [criada, setCriada] = useState<Parceria | null>(null)

  useEffect(() => {
    if (!aberto) return
    setForm({ ...formVazio, marcaId: marcaIdInicial ? String(marcaIdInicial) : '' })
    setCriada(null)
    setErro(null)
    Promise.all([api.get<Marca[]>('/marcas'), api.get<Pacote[]>('/pacotes?ativos=true')]).then(([m, p]) => {
      setMarcas(m)
      setPacotes(p)
    })
  }, [aberto, marcaIdInicial])

  const corpo = () => ({
    marcaId: Number(form.marcaId),
    pacoteId: form.pacoteId ? Number(form.pacoteId) : null,
    valor: form.valor ? Number(form.valor) : undefined,
    dataPublicacao: form.dataPublicacao || null,
    briefing: form.briefing || null,
    publicoNoGuia: form.publicoNoGuia,
    enviarEmail: form.enviarEmail,
  })

  // Atualiza a prévia enquanto a usuária preenche (com pequeno atraso)
  useEffect(() => {
    if (!aberto || !form.marcaId || (!form.pacoteId && !form.valor)) {
      setPrevia('')
      return
    }
    const t = setTimeout(() => {
      api
        .post<{ propostaTexto: string }>('/parcerias/previa', corpo())
        .then((r) => setPrevia(r.propostaTexto))
        .catch((e) => setPrevia(`⚠️ ${e.message}`))
    }, 300)
    return () => clearTimeout(t)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [aberto, form.marcaId, form.pacoteId, form.valor, form.dataPublicacao, form.briefing])

  async function enviar(e: FormEvent) {
    e.preventDefault()
    try {
      setCriada(await api.post<Parceria>('/parcerias', corpo()))
      aoCriar?.()
    } catch (err) {
      setErro((err as Error).message)
    }
  }

  const marca = marcas.find((m) => m.id === Number(form.marcaId))
  const pacote = pacotes.find((p) => p.id === Number(form.pacoteId))
  const set = (campo: keyof typeof form) => (e: { target: { value: string } }) =>
    setForm({ ...form, [campo]: e.target.value })

  if (criada) {
    return (
      <Modal aberto={aberto} titulo="Proposta criada" aoFechar={aoFechar} largo>
        <div className="space-y-4">
          {form.enviarEmail && (
            <p className="flex items-center gap-2 rounded-lg bg-green-50 px-3 py-2 text-sm text-green-800">
              <MailCheck size={16} /> A proposta está sendo enviada por e-mail para os contatos de {marca?.nome}.
            </p>
          )}
          <TextoProposta texto={criada.propostaTexto} />
          <div className="flex flex-wrap justify-between gap-2">
            <PropostaAcoes texto={criada.propostaTexto} whatsapp={marca?.contatos[0]?.whatsapp} />
            <Botao onClick={aoFechar}>Concluir</Botao>
          </div>
        </div>
      </Modal>
    )
  }

  return (
    <Modal aberto={aberto} titulo="Nova proposta" aoFechar={aoFechar} largo>
      <form onSubmit={enviar} className="grid gap-5 md:grid-cols-2">
        <div className="space-y-4">
          <Campo rotulo="Marca">
            <Selecao required value={form.marcaId} onChange={set('marcaId')}>
              <option value="">Selecione...</option>
              {marcas.map((m) => (
                <option key={m.id} value={m.id}>
                  {m.nome}
                </option>
              ))}
            </Selecao>
          </Campo>
          <Campo rotulo="Pacote">
            <Selecao value={form.pacoteId} onChange={set('pacoteId')}>
              <option value="">Personalizado (sem pacote)</option>
              {pacotes.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.nome} ({moeda(p.preco)})
                </option>
              ))}
            </Selecao>
          </Campo>
          <Campo rotulo="Valor (R$)" dica={pacote ? `Deixe vazio para usar ${moeda(pacote.preco)}` : undefined}>
            <Entrada type="number" min={0} step="0.01" value={form.valor} onChange={set('valor')} />
          </Campo>
          <Campo rotulo="Data prevista de publicação">
            <Entrada type="date" value={form.dataPublicacao} onChange={set('dataPublicacao')} />
          </Campo>
          <Campo rotulo="Observações para a proposta">
            <AreaTexto value={form.briefing} onChange={set('briefing')} placeholder="Ex.: visita no almoço de sábado" />
          </Campo>
          <label className="flex items-center gap-2 text-sm">
            <input
              type="checkbox"
              checked={form.enviarEmail}
              onChange={(e) => setForm({ ...form, enviarEmail: e.target.checked })}
            />
            Enviar a proposta por e-mail aos contatos da marca
          </label>
          <label className="flex items-center gap-2 text-sm">
            <input
              type="checkbox"
              checked={form.publicoNoGuia}
              onChange={(e) => setForm({ ...form, publicoNoGuia: e.target.checked })}
            />
            Mostrar no guia público quando fechar
          </label>
        </div>

        <div className="flex flex-col gap-3">
          <span className="text-sm font-medium text-stone-700">Prévia da proposta</span>
          {previa ? (
            <TextoProposta texto={previa} />
          ) : (
            <p className="rounded-lg bg-stone-50 p-4 text-sm text-stone-500">
              Escolha a marca e um pacote (ou informe o valor) para ver a proposta.
            </p>
          )}
          <Erro mensagem={erro} />
          <Botao type="submit" className="mt-auto" disabled={!previa || previa.startsWith('⚠️')}>
            Criar proposta
          </Botao>
        </div>
      </form>
    </Modal>
  )
}
