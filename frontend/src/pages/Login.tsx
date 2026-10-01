import { useState, type FormEvent } from 'react'
import { Link, Navigate, useNavigate } from 'react-router-dom'
import { ArrowLeft, UtensilsCrossed } from 'lucide-react'
import { useAuth } from '../contexts/AuthContext'
import { Botao, Campo, Cartao, Entrada, Erro } from '../components/ui'

/**
 * Login da influenciadora. Não há link para esta página no site:
 * ela acessa digitando /admin (ou /login) no navegador.
 */
export function Login() {
  const { usuario, entrar } = useAuth()
  const navigate = useNavigate()
  const [email, setEmail] = useState('')
  const [senha, setSenha] = useState('')
  const [erro, setErro] = useState<string | null>(null)
  const [enviando, setEnviando] = useState(false)

  if (usuario) return <Navigate to="/admin" replace />

  async function enviar(e: FormEvent) {
    e.preventDefault()
    setEnviando(true)
    try {
      await entrar(email, senha)
      navigate('/admin')
    } catch (err) {
      setErro((err as Error).message)
    } finally {
      setEnviando(false)
    }
  }

  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-4 p-4">
      <Cartao className="w-full max-w-sm">
        <div className="mb-6 text-center">
          <UtensilsCrossed className="mx-auto mb-2 text-marca-600" size={32} />
          <h1 className="text-xl font-semibold">Painel do Guia</h1>
          <p className="text-sm text-stone-500">Eventos, marcas, parcerias e propostas</p>
        </div>
        <form onSubmit={enviar} className="space-y-4">
          <Campo rotulo="E-mail">
            <Entrada type="email" required value={email} onChange={(e) => setEmail(e.target.value)} autoFocus />
          </Campo>
          <Campo rotulo="Senha">
            <Entrada type="password" required value={senha} onChange={(e) => setSenha(e.target.value)} />
          </Campo>
          <Erro mensagem={erro} />
          <Botao type="submit" className="w-full" disabled={enviando}>
            {enviando ? 'Entrando...' : 'Entrar'}
          </Botao>
        </form>
        {import.meta.env.DEV && (
          <p className="mt-4 text-center text-xs text-stone-500">
            Em desenvolvimento: a conta está em <code>ADMIN_EMAIL</code> e <code>ADMIN_SENHA</code> no{' '}
            <code>backend/.env</code>.
          </p>
        )}
      </Cartao>

      <Link to="/" className="flex items-center gap-1 text-sm text-stone-500 hover:text-stone-800">
        <ArrowLeft size={14} /> Voltar para a agenda
      </Link>
    </div>
  )
}
