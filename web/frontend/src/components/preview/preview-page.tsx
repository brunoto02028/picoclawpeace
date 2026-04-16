import React, { useState } from "react"

import {
  IconArrowUpRight,
  IconBrandFacebook,
  IconBrandInstagram,
  IconBrandLinkedin,
  IconBrandTiktok,
  IconBrandX,
  IconCalendarEvent,
  IconChartBar,
  IconCheck,
  IconClock,
  IconEye,
  IconHeart,
  IconMessageCircle,
  IconPlayerPlay,
  IconRefresh,
  IconShare,
  IconSpeakerphone,
  IconSparkles,
  IconTrendingUp,
  IconUsers,
} from "@tabler/icons-react"

import { PageHeader } from "../page-header"

function GlassCard({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  return (
    <div className={`rounded-3xl border border-white/50 bg-white/60 shadow-lg shadow-purple-500/10 backdrop-blur-xl dark:border-white/10 dark:bg-white/5 ${className}`}>
      {children}
    </div>
  )
}

function fmt(n: number): string {
  if (n >= 1000000) return `${(n / 1000000).toFixed(1)}M`
  if (n >= 1000) return `${(n / 1000).toFixed(1)}k`
  return String(n)
}

const UPCOMING_POSTS = [
  {
    id: 1,
    platform: "Instagram",
    icon: IconBrandInstagram,
    gradient: "from-pink-500 to-orange-400",
    time: "Hoje, 18:00",
    content: "Nova campanha BPR Rehab — resultados incríveis dos nossos pacientes! 💪 #fisioterapia #reabilitação",
    status: "scheduled",
    reach: 4200,
    img: "https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=400&q=80",
  },
  {
    id: 2,
    platform: "Facebook",
    icon: IconBrandFacebook,
    gradient: "from-blue-500 to-indigo-500",
    time: "Hoje, 20:30",
    content: "Bruno Physical Rehabilitation — Consultas disponíveis esta semana. Agende já! 📅",
    status: "scheduled",
    reach: 1800,
    img: null,
  },
  {
    id: 3,
    platform: "LinkedIn",
    icon: IconBrandLinkedin,
    gradient: "from-blue-600 to-blue-400",
    time: "Amanhã, 09:00",
    content: "Como a fisioterapia avançada está transformando a recuperação de atletas profissionais.",
    status: "draft",
    reach: 2900,
    img: null,
  },
  {
    id: 4,
    platform: "TikTok",
    icon: IconBrandTiktok,
    gradient: "from-slate-700 to-pink-500",
    time: "Amanhã, 19:00",
    content: "3 exercícios que você pode fazer em casa para aliviar a dor nas costas 🎯",
    status: "draft",
    reach: 12400,
    img: "https://images.unsplash.com/photo-1518611012118-696072aa579a?w=400&q=80",
  },
]

const ACTIVE_CAMPAIGNS = [
  { name: "BPR Summer Recovery", platform: "Instagram", budget: "£1.200", spent: "£840", pct: 70, status: "active", reach: "48.5k", eng: "6.2%" },
  { name: "Rehab Awareness", platform: "Facebook", budget: "£800", spent: "£320", pct: 40, status: "active", reach: "18k", eng: "2.1%" },
  { name: "Pro Athletes", platform: "LinkedIn", budget: "£600", spent: "£180", pct: 30, status: "active", reach: "32k", eng: "3.8%" },
]

const STATS = [
  { label: "Posts Agendados", value: "12", icon: IconCalendarEvent, color: "text-emerald-500", bg: "bg-emerald-500/10", gradient: "from-emerald-500/5 to-teal-500/5", delta: "+3 hoje" },
  { label: "Alcance Total", value: fmt(113600), icon: IconEye, color: "text-blue-500", bg: "bg-blue-500/10", gradient: "from-blue-500/5 to-cyan-500/5", delta: "+18%" },
  { label: "Campanhas Ativas", value: "3", icon: IconSpeakerphone, color: "text-orange-500", bg: "bg-orange-500/10", gradient: "from-orange-500/5 to-amber-500/5", delta: "£2.6k budget" },
  { label: "Eng. Médio", value: "5.1%", icon: IconTrendingUp, color: "text-fuchsia-500", bg: "bg-fuchsia-500/10", gradient: "from-fuchsia-500/5 to-violet-500/5", delta: "+0.4pp" },
]

const PLATFORM_SUMMARY = [
  { name: "Instagram", icon: IconBrandInstagram, gradient: "from-pink-500 to-orange-400", followers: "12.4k", posts: 24, eng: "6.2%", reach: "48.5k" },
  { name: "TikTok", icon: IconBrandTiktok, gradient: "from-slate-700 to-pink-500", followers: "8.1k", posts: 18, eng: "8.5%", reach: "125k" },
  { name: "LinkedIn", icon: IconBrandLinkedin, gradient: "from-blue-600 to-blue-400", followers: "3.2k", posts: 12, eng: "3.8%", reach: "32k" },
  { name: "Facebook", icon: IconBrandFacebook, gradient: "from-blue-500 to-indigo-500", followers: "6.7k", posts: 8, eng: "2.1%", reach: "18k" },
  { name: "X / Twitter", icon: IconBrandX, gradient: "from-slate-800 to-slate-600", followers: "1.8k", posts: 5, eng: "1.4%", reach: "9.2k" },
]

const AGENDA_TODAY = [
  { time: "18:00", platform: "Instagram", type: "Post", title: "BPR Summer — resultados", status: "scheduled" },
  { time: "20:30", platform: "Facebook", type: "Post", title: "Consultas disponíveis", status: "scheduled" },
]
const AGENDA_TOMORROW = [
  { time: "09:00", platform: "LinkedIn", type: "Artigo", title: "Fisioterapia e atletas", status: "draft" },
  { time: "14:00", platform: "Instagram", type: "Story", title: "Dicas de recuperação", status: "scheduled" },
  { time: "19:00", platform: "TikTok", type: "Vídeo", title: "3 exercícios para costas", status: "draft" },
]

export function PreviewPage() {
  const [refreshed, setRefreshed] = useState(false)

  const handleRefresh = () => {
    setRefreshed(true)
    setTimeout(() => setRefreshed(false), 1500)
  }

  return (
    <div className="flex h-full flex-col overflow-y-auto">
      <PageHeader title="Preview" />

      <div className="flex-1 px-4 py-6 md:px-8 lg:px-12">
        <div className="mx-auto max-w-6xl space-y-6">

          {/* Header */}
          <div className="flex items-start justify-between">
            <div>
              <h2 className="bg-gradient-to-r from-violet-600 to-fuchsia-600 bg-clip-text text-2xl font-bold text-transparent">
                Visão Geral
              </h2>
              <p className="text-sm text-muted-foreground">Resumo completo — posts, campanhas, métricas e agenda</p>
            </div>
            <button
              onClick={handleRefresh}
              className="flex items-center gap-2 rounded-2xl border border-white/40 bg-white/50 px-3 py-2 text-xs font-semibold text-muted-foreground shadow-sm backdrop-blur-md transition-all hover:bg-white/70 hover:text-foreground dark:bg-white/5 dark:hover:bg-white/10"
            >
              <IconRefresh className={`size-3.5 ${refreshed ? "animate-spin" : ""}`} />
              {refreshed ? "Atualizado!" : "Atualizar"}
            </button>
          </div>

          {/* KPI Cards */}
          <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
            {STATS.map((s) => (
              <GlassCard key={s.label} className={`bg-gradient-to-br ${s.gradient} p-4`}>
                <div className="flex items-start justify-between">
                  <div>
                    <p className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">{s.label}</p>
                    <p className="mt-1 text-2xl font-bold">{s.value}</p>
                    <div className="mt-1 flex items-center gap-1">
                      <IconArrowUpRight className="size-3 text-emerald-500" />
                      <span className="text-[11px] font-semibold text-emerald-500">{s.delta}</span>
                    </div>
                  </div>
                  <div className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-2xl ${s.bg}`}>
                    <s.icon className={`size-4 ${s.color}`} />
                  </div>
                </div>
              </GlassCard>
            ))}
          </div>

          {/* Main grid */}
          <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">

            {/* Upcoming posts */}
            <div className="lg:col-span-2">
              <GlassCard className="p-5">
                <div className="mb-4 flex items-center justify-between">
                  <h3 className="bg-gradient-to-r from-violet-600 to-fuchsia-600 bg-clip-text text-sm font-semibold text-transparent">
                    Posts Próximos
                  </h3>
                  <span className="rounded-xl border border-violet-500/20 bg-violet-500/10 px-2 py-0.5 text-[11px] font-semibold text-violet-600">
                    {UPCOMING_POSTS.length} agendados
                  </span>
                </div>
                <div className="space-y-3">
                  {UPCOMING_POSTS.map((post) => (
                    <div
                      key={post.id}
                      className="flex items-start gap-3 rounded-2xl border border-white/40 bg-white/30 p-3 transition-all hover:bg-white/50 dark:bg-white/5 dark:hover:bg-white/10"
                    >
                      <div className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br ${post.gradient} shadow-sm`}>
                        <post.icon className="size-4 text-white" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between gap-2">
                          <span className="text-[11px] font-semibold text-muted-foreground">{post.platform}</span>
                          <div className="flex items-center gap-2 shrink-0">
                            <span className={`rounded-lg px-2 py-0.5 text-[10px] font-semibold ${
                              post.status === "scheduled"
                                ? "border border-emerald-500/20 bg-emerald-500/10 text-emerald-600"
                                : "border border-amber-500/20 bg-amber-500/10 text-amber-600"
                            }`}>
                              {post.status === "scheduled" ? (
                                <span className="flex items-center gap-1"><IconCheck className="size-2.5" />Agendado</span>
                              ) : (
                                <span className="flex items-center gap-1"><IconClock className="size-2.5" />Rascunho</span>
                              )}
                            </span>
                            <span className="flex items-center gap-1 text-[10px] text-muted-foreground">
                              <IconClock className="size-3" />{post.time}
                            </span>
                          </div>
                        </div>
                        <p className="mt-1 text-xs text-foreground line-clamp-2">{post.content}</p>
                        <div className="mt-2 flex items-center gap-3 text-[10px] text-muted-foreground">
                          <span className="flex items-center gap-0.5"><IconEye className="size-3" />{fmt(post.reach)} alcance est.</span>
                        </div>
                      </div>
                      {post.img && (
                        <div className="relative h-14 w-14 shrink-0 overflow-hidden rounded-xl">
                          <img src={post.img} alt="preview" className="h-full w-full object-cover" />
                          {post.platform === "TikTok" && (
                            <div className="absolute inset-0 flex items-center justify-center bg-black/30">
                              <IconPlayerPlay className="size-4 text-white" />
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </GlassCard>
            </div>

            {/* Agenda */}
            <div className="flex flex-col gap-6">
              <GlassCard className="p-5">
                <div className="mb-3 flex items-center gap-2">
                  <IconCalendarEvent className="size-4 text-emerald-500" />
                  <h3 className="text-sm font-semibold">Agenda</h3>
                </div>
                <div className="space-y-4">
                  <div>
                    <p className="mb-2 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">Hoje</p>
                    <div className="space-y-2">
                      {AGENDA_TODAY.map((item, i) => (
                        <div key={i} className="flex items-center gap-2 rounded-xl border border-white/40 bg-white/30 px-3 py-2 dark:bg-white/5">
                          <span className="shrink-0 text-[11px] font-bold text-violet-600">{item.time}</span>
                          <div className="flex-1 min-w-0">
                            <p className="truncate text-[11px] font-semibold">{item.title}</p>
                            <p className="text-[10px] text-muted-foreground">{item.platform} · {item.type}</p>
                          </div>
                          <div className={`h-1.5 w-1.5 shrink-0 rounded-full ${item.status === "scheduled" ? "bg-emerald-500" : "bg-amber-400"}`} />
                        </div>
                      ))}
                    </div>
                  </div>
                  <div>
                    <p className="mb-2 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">Amanhã</p>
                    <div className="space-y-2">
                      {AGENDA_TOMORROW.map((item, i) => (
                        <div key={i} className="flex items-center gap-2 rounded-xl border border-white/40 bg-white/30 px-3 py-2 dark:bg-white/5">
                          <span className="shrink-0 text-[11px] font-bold text-violet-600">{item.time}</span>
                          <div className="flex-1 min-w-0">
                            <p className="truncate text-[11px] font-semibold">{item.title}</p>
                            <p className="text-[10px] text-muted-foreground">{item.platform} · {item.type}</p>
                          </div>
                          <div className={`h-1.5 w-1.5 shrink-0 rounded-full ${item.status === "scheduled" ? "bg-emerald-500" : "bg-amber-400"}`} />
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </GlassCard>
            </div>

          </div>

          {/* Campaigns */}
          <GlassCard className="p-5">
            <div className="mb-4 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <IconSpeakerphone className="size-4 text-orange-500" />
                <h3 className="text-sm font-semibold">Campanhas Ativas</h3>
              </div>
              <span className="rounded-xl border border-orange-500/20 bg-orange-500/10 px-2 py-0.5 text-[11px] font-semibold text-orange-600">
                {ACTIVE_CAMPAIGNS.length} ativas
              </span>
            </div>
            <div className="space-y-4">
              {ACTIVE_CAMPAIGNS.map((c) => (
                <div key={c.name} className="rounded-2xl border border-white/40 bg-white/30 p-4 dark:bg-white/5">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="text-sm font-semibold">{c.name}</p>
                      <p className="text-[11px] text-muted-foreground">{c.platform}</p>
                    </div>
                    <div className="shrink-0 text-right">
                      <p className="text-xs font-bold">{c.spent} <span className="font-normal text-muted-foreground">/ {c.budget}</span></p>
                      <p className="text-[10px] text-muted-foreground">{c.pct}% gasto</p>
                    </div>
                  </div>
                  <div className="mt-3 h-1.5 w-full overflow-hidden rounded-full bg-black/5 dark:bg-white/10">
                    <div
                      className="h-full rounded-full bg-gradient-to-r from-orange-500 to-amber-400 transition-all duration-700"
                      style={{ width: `${c.pct}%` }}
                    />
                  </div>
                  <div className="mt-3 flex items-center gap-4 text-[11px] text-muted-foreground">
                    <span className="flex items-center gap-1"><IconEye className="size-3" />{c.reach}</span>
                    <span className="flex items-center gap-1"><IconHeart className="size-3" />{c.eng}</span>
                    <span className="ml-auto flex items-center gap-1 rounded-lg border border-emerald-500/20 bg-emerald-500/10 px-2 py-0.5 text-[10px] font-semibold text-emerald-600">
                      <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" /> Ativa
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </GlassCard>

          {/* Platform summary */}
          <GlassCard className="p-5">
            <div className="mb-4 flex items-center gap-2">
              <IconChartBar className="size-4 text-fuchsia-500" />
              <h3 className="text-sm font-semibold">Contas Conectadas</h3>
            </div>
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
              {PLATFORM_SUMMARY.map((p) => (
                <div
                  key={p.name}
                  className="flex flex-col items-center gap-2 rounded-2xl border border-white/40 bg-white/30 p-3 transition-all hover:bg-white/50 dark:bg-white/5 dark:hover:bg-white/10"
                >
                  <div className={`flex h-10 w-10 items-center justify-center rounded-2xl bg-gradient-to-br ${p.gradient} shadow-sm`}>
                    <p.icon className="size-5 text-white" />
                  </div>
                  <p className="text-[11px] font-semibold">{p.name}</p>
                  <div className="w-full space-y-1 text-center">
                    <div className="flex items-center justify-center gap-1 text-[10px] text-muted-foreground">
                      <IconUsers className="size-3" />{p.followers}
                    </div>
                    <div className="flex items-center justify-center gap-1 text-[10px] text-muted-foreground">
                      <IconEye className="size-3" />{p.reach}
                    </div>
                    <div className="flex items-center justify-center gap-1 text-[10px] text-muted-foreground">
                      <IconHeart className="size-3" />{p.eng}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </GlassCard>

          {/* AI tip */}
          <GlassCard className="flex items-center gap-4 bg-gradient-to-br from-violet-500/5 to-fuchsia-500/5 p-5">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-violet-500 to-fuchsia-500 shadow-sm shadow-violet-500/30">
              <IconSparkles className="size-5 text-white" />
            </div>
            <div className="flex-1">
              <p className="text-xs font-semibold text-foreground">
                💡 Dica do dia: O seu melhor horário para postar é entre 18h–20h. Hoje tens 2 posts agendados nessa janela — ótimo timing!
              </p>
              <p className="mt-0.5 text-[11px] text-muted-foreground">Análise baseada nos últimos 30 dias</p>
            </div>
            <div className="flex items-center gap-1 rounded-xl border border-violet-500/20 bg-violet-500/10 px-2 py-0.5 text-[11px] font-semibold text-violet-600 shrink-0">
              <IconSparkles className="size-3" /> AI
            </div>
          </GlassCard>

        </div>
      </div>
    </div>
  )
}
