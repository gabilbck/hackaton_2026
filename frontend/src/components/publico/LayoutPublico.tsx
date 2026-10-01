import { Link, Outlet } from 'react-router-dom'
import { Handshake, UtensilsCrossed } from 'lucide-react'

/**
 * Moldura do site público. De propósito, não há nenhum link para o login da influenciadora:
 * ela acessa digitando /admin. Quem se cadastra pelo site são as marcas ("Seja parceiro").
 */
export function LayoutPublico() {
  return (
    <div className="flex min-h-screen flex-col">
      <header className="sticky top-0 z-[1000] border-b border-stone-200 bg-white/90 backdrop-blur">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3">
          <Link to="/" className="flex items-center gap-2 font-semibold text-stone-900">
            <UtensilsCrossed className="text-marca-600" size={22} />
            <span>
              Guia <span className="text-marca-600">Joinville</span>
            </span>
          </Link>
          <div className="flex items-center gap-4">
            <a
              href="https://www.instagram.com/guiagastronomicojoinville/"
              target="_blank"
              rel="noreferrer"
              className="hidden text-sm text-stone-600 hover:text-marca-700 sm:block"
            >
              @guiagastronomicojoinville
            </a>
            <Link
              to="/parceiros"
              className="flex items-center gap-1.5 rounded-lg bg-marca-600 px-3 py-1.5 text-sm font-medium text-white hover:bg-marca-700"
            >
              <Handshake size={15} />
              Seja parceiro
            </Link>
          </div>
        </div>
      </header>

      <main className="flex-1">
        <Outlet />
      </main>

      <footer className="border-t border-stone-200 bg-white py-6 text-center text-sm text-stone-500">
        <p>Guia Gastronômico Joinville · Curadoria de onde comer e o que fazer na cidade</p>
        <Link to="/parceiros" className="mt-1 inline-block text-marca-700 hover:underline">
          Tem um restaurante, bar ou evento? Anuncie no Guia
        </Link>
      </footer>
    </div>
  )
}
