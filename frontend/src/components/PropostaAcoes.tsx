import { useState } from 'react'
import { Check, Copy, MessageCircle } from 'lucide-react'
import { linkWhatsApp } from '../lib/formato'
import { Botao } from './ui'

export function PropostaAcoes({ texto, whatsapp }: { texto: string; whatsapp?: string | null }) {
  const [copiado, setCopiado] = useState(false)

  async function copiar() {
    await navigator.clipboard.writeText(texto)
    setCopiado(true)
    setTimeout(() => setCopiado(false), 2000)
  }

  return (
    <div className="flex flex-wrap gap-2">
      <Botao variante="secundario" onClick={copiar} type="button">
        {copiado ? <Check size={16} /> : <Copy size={16} />}
        {copiado ? 'Copiado!' : 'Copiar texto'}
      </Botao>
      <a href={linkWhatsApp(whatsapp, texto)} target="_blank" rel="noreferrer">
        <Botao variante="secundario" type="button" className="text-green-700">
          <MessageCircle size={16} /> Enviar no WhatsApp
        </Botao>
      </a>
    </div>
  )
}

export function TextoProposta({ texto }: { texto: string }) {
  return (
    <pre className="max-h-80 overflow-y-auto whitespace-pre-wrap rounded-lg bg-stone-50 p-4 font-sans text-sm leading-relaxed text-stone-700">
      {texto}
    </pre>
  )
}
