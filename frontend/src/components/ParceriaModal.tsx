import { useEffect, useState } from 'react'
import { Send, Trash2 } from 'lucide-react'
import { api } from '../lib/api'
import { data, moeda, paraInputData, STATUS } from '../lib/formato'
import type { Parceria, StatusParceria } from '../types'
import { Botao, Campo, Entrada, Erro, Modal, Selecao, Selo } from './ui'
import { PropostaAcoes, TextoProposta } from './PropostaAcoes'

interface Props {
  id: number | null
  aoFechar: () => void
  aoAlterar: () => void
}

/** Detalhe de uma parceria: proposta, status, data e histórico de e-mails. */
export function ParceriaModal({ id, aoFechar, aoAlterar }: Props) {
  const [p, setP] = useState<Parceria | null>(null)
  const [erro, setErro] = useState<string | null>(null)
  const [aviso, setAviso] = useState<string | null>(null)

  const carregar = () => id && api.get<Parceria>(`/parcerias/${id}`).then(setP)

  useEffect(() => {
    setP(null)
    setErro(null)
    setAviso(null)
    carregar()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id])

  async function executar(acao: () => Promise<unknown>, mensagem?: string) {
    try {
      await acao()
      setAviso(mensagem ?? null)
      setErro(null)
      await carregar()
      aoAlterar()
    } catch (e) {
      setErro((e as Error).message)
    }
  }

  const alterarStatus = (status: StatusParceria) =>
    executar(() => api.patch(`/parcerias/${id}/status`, { status }), 'Status atualizado. Os contatos serão avisados por e-mail.')

  const excluir = async () => {
    if (!confirm('Excluir esta parceria?')) return
    await api.delete(`/parcerias/${id}`)
    aoAlterar()
    aoFechar()
  }

  const contato = p?.marca?.contatos?.find((c) => c.principal) ?? p?.marca?.contatos?.[0]

  return (
    <Modal aberto={id !== null} titulo={p ? `${p.marca?.nome}: ${p.pacote?.nome ?? 'Proposta personalizada'}` : 'Carregando...'} aoFechar={aoFechar} largo>
      {p && (
        <div className="space-y-5">
          <div className="grid gap-3 sm:grid-cols-3">
            <Campo rotulo="Etapa">
              <Selecao value={p.status} onChange={(e) => alterarStatus(e.target.value as StatusParceria)}>
                {STATUS.map((s) => (
                  <option key={s.valor} value={s.valor}>
                    {s.rotulo}
                  </option>
                ))}
              </Selecao>
            </Campo>
            <Campo rotulo="Data de publicação">
              <Entrada
                type="date"
                value={paraInputData(p.dataPublicacao)}
                onChange={(e) => executar(() => api.put(`/parcerias/${id}`, { dataPublicacao: e.target.value || null }))}
              />
            </Campo>
            <Campo rotulo="Valor">
              <p className="py-2 text-lg font-semibold">{moeda(p.valor)}</p>
            </Campo>
          </div>

          <label className="flex items-center gap-2 text-sm">
            <input
              type="checkbox"
              checked={p.publicoNoGuia}
              onChange={(e) => executar(() => api.put(`/parcerias/${id}`, { publicoNoGuia: e.target.checked }))}
            />
            Mostrar no guia público (a partir de "Fechado")
          </label>

          {aviso && <p className="rounded-lg bg-green-50 px-3 py-2 text-sm text-green-800">{aviso}</p>}
          <Erro mensagem={erro} />

          <div className="space-y-2">
            <h3 className="text-sm font-medium text-stone-700">Proposta enviada</h3>
            <TextoProposta texto={p.propostaTexto} />
            <div className="flex flex-wrap gap-2">
              <PropostaAcoes texto={p.propostaTexto} whatsapp={contato?.whatsapp} />
              <Botao
                variante="secundario"
                onClick={() => executar(() => api.post(`/parcerias/${id}/reenviar`), 'Proposta reenviada por e-mail.')}
              >
                <Send size={16} /> Reenviar por e-mail
              </Botao>
            </div>
          </div>

          <div>
            <h3 className="mb-2 text-sm font-medium text-stone-700">E-mails desta parceria</h3>
            {p.notificacoes?.length ? (
              <ul className="divide-y divide-stone-100 rounded-lg border border-stone-200 text-sm">
                {p.notificacoes.map((n) => (
                  <li key={n.id} className="flex items-center justify-between gap-3 px-3 py-2">
                    <span>
                      {n.assunto} <span className="text-stone-400">· {data(n.criadoEm)}</span>
                    </span>
                    {n.previewUrl ? (
                      <a href={n.previewUrl} target="_blank" rel="noreferrer" className="shrink-0 text-marca-700 hover:underline">
                        Ver e-mail
                      </a>
                    ) : (
                      <span className="shrink-0 text-xs text-stone-500">{n.status}</span>
                    )}
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-sm text-stone-500">Nenhum e-mail enviado.</p>
            )}
          </div>

          <div className="flex items-center justify-between border-t border-stone-100 pt-4">
            <Selo status={p.status} />
            <Botao variante="perigo" onClick={excluir}>
              <Trash2 size={16} /> Excluir
            </Botao>
          </div>
        </div>
      )}
    </Modal>
  )
}
