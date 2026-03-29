import React from "react"

import {
  IconArrowUpRight,
  IconBrain,
  IconChartBar,
  IconEye,
  IconHeart,
  IconMessageCircle,
  IconShare,
  IconSparkles,
  IconTrendingUp,
  IconUsers,
} from "@tabler/icons-react"

import { PageHeader } from "@/components/page-header"

function GlassCard({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  return (
    <div className={`rounded-3xl border border-white/50 bg-white/60 shadow-lg shadow-purple-500/10 backdrop-blur-xl dark:border-white/10 dark:bg-white/5 ${className}`}>
      {children}
    </div>
  )
}

const WEEKLY_DATA = [
  { day: "Seg", posts: 3, reach: 12400, engagement: 4.1 },
  { day: "Ter", posts: 2, reach: 8900, engagement: 3.7 },
  { day: "Qua", posts: 5, reach: 21000, engagement: 5.2 },
  { day: "Qui", posts: 2, reach: 9500, engagement: 3.9 },
  { day: "Sex", posts: 4, reach: 18700, engagement: 6.1 },
  { day: "Sáb", posts: 6, reach: 28000, engagement: 7.4 },
  { day: "Dom", posts: 3, reach: 15200, engagement: 5.8 },
]

const PLATFORM_STATS = [
  { name: "Instagram", color: "from-pink-500 to-orange-400", pct: 38, reach: "48.5k", eng: "6.2%", posts: 24 },
  { name: "LinkedIn", color: "from-blue-600 to-blue-400", pct: 22, reach: "32k", eng: "3.8%", posts: 12 },
  { name: "TikTok", color: "from-slate-700 to-pink-500", pct: 28, reach: "125k", eng: "8.5%", posts: 18 },
  { name: "Facebook", color: "from-blue-500 to-indigo-500", pct: 12, reach: "18k", eng: "2.1%", posts: 8 },
]

const HEATMAP_DATA = Array.from({ length: 7 }, (_, row) =>
  Array.from({ length: 24 }, (_, col) => {
    const peak = (row < 5 && (col >= 9 && col <= 12 || col >= 18 && col <= 21))
      || (row >= 5 && (col >= 11 && col <= 14 || col >= 19 && col <= 22))
    const mid = (col >= 7 && col <= 8) || (col >= 13 && col <= 17)
    return peak ? Math.floor(Math.random() * 40) + 60 : mid ? Math.floor(Math.random() * 30) + 20 : Math.floor(Math.random() * 15)
  })
)

const AI_INSIGHTS = [
  "📈 Seus posts de sábado têm 2.3× mais engajamento. Considere aumentar a frequência nos fins de semana.",
  "🕐 O melhor horário para postar é entre 18h–20h, com pico de engajamento de 7.4%.",
  "📱 TikTok está superando Instagram em alcance. Vale aumentar o budget nessa plataforma.",
  "💡 Conteúdo em vídeo tem 3× mais compartilhamentos que posts estáticos no seu perfil.",
  "🎯 Campanhas B2B no LinkedIn têm ROI 40% maior quando postadas entre terça e quinta.",
]

function fmt(n: number): string {
  if (n >= 1000000) return `${(n / 1000000).toFixed(1)}M`
  if (n >= 1000) return `${(n / 1000).toFixed(1)}k`
  return String(n)
}

function MiniBar({ value, max, color }: { value: number; max: number; color: string }) {
  const pct = max > 0 ? (value / max) * 100 : 0
  const height = Math.max(4, (pct / 100) * 48)
  return (
    <div className="flex h-12 w-full items-end">
      <div
        className={`w-full rounded-t-md bg-gradient-to-t ${color} opacity-80 transition-all duration-700`}
        style={{ height: `${height}px` }}
      />
    </div>
  )
}

export function InsightsPage() {
  const totalReach = WEEKLY_DATA.reduce((s, d) => s + d.reach, 0)
  const avgEngagement = (WEEKLY_DATA.reduce((s, d) => s + d.engagement, 0) / WEEKLY_DATA.length).toFixed(1)
  const totalPosts = WEEKLY_DATA.reduce((s, d) => s + d.posts, 0)
  const maxReach = Math.max(...WEEKLY_DATA.map((d) => d.reach))

  const statCards = [
    { label: "Alcance Semanal", value: fmt(totalReach), icon: IconEye, color: "text-blue-500", bg: "bg-blue-500/10", gradient: "from-blue-500/5 to-cyan-500/5", delta: "+18%" },
    { label: "Engajamento Médio", value: `${avgEngagement}%`, icon: IconHeart, color: "text-pink-500", bg: "bg-pink-500/10", gradient: "from-pink-500/5 to-rose-500/5", delta: "+2.1pp" },
    { label: "Posts Publicados", value: String(totalPosts), icon: IconChartBar, color: "text-violet-500", bg: "bg-violet-500/10", gradient: "from-violet-500/5 to-purple-500/5", delta: "+3" },
    { label: "Seguidores Ganhos", value: "+847", icon: IconUsers, color: "text-emerald-500", bg: "bg-emerald-500/10", gradient: "from-emerald-500/5 to-teal-500/5", delta: "+12%" },
  ]

  return (
    <div className="flex h-full flex-col overflow-y-auto">
      <PageHeader title="Insights" />

      <div className="flex-1 px-4 py-6 md:px-8 lg:px-12">
        <div className="mx-auto max-w-5xl space-y-6">

          <div>
            <h2 className="bg-gradient-to-r from-fuchsia-600 to-violet-600 bg-clip-text text-2xl font-bold text-transparent">
              Insights & Analytics
            </h2>
            <p className="text-sm text-muted-foreground">Performance das últimas 4 semanas</p>
          </div>

          {/* Stat cards */}
          <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
            {statCards.map((card) => (
              <GlassCard key={card.label} className={`bg-gradient-to-br ${card.gradient} p-4`}>
                <div className="flex items-start justify-between">
                  <div>
                    <p className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">{card.label}</p>
                    <p className="mt-1 text-2xl font-bold">{card.value}</p>
                    <div className="mt-1 flex items-center gap-1">
                      <IconTrendingUp className="size-3 text-emerald-500" />
                      <span className="text-[11px] font-semibold text-emerald-500">{card.delta}</span>
                    </div>
                  </div>
                  <div className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-2xl ${card.bg}`}>
                    <card.icon className={`size-4 ${card.color}`} />
                  </div>
                </div>
              </GlassCard>
            ))}
          </div>

          <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">

            {/* Weekly bar chart */}
            <GlassCard className="p-5">
              <div className="mb-4 flex items-center justify-between">
                <h3 className="bg-gradient-to-r from-fuchsia-600 to-violet-600 bg-clip-text text-sm font-semibold text-transparent">
                  Alcance por Dia
                </h3>
                <span className="flex items-center gap-1 rounded-xl border border-emerald-500/20 bg-emerald-500/10 px-2 py-0.5 text-[11px] font-semibold text-emerald-600">
                  <IconArrowUpRight className="size-3" />
                  Esta semana
                </span>
              </div>
              <div className="flex items-end gap-1.5">
                {WEEKLY_DATA.map((d) => (
                  <div key={d.day} className="flex flex-1 flex-col items-center gap-1">
                    <span className="text-[10px] font-semibold text-muted-foreground">{fmt(d.reach)}</span>
                    <MiniBar value={d.reach} max={maxReach} color="from-fuchsia-500 to-violet-500" />
                    <span className="text-[10px] text-muted-foreground">{d.day}</span>
                  </div>
                ))}
              </div>
              <div className="mt-4 grid grid-cols-3 gap-3 border-t border-white/30 pt-4">
                {[
                  { icon: IconEye, label: "Alcance total", value: fmt(totalReach), color: "text-blue-500" },
                  { icon: IconHeart, label: "Eng. médio", value: `${avgEngagement}%`, color: "text-pink-500" },
                  { icon: IconShare, label: "Total posts", value: String(totalPosts), color: "text-violet-500" },
                ].map((m) => (
                  <div key={m.label} className="flex flex-col items-center rounded-xl border border-white/40 bg-white/30 py-2 dark:bg-white/5">
                    <m.icon className={`size-3.5 ${m.color} mb-0.5`} />
                    <span className="text-xs font-bold">{m.value}</span>
                    <span className="text-[9px] text-center text-muted-foreground">{m.label}</span>
                  </div>
                ))}
              </div>
            </GlassCard>

            {/* Platform breakdown */}
            <GlassCard className="p-5">
              <h3 className="mb-4 bg-gradient-to-r from-fuchsia-600 to-violet-600 bg-clip-text text-sm font-semibold text-transparent">
                Por Plataforma
              </h3>
              <div className="space-y-3">
                {PLATFORM_STATS.map((p) => (
                  <div key={p.name}>
                    <div className="mb-1.5 flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className={`h-3 w-3 rounded-full bg-gradient-to-r ${p.color}`} />
                        <span className="text-xs font-semibold">{p.name}</span>
                      </div>
                      <div className="flex items-center gap-3 text-[11px] text-muted-foreground">
                        <span className="flex items-center gap-0.5"><IconEye className="size-3" />{p.reach}</span>
                        <span className="flex items-center gap-0.5"><IconHeart className="size-3" />{p.eng}</span>
                        <span className="flex items-center gap-0.5"><IconMessageCircle className="size-3" />{p.posts}</span>
                      </div>
                    </div>
                    <div className="h-2 w-full overflow-hidden rounded-full bg-black/5 dark:bg-white/10">
                      <div
                        className={`h-full rounded-full bg-gradient-to-r ${p.color} transition-all duration-700`}
                        style={{ width: `${p.pct}%` }}
                      />
                    </div>
                    <p className="mt-0.5 text-right text-[10px] text-muted-foreground">{p.pct}%</p>
                  </div>
                ))}
              </div>
            </GlassCard>
          </div>

          {/* Heatmap */}
          <GlassCard className="p-5">
            <div className="mb-4 flex items-center justify-between">
              <h3 className="bg-gradient-to-r from-fuchsia-600 to-violet-600 bg-clip-text text-sm font-semibold text-transparent">
                Heatmap de Engajamento
              </h3>
              <div className="flex items-center gap-2 text-[11px] text-muted-foreground">
                <span>Baixo</span>
                <div className="flex gap-0.5">
                  {[10, 25, 45, 65, 85].map((v) => (
                    <div key={v} className="h-3 w-3 rounded-sm" style={{ backgroundColor: `rgba(168,85,247,${v / 100})` }} />
                  ))}
                </div>
                <span>Alto</span>
              </div>
            </div>
            <div className="flex gap-1">
              <div className="flex flex-col justify-around pr-2">
                {["Seg","Ter","Qua","Qui","Sex","Sáb","Dom"].map((d) => (
                  <span key={d} className="text-[10px] text-muted-foreground">{d}</span>
                ))}
              </div>
              <div className="flex-1 overflow-x-auto">
                <div className="flex flex-col gap-1 min-w-0">
                  {HEATMAP_DATA.map((row, ri) => (
                    <div key={ri} className="flex gap-0.5">
                      {row.map((val, ci) => (
                        <div
                          key={ci}
                          className="h-4 flex-1 rounded-sm transition-all hover:scale-110"
                          title={`${["Seg","Ter","Qua","Qui","Sex","Sáb","Dom"][ri]} ${ci}h: ${val}%`}
                          style={{ backgroundColor: `rgba(168,85,247,${val / 100})`, minWidth: "3px" }}
                        />
                      ))}
                    </div>
                  ))}
                </div>
                <div className="mt-1 flex justify-between">
                  {[0, 6, 12, 18, 23].map((h) => (
                    <span key={h} className="text-[9px] text-muted-foreground">{h}h</span>
                  ))}
                </div>
              </div>
            </div>
          </GlassCard>

          {/* AI Insights */}
          <GlassCard className="bg-gradient-to-br from-fuchsia-500/5 to-violet-500/5 p-5">
            <div className="mb-4 flex items-center gap-3">
              <div className="flex h-9 w-9 items-center justify-center rounded-2xl bg-gradient-to-br from-fuchsia-500 to-violet-500 shadow-sm shadow-fuchsia-500/30">
                <IconBrain className="size-5 text-white" />
              </div>
              <div>
                <h3 className="bg-gradient-to-r from-fuchsia-600 to-violet-600 bg-clip-text text-sm font-semibold text-transparent">
                  AI Insights
                </h3>
                <p className="text-[11px] text-muted-foreground">Recomendações personalizadas para sua estratégia</p>
              </div>
              <div className="ml-auto flex items-center gap-1 rounded-xl border border-fuchsia-500/20 bg-fuchsia-500/10 px-2 py-0.5 text-[11px] font-semibold text-fuchsia-600">
                <IconSparkles className="size-3" />
                AI
              </div>
            </div>
            <div className="space-y-2">
              {AI_INSIGHTS.map((insight, i) => (
                <div
                  key={i}
                  className="flex items-start gap-3 rounded-2xl border border-white/40 bg-white/40 p-3 transition-all hover:bg-white/60 hover:scale-[1.005] dark:bg-white/5 dark:hover:bg-white/10"
                >
                  <div className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-fuchsia-500 to-violet-500 text-[10px] font-bold text-white">
                    {i + 1}
                  </div>
                  <p className="text-xs leading-relaxed text-foreground">{insight}</p>
                </div>
              ))}
            </div>
          </GlassCard>

        </div>
      </div>
    </div>
  )
}
