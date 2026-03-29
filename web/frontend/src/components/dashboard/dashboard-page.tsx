import React from "react"

import {
  IconAtom,
  IconBolt,
  IconChevronRight,
  IconHistory,
  IconLoader2,
  IconMessageCircle,
  IconPlayerPlay,
  IconPower,
  IconRadio,
  IconSettings,
  IconSparkles,
  IconTrendingUp,
} from "@tabler/icons-react"
import { useQuery } from "@tanstack/react-query"
import { Link } from "@tanstack/react-router"
import dayjs from "dayjs"
import { useTranslation } from "react-i18next"

import { getChannelsCatalog } from "@/api/channels"
import { getModels } from "@/api/models"
import { getSessions } from "@/api/sessions"
import { PageHeader } from "@/components/page-header"
import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"
import { useGateway } from "@/hooks/use-gateway"

function GlassCard({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  return (
    <div className={`rounded-3xl border border-white/50 bg-white/60 shadow-lg shadow-purple-500/10 backdrop-blur-xl dark:border-white/10 dark:bg-white/5 ${className}`}>
      {children}
    </div>
  )
}

function MiniPieChart({ filled, total }: { filled: number; total: number }) {
  if (total === 0) return <div className="h-12 w-12 rounded-full bg-purple-100/60" />
  const pct = Math.min(filled / total, 1)
  const r = 20
  const circ = 2 * Math.PI * r
  const dash = pct * circ
  return (
    <svg width="48" height="48" viewBox="0 0 48 48">
      <circle cx="24" cy="24" r={r} fill="none" stroke="#e9d5ff" strokeWidth="6" />
      <circle
        cx="24" cy="24" r={r} fill="none"
        stroke="url(#pg)" strokeWidth="6"
        strokeDasharray={`${dash} ${circ - dash}`}
        strokeLinecap="round"
        transform="rotate(-90 24 24)"
      />
      <defs>
        <linearGradient id="pg" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stopColor="#a855f7" />
          <stop offset="100%" stopColor="#ec4899" />
        </linearGradient>
      </defs>
    </svg>
  )
}

function ColorBar({ value, max, color }: { value: number; max: number; color: string }) {
  const pct = max > 0 ? Math.min((value / max) * 100, 100) : 0
  return (
    <div className="h-1.5 w-full overflow-hidden rounded-full bg-black/5 dark:bg-white/10">
      <div
        className={`h-full rounded-full transition-all duration-700 ${color}`}
        style={{ width: `${pct}%` }}
      />
    </div>
  )
}

export function DashboardPage() {
  const { t } = useTranslation()
  const {
    state: gwState,
    loading: gwLoading,
    canStart,
    start,
    stop,
  } = useGateway()

  const isRunning = gwState === "running"
  const isStarting = gwState === "starting"
  const isRestarting = gwState === "restarting"
  const isStopping = gwState === "stopping"
  const isTransitioning = isStarting || isRestarting || isStopping

  const { data: modelsData, isLoading: modelsLoading } = useQuery({
    queryKey: ["models"],
    queryFn: getModels,
  })

  const { data: channelsData, isLoading: channelsLoading } = useQuery({
    queryKey: ["channels-catalog"],
    queryFn: getChannelsCatalog,
  })

  const { data: sessionsData, isLoading: sessionsLoading } = useQuery({
    queryKey: ["sessions-recent"],
    queryFn: () => getSessions(0, 6),
  })

  const configuredModels = modelsData?.models.filter((m) => m.configured).length ?? 0
  const totalModels = modelsData?.total ?? 0
  const defaultModel = modelsData?.default_model
  const channelsCount = channelsData?.channels.length ?? 0
  const sessionsCount = sessionsData?.length ?? 0

  const gwStatusLabel = isRunning
    ? t("dashboard.gateway.running")
    : isStarting
      ? t("dashboard.gateway.starting")
      : isRestarting
        ? t("dashboard.gateway.restarting")
        : isStopping
          ? t("dashboard.gateway.stopping")
          : t("dashboard.gateway.stopped")

  const statCards = [
    {
      label: t("dashboard.gateway.title"),
      value: gwStatusLabel,
      icon: IconBolt,
      iconColor: "text-violet-500",
      iconBg: "bg-violet-500/10",
      gradient: "from-violet-500/5 to-purple-500/5",
      extra: (
        <Button
          variant={isRunning ? "destructive" : "default"}
          size="sm"
          className={`mt-3 h-7 w-full gap-1.5 text-xs transition-all hover:scale-105 ${
            !isRunning && canStart && !isTransitioning
              ? "bg-gradient-to-r from-green-500 to-emerald-500 text-white shadow-sm shadow-green-500/30 hover:from-green-600 hover:to-emerald-600"
              : ""
          }`}
          onClick={() => (isRunning ? void stop() : void start())}
          disabled={gwLoading || isTransitioning || (!isRunning && !canStart)}
        >
          {gwLoading || isTransitioning ? (
            <IconLoader2 className="size-3 animate-spin" />
          ) : isRunning ? (
            <IconPower className="size-3" />
          ) : (
            <IconPlayerPlay className="size-3" />
          )}
          {isRunning ? t("header.gateway.action.stop") : t("header.gateway.action.start")}
        </Button>
      ),
      indicator: (
        <span className="relative flex size-2.5 shrink-0">
          <span className={`relative inline-flex size-2.5 rounded-full ${isRunning ? "bg-green-500" : isTransitioning ? "bg-amber-400" : "bg-muted-foreground/40"}`} />
          {isRunning && <span className="absolute inline-flex size-full animate-ping rounded-full bg-green-400 opacity-75" />}
        </span>
      ),
    },
    {
      label: t("navigation.models"),
      value: modelsLoading ? "—" : String(configuredModels),
      icon: IconAtom,
      iconColor: "text-blue-500",
      iconBg: "bg-blue-500/10",
      gradient: "from-blue-500/5 to-cyan-500/5",
      sub: modelsLoading ? null : t("dashboard.models.configured", { total: totalModels }),
      sub2: defaultModel,
      chart: modelsLoading ? null : <MiniPieChart filled={configuredModels} total={totalModels} />,
      bar: modelsLoading ? null : <ColorBar value={configuredModels} max={totalModels} color="bg-gradient-to-r from-blue-500 to-cyan-400" />,
    },
    {
      label: t("navigation.channels_group"),
      value: channelsLoading ? "—" : String(channelsCount),
      icon: IconRadio,
      iconColor: "text-orange-500",
      iconBg: "bg-orange-500/10",
      gradient: "from-orange-500/5 to-amber-500/5",
      sub: channelsLoading ? null : t("dashboard.channels.available"),
      bar: channelsLoading ? null : <ColorBar value={channelsCount} max={12} color="bg-gradient-to-r from-orange-500 to-amber-400" />,
    },
    {
      label: t("dashboard.sessions.title"),
      value: sessionsLoading ? "—" : String(sessionsCount),
      icon: IconHistory,
      iconColor: "text-teal-500",
      iconBg: "bg-teal-500/10",
      gradient: "from-teal-500/5 to-emerald-500/5",
      sub: sessionsLoading ? null : t("dashboard.sessions.recent"),
      bar: sessionsLoading ? null : <ColorBar value={sessionsCount} max={20} color="bg-gradient-to-r from-teal-500 to-emerald-400" />,
      trend: <span className="flex items-center gap-0.5 text-[10px] font-medium text-emerald-500"><IconTrendingUp className="size-3" />+{sessionsCount}</span>,
    },
  ]

  return (
    <div className="flex h-full flex-col overflow-y-auto">
      <PageHeader title={t("navigation.dashboard")} />

      <div className="flex-1 px-4 py-6 md:px-8 lg:px-12">
        <div className="mx-auto max-w-5xl space-y-6">

          {/* Header gradient text */}
          <div>
            <h2 className="bg-gradient-to-r from-purple-600 to-fuchsia-600 bg-clip-text text-2xl font-bold text-transparent">
              Social Hub
            </h2>
            <p className="text-muted-foreground text-sm">Visão geral do sistema</p>
          </div>

          {/* Stat Cards */}
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {statCards.map((card) => (
              <GlassCard key={card.label} className={`bg-gradient-to-br ${card.gradient} p-4`}>
                <div className="flex items-start justify-between">
                  <div>
                    <p className="text-muted-foreground text-[11px] font-semibold uppercase tracking-wider">
                      {card.label}
                    </p>
                    <div className="mt-1 flex items-center gap-2">
                      {"indicator" in card && card.indicator}
                      <span className="text-2xl font-bold">{card.value}</span>
                    </div>
                    {"sub" in card && card.sub && (
                      <p className="text-muted-foreground mt-0.5 text-[11px]">{card.sub}</p>
                    )}
                    {"sub2" in card && card.sub2 && (
                      <p className="text-muted-foreground mt-0.5 truncate text-[11px] font-medium">↳ {card.sub2}</p>
                    )}
                    {"trend" in card && card.trend}
                  </div>
                  <div className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-2xl ${card.iconBg}`}>
                    <card.icon className={`size-4 ${card.iconColor}`} />
                  </div>
                </div>
                {"chart" in card && card.chart && (
                  <div className="mt-3 flex items-center justify-center">
                    {card.chart}
                  </div>
                )}
                {"bar" in card && card.bar && (
                  <div className="mt-3">{card.bar}</div>
                )}
                {"extra" in card && card.extra}
              </GlassCard>
            ))}
          </div>

          {/* Second Row */}
          <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">

            {/* Recent Sessions */}
            <GlassCard className="p-5">
              <div className="mb-4 flex items-center justify-between">
                <h3 className="bg-gradient-to-r from-purple-600 to-fuchsia-600 bg-clip-text text-sm font-semibold text-transparent">
                  {t("dashboard.sessions.recentTitle")}
                </h3>
                <Link to="/">
                  <button className="flex items-center gap-1 rounded-xl px-2 py-1 text-xs font-medium text-muted-foreground transition-all hover:bg-purple-500/10 hover:text-purple-600">
                    {t("chat.history")}
                    <IconChevronRight className="size-3" />
                  </button>
                </Link>
              </div>
              {sessionsLoading ? (
                <div className="space-y-2">
                  {Array.from({ length: 4 }).map((_, i) => (
                    <Skeleton key={i} className="h-12 w-full rounded-2xl" />
                  ))}
                </div>
              ) : !sessionsData || sessionsData.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-8 text-center">
                  <div className="mb-2 flex h-12 w-12 items-center justify-center rounded-2xl bg-purple-500/10">
                    <IconHistory className="size-6 text-purple-400" />
                  </div>
                  <p className="text-muted-foreground text-sm">{t("chat.noHistory")}</p>
                  <Link to="/">
                    <button className="mt-3 rounded-xl bg-gradient-to-r from-purple-500 to-fuchsia-500 px-4 py-1.5 text-xs font-medium text-white shadow-sm shadow-purple-500/30 transition-all hover:scale-105">
                      {t("dashboard.sessions.startChat")}
                    </button>
                  </Link>
                </div>
              ) : (
                <div className="space-y-1">
                  {sessionsData.map((session) => (
                    <Link key={session.id} to="/">
                      <div className="flex items-start rounded-2xl px-3 py-2.5 transition-all hover:bg-purple-500/5">
                        <div className="mr-3 flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-purple-500/10">
                          <IconMessageCircle className="size-3.5 text-purple-500" />
                        </div>
                        <div className="min-w-0 flex-1">
                          <p className="truncate text-sm font-medium">
                            {session.title || session.preview}
                          </p>
                          <p className="text-muted-foreground mt-0.5 text-xs">
                            {dayjs(session.updated).format("MMM D, HH:mm")}
                            {" · "}
                            {t("chat.messagesCount", { count: session.message_count })}
                          </p>
                        </div>
                        <IconChevronRight className="text-muted-foreground/40 ml-2 mt-1 size-3.5 shrink-0" />
                      </div>
                    </Link>
                  ))}
                </div>
              )}
            </GlassCard>

            {/* Quick Actions */}
            <GlassCard className="p-5">
              <h3 className="mb-4 bg-gradient-to-r from-purple-600 to-fuchsia-600 bg-clip-text text-sm font-semibold text-transparent">
                {t("dashboard.quickActions.title")}
              </h3>
              <div className="space-y-1.5">
                {[
                  { to: "/", icon: IconMessageCircle, bg: "bg-violet-500/10", color: "text-violet-500", title: t("dashboard.quickActions.chat"), desc: t("dashboard.quickActions.chatDesc") },
                  { to: "/models", icon: IconAtom, bg: "bg-blue-500/10", color: "text-blue-500", title: t("dashboard.quickActions.models"), desc: t("dashboard.quickActions.modelsDesc") },
                  { to: "/agent/skills", icon: IconSparkles, bg: "bg-amber-500/10", color: "text-amber-500", title: t("dashboard.quickActions.skills"), desc: t("dashboard.quickActions.skillsDesc") },
                  { to: "/config", icon: IconSettings, bg: "bg-slate-500/10", color: "text-slate-500", title: t("dashboard.quickActions.config"), desc: t("dashboard.quickActions.configDesc") },
                ].map((action) => (
                  <Link key={action.to} to={action.to}>
                    <div className="flex items-center rounded-2xl px-3 py-2.5 transition-all hover:bg-gradient-to-r hover:from-purple-500/5 hover:to-fuchsia-500/5 hover:scale-[1.01]">
                      <div className={`mr-3 flex h-9 w-9 shrink-0 items-center justify-center rounded-2xl ${action.bg}`}>
                        <action.icon className={`size-4 ${action.color}`} />
                      </div>
                      <div className="flex-1">
                        <p className="text-sm font-medium">{action.title}</p>
                        <p className="text-muted-foreground text-xs">{action.desc}</p>
                      </div>
                      <IconChevronRight className="text-muted-foreground/50 size-4" />
                    </div>
                  </Link>
                ))}
              </div>
            </GlassCard>
          </div>
        </div>
      </div>
    </div>
  )
}
