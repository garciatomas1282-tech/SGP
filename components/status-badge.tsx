import type { EstadoCliente, EstadoPrestamo, EstadoCuota } from "@/lib/types"
import {
  ESTADO_CLIENTE_BADGE,
  ESTADO_CLIENTE_LABEL,
  ESTADO_CUOTA_BADGE,
  ESTADO_CUOTA_LABEL,
  ESTADO_PRESTAMO_BADGE,
  ESTADO_PRESTAMO_LABEL,
} from "@/lib/constants"
import { Badge } from "@/components/ui/badge"

export function ClienteEstadoBadge({ estado }: { estado: EstadoCliente }) {
  return <Badge variant={ESTADO_CLIENTE_BADGE[estado]}>{ESTADO_CLIENTE_LABEL[estado]}</Badge>
}

export function PrestamoEstadoBadge({ estado }: { estado: EstadoPrestamo }) {
  return <Badge variant={ESTADO_PRESTAMO_BADGE[estado]}>{ESTADO_PRESTAMO_LABEL[estado]}</Badge>
}

export function CuotaEstadoBadge({ estado }: { estado: EstadoCuota }) {
  return <Badge variant={ESTADO_CUOTA_BADGE[estado]}>{ESTADO_CUOTA_LABEL[estado]}</Badge>
}
