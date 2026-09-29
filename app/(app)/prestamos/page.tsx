"use client"

import { useState, useMemo } from "react"
import Link from "next/link"
import { HandCoins, Search, MoreHorizontal, RefreshCw, CheckCircle2 } from "lucide-react"
import { usePrestamos } from "@/lib/hooks"
import { formatCurrency, formatDate } from "@/lib/format"
import { FRECUENCIA_LABEL } from "@/lib/constants"
import type { EstadoPrestamo, Prestamo } from "@/lib/types"
import { PageHeader } from "@/components/page-header"
import { NuevoPrestamoDialog } from "@/components/prestamos/nuevo-prestamo-dialog"
import { AccionPrestamoDialog } from "@/components/prestamos/accion-prestamo-dialog"
import { PrestamoEstadoBadge } from "@/components/status-badge"
import { Input } from "@/components/ui/input"
import { EmptyState } from "@/components/ui/empty-state"
import { Skeleton } from "@/components/ui/skeleton"
import { Button } from "@/components/ui/button"
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
} from "@/components/ui/table"
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
} from "@/components/ui/dropdown-menu"

const FILTERS: { value: "TODOS" | EstadoPrestamo; label: string }[] = [
  { value: "TODOS", label: "Todos" },
  { value: "ACTIVO", label: "Activos" },
  { value: "EN_MORA", label: "En mora" },
  { value: "CANCELADO", label: "Cancelados" },
]

export default function PrestamosPage() {
  const { prestamos, isLoading, mutate } = usePrestamos()
  const [query, setQuery] = useState("")
  const [filter, setFilter] = useState<"TODOS" | EstadoPrestamo>("TODOS")
  const [accion, setAccion] = useState<{ prestamo: Prestamo; modo: "renovar" | "cancelar" } | null>(null)
  const [dialogOpen, setDialogOpen] = useState(false)

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase()
    return prestamos.filter((p) => {
      const matchEstado = filter === "TODOS" || p.estado === filter
      const matchQuery =
        !q ||
        p.cliente?.nombre?.toLowerCase().includes(q) ||
        String(p.id).includes(q)
      return matchEstado && matchQuery
    })
  }, [prestamos, query, filter])

  function openAccion(prestamo: Prestamo, modo: "renovar" | "cancelar") {
    setAccion({ prestamo, modo })
    setDialogOpen(true)
  }

  return (
    <div>
      <PageHeader
        title="Préstamos"
        description="Otorgá préstamos, registrá renovaciones y cancelaciones."
        action={<NuevoPrestamoDialog onCreated={() => mutate()} />}
      />

      <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="relative max-w-sm flex-1">
          <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Buscar por cliente o N.º"
            className="pl-9"
          />
        </div>
        <div className="flex flex-wrap gap-1.5">
          {FILTERS.map((f) => (
            <button
              key={f.value}
              type="button"
              onClick={() => setFilter(f.value)}
              className={
                "rounded-full px-3 py-1.5 text-sm font-medium transition-colors " +
                (filter === f.value
                  ? "bg-primary text-primary-foreground"
                  : "bg-secondary text-muted-foreground hover:text-foreground")
              }
            >
              {f.label}
            </button>
          ))}
        </div>
      </div>

      {isLoading ? (
        <div className="space-y-2">
          {Array.from({ length: 5 }).map((_, i) => (
            <Skeleton key={i} className="h-16 w-full" />
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <EmptyState
          icon={HandCoins}
          title={query || filter !== "TODOS" ? "Sin resultados" : "Todavía no hay préstamos"}
          description={
            query || filter !== "TODOS"
              ? "Ajustá los filtros o el término de búsqueda."
              : "Otorgá tu primer préstamo para comenzar a operar."
          }
          action={query || filter !== "TODOS" ? undefined : <NuevoPrestamoDialog onCreated={() => mutate()} />}
        />
      ) : (
        <>
          {/* Tabla en escritorio */}
          <div className="hidden overflow-hidden rounded-xl border border-border bg-card shadow-sm lg:block">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>N.º</TableHead>
                  <TableHead>Cliente</TableHead>
                  <TableHead className="text-right">Capital</TableHead>
                  <TableHead className="text-right">Total actual</TableHead>
                  <TableHead>Frecuencia</TableHead>
                  <TableHead>Vence</TableHead>
                  <TableHead>Estado</TableHead>
                  <TableHead className="w-10" />
                </TableRow>
              </TableHeader>
              <TableBody>
                {filtered.map((p) => (
                  <TableRow key={p.id}>
                    <TableCell className="tabular-nums text-muted-foreground">#{p.id}</TableCell>
                    <TableCell>
                      <Link
                        href={`/clientes/${p.cliente?.id}`}
                        className="font-medium text-foreground hover:underline"
                      >
                        {p.cliente?.nombre ?? "—"}
                      </Link>
                    </TableCell>
                    <TableCell className="text-right tabular-nums">{formatCurrency(p.montoCapital)}</TableCell>
                    <TableCell className="text-right font-semibold tabular-nums">
                      {formatCurrency(p.montoTotalActual)}
                    </TableCell>
                    <TableCell className="text-muted-foreground">{FRECUENCIA_LABEL[p.frecuencia]}</TableCell>
                    <TableCell className="text-muted-foreground">{formatDate(p.fechaVencimiento)}</TableCell>
                    <TableCell>
                      <PrestamoEstadoBadge estado={p.estado} />
                    </TableCell>
                    <TableCell>
                      <PrestamoActions prestamo={p} onAccion={openAccion} />
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>

          {/* Tarjetas en móvil/tablet */}
          <div className="space-y-3 lg:hidden">
            {filtered.map((p) => (
              <div key={p.id} className="rounded-xl border border-border bg-card p-4 shadow-sm">
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <Link
                      href={`/clientes/${p.cliente?.id}`}
                      className="truncate font-medium hover:underline"
                    >
                      {p.cliente?.nombre ?? "—"}
                    </Link>
                    <p className="text-xs text-muted-foreground">Préstamo #{p.id}</p>
                  </div>
                  <PrestamoEstadoBadge estado={p.estado} />
                </div>
                <div className="mt-3 flex items-end justify-between">
                  <div>
                    <p className="text-xs text-muted-foreground">Total actual</p>
                    <p className="text-xl font-semibold tabular-nums">
                      {formatCurrency(p.montoTotalActual)}
                    </p>
                  </div>
                  <div className="text-right text-sm">
                    <p className="text-muted-foreground">{FRECUENCIA_LABEL[p.frecuencia]}</p>
                    <p className="text-muted-foreground">Vence {formatDate(p.fechaVencimiento)}</p>
                  </div>
                </div>
                {p.estado !== "CANCELADO" ? (
                  <div className="mt-4 flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      className="flex-1"
                      onClick={() => openAccion(p, "renovar")}
                    >
                      <RefreshCw className="size-4" />
                      Renovar
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      className="flex-1"
                      onClick={() => openAccion(p, "cancelar")}
                    >
                      <CheckCircle2 className="size-4" />
                      Cancelar
                    </Button>
                  </div>
                ) : null}
              </div>
            ))}
          </div>
        </>
      )}

      <AccionPrestamoDialog
        prestamo={accion?.prestamo ?? null}
        modo={accion?.modo ?? "renovar"}
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        onDone={() => mutate()}
      />
    </div>
  )
}

function PrestamoActions({
  prestamo,
  onAccion,
}: {
  prestamo: Prestamo
  onAccion: (p: Prestamo, modo: "renovar" | "cancelar") => void
}) {
  if (prestamo.estado === "CANCELADO") {
    return <span className="sr-only">Préstamo cancelado</span>
  }
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon" aria-label="Acciones del préstamo">
          <MoreHorizontal className="size-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuItem onSelect={() => onAccion(prestamo, "renovar")}>
          <RefreshCw className="size-4" />
          Renovar (abonar intereses)
        </DropdownMenuItem>
        <DropdownMenuItem onSelect={() => onAccion(prestamo, "cancelar")}>
          <CheckCircle2 className="size-4" />
          Cancelar (pago total)
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
