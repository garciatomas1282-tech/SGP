"use client"

import useSWR from "swr"
import { api } from "./api"
import { useAuth } from "./auth-context"
import type {
  Cliente,
  Prestamo,
  DashboardMetricas,
  AlertasDiarias,
  FrecuenciaPago,
  ClienteInput,
} from "./types"

// El backend recibe prestamistaId como query param en casi todos los endpoints.
function usePrestamistaId() {
  const { user } = useAuth()
  return user?.prestamistaId ?? null
}

export function useClientes() {
  const pid = usePrestamistaId()
  const { data, error, isLoading, mutate } = useSWR<Cliente[]>(
    pid ? ["/api/v1/clientes", pid] : null,
    () => api.get<Cliente[]>("/api/v1/clientes", { prestamistaId: pid! }),
  )
  return { clientes: data ?? [], error, isLoading, mutate }
}

export function useCliente(clienteId: number | null) {
  const pid = usePrestamistaId()
  const { data, error, isLoading, mutate } = useSWR<Cliente>(
    pid && clienteId ? ["/api/v1/clientes", clienteId, pid] : null,
    () => api.get<Cliente>(`/api/v1/clientes/${clienteId}`, { prestamistaId: pid! }),
  )
  return { cliente: data, error, isLoading, mutate }
}

export function usePrestamos() {
  const pid = usePrestamistaId()
  const { data, error, isLoading, mutate } = useSWR<Prestamo[]>(
    pid ? ["/api/v1/prestamos", pid] : null,
    () => api.get<Prestamo[]>("/api/v1/prestamos", { prestamistaId: pid! }),
  )
  return { prestamos: data ?? [], error, isLoading, mutate }
}

export function useDashboardMetricas() {
  const pid = usePrestamistaId()
  const { data, error, isLoading, mutate } = useSWR<DashboardMetricas>(
    pid ? ["/api/v1/dashboard/metricas", pid] : null,
    () => api.get<DashboardMetricas>("/api/v1/dashboard/metricas", { prestamistaId: pid! }),
    { refreshInterval: 60_000 },
  )
  return { metricas: data, error, isLoading, mutate }
}

export function useAlertasDiarias() {
  const pid = usePrestamistaId()
  const { data, error, isLoading, mutate } = useSWR<AlertasDiarias>(
    pid ? ["/api/v1/dashboard/alertas-diarias", pid] : null,
    () => api.get<AlertasDiarias>("/api/v1/dashboard/alertas-diarias", { prestamistaId: pid! }),
    { refreshInterval: 60_000 },
  )
  return { alertas: data, error, isLoading, mutate }
}

// --- Mutaciones ---

export function useClienteActions() {
  const pid = usePrestamistaId()
  return {
    crearCliente: (body: ClienteInput) =>
      api.post<Cliente>("/api/v1/clientes", { query: { prestamistaId: pid! }, body }),
  }
}

export function usePrestamoActions() {
  const pid = usePrestamistaId()
  return {
    crearPrestamo: (params: {
      clienteId: number
      montoCapital: number
      porcentajeRecargo: number
      frecuencia: FrecuenciaPago
    }) =>
      api.post<Prestamo>("/api/v1/prestamos", {
        query: { prestamistaId: pid!, ...params },
      }),
    renovarPrestamo: (prestamoId: number, montoAbonado: number) =>
      api.post<Prestamo>(`/api/v1/prestamos/${prestamoId}/renovar`, {
        query: { prestamistaId: pid!, montoAbonado },
      }),
    cancelarPrestamo: (prestamoId: number, montoAbonado: number) =>
      api.post<Prestamo>(`/api/v1/prestamos/${prestamoId}/cancelar`, {
        query: { prestamistaId: pid!, montoAbonado },
      }),
  }
}
