// Capa central de comunicación con el backend Spring (Back/).
// Base configurable; por defecto el backend local en :8080.

export const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_BASE_URL?.replace(/\/$/, "") ||
  "http://localhost:8080"

const TOKEN_KEY = "sgp-token"

export class ApiError extends Error {
  status: number
  constructor(message: string, status: number) {
    super(message)
    this.name = "ApiError"
    this.status = status
  }
}

export function getToken(): string | null {
  if (typeof window === "undefined") return null
  return localStorage.getItem(TOKEN_KEY)
}

export function setToken(token: string) {
  if (typeof window !== "undefined") localStorage.setItem(TOKEN_KEY, token)
}

export function clearToken() {
  if (typeof window !== "undefined") localStorage.removeItem(TOKEN_KEY)
}

type Query = Record<string, string | number | boolean | undefined | null>

function buildUrl(path: string, query?: Query): string {
  const url = new URL(API_BASE_URL + path)
  if (query) {
    for (const [key, value] of Object.entries(query)) {
      if (value !== undefined && value !== null) {
        url.searchParams.set(key, String(value))
      }
    }
  }
  return url.toString()
}

interface RequestOptions {
  method?: string
  query?: Query
  body?: unknown
}

async function request<T>(path: string, options: RequestOptions = {}): Promise<T> {
  const { method = "GET", query, body } = options
  const token = getToken()

  const headers: Record<string, string> = {}
  if (body !== undefined) headers["Content-Type"] = "application/json"
  if (token) headers["Authorization"] = `Bearer ${token}`

  let res: Response
  try {
    res = await fetch(buildUrl(path, query), {
      method,
      headers,
      body: body !== undefined ? JSON.stringify(body) : undefined,
    })
  } catch {
    throw new ApiError(
      "No se pudo conectar con el servidor. Verificá que el backend esté en ejecución.",
      0,
    )
  }

  if (res.status === 401 || res.status === 403) {
    clearToken()
    if (typeof window !== "undefined" && !window.location.pathname.startsWith("/login")) {
      window.location.href = "/login"
    }
    throw new ApiError("Tu sesión expiró. Iniciá sesión nuevamente.", res.status)
  }

  if (!res.ok) {
    let message = "Ocurrió un error al procesar la solicitud."
    try {
      const data = await res.json()
      if (data?.message) message = data.message
      else if (data?.error) message = data.error
    } catch {
      // respuesta sin cuerpo JSON
    }
    throw new ApiError(message, res.status)
  }

  if (res.status === 204) return undefined as T
  const text = await res.text()
  if (!text) return undefined as T
  return JSON.parse(text) as T
}

export const api = {
  get: <T>(path: string, query?: Query) => request<T>(path, { method: "GET", query }),
  post: <T>(path: string, opts?: { query?: Query; body?: unknown }) =>
    request<T>(path, { method: "POST", query: opts?.query, body: opts?.body }),
}
