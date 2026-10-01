import { useState, type FormEvent } from 'react'
import { BellRing, CheckCircle2 } from 'lucide-react'
import { api } from '../../lib/api'
import { CATEGORIAS } from '../../lib/formato'
import type { CategoriaEvento } from '../../types'
import { Botao, Entrada, Erro } from '../ui'

/** Responde à dor "descubro os eventos só depois que aconteceram": avisos por e-mail. */
export function Inscricao() {
  const [email, setEmail] = useState('')
  const [nome, setNome] = useState('')
  const [categorias, setCategorias] = useState<CategoriaEvento[]>([])
  const [erro, setErro] = useState<string | null>(null)
  const [ok, setOk] = useState(false)
  const [enviando, setEnviando] = useState(false)

  const alternar = (c: CategoriaEvento) =>
    setCategorias((atual) => (atual.includes(c) ? atual.filter((x) => x !== c) : [...atual, c]))

  async function enviar(e: FormEvent) {
    e.preventDefault()
    setEnviando(true)
    try {
      await api.post('/publico/inscricao', { email, nome: nome || null, categorias })
      setOk(true)
      setErro(null)
    } catch (err) {
      setErro((err as Error).message)
    } finally {
      setEnviando(false)
    }
  }

  return (
    <section className="rounded-2xl bg-gradient-to-br from-marca-600 to-rose-600 p-6 text-white md:p-8">
      {ok ? (
        <div className="flex items-center gap-3">
          <CheckCircle2 size={28} />
          <div>
            <p className="text-lg font-semibold">Inscrição feita!</p>
            <p className="text-white/85">Enviamos um e-mail de confirmação. Você vai saber dos eventos antes de todo mundo.</p>
          </div>
        </div>
      ) : (
        <form onSubmit={enviar} className="space-y-4">
          <div className="flex items-start gap-3">
            <BellRing size={26} className="mt-0.5 shrink-0" />
            <div>
              <h2 className="text-xl font-semibold">Não perca mais nenhum evento</h2>
              <p className="text-white/85">Receba por e-mail os novos eventos das categorias que você curte.</p>
            </div>
          </div>

          <div className="flex flex-wrap gap-2" role="group" aria-label="Categorias de interesse">
            {CATEGORIAS.filter((c) => c.valor !== 'OUTRO').map((c) => {
              const ativo = categorias.includes(c.valor)
              return (
                <button
                  key={c.valor}
                  type="button"
                  onClick={() => alternar(c.valor)}
                  aria-pressed={ativo}
                  className={`rounded-full border px-3 py-1 text-sm transition ${
                    ativo ? 'border-white bg-white text-marca-700' : 'border-white/50 hover:bg-white/10'
                  }`}
                >
                  {c.emoji} {c.rotulo}
                </button>
              )
            })}
          </div>
          <p className="text-xs text-white/75">Sem nenhuma selecionada, você recebe todas.</p>

          <div className="grid gap-2 sm:grid-cols-[1fr_1.4fr_auto]">
            <Entrada placeholder="Seu nome (opcional)" value={nome} onChange={(e) => setNome(e.target.value)} className="text-stone-800" aria-label="Nome" />
            <Entrada type="email" required placeholder="seu@email.com" value={email} onChange={(e) => setEmail(e.target.value)} className="text-stone-800" aria-label="E-mail" />
            <Botao type="submit" disabled={enviando} className="bg-stone-900 hover:bg-stone-800">
              {enviando ? 'Enviando...' : 'Quero receber'}
            </Botao>
          </div>
          <Erro mensagem={erro} />
        </form>
      )}
    </section>
  )
}
