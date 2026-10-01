import { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { api } from '../../lib/api'
import { Cartao } from '../../components/ui'

export function Descadastrar() {
  const { token } = useParams()
  const [mensagem, setMensagem] = useState('Processando...')

  useEffect(() => {
    api
      .post<{ mensagem: string }>(`/publico/descadastrar/${token}`)
      .then((r) => setMensagem(r.mensagem))
      .catch(() => setMensagem('Não encontramos essa inscrição. Talvez ela já tenha sido cancelada.'))
  }, [token])

  return (
    <div className="mx-auto max-w-md px-4 py-16">
      <Cartao className="text-center">
        <p className="text-lg">{mensagem}</p>
        <Link to="/" className="mt-4 inline-block text-marca-700 hover:underline">
          Voltar para a agenda
        </Link>
      </Cartao>
    </div>
  )
}
