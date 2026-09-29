"use client"

import { useState, useMemo } from "react"
import { Plus } from "lucide-react"
import { toast } from "sonner"
import { usePrestamoActions, useClientes } from "@/lib/hooks"
import { ApiError } from "@/lib/api"
import { FRECUENCIA_OPTIONS } from "@/lib/constants"
import { formatCurrency } from "@/lib/format"
import type { FrecuenciaPago } from "@/lib/types"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  DialogTrigger,
  DialogClose,
} from "@/components/ui/dialog"

export function NuevoPrestamoDialog({
  onCreated,
  defaultClienteId,
}: {
  onCreated?: () => void
  defaultClienteId?: number
}) {
  const { clientes } = useClientes()
  const { crearPrestamo } = usePrestamoActions()
  const [open, setOpen] = useState(false)
  const [submitting, setSubmitting] = useState(false)

  const [clienteId, setClienteId] = useState<string>(defaultClienteId ? String(defaultClienteId) : "")
  const [frecuencia, setFrecuencia] = useState<FrecuenciaPago>("MENSUAL")
  const [capital, setCapital] = useState("")
  const [recargo, setRecargo] = useState("")

  const total = useMemo(() => {
    const c = Number(capital)
    const r = Number(recargo)
    if (!c || Number.isNaN(c) || Number.isNaN(r)) return null
    return c * (1 + r / 100)
  }, [capital, recargo])

  function reset() {
    setClienteId(defaultClienteId ? String(defaultClienteId) : "")
    setFrecuencia("MENSUAL")
    setCapital("")
    setRecargo("")
  }

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    const capitalNum = Number(capital)
    const recargoNum = Number(recargo)

    if (!clienteId) {
      toast.error("Seleccioná un cliente")
      return
    }
    if (!capitalNum || capitalNum <= 0) {
      toast.error("Ingresá un capital válido")
      return
    }
    if (Number.isNaN(recargoNum) || recargoNum < 0) {
      toast.error("Ingresá un porcentaje de recargo válido")
      return
    }

    setSubmitting(true)
    try {
      await crearPrestamo({
        clienteId: Number(clienteId),
        montoCapital: capitalNum,
        porcentajeRecargo: recargoNum,
        frecuencia,
      })
      toast.success("Préstamo creado correctamente")
      setOpen(false)
      reset()
      onCreated?.()
    } catch (err) {
      toast.error(err instanceof ApiError ? err.message : "No se pudo crear el préstamo")
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <Dialog
      open={open}
      onOpenChange={(v) => {
        setOpen(v)
        if (!v) reset()
      }}
    >
      <DialogTrigger asChild>
        <Button>
          <Plus className="size-4" />
          Nuevo préstamo
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Otorgar préstamo</DialogTitle>
          <DialogDescription>Definí el capital, recargo y frecuencia de cobro.</DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="p-cliente">Cliente *</Label>
            <Select value={clienteId} onValueChange={setClienteId}>
              <SelectTrigger id="p-cliente">
                <SelectValue placeholder="Seleccioná un cliente" />
              </SelectTrigger>
              <SelectContent>
                {clientes.length === 0 ? (
                  <div className="px-3 py-2 text-sm text-muted-foreground">No hay clientes</div>
                ) : (
                  clientes.map((c) => (
                    <SelectItem key={c.id} value={String(c.id)}>
                      {c.nombre}
                    </SelectItem>
                  ))
                )}
              </SelectContent>
            </Select>
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="p-capital">Capital *</Label>
              <Input
                id="p-capital"
                value={capital}
                onChange={(e) => setCapital(e.target.value)}
                type="number"
                min="0"
                step="0.01"
                inputMode="decimal"
                placeholder="0.00"
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="p-recargo">Recargo (%) *</Label>
              <Input
                id="p-recargo"
                value={recargo}
                onChange={(e) => setRecargo(e.target.value)}
                type="number"
                min="0"
                step="0.01"
                inputMode="decimal"
                placeholder="0"
                required
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="p-frecuencia">Frecuencia de cobro *</Label>
            <Select value={frecuencia} onValueChange={(v) => setFrecuencia(v as FrecuenciaPago)}>
              <SelectTrigger id="p-frecuencia">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {FRECUENCIA_OPTIONS.map((f) => (
                  <SelectItem key={f.value} value={f.value}>
                    {f.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="flex items-center justify-between rounded-lg border border-border bg-secondary/50 px-4 py-3">
            <span className="text-sm text-muted-foreground">Total a devolver</span>
            <span className="text-lg font-semibold tabular-nums">
              {total !== null ? formatCurrency(total) : "—"}
            </span>
          </div>

          <DialogFooter>
            <DialogClose asChild>
              <Button type="button" variant="outline">
                Cancelar
              </Button>
            </DialogClose>
            <Button type="submit" loading={submitting}>
              Crear préstamo
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
