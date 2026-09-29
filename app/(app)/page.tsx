"use client"

import { CalendarClock, AlertTriangle, HandCoins, CalendarDays } from "lucide-react"
import { useAuth } from "@/lib/auth-context"
import { useDashboardMetricas, useAlertasDiarias } from "@/lib/hooks"
import { PageHeader } from "@/components/page-header"
import { StatCard } from "@/components/stat-card"
import { AlertColumn } from "@/components/dashboard/alertas-panel"

export default function DashboardPage() {
  const { user } = useAuth()
  const { metricas, isLoading: loadingMetricas } = useDashboardMetricas()
  const { alertas, isLoading: loadingAlertas } = useAlertasDiarias()

  const firstName = user?.nombre?.split(/\s+/)[0] ?? ""

  return (
    <div>
      <PageHeader
        title={`Hola${firstName ? `, ${firstName}` : ""}`}
        description="Resumen de tu cartera de préstamos y vencimientos del día."
      />

      <section className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <StatCard
          label="Préstamos activos"
          value={metricas?.totalPrestamosActivos ?? 0}
          icon={HandCoins}
          tone="info"
          loading={loadingMetricas}
        />
        <StatCard
          label="Cuotas vencen hoy"
          value={metricas?.cuotasVencenHoyCount ?? 0}
          icon={CalendarClock}
          tone="warning"
          loading={loadingMetricas}
        />
        <StatCard
          label="Cuotas en mora"
          value={metricas?.cuotasEnMoraCount ?? 0}
          icon={AlertTriangle}
          tone="danger"
          loading={loadingMetricas}
        />
      </section>

      <section className="mt-8">
        <h2 className="mb-3 text-lg font-semibold tracking-tight">Alertas de cobranza</h2>
        <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
          <AlertColumn
            title="Vencen hoy"
            icon={CalendarClock}
            tone="warning"
            cuotas={alertas?.vencenHoy ?? []}
            loading={loadingAlertas}
          />
          <AlertColumn
            title="Vencen mañana"
            icon={CalendarDays}
            tone="info"
            cuotas={alertas?.vencenManana ?? []}
            loading={loadingAlertas}
          />
          <AlertColumn
            title="Vencidas en mora"
            icon={AlertTriangle}
            tone="danger"
            cuotas={alertas?.vencidasEnMora ?? []}
            loading={loadingAlertas}
          />
        </div>
      </section>
    </div>
  )
}
