"use client"

import { use, useMemo } from "react"
import Link from "next/link"
import { ArrowLeft, Phone, MapPin, IdCard, HandCoins, Loader2 } from "lucide-react"
import { useCliente, usePrestamos } from "@/lib/hooks"
import { formatCurrency, formatDate, initials } from "@/lib/format"
import { FRECUENCIA_LABEL } from "@/lib/constants"
import { ClienteEstadoBadge, PrestamoEstadoBadge } from "@/components/status-badge"
import { EmptyState } from "@/components/ui/empty-state"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"

export default function ClienteDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params)
  const clienteId = Number(id)
  const { cliente, isLoading, error } = useCliente(clienteId)
  const { prestamos } = usePrestamos()

  const prestamosCliente = useMemo(
    () => prestamos.filter((p) => p.cliente?.id === clienteId),
    [prestamos, clienteId],
  )

  if (isLoading) {
    return (
      <div className="flex min-h-[50vh] items-center justify-center">
        <Loader2 className="size-6 animate-spin text-muted-foreground" />
      </div>
    )
  }

  if (error || !cliente) {
    return (
      <div>
        <BackLink />
        <EmptyState
          icon={HandCoins}
          title="Cliente no encontrado"
          description="El cliente que buscás no existe o no pertenece a tu cartera."
          action={
            <Button asChild variant="outline">
              <Link href="/clientes">Volver a clientes</Link>
            </Button>
          }
        />
      </div>
    )
  }

  return (
    <div>
      <BackLink />

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Ficha del cliente */}
        <Card className="lg:col-span-1">
          <div className="flex flex-col items-center gap-3 border-b border-border pb-5 text-center">
            <span className="flex size-16 items-center justify-center rounded-full bg-secondary text-xl font-semibold">
              {initials(cliente.nombre)}
            </span>
            <div>
              <h1 className="text-lg font-semibold tracking-tight">{cliente.nombre}</h1>
              <div className="mt-1.5">
                <ClienteEstadoBadge estado={cliente.estado} />
              </div>
            </div>
          </div>
          <dl className="space-y-4 pt-5">
            <InfoRow icon={IdCard} label="DNI" value={cliente.dni || "No registrado"} />
            <InfoRow icon={Phone} label="Teléfono" value={cliente.telefono || "No registrado"} />
            <InfoRow icon={MapPin} label="Dirección" value={cliente.direccion || "No registrada"} />
          </dl>
        </Card>

        {/* Préstamos del cliente */}
        <div className="lg:col-span-2">
          <div className="mb-3 flex items-center justify-between">
            <h2 className="text-lg font-semibold tracking-tight">Préstamos</h2>
            <span className="text-sm text-muted-foreground">
              {prestamosCliente.length} {prestamosCliente.length === 1 ? "préstamo" : "préstamos"}
            </span>
          </div>

          {prestamosCliente.length === 0 ? (
            <EmptyState
              icon={HandCoins}
              title="Sin préstamos"
              description="Este cliente todavía no tiene préstamos registrados."
              action={
                <Button asChild variant="outline">
                  <Link href="/prestamos">Ir a préstamos</Link>
                </Button>
              }
            />
          ) : (
            <div className="space-y-3">
              {prestamosCliente.map((p) => (
                <Link
                  key={p.id}
                  href={`/prestamos?focus=${p.id}`}
                  className="block rounded-xl border border-border bg-card p-4 shadow-sm transition-colors hover:border-primary/40"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="text-sm text-muted-foreground">Préstamo #{p.id}</p>
                      <p className="mt-0.5 text-xl font-semibold tabular-nums">
                        {formatCurrency(p.montoTotalActual)}
                      </p>
                    </div>
                    <PrestamoEstadoBadge estado={p.estado} />
                  </div>
                  <div className="mt-3 grid grid-cols-2 gap-3 text-sm sm:grid-cols-4">
                    <Meta label="Capital" value={formatCurrency(p.montoCapital)} />
                    <Meta label="Recargo" value={`${p.porcentajeRecargo}%`} />
                    <Meta label="Frecuencia" value={FRECUENCIA_LABEL[p.frecuencia]} />
                    <Meta label="Vence" value={formatDate(p.fechaVencimiento)} />
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

function BackLink() {
  return (
    <Link
      href="/clientes"
      className="mb-5 inline-flex items-center gap-1.5 text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
    >
      <ArrowLeft className="size-4" />
      Clientes
    </Link>
  )
}

function InfoRow({
  icon: Icon,
  label,
  value,
}: {
  icon: typeof Phone
  label: string
  value: string
}) {
  return (
    <div className="flex items-start gap-3">
      <span className="mt-0.5 flex size-8 shrink-0 items-center justify-center rounded-lg bg-secondary text-muted-foreground">
        <Icon className="size-4" />
      </span>
      <div className="min-w-0">
        <dt className="text-xs text-muted-foreground">{label}</dt>
        <dd className="text-sm font-medium text-foreground">{value}</dd>
      </div>
    </div>
  )
}

function Meta({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="text-xs text-muted-foreground">{label}</p>
      <p className="font-medium tabular-nums">{value}</p>
    </div>
  )
}
