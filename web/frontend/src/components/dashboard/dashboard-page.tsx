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
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import { useGateway } from "@/hooks/use-gateway"

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

  const configuredModels =
    modelsData?.models.filter((m) => m.configured).length ?? 0
  const totalModels = modelsData?.total ?? 0
  const defaultModel = modelsData?.default_model
  const channelsCount = channelsData?.channels.length ?? 0
  const sessionsCount = sessionsData?.length ?? 0

  const gwStatusColor = isRunning
    ? "text-green-500"
    : isTransitioning
      ? "text-amber-500"
      : "text-muted-foreground"

  const gwStatusLabel = isRunning
    ? t("dashboard.gateway.running")
    : isStarting
      ? t("dashboard.gateway.starting")
      : isRestarting
        ? t("dashboard.gateway.restarting")
        : isStopping
          ? t("dashboard.gateway.stopping")
          : t("dashboard.gateway.stopped")

  return (
    <div className="flex h-full flex-col overflow-y-auto">
      <PageHeader title={t("navigation.dashboard")} />

      <div className="flex-1 px-4 py-6 md:px-8 lg:px-12">
        <div className="mx-auto max-w-5xl space-y-6">

          {/* Stat Cards Row */}
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">

            {/* Gateway Status Card */}
            <Card size="sm">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="text-muted-foreground text-xs font-medium uppercase tracking-wide">
                    {t("dashboard.gateway.title")}
                  </CardTitle>
                  <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-violet-500/10">
                    <IconBolt className="size-4 text-violet-500" />
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex items-center gap-2">
                    <span className="relative flex size-2.5 shrink-0">
                      <span
                        className={`relative inline-flex size-2.5 rounded-full ${
                          isRunning
                            ? "bg-green-500"
                            : isTransitioning
                              ? "bg-amber-400"
                              : "bg-muted-foreground/40"
                        }`}
                      />
                      {isRunning && (
                        <span className="absolute inline-flex size-full animate-ping rounded-full bg-green-400 opacity-75" />
                      )}
                    </span>
                    <span className={`text-sm font-semibold ${gwStatusColor}`}>
                      {gwStatusLabel}
                    </span>
                  </div>
                  <Button
                    variant={isRunning ? "destructive" : "default"}
                    size="sm"
                    className={`h-7 w-full gap-1.5 text-xs ${
                      !isRunning && canStart && !isTransitioning
                        ? "bg-green-500 text-white hover:bg-green-600"
                        : ""
                    }`}
                    onClick={() => (isRunning ? void stop() : void start())}
                    disabled={
                      gwLoading ||
                      isTransitioning ||
                      (!isRunning && !canStart)
                    }
                  >
                    {gwLoading || isTransitioning ? (
                      <IconLoader2 className="size-3 animate-spin" />
                    ) : isRunning ? (
                      <IconPower className="size-3" />
                    ) : (
                      <IconPlayerPlay className="size-3" />
                    )}
                    {isRunning
                      ? t("header.gateway.action.stop")
                      : t("header.gateway.action.start")}
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Models Card */}
            <Card size="sm">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="text-muted-foreground text-xs font-medium uppercase tracking-wide">
                    {t("navigation.models")}
                  </CardTitle>
                  <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-500/10">
                    <IconAtom className="size-4 text-blue-500" />
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                {modelsLoading ? (
                  <Skeleton className="h-12 w-full" />
                ) : (
                  <div className="space-y-1">
                    <div className="text-2xl font-bold">{configuredModels}</div>
                    <p className="text-muted-foreground text-xs">
                      {t("dashboard.models.configured", { total: totalModels })}
                    </p>
                    {defaultModel && (
                      <p className="text-muted-foreground truncate text-xs font-medium">
                        ↳ {defaultModel}
                      </p>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Channels Card */}
            <Card size="sm">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="text-muted-foreground text-xs font-medium uppercase tracking-wide">
                    {t("navigation.channels_group")}
                  </CardTitle>
                  <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-orange-500/10">
                    <IconRadio className="size-4 text-orange-500" />
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                {channelsLoading ? (
                  <Skeleton className="h-12 w-full" />
                ) : (
                  <div className="space-y-1">
                    <div className="text-2xl font-bold">{channelsCount}</div>
                    <p className="text-muted-foreground text-xs">
                      {t("dashboard.channels.available")}
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Sessions Card */}
            <Card size="sm">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="text-muted-foreground text-xs font-medium uppercase tracking-wide">
                    {t("dashboard.sessions.title")}
                  </CardTitle>
                  <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-teal-500/10">
                    <IconHistory className="size-4 text-teal-500" />
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                {sessionsLoading ? (
                  <Skeleton className="h-12 w-full" />
                ) : (
                  <div className="space-y-1">
                    <div className="text-2xl font-bold">{sessionsCount}</div>
                    <p className="text-muted-foreground text-xs">
                      {t("dashboard.sessions.recent")}
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Second Row: Recent Sessions + Quick Actions */}
          <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">

            {/* Recent Sessions */}
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="text-sm font-semibold">
                    {t("dashboard.sessions.recentTitle")}
                  </CardTitle>
                  <Link to="/">
                    <Button variant="ghost" size="sm" className="h-7 gap-1 text-xs">
                      {t("chat.history")}
                      <IconChevronRight className="size-3" />
                    </Button>
                  </Link>
                </div>
              </CardHeader>
              <CardContent>
                {sessionsLoading ? (
                  <div className="space-y-2">
                    {Array.from({ length: 4 }).map((_, i) => (
                      <Skeleton key={i} className="h-12 w-full" />
                    ))}
                  </div>
                ) : !sessionsData || sessionsData.length === 0 ? (
                  <div className="text-muted-foreground flex flex-col items-center justify-center py-8 text-center">
                    <IconHistory className="mb-2 size-8 opacity-30" />
                    <p className="text-sm">{t("chat.noHistory")}</p>
                    <Link to="/">
                      <Button variant="outline" size="sm" className="mt-3 h-7 text-xs">
                        {t("dashboard.sessions.startChat")}
                      </Button>
                    </Link>
                  </div>
                ) : (
                  <div className="space-y-0.5">
                    {sessionsData.map((session) => (
                      <Link key={session.id} to="/">
                        <div className="hover:bg-muted/60 flex items-start rounded-lg px-3 py-2.5 transition-colors">
                          <IconMessageCircle className="text-muted-foreground mt-0.5 mr-2.5 size-4 shrink-0" />
                          <div className="min-w-0 flex-1">
                            <p className="truncate text-sm font-medium">
                              {session.title || session.preview}
                            </p>
                            <p className="text-muted-foreground mt-0.5 text-xs">
                              {dayjs(session.updated).format("MMM D, HH:mm")}
                              {" · "}
                              {t("chat.messagesCount", {
                                count: session.message_count,
                              })}
                            </p>
                          </div>
                          <IconChevronRight className="text-muted-foreground/50 ml-2 mt-0.5 size-3.5 shrink-0" />
                        </div>
                      </Link>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Quick Actions */}
            <Card>
              <CardHeader>
                <CardTitle className="text-sm font-semibold">
                  {t("dashboard.quickActions.title")}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-1">
                  <Link to="/">
                    <div className="hover:bg-muted/60 flex items-center rounded-lg px-3 py-3 transition-colors">
                      <div className="mr-3 flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-violet-500/10">
                        <IconMessageCircle className="size-4 text-violet-500" />
                      </div>
                      <div className="flex-1">
                        <p className="text-sm font-medium">
                          {t("dashboard.quickActions.chat")}
                        </p>
                        <p className="text-muted-foreground text-xs">
                          {t("dashboard.quickActions.chatDesc")}
                        </p>
                      </div>
                      <IconChevronRight className="text-muted-foreground size-4" />
                    </div>
                  </Link>

                  <Link to="/models">
                    <div className="hover:bg-muted/60 flex items-center rounded-lg px-3 py-3 transition-colors">
                      <div className="mr-3 flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-blue-500/10">
                        <IconAtom className="size-4 text-blue-500" />
                      </div>
                      <div className="flex-1">
                        <p className="text-sm font-medium">
                          {t("dashboard.quickActions.models")}
                        </p>
                        <p className="text-muted-foreground text-xs">
                          {t("dashboard.quickActions.modelsDesc")}
                        </p>
                      </div>
                      <IconChevronRight className="text-muted-foreground size-4" />
                    </div>
                  </Link>

                  <Link to="/agent/skills">
                    <div className="hover:bg-muted/60 flex items-center rounded-lg px-3 py-3 transition-colors">
                      <div className="mr-3 flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-amber-500/10">
                        <IconSparkles className="size-4 text-amber-500" />
                      </div>
                      <div className="flex-1">
                        <p className="text-sm font-medium">
                          {t("dashboard.quickActions.skills")}
                        </p>
                        <p className="text-muted-foreground text-xs">
                          {t("dashboard.quickActions.skillsDesc")}
                        </p>
                      </div>
                      <IconChevronRight className="text-muted-foreground size-4" />
                    </div>
                  </Link>

                  <Link to="/config">
                    <div className="hover:bg-muted/60 flex items-center rounded-lg px-3 py-3 transition-colors">
                      <div className="mr-3 flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-slate-500/10">
                        <IconSettings className="size-4 text-slate-500" />
                      </div>
                      <div className="flex-1">
                        <p className="text-sm font-medium">
                          {t("dashboard.quickActions.config")}
                        </p>
                        <p className="text-muted-foreground text-xs">
                          {t("dashboard.quickActions.configDesc")}
                        </p>
                      </div>
                      <IconChevronRight className="text-muted-foreground size-4" />
                    </div>
                  </Link>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}
