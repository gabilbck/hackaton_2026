import { useCallback, useEffect, useState } from 'react'

/** Busca dados ao montar e sempre que `deps` mudar; `recarregar` refaz a busca. */
export function useCarregar<T>(buscar: () => Promise<T>, deps: unknown[] = []) {
  const [dados, setDados] = useState<T | null>(null)
  const [carregando, setCarregando] = useState(true)
  const [erro, setErro] = useState<string | null>(null)

  // eslint-disable-next-line react-hooks/exhaustive-deps
  const executar = useCallback(buscar, deps)

  const recarregar = useCallback(async () => {
    setCarregando(true)
    try {
      setDados(await executar())
      setErro(null)
    } catch (e) {
      setErro((e as Error).message)
    } finally {
      setCarregando(false)
    }
  }, [executar])

  useEffect(() => {
    recarregar()
  }, [recarregar])

  return { dados, carregando, erro, recarregar }
}
