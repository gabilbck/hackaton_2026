import { Link } from 'react-router-dom'
import { CalendarDays, Inbox, Plus } from 'lucide-react'
import { useState } from 'react'
import { api } from '../lib/api'
import { useCarregar } from '../lib/useCarregar'
import { data, moeda, STATUS } from '../lib/formato'
import type { Dashboard } from '../types'
import { Botao, Cabecalho, Cartao, Erro, Selo, Vazio } from '../components/ui'
import { NovaParceriaModal } from '../components/NovaParceriaModal'

export function Painel() {
  const { dados, erro, recarregar } = useCarregar(() => api.get<Dashboard>('/dashboard'))
  const [novaAberta, setNovaAberta] = useState(false)

  const ativas = dados
    ? (['PROSPECCAO', 'NEGOCIANDO', 'FECHADO'] as const).reduce((s, k) => s + (dados.parceriasPorStatus[k] ?? 0), 0)
    : 0

  return (
    <>
      <Cabecalho
        titulo="Painel"
        subtitulo="Resumo das suas parcerias"
        acoes={
          <Botao onClick={() => setNovaAberta(true)}>
            <Plus size={16} /> Nova proposta
          </Botao>
        }
      />
      <Erro mensagem={erro} />

      {dados && (
        <div className="space-y-6">
          {(dados.solicitacoesNovas > 0 || dados.eventosParaAprovar > 0) && (
            <div className="grid gap-3 sm:grid-cols-2">
              {dados.solicitacoesNovas > 0 && (
                <Link to="/admin/parcerias" className="flex items-center gap-3 rounded-xl border border-sky-200 bg-sky-50 p-4 text-sky-900 hover:border-sky-400">
                  <Inbox size={22} />
                  <span>
                    <strong>{dados.solicitacoesNovas}</strong> marca(s) se cadastraram pelo site e aguardam contato
                  </span>
                </Link>
              )}
              {dados.eventosParaAprovar > 0 && (
                <Link to="/admin/eventos" className="flex items-center gap-3 rounded-xl border border-amber-200 bg-amber-50 p-4 text-amber-900 hover:border-amber-400">
                  <CalendarDays size={22} />
                  <span>
                    <strong>{dados.eventosParaAprovar}</strong> evento(s) em rascunho aguardando sua aprovação
                  </span>
                </Link>
              )}
            </div>
          )}

          <div className="grid grid-cols-2 gap-4 lg:grid-cols-3">
            <Indicador rotulo="Eventos na agenda" valor={dados.eventosFuturos} />
            <Indicador rotulo="Inscritos nos alertas" valor={dados.totalInscritos} />
            <Indicador rotulo="Marcas cadastradas" valor={dados.totalMarcas} />
            <Indicador rotulo="Parcerias em andamento" valor={ativas} />
            <Indicador rotulo="A receber" valor={moeda(dados.valorAReceber)} />
            <Indicador rotulo="Recebido" valor={moeda(dados.valorRecebido)} />
          </div>

          <Cartao>
            <h2 className="mb-3 font-semibold">Parcerias por etapa</h2>
            <div className="flex flex-wrap gap-2">
              {STATUS.map((s) => (
                <Link
                  key={s.valor}
                  to="/admin/parcerias"
                  className={`rounded-lg px-3 py-2 text-sm font-medium ${s.cor}`}
                >
                  {s.rotulo}: {dados.parceriasPorStatus[s.valor] ?? 0}
                </Link>
              ))}
            </div>
          </Cartao>

          <div className="grid gap-6 lg:grid-cols-2">
            <Cartao>
              <h2 className="mb-3 flex items-center gap-2 font-semibold">
                <CalendarDays size={18} /> Próximas publicações
              </h2>
              {dados.proximasPublicacoes.length === 0 ? (
                <Vazio>Nenhuma publicação agendada.</Vazio>
              ) : (
                <ul className="divide-y divide-stone-100">
                  {dados.proximasPublicacoes.map((p) => (
                    <li key={p.id} className="flex items-center justify-between py-2.5">
                      <div>
                        <Link to={`/admin/marcas/${p.marca.id}`} className="font-medium hover:text-marca-700">
                          {p.marca.nome}
                        </Link>
                        <p className="text-sm text-stone-500">{data(p.dataPublicacao)}</p>
                      </div>
                      <Selo status={p.status} />
                    </li>
                  ))}
                </ul>
              )}
            </Cartao>

            <Cartao>
              <h2 className="mb-3 font-semibold">Últimos e-mails enviados</h2>
              {dados.ultimasNotificacoes.length === 0 ? (
                <Vazio>Nenhum e-mail enviado ainda.</Vazio>
              ) : (
                <ul className="divide-y divide-stone-100 text-sm">
                  {dados.ultimasNotificacoes.map((n) => (
                    <li key={n.id} className="py-2.5">
                      <p className="font-medium">{n.assunto}</p>
                      <p className="text-stone-500">{n.destinatario}</p>
                    </li>
                  ))}
                </ul>
              )}
            </Cartao>
          </div>
        </div>
      )}

      <NovaParceriaModal aberto={novaAberta} aoFechar={() => setNovaAberta(false)} aoCriar={recarregar} />
    </>
  )
}

function Indicador({ rotulo, valor }: { rotulo: string; valor: string | number }) {
  return (
    <Cartao className="p-4">
      <p className="text-sm text-stone-500">{rotulo}</p>
      <p className="mt-1 text-2xl font-semibold text-stone-900">{valor}</p>
    </Cartao>
  )
}
