import { NavLink, Outlet } from 'react-router-dom'
import { CalendarDays, ExternalLink, Handshake, LayoutDashboard, LogOut, Mail, Package, Store, UtensilsCrossed } from 'lucide-react'
import { useAuth } from '../contexts/AuthContext'

const itens = [
  { para: '/admin', rotulo: 'Painel', icone: LayoutDashboard },
  { para: '/admin/eventos', rotulo: 'Eventos', icone: CalendarDays },
  { para: '/admin/marcas', rotulo: 'Marcas', icone: Store },
  { para: '/admin/parcerias', rotulo: 'Parcerias', icone: Handshake },
  { para: '/admin/pacotes', rotulo: 'Pacotes', icone: Package },
  { para: '/admin/notificacoes', rotulo: 'E-mails', icone: Mail },
]

export function Layout() {
  const { usuario, sair } = useAuth()

  return (
    <div className="min-h-screen md:flex">
      <aside className="border-b border-stone-200 bg-white md:sticky md:top-0 md:flex md:h-screen md:w-60 md:shrink-0 md:flex-col md:border-r md:border-b-0">
        <div className="flex items-center gap-2 px-5 py-4">
          <UtensilsCrossed className="text-marca-600" size={22} />
          <span className="font-semibold text-stone-900">Guia Parcerias</span>
        </div>

        <nav className="flex gap-1 overflow-x-auto px-3 pb-3 md:flex-1 md:flex-col md:overflow-visible">
          {itens.map(({ para, rotulo, icone: Icone }) => (
            <NavLink
              key={para}
              to={para}
              end={para === '/admin'}
              className={({ isActive }) =>
                `flex shrink-0 items-center gap-2.5 rounded-lg px-3 py-2 text-sm font-medium ${
                  isActive ? 'bg-marca-50 text-marca-700' : 'text-stone-600 hover:bg-stone-100'
                }`
              }
            >
              <Icone size={18} />
              {rotulo}
            </NavLink>
          ))}
          <a
            href="/"
            target="_blank"
            className="flex shrink-0 items-center gap-2.5 rounded-lg px-3 py-2 text-sm font-medium text-stone-600 hover:bg-stone-100"
          >
            <ExternalLink size={18} />
            Ver site público
          </a>
        </nav>

        <div className="hidden border-t border-stone-200 p-4 md:block">
          <p className="truncate text-sm font-medium">{usuario?.nome}</p>
          <button onClick={sair} className="mt-1 flex items-center gap-1.5 text-sm text-stone-500 hover:text-stone-800">
            <LogOut size={14} /> Sair
          </button>
        </div>
      </aside>

      <main className="mx-auto w-full max-w-6xl min-w-0 flex-1 p-4 md:p-8">
        <Outlet />
      </main>
    </div>
  )
}
