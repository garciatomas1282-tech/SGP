"use client"

import { useState, useMemo } from "react"
import Link from "next/link"
import { Users, Search, Phone, ChevronRight } from "lucide-react"
import { useClientes } from "@/lib/hooks"
import { initials } from "@/lib/format"
import { PageHeader } from "@/components/page-header"
import { NuevoClienteDialog } from "@/components/clientes/nuevo-cliente-dialog"
import { ClienteEstadoBadge } from "@/components/status-badge"
import { Input } from "@/components/ui/input"
import { EmptyState } from "@/components/ui/empty-state"
import { Skeleton } from "@/components/ui/skeleton"
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
} from "@/components/ui/table"

export default function ClientesPage() {
  const { clientes, isLoading, mutate } = useClientes()
  const [query, setQuery] = useState("")

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase()
    if (!q) return clientes
    return clientes.filter(
      (c) =>
        c.nombre.toLowerCase().includes(q) ||
        (c.dni ?? "").toLowerCase().includes(q) ||
        (c.telefono ?? "").toLowerCase().includes(q),
    )
  }, [clientes, query])

  return (
    <div>
      <PageHeader
        title="Clientes"
        description="Gestioná los clientes de tu cartera."
        action={<NuevoClienteDialog onCreated={() => mutate()} />}
      />

      <div className="mb-4 max-w-sm">
        <div className="relative">
          <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Buscar por nombre, DNI o teléfono"
            className="pl-9"
          />
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
          icon={Users}
          title={query ? "Sin resultados" : "Todavía no hay clientes"}
          description={
            query
              ? "Probá con otro término de búsqueda."
              : "Registrá tu primer cliente para empezar a otorgar préstamos."
          }
          action={query ? undefined : <NuevoClienteDialog onCreated={() => mutate()} />}
        />
      ) : (
        <>
          {/* Tabla en escritorio */}
          <div className="hidden overflow-hidden rounded-xl border border-border bg-card shadow-sm md:block">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Cliente</TableHead>
                  <TableHead>DNI</TableHead>
                  <TableHead>Teléfono</TableHead>
                  <TableHead>Estado</TableHead>
                  <TableHead className="w-10" />
                </TableRow>
              </TableHeader>
              <TableBody>
                {filtered.map((c) => (
                  <TableRow key={c.id} className="group cursor-pointer">
                    <TableCell>
                      <Link href={`/clientes/${c.id}`} className="flex items-center gap-3">
                        <span className="flex size-9 shrink-0 items-center justify-center rounded-full bg-secondary text-xs font-semibold">
                          {initials(c.nombre)}
                        </span>
                        <span className="font-medium text-foreground">{c.nombre}</span>
                      </Link>
                    </TableCell>
                    <TableCell className="tabular-nums text-muted-foreground">{c.dni || "—"}</TableCell>
                    <TableCell className="text-muted-foreground">{c.telefono || "—"}</TableCell>
                    <TableCell>
                      <ClienteEstadoBadge estado={c.estado} />
                    </TableCell>
                    <TableCell>
                      <Link
                        href={`/clientes/${c.id}`}
                        className="flex items-center justify-end text-muted-foreground transition-colors group-hover:text-foreground"
                        aria-label={`Ver ${c.nombre}`}
                      >
                        <ChevronRight className="size-4" />
                      </Link>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>

          {/* Tarjetas en móvil */}
          <div className="space-y-3 md:hidden">
            {filtered.map((c) => (
              <Link
                key={c.id}
                href={`/clientes/${c.id}`}
                className="flex items-center gap-3 rounded-xl border border-border bg-card p-4 shadow-sm"
              >
                <span className="flex size-11 shrink-0 items-center justify-center rounded-full bg-secondary text-sm font-semibold">
                  {initials(c.nombre)}
                </span>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center justify-between gap-2">
                    <p className="truncate font-medium">{c.nombre}</p>
                    <ClienteEstadoBadge estado={c.estado} />
                  </div>
                  <p className="mt-0.5 flex items-center gap-1.5 text-sm text-muted-foreground">
                    <Phone className="size-3.5" />
                    {c.telefono || "Sin teléfono"}
                  </p>
                </div>
              </Link>
            ))}
          </div>
        </>
      )}
    </div>
  )
}
