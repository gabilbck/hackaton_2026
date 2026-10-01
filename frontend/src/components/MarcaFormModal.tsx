import { useEffect, useState, type FormEvent } from 'react'
import { api } from '../lib/api'
import type { Marca } from '../types'
import { AreaTexto, Botao, Campo, Entrada, Erro, Modal } from './ui'

interface Props {
  aberto: boolean
  aoFechar: () => void
  aoSalvar: (marca: Marca) => void
  marca?: Marca | null
}

const vazio = {
  nome: '',
  instagram: '',
  segmento: '',
  bairro: '',
  endereco: '',
  observacoes: '',
  contatoNome: '',
  contatoWhatsapp: '',
  contatoEmail: '',
}

/** Cria marca (já com o contato principal) ou edita os dados de uma existente. */
export function MarcaFormModal({ aberto, aoFechar, aoSalvar, marca }: Props) {
  const [form, setForm] = useState(vazio)
  const [erro, setErro] = useState<string | null>(null)
  const editando = !!marca

  useEffect(() => {
    if (!aberto) return
    setErro(null)
    setForm(
      marca
        ? {
            ...vazio,
            nome: marca.nome,
            instagram: marca.instagram ?? '',
            segmento: marca.segmento ?? '',
            bairro: marca.bairro ?? '',
            endereco: marca.endereco ?? '',
            observacoes: marca.observacoes ?? '',
          }
        : vazio,
    )
  }, [aberto, marca])

  const set = (campo: keyof typeof form) => (e: { target: { value: string } }) =>
    setForm({ ...form, [campo]: e.target.value })

  async function enviar(e: FormEvent) {
    e.preventDefault()
    const { contatoNome, contatoWhatsapp, contatoEmail, ...dados } = form
    const instagram = dados.instagram && !dados.instagram.startsWith('@') ? `@${dados.instagram}` : dados.instagram
    try {
      const salva = editando
        ? await api.put<Marca>(`/marcas/${marca!.id}`, { ...dados, instagram })
        : await api.post<Marca>('/marcas', {
            ...dados,
            instagram,
            contatos: contatoNome
              ? [{ nome: contatoNome, whatsapp: contatoWhatsapp, email: contatoEmail, principal: true }]
              : [],
          })
      aoSalvar(salva)
      aoFechar()
    } catch (err) {
      setErro((err as Error).message)
    }
  }

  return (
    <Modal aberto={aberto} titulo={editando ? 'Editar marca' : 'Nova marca'} aoFechar={aoFechar}>
      <form onSubmit={enviar} className="space-y-4">
        <Campo rotulo="Nome da marca *">
          <Entrada required value={form.nome} onChange={set('nome')} autoFocus />
        </Campo>
        <div className="grid grid-cols-2 gap-3">
          <Campo rotulo="Instagram">
            <Entrada value={form.instagram} onChange={set('instagram')} placeholder="@restaurante" />
          </Campo>
          <Campo rotulo="Segmento">
            <Entrada value={form.segmento} onChange={set('segmento')} placeholder="Italiana, cafeteria..." />
          </Campo>
          <Campo rotulo="Bairro">
            <Entrada value={form.bairro} onChange={set('bairro')} />
          </Campo>
          <Campo rotulo="Endereço">
            <Entrada value={form.endereco} onChange={set('endereco')} />
          </Campo>
        </div>
        <Campo rotulo="Observações">
          <AreaTexto value={form.observacoes} onChange={set('observacoes')} />
        </Campo>

        {!editando && (
          <fieldset className="space-y-3 rounded-lg border border-stone-200 p-3">
            <legend className="px-1 text-sm font-medium">Contato principal</legend>
            <Campo rotulo="Nome">
              <Entrada value={form.contatoNome} onChange={set('contatoNome')} />
            </Campo>
            <div className="grid grid-cols-2 gap-3">
              <Campo rotulo="WhatsApp">
                <Entrada value={form.contatoWhatsapp} onChange={set('contatoWhatsapp')} placeholder="47 99999-0000" />
              </Campo>
              <Campo rotulo="E-mail" dica="Recebe as propostas e atualizações">
                <Entrada type="email" value={form.contatoEmail} onChange={set('contatoEmail')} />
              </Campo>
            </div>
          </fieldset>
        )}

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
