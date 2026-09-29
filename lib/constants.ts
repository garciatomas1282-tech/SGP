import type {
  EstadoCliente,
  EstadoCuota,
  EstadoPrestamo,
  FrecuenciaPago,
  TipoPago,
} from "./types"
import type { BadgeProps } from "@/components/ui/badge"

type BadgeVariant = NonNullable<BadgeProps["variant"]>

export const FRECUENCIA_LABEL: Record<FrecuenciaPago, string> = {
  DIARIO: "Diario",
  SEMANAL: "Semanal",
  QUINCENAL: "Quincenal",
  MENSUAL: "Mensual",
}

export const FRECUENCIA_OPTIONS: { value: FrecuenciaPago; label: string; dias: number }[] = [
  { value: "DIARIO", label: "Diario", dias: 1 },
  { value: "SEMANAL", label: "Semanal", dias: 7 },
  { value: "QUINCENAL", label: "Quincenal", dias: 15 },
  { value: "MENSUAL", label: "Mensual", dias: 30 },
]

export const ESTADO_PRESTAMO_LABEL: Record<EstadoPrestamo, string> = {
  ACTIVO: "Activo",
  CANCELADO: "Cancelado",
  EN_MORA: "En mora",
}

export const ESTADO_PRESTAMO_BADGE: Record<EstadoPrestamo, BadgeVariant> = {
  ACTIVO: "info",
  CANCELADO: "success",
  EN_MORA: "danger",
}

export const ESTADO_CLIENTE_LABEL: Record<EstadoCliente, string> = {
  ACTIVO: "Activo",
  BLOQUEADO: "Bloqueado",
}

export const ESTADO_CLIENTE_BADGE: Record<EstadoCliente, BadgeVariant> = {
  ACTIVO: "success",
  BLOQUEADO: "danger",
}

export const ESTADO_CUOTA_LABEL: Record<EstadoCuota, string> = {
  PENDIENTE: "Pendiente",
  PAGADA: "Pagada",
  PARCIAL: "Parcial",
  VENCIDA: "Vencida",
}

export const ESTADO_CUOTA_BADGE: Record<EstadoCuota, BadgeVariant> = {
  PENDIENTE: "neutral",
  PAGADA: "success",
  PARCIAL: "warning",
  VENCIDA: "danger",
}

export const TIPO_PAGO_LABEL: Record<TipoPago, string> = {
  RENOVACION_INTERESES: "Renovación de intereses",
  CANCELACION_TOTAL: "Cancelación total",
}
