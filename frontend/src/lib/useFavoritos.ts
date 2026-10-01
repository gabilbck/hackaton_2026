import { useCallback, useState } from 'react'

const CHAVE = 'guia.favoritos'

function ler(): number[] {
  try {
    return JSON.parse(localStorage.getItem(CHAVE) ?? '[]')
  } catch {
    return []
  }
}

/** Eventos favoritos salvos no próprio navegador (sem precisar de conta). */
export function useFavoritos() {
  const [ids, setIds] = useState<number[]>(ler)

  const alternar = useCallback((id: number) => {
    setIds((atuais) => {
      const novos = atuais.includes(id) ? atuais.filter((x) => x !== id) : [...atuais, id]
      try {
        localStorage.setItem(CHAVE, JSON.stringify(novos))
      } catch {
        // Navegador sem armazenamento (ex.: aba anônima): favorito vale só nesta visita
      }
      return novos
    })
  }, [])

  return { ids, ehFavorito: (id: number) => ids.includes(id), alternar }
}
