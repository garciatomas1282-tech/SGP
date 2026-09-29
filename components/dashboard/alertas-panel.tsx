"use client"

import { CalendarClock, CalendarDays, AlertTriangle } from "lucide-react"
import type { Cuota } from "@/lib/types"
import { formatCurrency, formatDate } from "@/lib/format"
import { Skeleton } from "@/components/ui/skeleton"
import { cn } from "@/lib/utils"

interface AlertColumnProps {
  title: string
  cuotas: Cuota[]
  icon: typeof CalendarClock
  tone: "info" | "warning" | "danger"
  loading?: boolean
}

const toneRing: Record<AlertColumnProps["tone"], string> = {
  info: "text-info bg-info/10",
  warning: "text-warning bg-warning/10",
  danger: "text-destructive bg-destructive/10",
}

export function AlertColumn({ title, cuotas, icon: Icon, tone, loading }: AlertColumnProps) {
  return (
    <div className="flex flex-col rounded-xl border border-border bg-card shadow-sm">
      <div className="flex items-center gap-2.5 border-b border-border px-4 py-3">
        <span className={cn("flex size-8 items-center justify-center rounded-lg", toneRing[tone])}>
          <Icon className="size-4" />
        </span>
        <h3 className="text-sm font-semibold">{title}</h3>
        {!loading ? (
          <span className="ml-auto rounded-full bg-secondary px-2 py-0.5 text-xs font-medium text-muted-foreground">
            {cuotas.length}
          </span>
        ) : null}
      </div>
      <div className="flex-1 p-3">
        {loading ? (
          <div className="space-y-2">
            <Skeleton className="h-14 w-full" />
            <Skeleton className="h-14 w-full" />
          </div>
        ) : cuotas.length === 0 ? (
          <p className="px-1 py-8 text-center text-sm text-muted-foreground">Sin cuotas</p>
        ) : (
          <ul className="space-y-2">
            {cuotas.map((c) => (
              <li
                key={c.id}
                className="flex items-center justify-between gap-3 rounded-lg border border-border/60 bg-background px-3 py-2.5"
              >
                <div className="min-w-0">
                  <p className="truncate text-sm font-medium">
                    {c.prestamo?.cliente?.nombre ?? `Cuota #${c.numeroCuota ?? c.id}`}
                  </p>
                  <p className="text-xs text-muted-foreground">Vence {formatDate(c.fechaVencimiento)}</p>
                </div>
                <span className="shrink-0 text-sm font-semibold tabular-nums">
                  {formatCurrency(c.montoTotal)}
                </span>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  )
}

export const alertIcons = { CalendarClock, CalendarDays, AlertTriangle }
