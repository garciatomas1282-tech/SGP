"use client"

import { useState } from "react"
import { UserPlus } from "lucide-react"
import { toast } from "sonner"
import { useClienteActions } from "@/lib/hooks"
import { ApiError } from "@/lib/api"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
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

export function NuevoClienteDialog({ onCreated }: { onCreated?: () => void }) {
  const { crearCliente } = useClienteActions()
  const [open, setOpen] = useState(false)
  const [submitting, setSubmitting] = useState(false)

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    const form = new FormData(e.currentTarget)
    const nombre = String(form.get("nombre") || "").trim()
    const dni = String(form.get("dni") || "").trim()
    const telefono = String(form.get("telefono") || "").trim()
    const direccion = String(form.get("direccion") || "").trim()

    if (!nombre || !telefono) {
      toast.error("Nombre y teléfono son obligatorios")
      return
    }

    setSubmitting(true)
    try {
      await crearCliente({
        nombre,
        dni: dni || undefined,
        telefono,
        direccion: direccion || undefined,
      })
      toast.success("Cliente registrado correctamente")
      setOpen(false)
      onCreated?.()
    } catch (err) {
      toast.error(err instanceof ApiError ? err.message : "No se pudo registrar el cliente")
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>
          <UserPlus className="size-4" />
          Nuevo cliente
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Registrar cliente</DialogTitle>
          <DialogDescription>Completá los datos del nuevo cliente.</DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="c-nombre">Nombre completo *</Label>
            <Input id="c-nombre" name="nombre" placeholder="Juan Pérez" required />
          </div>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="c-dni">DNI</Label>
              <Input id="c-dni" name="dni" placeholder="30.123.456" inputMode="numeric" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="c-telefono">Teléfono *</Label>
              <Input id="c-telefono" name="telefono" placeholder="11 5555-5555" inputMode="tel" required />
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="c-direccion">Dirección</Label>
            <Textarea id="c-direccion" name="direccion" placeholder="Calle, número, localidad" rows={2} />
          </div>
          <DialogFooter>
            <DialogClose asChild>
              <Button type="button" variant="outline">
                Cancelar
              </Button>
            </DialogClose>
            <Button type="submit" loading={submitting}>
              Registrar cliente
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
