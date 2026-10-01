const BASE = import.meta.env.VITE_API_URL ?? '/api'
const CHAVE_TOKEN = 'guia.token'

export class ApiError extends Error {
  status: number
  detalhes?: { campo: string; mensagem: string }[]

  constructor(status: number, mensagem: string, detalhes?: ApiError['detalhes']) {
    super(mensagem)
    this.status = status
    this.detalhes = detalhes
  }
}

export const token = {
  get: () => localStorage.getItem(CHAVE_TOKEN),
  set: (t: string) => localStorage.setItem(CHAVE_TOKEN, t),
  limpar: () => localStorage.removeItem(CHAVE_TOKEN),
}

async function requisicao<T>(metodo: string, caminho: string, corpo?: unknown): Promise<T> {
  const t = token.get()
  const resp = await fetch(`${BASE}${caminho}`, {
    method: metodo,
    headers: {
      ...(corpo !== undefined && { 'Content-Type': 'application/json' }),
      ...(t && { Authorization: `Bearer ${t}` }),
    },
    body: corpo !== undefined ? JSON.stringify(corpo) : undefined,
  })

  if (resp.status === 401 && t) {
    token.limpar()
    window.location.href = '/login'
  }
  if (resp.status === 204) return undefined as T

  const dados = await resp.json().catch(() => ({}))
  if (!resp.ok) {
    const detalhe = dados.detalhes?.[0]
    throw new ApiError(
      resp.status,
      detalhe ? `${detalhe.campo}: ${detalhe.mensagem}` : (dados.erro ?? 'Erro inesperado'),
      dados.detalhes,
    )
  }
  return dados as T
}

export const api = {
  get: <T>(caminho: string) => requisicao<T>('GET', caminho),
  post: <T>(caminho: string, corpo?: unknown) => requisicao<T>('POST', caminho, corpo ?? {}),
  put: <T>(caminho: string, corpo: unknown) => requisicao<T>('PUT', caminho, corpo),
  patch: <T>(caminho: string, corpo: unknown) => requisicao<T>('PATCH', caminho, corpo),
  delete: <T = void>(caminho: string) => requisicao<T>('DELETE', caminho),
}
