import { useState, type FormEvent, type ReactNode } from 'react'
import { Link } from 'react-router-dom'
import { AtSign, CalendarPlus, CheckCircle2, Megaphone, Users } from 'lucide-react'
import { api } from '../../lib/api'
import { useCarregar } from '../../lib/useCarregar'
import { CATEGORIAS, deInputDataHora, moeda } from '../../lib/formato'
import type { CategoriaEvento } from '../../types'
import { AreaTexto, Botao, Campo, Entrada, Erro, Selecao } from '../../components/ui'

interface PacotePublico {
  id: number
  nome: string
  descricao: string | null
  preco: string
  itens: { tipo: string; quantidade: number; descricao: string | null }[]
}

const marcaVazia = { nome: '', instagram: '', segmento: '', bairro: '', endereco: '' }
const contatoVazio = { nome: '', cargo: '', whatsapp: '', email: '' }
const eventoVazio = {
  titulo: '',
  inicio: '',
  categoria: 'GASTRONOMIA' as CategoriaEvento,
  gratuito: false,
  preco: '',
  linkIngresso: '',
  descricao: '',
}

/**
 * Cadastro feito pela própria marca interessada.
 * Cria a marca e a parceria no painel da influenciadora e, se escolher um pacote,
 * já recebe a proposta por e-mail.
 */
export function SejaParceiro() {
  const pacotes = useCarregar(() => api.get<PacotePublico[]>('/publico/pacotes'))
  const [marca, setMarca] = useState(marcaVazia)
  const [contato, setContato] = useState(contatoVazio)
  const [pacoteId, setPacoteId] = useState<number | null>(null)
  const [mensagem, setMensagem] = useState('')
  const [comEvento, setComEvento] = useState(false)
  const [evento, setEvento] = useState(eventoVazio)
  const [site, setSite] = useState('') // anti-spam (campo invisível)
  const [erro, setErro] = useState<string | null>(null)
  const [enviando, setEnviando] = useState(false)
  const [resultado, setResultado] = useState<string | null>(null)

  async function enviar(e: FormEvent) {
    e.preventDefault()
    setEnviando(true)
    try {
      const r = await api.post<{ mensagem: string }>('/publico/parcerias', {
        marca,
        contato,
        pacoteId,
        mensagem: mensagem || null,
        evento: comEvento
          ? {
              ...evento,
              inicio: deInputDataHora(evento.inicio),
              preco: evento.gratuito || !evento.preco ? null : Number(evento.preco),
            }
          : null,
        site,
      })
      setResultado(r.mensagem)
      window.scrollTo({ top: 0, behavior: 'smooth' })
    } catch (err) {
      setErro((err as Error).message)
    } finally {
      setEnviando(false)
    }
  }

  if (resultado) {
    return (
      <div className="mx-auto max-w-xl px-4 py-16 text-center">
        <CheckCircle2 size={48} className="mx-auto text-emerald-600" />
        <h1 className="mt-4 text-2xl font-bold">Obrigada pelo interesse!</h1>
        <p className="mt-2 text-stone-600">{resultado}</p>
        <p className="mt-1 text-sm text-stone-500">
          Você também vai receber por e-mail cada atualização da parceria.
        </p>
        <Link to="/" className="mt-6 inline-block text-marca-700 hover:underline">
          Voltar para a agenda
        </Link>
      </div>
    )
  }

  const setM = (c: keyof typeof marca) => (e: { target: { value: string } }) => setMarca({ ...marca, [c]: e.target.value })
  const setC = (c: keyof typeof contato) => (e: { target: { value: string } }) => setContato({ ...contato, [c]: e.target.value })
  const setE = (c: keyof typeof evento) => (e: { target: { value: string } }) => setEvento({ ...evento, [c]: e.target.value })

  return (
    <>
      <section className="bg-gradient-to-b from-marca-50 to-stone-50 px-4 pt-10 pb-8">
        <div className="mx-auto max-w-4xl">
          <h1 className="text-3xl font-bold tracking-tight text-stone-900 md:text-4xl">Seja parceiro do Guia</h1>
          <p className="mt-2 max-w-2xl text-stone-600">
            Divulgue seu restaurante, bar ou evento para quem procura o que fazer em Joinville. Cadastre sua marca,
            escolha um pacote e receba a proposta no seu e-mail na hora.
          </p>
          <div className="mt-6 grid gap-3 sm:grid-cols-3">
            {[
              { icone: AtSign, texto: 'Conteúdo no Instagram do @guiagastronomicojoinville' },
              { icone: Megaphone, texto: 'Destaque na agenda de eventos da cidade' },
              { icone: Users, texto: 'Público local que decide onde sair pelo Guia' },
            ].map(({ icone: Icone, texto }) => (
              <div key={texto} className="flex items-center gap-3 rounded-xl bg-white p-3 text-sm shadow-sm">
                <Icone className="shrink-0 text-marca-600" size={20} /> {texto}
              </div>
            ))}
          </div>
        </div>
      </section>

      <form onSubmit={enviar} className="mx-auto max-w-4xl space-y-8 px-4 py-8">
        {/* Honeypot: invisível para pessoas, robôs costumam preencher */}
        <input
          type="text"
          name="site"
          value={site}
          onChange={(e) => setSite(e.target.value)}
          tabIndex={-1}
          autoComplete="off"
          aria-hidden
          className="absolute -left-[9999px] h-0 w-0 opacity-0"
        />

        <Secao numero={1} titulo="Sobre o seu negócio">
          <div className="grid gap-4 sm:grid-cols-2">
            <Campo rotulo="Nome do estabelecimento *">
              <Entrada required value={marca.nome} onChange={setM('nome')} />
            </Campo>
            <Campo rotulo="Instagram">
              <Entrada value={marca.instagram} onChange={setM('instagram')} placeholder="@seurestaurante" />
            </Campo>
            <Campo rotulo="Tipo de negócio">
              <Entrada value={marca.segmento} onChange={setM('segmento')} placeholder="Italiana, cafeteria, casa de shows..." />
            </Campo>
            <Campo rotulo="Bairro">
              <Entrada value={marca.bairro} onChange={setM('bairro')} />
            </Campo>
            <div className="sm:col-span-2">
              <Campo rotulo="Endereço">
                <Entrada value={marca.endereco} onChange={setM('endereco')} placeholder="Rua, número" />
              </Campo>
            </div>
          </div>
        </Secao>

        <Secao numero={2} titulo="Quem vai falar com a gente">
          <div className="grid gap-4 sm:grid-cols-2">
            <Campo rotulo="Seu nome *">
              <Entrada required value={contato.nome} onChange={setC('nome')} />
            </Campo>
            <Campo rotulo="Cargo">
              <Entrada value={contato.cargo} onChange={setC('cargo')} placeholder="Proprietária, marketing..." />
            </Campo>
            <Campo rotulo="E-mail *" dica="A proposta e as atualizações chegam aqui">
              <Entrada type="email" required value={contato.email} onChange={setC('email')} />
            </Campo>
            <Campo rotulo="WhatsApp">
              <Entrada value={contato.whatsapp} onChange={setC('whatsapp')} placeholder="47 99999-0000" />
            </Campo>
          </div>
        </Secao>

        <Secao numero={3} titulo="Como você quer aparecer">
          <div className="grid gap-3 sm:grid-cols-2">
            {pacotes.dados?.map((p) => (
              <OpcaoPacote key={p.id} ativo={pacoteId === p.id} onClick={() => setPacoteId(p.id)}>
                <div className="flex items-start justify-between gap-2">
                  <span className="font-semibold">{p.nome}</span>
                  <span className="font-semibold text-marca-700">{moeda(p.preco)}</span>
                </div>
                {p.descricao && <p className="mt-1 text-sm text-stone-500">{p.descricao}</p>}
                <ul className="mt-2 space-y-0.5 text-sm text-stone-700">
                  {p.itens.map((i, idx) => (
                    <li key={idx}>
                      • {i.quantidade}x {i.tipo}
                      {i.descricao && <span className="text-stone-500">: {i.descricao}</span>}
                    </li>
                  ))}
                </ul>
              </OpcaoPacote>
            ))}
            <OpcaoPacote ativo={pacoteId === null} onClick={() => setPacoteId(null)}>
              <span className="font-semibold">Quero uma proposta personalizada</span>
              <p className="mt-1 text-sm text-stone-500">Conte o que você precisa e a gente monta uma proposta sob medida.</p>
            </OpcaoPacote>
          </div>
          <div className="mt-4">
            <Campo rotulo={pacoteId === null ? 'O que você precisa? *' : 'Algo mais que devemos saber?'}>
              <AreaTexto
                required={pacoteId === null}
                value={mensagem}
                onChange={(e) => setMensagem(e.target.value)}
                placeholder="Ex.: inauguração no dia 20, menu novo de inverno, melhor horário para a visita..."
              />
            </Campo>
          </div>
        </Secao>

        <Secao numero={4} titulo="Tem um evento para divulgar? (opcional)">
          <label className="flex items-center gap-2 text-sm font-medium">
            <input type="checkbox" checked={comEvento} onChange={(e) => setComEvento(e.target.checked)} />
            <CalendarPlus size={16} className="text-marca-600" /> Sim, quero sugerir um evento para a agenda do Guia
          </label>
          {comEvento && (
            <div className="mt-4 grid gap-4 sm:grid-cols-2">
              <div className="sm:col-span-2">
                <Campo rotulo="Nome do evento *">
                  <Entrada required value={evento.titulo} onChange={setE('titulo')} />
                </Campo>
              </div>
              <Campo rotulo="Data e hora *">
                <Entrada required type="datetime-local" value={evento.inicio} onChange={setE('inicio')} />
              </Campo>
              <Campo rotulo="Categoria">
                <Selecao value={evento.categoria} onChange={setE('categoria')}>
                  {CATEGORIAS.map((c) => (
                    <option key={c.valor} value={c.valor}>
                      {c.emoji} {c.rotulo}
                    </option>
                  ))}
                </Selecao>
              </Campo>
              <label className="flex items-center gap-2 text-sm font-medium sm:pt-6">
                <input type="checkbox" checked={evento.gratuito} onChange={(e) => setEvento({ ...evento, gratuito: e.target.checked })} />
                Entrada gratuita
              </label>
              <Campo rotulo="Preço a partir de (R$)">
                <Entrada type="number" min={0} step="0.01" disabled={evento.gratuito} value={evento.preco} onChange={setE('preco')} />
              </Campo>
              <div className="sm:col-span-2">
                <Campo rotulo="Link de ingressos">
                  <Entrada type="url" value={evento.linkIngresso} onChange={setE('linkIngresso')} placeholder="https://..." />
                </Campo>
              </div>
              <div className="sm:col-span-2">
                <Campo rotulo="Descrição">
                  <AreaTexto value={evento.descricao} onChange={setE('descricao')} />
                </Campo>
              </div>
              <p className="text-xs text-stone-500 sm:col-span-2">
                O evento passa pela curadoria do Guia antes de aparecer na agenda.
              </p>
            </div>
          )}
        </Secao>

        <Erro mensagem={erro} />
        <Botao type="submit" disabled={enviando} className="w-full py-3 text-base sm:w-auto sm:px-8">
          {enviando ? 'Enviando...' : pacoteId ? 'Cadastrar e receber a proposta' : 'Cadastrar e pedir proposta'}
        </Botao>
      </form>
    </>
  )
}

function Secao({ numero, titulo, children }: { numero: number; titulo: string; children: ReactNode }) {
  return (
    <section className="rounded-2xl border border-stone-200 bg-white p-5 md:p-6">
      <h2 className="mb-4 flex items-center gap-3 text-lg font-semibold">
        <span className="flex h-7 w-7 items-center justify-center rounded-full bg-marca-600 text-sm text-white">{numero}</span>
        {titulo}
      </h2>
      {children}
    </section>
  )
}

function OpcaoPacote({ ativo, onClick, children }: { ativo: boolean; onClick: () => void; children: ReactNode }) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={ativo}
      className={`rounded-xl border-2 p-4 text-left transition ${
        ativo ? 'border-marca-600 bg-marca-50' : 'border-stone-200 hover:border-marca-500'
      }`}
    >
      {children}
    </button>
  )
}
