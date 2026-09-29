"use client"

import { useState } from "react"
import { toast } from "sonner"
import { usePrestamoActions } from "@/lib/hooks"
import { ApiError } from "@/lib/api"
import { formatCurrency } from "@/lib/format"
import type { Prestamo } from "@/lib/types"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  DialogClose,
} from "@/components/ui/dialog"

type Modo = "renovar" | "cancelar"

interface AccionPrestamoDialogProps {
  prestamo: Prestamo | null
  modo: Modo
  open: boolean
  onOpenChange: (open: boolean) => void
  onDone?: () => void
}

export function AccionPrestamoDialog({
  prestamo,
  modo,
  open,
  onOpenChange,
  onDone,
}: AccionPrestamoDialogProps) {
  const { renovarPrestamo, cancelarPrestamo } = usePrestamoActions()
  const [monto, setMonto] = useState("")
  const [submitting, setSubmitting] = useState(false)

  const esRenovar = modo === "renovar"
  const titulo = esRenovar ? "Renovar préstamo" : "Cancelar préstamo"
  const descripcion = esRenovar
    ? "Registrá el abono de intereses. El capital continúa vigente y se renueva el vencimiento."
    : "Registrá el pago total para saldar el préstamo por completo."

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    if (!prestamo) return
    const montoNum = Number(monto)
    if (!montoNum || montoNum <= 0) {
      toast.error("Ingresá un monto válido")
      return
    }

    setSubmitting(true)
    try {
      if (esRenovar) {
        await renovarPrestamo(prestamo.id, montoNum)
        toast.success("Préstamo renovado correctamente")
      } else {
        await cancelarPrestamo(prestamo.id, montoNum)
        toast.success("Préstamo cancelado correctamente")
      }
      onOpenChange(false)
      setMonto("")
      onDone?.()
    } catch (err) {
      toast.error(err instanceof ApiError ? err.message : "No se pudo completar la operación")
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <Dialog
      open={open}
      onOpenChange={(v) => {
        onOpenChange(v)
        if (!v) setMonto("")
      }}
    >
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{titulo}</DialogTitle>
          <DialogDescription>{descripcion}</DialogDescription>
        </DialogHeader>

        {prestamo ? (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-3 rounded-lg border border-border bg-secondary/50 px-4 py-3 text-sm">
              <div>
                <p className="text-xs text-muted-foreground">Cliente</p>
                <p className="font-medium">{prestamo.cliente?.nombre ?? "—"}</p>
              </div>
              <div className="text-right">
                <p className="text-xs text-muted-foreground">Total actual</p>
                <p className="font-semibold tabular-nums">{formatCurrency(prestamo.montoTotalActual)}</p>
              </div>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="a-monto">Monto abonado *</Label>
                <Input
                  id="a-monto"
                  value={monto}
                  onChange={(e) => setMonto(e.target.value)}
                  type="number"
                  min="0"
                  step="0.01"
                  inputMode="decimal"
                  placeholder="0.00"
                  autoFocus
                  required
                />
              </div>
              <DialogFooter>
                <DialogClose asChild>
                  <Button type="button" variant="outline">
                    Cerrar
                  </Button>
                </DialogClose>
                <Button type="submit" variant={esRenovar ? "default" : "destructive"} loading={submitting}>
                  {esRenovar ? "Confirmar renovación" : "Confirmar cancelación"}
                </Button>
              </DialogFooter>
            </form>
          </div>
        ) : null}
      </DialogContent>
    </Dialog>
  )
}
