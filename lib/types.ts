// Tipos basados en las entidades y respuestas reales del backend (Back/).
// El backend es la fuente de verdad. No agregar campos que no existan.

export type EstadoCliente = "ACTIVO" | "BLOQUEADO"
export type EstadoPrestamo = "ACTIVO" | "CANCELADO" | "EN_MORA"
export type EstadoCuota = "PENDIENTE" | "PAGADA" | "PARCIAL" | "VENCIDA"
export type FrecuenciaPago = "DIARIO" | "SEMANAL" | "QUINCENAL" | "MENSUAL"
export type TipoPago = "RENOVACION_INTERESES" | "CANCELACION_TOTAL"

export interface AuthResponse {
  token: string
  prestamistaId: number
  nombre: string
  email: string
}

export interface Cliente {
  id: number
  prestamistaId: number
  nombre: string
  dni: string | null
  telefono: string
  direccion: string | null
  estado: EstadoCliente
}

// Payload aceptado por POST /clientes (el backend asigna estado = ACTIVO).
export interface ClienteInput {
  nombre: string
  dni?: string
  telefono: string
  direccion?: string
}

export interface Prestamo {
  id: number
  prestamistaId: number
  cliente: Cliente
  montoCapital: number
  porcentajeRecargo: number
  montoTotalActual: number
  frecuencia: FrecuenciaPago
  fechaInicio: string // LocalDateTime ISO
  fechaVencimiento: string // LocalDateTime ISO
  cantidadRenovaciones: number
  estado: EstadoPrestamo
}

// Parametros de query para POST /prestamos
export interface PrestamoInput {
  clienteId: number
  montoCapital: number
  porcentajeRecargo: number
  frecuencia: FrecuenciaPago
}

export interface Cuota {
  id: number
  prestamistaId: number
  numeroCuota: number
  montoCuota: number
  montoPagado: number
  fechaVencimiento: string // LocalDate ISO
  fechaPago: string | null
  estado: EstadoCuota
}

export interface Pago {
  id: number
  prestamistaId: number
  montoPagado: number
  tipoPago: TipoPago
  fechaPago: string // LocalDateTime ISO
}

export interface DashboardMetricas {
  cuotasVencenHoyCount: number
  cuotasEnMoraCount: number
  totalPrestamosActivos: number
}

export interface AlertasDiarias {
  vencenHoy: Cuota[]
  vencenManana: Cuota[]
  vencidasEnMora: Cuota[]
}
