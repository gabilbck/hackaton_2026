import { useEffect, useState, type FormEvent } from 'react'
import { api } from '../lib/api'
import { CATEGORIAS, deInputDataHora, paraInputDataHora } from '../lib/formato'
import type { CategoriaEvento, Evento, Marca } from '../types'
import { AreaTexto, Botao, Campo, Entrada, Erro, Modal, Selecao } from './ui'

interface Props {
  aberto: boolean
  evento: Evento | null
  aoFechar: () => void
  aoSalvar: () => void
}

const vazio = {
  titulo: '',
  descricao: '',
  categoria: 'GASTRONOMIA' as CategoriaEvento,
  inicio: '',
  fim: '',
  gratuito: false,
  preco: '',
  marcaId: '',
  local: '',
  endereco: '',
  bairro: '',
  linkIngresso: '',
  imagemUrl: '',
  destaque: false,
  publicado: true,
  notificarInscritos: true,
}

export function EventoFormModal({ aberto, evento, aoFechar, aoSalvar }: Props) {
  const [form, setForm] = useState(vazio)
  const [marcas, setMarcas] = useState<Marca[]>([])
  const [erro, setErro] = useState<string | null>(null)
  const [salvando, setSalvando] = useState(false)

  useEffect(() => {
    if (!aberto) return
    setErro(null)
    api.get<Marca[]>('/marcas').then(setMarcas)
    setForm(
      evento
        ? {
            ...vazio,
            titulo: evento.titulo,
            descricao: evento.descricao ?? '',
            categoria: evento.categoria,
            inicio: paraInputDataHora(evento.inicio),
            fim: paraInputDataHora(evento.fim),
            gratuito: evento.gratuito,
            preco: evento.preco ? String(Number(evento.preco)) : '',
            marcaId: evento.marcaId ? String(evento.marcaId) : '',
            local: evento.local ?? '',
            endereco: evento.endereco,
            bairro: evento.bairro ?? '',
            linkIngresso: evento.linkIngresso ?? '',
            imagemUrl: evento.imagemUrl ?? '',
            destaque: evento.destaque,
            publicado: evento.publicado,
            notificarInscritos: !evento.publicado,
          }
        : vazio,
    )
  }, [aberto, evento])

  const set = (campo: keyof typeof form) => (e: { target: { value: string } }) =>
    setForm((f) => ({ ...f, [campo]: e.target.value }))
  const marcar = (campo: keyof typeof form) => (e: { target: { checked: boolean } }) =>
    setForm((f) => ({ ...f, [campo]: e.target.checked }))

  /** Ao escolher a marca, reaproveita nome e endereço dela nos campos vazios. */
  function escolherMarca(id: string) {
    const m = marcas.find((x) => x.id === Number(id))
    setForm((f) => ({
      ...f,
      marcaId: id,
      local: f.local || m?.nome || '',
      endereco: f.endereco || m?.endereco || '',
      bairro: f.bairro || m?.bairro || '',
    }))
  }

  async function enviar(e: FormEvent) {
    e.preventDefault()
    setSalvando(true)
    const corpo = {
      ...form,
      inicio: deInputDataHora(form.inicio),
      fim: deInputDataHora(form.fim),
      preco: form.gratuito || !form.preco ? null : Number(form.preco),
      marcaId: form.marcaId ? Number(form.marcaId) : null,
    }
    try {
      if (evento) await api.put(`/eventos/${evento.id}`, corpo)
      else await api.post('/eventos', corpo)
      aoSalvar()
      aoFechar()
    } catch (err) {
      setErro((err as Error).message)
    } finally {
      setSalvando(false)
    }
  }

  const vaiNotificar = form.publicado && (!evento || !evento.publicado)

  return (
    <Modal aberto={aberto} titulo={evento ? 'Editar evento' : 'Novo evento'} aoFechar={aoFechar} largo>
      <form onSubmit={enviar} className="space-y-4">
        <Campo rotulo="Título *">
          <Entrada required value={form.titulo} onChange={set('titulo')} placeholder="Ex.: Festival de Food Trucks" />
        </Campo>

        <div className="grid gap-3 sm:grid-cols-3">
          <Campo rotulo="Categoria *">
            <Selecao value={form.categoria} onChange={set('categoria')}>
              {CATEGORIAS.map((c) => (
                <option key={c.valor} value={c.valor}>
                  {c.emoji} {c.rotulo}
                </option>
              ))}
            </Selecao>
          </Campo>
          <Campo rotulo="Início *">
            <Entrada required type="datetime-local" value={form.inicio} onChange={set('inicio')} />
          </Campo>
          <Campo rotulo="Término">
            <Entrada type="datetime-local" value={form.fim} onChange={set('fim')} min={form.inicio} />
          </Campo>
        </div>

        <div className="grid items-end gap-3 sm:grid-cols-3">
          <label className="flex items-center gap-2 pb-2 text-sm font-medium">
            <input type="checkbox" checked={form.gratuito} onChange={marcar('gratuito')} /> Evento gratuito
          </label>
          <Campo rotulo="Preço a partir de (R$)">
            <Entrada type="number" min={0} step="0.01" value={form.preco} onChange={set('preco')} disabled={form.gratuito} />
          </Campo>
          <Campo rotulo="Link do ingresso">
            <Entrada type="url" value={form.linkIngresso} onChange={set('linkIngresso')} placeholder="https://..." />
          </Campo>
        </div>

        <fieldset className="space-y-3 rounded-lg border border-stone-200 p-3">
          <legend className="px-1 text-sm font-medium">Local</legend>
          <Campo rotulo="Marca parceira (opcional)" dica="Preenche local e endereço com os dados da marca">
            <Selecao value={form.marcaId} onChange={(e) => escolherMarca(e.target.value)}>
              <option value="">Nenhuma</option>
              {marcas.map((m) => (
                <option key={m.id} value={m.id}>
                  {m.nome}
                </option>
              ))}
            </Selecao>
          </Campo>
          <div className="grid gap-3 sm:grid-cols-[1fr_1.4fr_1fr]">
            <Campo rotulo="Nome do local">
              <Entrada value={form.local} onChange={set('local')} />
            </Campo>
            <Campo rotulo="Endereço *" dica="Usado para posicionar no mapa">
              <Entrada required value={form.endereco} onChange={set('endereco')} placeholder="Rua, número" />
            </Campo>
            <Campo rotulo="Bairro">
              <Entrada value={form.bairro} onChange={set('bairro')} />
            </Campo>
          </div>
        </fieldset>

        <Campo rotulo="Descrição">
          <AreaTexto value={form.descricao} onChange={set('descricao')} />
        </Campo>
        <Campo rotulo="URL da imagem (opcional)" dica="Sem imagem, o card usa a cor e o ícone da categoria">
          <Entrada type="url" value={form.imagemUrl} onChange={set('imagemUrl')} />
        </Campo>

        <div className="flex flex-wrap gap-x-6 gap-y-2 text-sm">
          <label className="flex items-center gap-2">
            <input type="checkbox" checked={form.destaque} onChange={marcar('destaque')} /> ⭐ Recomendado pelo Guia
          </label>
          <label className="flex items-center gap-2">
            <input type="checkbox" checked={form.publicado} onChange={marcar('publicado')} /> Publicado na agenda
          </label>
          {vaiNotificar && (
            <label className="flex items-center gap-2">
              <input type="checkbox" checked={form.notificarInscritos} onChange={marcar('notificarInscritos')} /> Avisar inscritos por e-mail
            </label>
          )}
        </div>

        <Erro mensagem={erro} />
        <div className="flex justify-end gap-2">
          <Botao type="button" variante="secundario" onClick={aoFechar}>
            Cancelar
          </Botao>
          <Botao type="submit" disabled={salvando}>
            {salvando ? 'Salvando...' : 'Salvar evento'}
          </Botao>
        </div>
      </form>
    </Modal>
  )
}
