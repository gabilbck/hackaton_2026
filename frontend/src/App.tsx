import type { ReactNode } from 'react'
import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom'
import { AuthProvider, useAuth } from './contexts/AuthContext'
import { Layout } from './components/Layout'
import { LayoutPublico } from './components/publico/LayoutPublico'
import { Login } from './pages/Login'
import { Painel } from './pages/Painel'
import { Eventos } from './pages/Eventos'
import { Marcas } from './pages/Marcas'
import { MarcaDetalhe } from './pages/MarcaDetalhe'
import { Parcerias } from './pages/Parcerias'
import { Pacotes } from './pages/Pacotes'
import { Notificacoes } from './pages/Notificacoes'
import { SejaParceiro } from './pages/publico/SejaParceiro'
import { Agenda } from './pages/publico/Agenda'
import { EventoDetalhe } from './pages/publico/EventoDetalhe'
import { Descadastrar } from './pages/publico/Descadastrar'

function Protegida({ children }: { children: ReactNode }) {
  const { usuario } = useAuth()
  return usuario ? children : <Navigate to="/login" replace />
}

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          {/* Site público: a agenda de eventos de Joinville */}
          <Route element={<LayoutPublico />}>
            <Route index element={<Agenda />} />
            <Route path="evento/:id" element={<EventoDetalhe />} />
            <Route path="descadastrar/:token" element={<Descadastrar />} />
            <Route path="parceiros" element={<SejaParceiro />} />
          </Route>

          {/* Acesso da influenciadora: não há link no site, entra-se digitando /admin */}
          <Route path="/login" element={<Login />} />

          {/* Área da influenciadora */}
          <Route
            path="/admin"
            element={
              <Protegida>
                <Layout />
              </Protegida>
            }
          >
            <Route index element={<Painel />} />
            <Route path="eventos" element={<Eventos />} />
            <Route path="marcas" element={<Marcas />} />
            <Route path="marcas/:id" element={<MarcaDetalhe />} />
            <Route path="parcerias" element={<Parcerias />} />
            <Route path="pacotes" element={<Pacotes />} />
            <Route path="notificacoes" element={<Notificacoes />} />
          </Route>

          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  )
}
