import { api } from '../lib/api'
import { useCarregar } from '../lib/useCarregar'
import type { Notificacao } from '../types'
import { Cabecalho, Cartao, Erro, Vazio } from '../components/ui'

const corStatus = {
  ENVIADO: 'bg-green-100 text-green-800',
  SIMULADO: 'bg-sky-100 text-sky-800',
  FALHOU: 'bg-red-100 text-red-800',
}

export function Notificacoes() {
  const { dados, erro } = useCarregar(() => api.get<(Notificacao & { contato: { nome: string } | null })[]>('/notificacoes'))

  return (
    <>
      <Cabecalho titulo="E-mails enviados" subtitulo="Cadastros, propostas e atualizações de status" />
      <Erro mensagem={erro} />
      {dados?.length === 0 && <Vazio>Nenhum e-mail enviado ainda.</Vazio>}
      {!!dados?.length && (
        <Cartao className="overflow-x-auto p-0">
          <table className="w-full text-left text-sm">
            <thead className="border-b border-stone-200 bg-stone-50 text-stone-500">
              <tr>
                <th className="px-4 py-3 font-medium">Quando</th>
                <th className="px-4 py-3 font-medium">Para</th>
                <th className="px-4 py-3 font-medium">Assunto</th>
                <th className="px-4 py-3 font-medium">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-stone-100">
              {dados.map((n) => (
                <tr key={n.id}>
                  <td className="px-4 py-3 whitespace-nowrap text-stone-500">{new Date(n.criadoEm).toLocaleString('pt-BR')}</td>
                  <td className="px-4 py-3">
                    {n.contato?.nome && <span className="block font-medium">{n.contato.nome}</span>}
                    <span className="text-stone-500">{n.destinatario}</span>
                  </td>
                  <td className="px-4 py-3">{n.assunto}</td>
                  <td className="px-4 py-3">
                    <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${corStatus[n.status]}`} title={n.erro ?? undefined}>
                      {n.status === 'SIMULADO' ? 'Teste' : n.status === 'ENVIADO' ? 'Enviado' : 'Falhou'}
                    </span>
                    {n.previewUrl && (
                      <a href={n.previewUrl} target="_blank" rel="noreferrer" className="ml-2 text-marca-700 hover:underline">
                        ver
                      </a>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </Cartao>
      )}
    </>
  )
}
