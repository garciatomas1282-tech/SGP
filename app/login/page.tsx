"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { HandCoins, Loader2 } from "lucide-react"
import { toast } from "sonner"
import { useAuth } from "@/lib/auth-context"
import { ApiError } from "@/lib/api"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs"

export default function LoginPage() {
  const { user, loading, login, register } = useAuth()
  const router = useRouter()
  const [submitting, setSubmitting] = useState(false)

  useEffect(() => {
    if (!loading && user) router.replace("/")
  }, [loading, user, router])

  async function handleLogin(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    const form = new FormData(e.currentTarget)
    const email = String(form.get("email") || "").trim()
    const password = String(form.get("password") || "")
    if (!email || !password) return
    setSubmitting(true)
    try {
      await login(email, password)
      toast.success("Bienvenido de nuevo")
      router.replace("/")
    } catch (err) {
      toast.error(err instanceof ApiError ? err.message : "No se pudo iniciar sesión")
    } finally {
      setSubmitting(false)
    }
  }

  async function handleRegister(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    const form = new FormData(e.currentTarget)
    const nombre = String(form.get("nombre") || "").trim()
    const email = String(form.get("email") || "").trim()
    const password = String(form.get("password") || "")
    if (!nombre || !email || !password) return
    if (password.length < 6) {
      toast.error("La contraseña debe tener al menos 6 caracteres")
      return
    }
    setSubmitting(true)
    try {
      await register(nombre, email, password)
      toast.success("Cuenta creada correctamente")
      router.replace("/")
    } catch (err) {
      toast.error(err instanceof ApiError ? err.message : "No se pudo crear la cuenta")
    } finally {
      setSubmitting(false)
    }
  }

  if (loading || user) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <Loader2 className="size-6 animate-spin text-muted-foreground" />
      </div>
    )
  }

  return (
    <div className="flex min-h-screen flex-col bg-background lg:flex-row">
      {/* Panel de marca */}
      <div className="relative hidden overflow-hidden bg-primary lg:flex lg:w-1/2 lg:flex-col lg:justify-between lg:p-12">
        <div className="flex items-center gap-3 text-primary-foreground">
          <div className="flex size-10 items-center justify-center rounded-xl bg-white/15">
            <HandCoins className="size-6" />
          </div>
          <span className="text-lg font-semibold">SGP</span>
        </div>
        <div className="space-y-4 text-primary-foreground">
          <h2 className="text-balance text-3xl font-semibold leading-tight">
            Gestión de préstamos simple y bajo control
          </h2>
          <p className="max-w-md text-pretty text-sm text-primary-foreground/80">
            Administrá clientes, préstamos, renovaciones y cancelaciones. Seguí de cerca los
            vencimientos y la mora desde un panel unificado.
          </p>
        </div>
        <div
          aria-hidden
          className="pointer-events-none absolute -right-24 -top-24 size-72 rounded-full bg-white/10 blur-2xl"
        />
        <div
          aria-hidden
          className="pointer-events-none absolute -bottom-32 -left-16 size-80 rounded-full bg-white/10 blur-2xl"
        />
      </div>

      {/* Panel de formulario */}
      <div className="flex flex-1 items-center justify-center px-4 py-12 sm:px-6">
        <div className="w-full max-w-md">
          <div className="mb-8 flex items-center gap-3 lg:hidden">
            <div className="flex size-10 items-center justify-center rounded-xl bg-primary text-primary-foreground">
              <HandCoins className="size-6" />
            </div>
            <span className="text-lg font-semibold">SGP</span>
          </div>

          <div className="mb-6 space-y-1">
            <h1 className="text-2xl font-semibold tracking-tight">Acceso al sistema</h1>
            <p className="text-sm text-muted-foreground">
              Ingresá con tu cuenta o registrate como prestamista.
            </p>
          </div>

          <Tabs defaultValue="login">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="login">Iniciar sesión</TabsTrigger>
              <TabsTrigger value="register">Crear cuenta</TabsTrigger>
            </TabsList>

            <TabsContent value="login">
              <form onSubmit={handleLogin} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="login-email">Correo electrónico</Label>
                  <Input id="login-email" name="email" type="email" autoComplete="email" placeholder="tu@correo.com" required />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="login-password">Contraseña</Label>
                  <Input id="login-password" name="password" type="password" autoComplete="current-password" placeholder="••••••••" required />
                </div>
                <Button type="submit" className="w-full" size="lg" loading={submitting}>
                  Iniciar sesión
                </Button>
              </form>
            </TabsContent>

            <TabsContent value="register">
              <form onSubmit={handleRegister} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="reg-nombre">Nombre completo</Label>
                  <Input id="reg-nombre" name="nombre" type="text" autoComplete="name" placeholder="Juan Pérez" required />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="reg-email">Correo electrónico</Label>
                  <Input id="reg-email" name="email" type="email" autoComplete="email" placeholder="tu@correo.com" required />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="reg-password">Contraseña</Label>
                  <Input id="reg-password" name="password" type="password" autoComplete="new-password" placeholder="Mínimo 6 caracteres" required />
                </div>
                <Button type="submit" className="w-full" size="lg" loading={submitting}>
                  Crear cuenta
                </Button>
              </form>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  )
}
