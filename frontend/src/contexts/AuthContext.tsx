import { createContext, useContext, useState, type ReactNode } from 'react'
import { api, token } from '../lib/api'

interface Usuario {
  id: number
  nome: string
  email: string
}

interface AuthContextValue {
  usuario: Usuario | null
  entrar: (email: string, senha: string) => Promise<void>
  sair: () => void
}

const AuthContext = createContext<AuthContextValue | null>(null)
const CHAVE_USUARIO = 'guia.usuario'

export function AuthProvider({ children }: { children: ReactNode }) {
  const [usuario, setUsuario] = useState<Usuario | null>(() => {
    const salvo = localStorage.getItem(CHAVE_USUARIO)
    return salvo && token.get() ? JSON.parse(salvo) : null
  })

  async function entrar(email: string, senha: string) {
    const r = await api.post<{ token: string; usuario: Usuario }>('/auth/login', { email, senha })
    token.set(r.token)
    localStorage.setItem(CHAVE_USUARIO, JSON.stringify(r.usuario))
    setUsuario(r.usuario)
  }

  function sair() {
    token.limpar()
    localStorage.removeItem(CHAVE_USUARIO)
    setUsuario(null)
  }

  return <AuthContext.Provider value={{ usuario, entrar, sair }}>{children}</AuthContext.Provider>
}

// eslint-disable-next-line react-refresh/only-export-components
export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth precisa estar dentro de <AuthProvider>')
  return ctx
}
