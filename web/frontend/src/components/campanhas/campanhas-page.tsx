import React, { useState } from "react"

import {
  IconChartBar,
  IconCircleCheck,
  IconClock,
  IconEye,
  IconHeart,
  IconMessageCircle,
  IconPlus,
  IconShare,
  IconSpeakerphone,
  IconPlayerPause,
  IconPlayerPlay,
  IconTrendingDown,
  IconTrendingUp,
  IconX,
} from "@tabler/icons-react"

import { PageHeader } from "@/components/page-header"

interface Campaign {
  id: string
  name: string
  platform: string
  platformColor: string
  status: "active" | "paused" | "completed" | "draft"
  budget: number
  spent: number
  reach: number
  engagement: number
  clicks: number
  shares: number
  startDate: string
  endDate: string
  trend: "up" | "down" | "stable"
}

const CAMPAIGNS: Campaign[] = [
  {
    id: "1",
    name: "Lançamento Produto X",
    platform: "Instagram",
    platformColor: "from-pink-500 to-orange-400",
    status: "active",
    budget: 5000,
    spent: 3200,
    reach: 48500,
    engagement: 4.2,
    clicks: 1840,
    shares: 320,
    startDate: "01/03",
    endDate: "31/03",
    trend: "up",
  },
  {
    id: "2",
    name: "Brand Awareness B2B",
    platform: "LinkedIn",
    platformColor: "from-blue-600 to-blue-400",
    status: "active",
    budget: 8000,
    spent: 5100,
    reach: 32000,
    engagement: 3.8,
    clicks: 2200,
    shares: 180,
    startDate: "15/02",
    endDate: "15/04",
    trend: "up",
  },
  {
    id: "3",
    name: "Viral Challenge",
    platform: "TikTok",
    platformColor: "from-slate-800 to-pink-500",
    status: "completed",
    budget: 3000,
    spent: 3000,
    reach: 125000,
    engagement: 8.5,
    clicks: 4500,
    shares: 2100,
    startDate: "01/02",
    endDate: "28/02",
    trend: "stable",
  },
  {
    id: "4",
    name: "Promoção Verão",
    platform: "Facebook",
    platformColor: "from-blue-500 to-indigo-500",
    status: "paused",
    budget: 4000,
    spent: 1200,
    reach: 18000,
    engagement: 2.1,
    clicks: 640,
    shares: 90,
    startDate: "10/03",
    endDate: "10/04",
    trend: "down",
  },
  {
    id: "5",
    name: "Newsletter Q2",
    platform: "Email",
    platformColor: "from-violet-500 to-purple-600",
    status: "draft",
    budget: 500,
    spent: 0,
    reach: 0,
    engagement: 0,
    clicks: 0,
    shares: 0,
    startDate: "01/04",
    endDate: "30/06",
    trend: "stable",
  },
  {
    id: "6",
    name: "Influencer Collab",
    platform: "YouTube",
    platformColor: "from-red-500 to-orange-500",
    status: "active",
    budget: 12000,
    spent: 7800,
    reach: 210000,
    engagement: 6.3,
    clicks: 8900,
    shares: 1400,
    startDate: "05/03",
    endDate: "05/05",
    trend: "up",
  },
]

const STATUS_CONFIG = {
  active: { label: "Ativa", color: "bg-emerald-500/15 text-emerald-600 border-emerald-500/20" },
  paused: { label: "Pausada", color: "bg-amber-500/15 text-amber-600 border-amber-500/20" },
  completed: { label: "Concluída", color: "bg-blue-500/15 text-blue-600 border-blue-500/20" },
  draft: { label: "Rascunho", color: "bg-slate-500/15 text-slate-600 border-slate-500/20" },
}

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

const PLATFORM_COLORS: Record<string, string> = {
  Instagram: "from-pink-500 to-orange-400",
  Facebook: "from-blue-500 to-indigo-500",
  TikTok: "from-slate-700 to-pink-500",
  LinkedIn: "from-blue-600 to-blue-400",
  YouTube: "from-red-500 to-orange-500",
  "X / Twitter": "from-slate-500 to-slate-400",
  Email: "from-violet-500 to-purple-600",
  WhatsApp: "from-emerald-500 to-green-400",
}

const EMPTY_CAMP = { name: "", platform: "Instagram", budget: "", startDate: "", endDate: "", status: "draft" as Campaign["status"] }

export function CampanhasPage() {
  const [campaigns, setCampaigns] = useState<Campaign[]>(CAMPAIGNS)
  const [showModal, setShowModal] = useState(false)
  const [form, setForm] = useState(EMPTY_CAMP)

  const activeCampaigns = campaigns.filter((c) => c.status === "active").length
  const totalReach = campaigns.reduce((s, c) => s + c.reach, 0)
  const totalBudget = campaigns.reduce((s, c) => s + c.budget, 0)
  const totalSpent = campaigns.reduce((s, c) => s + c.spent, 0)
  const avgEngagement = (campaigns.filter((c) => c.engagement > 0).reduce((s, c) => s + c.engagement, 0) / (campaigns.filter((c) => c.engagement > 0).length || 1)).toFixed(1)

  const toggleCampaignStatus = (id: string) => {
    setCampaigns((prev) =>
      prev.map((c) =>
        c.id === id
          ? { ...c, status: c.status === "active" ? "paused" : "active" }
          : c
      )
    )
  }

  const handleAddCampaign = () => {
    if (!form.name || !form.platform) return
    const newCamp: Campaign = {
      id: String(Date.now()),
      name: form.name,
      platform: form.platform,
      platformColor: PLATFORM_COLORS[form.platform] ?? "from-violet-500 to-purple-600",
      status: form.status,
      budget: form.budget ? parseInt(form.budget) : 0,
      spent: 0,
      reach: 0,
      engagement: 0,
      clicks: 0,
      shares: 0,
      startDate: form.startDate,
      endDate: form.endDate,
      trend: "stable",
    }
    setCampaigns((prev) => [newCamp, ...prev])
    setForm(EMPTY_CAMP)
    setShowModal(false)
  }

  const inputCls = "w-full rounded-xl border border-white/50 bg-white/50 px-3 py-2 text-sm placeholder:text-muted-foreground/50 focus:outline-none focus:ring-2 focus:ring-orange-500/40 dark:bg-white/10"


  const summaryCards = [
    { label: "Campanhas Ativas", value: String(activeCampaigns), icon: IconSpeakerphone, color: "text-orange-500", bg: "bg-orange-500/10", gradient: "from-orange-500/5 to-amber-500/5" },
    { label: "Alcance Total", value: fmt(totalReach), icon: IconEye, color: "text-blue-500", bg: "bg-blue-500/10", gradient: "from-blue-500/5 to-cyan-500/5" },
    { label: "Engajamento Médio", value: `${avgEngagement}%`, icon: IconHeart, color: "text-pink-500", bg: "bg-pink-500/10", gradient: "from-pink-500/5 to-rose-500/5" },
    { label: "Budget Utilizado", value: `${Math.round((totalSpent / totalBudget) * 100)}%`, icon: IconChartBar, color: "text-violet-500", bg: "bg-violet-500/10", gradient: "from-violet-500/5 to-purple-500/5", sub: `£${fmt(totalSpent)} / £${fmt(totalBudget)}` },
  ]

  return (
    <div className="flex h-full flex-col overflow-y-auto">
      <PageHeader title="Campanhas">
        <button
          onClick={() => setShowModal(true)}
          className="flex items-center gap-1.5 rounded-xl bg-gradient-to-r from-orange-500 to-amber-500 px-3 py-1.5 text-xs font-medium text-white shadow-sm shadow-orange-500/30 transition-all hover:scale-105"
        >
          <IconPlus className="size-3.5" />
          Nova campanha
        </button>
      </PageHeader>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/30 backdrop-blur-sm" onClick={() => setShowModal(false)} />
          <div className="relative w-full max-w-md rounded-3xl border border-white/50 bg-white/80 p-6 shadow-2xl shadow-orange-500/10 backdrop-blur-2xl dark:bg-slate-900/80">
            <div className="mb-5 flex items-center justify-between">
              <h3 className="bg-gradient-to-r from-orange-500 to-amber-500 bg-clip-text text-base font-bold text-transparent">Nova Campanha</h3>
              <button onClick={() => setShowModal(false)} className="flex h-7 w-7 items-center justify-center rounded-xl border border-white/50 bg-white/40 text-muted-foreground hover:bg-red-500/10 hover:text-red-500">
                <IconX className="size-4" />
              </button>
            </div>
            <div className="space-y-3">
              <div>
                <label className="mb-1 block text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">Nome da campanha *</label>
                <input className={inputCls} placeholder="Ex: Lançamento Produto X" value={form.name} onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))} />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="mb-1 block text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">Plataforma</label>
                  <select className={inputCls} value={form.platform} onChange={(e) => setForm((f) => ({ ...f, platform: e.target.value }))}>
                    {Object.keys(PLATFORM_COLORS).map((p) => <option key={p}>{p}</option>)}
                  </select>
                </div>
                <div>
                  <label className="mb-1 block text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">Status</label>
                  <select className={inputCls} value={form.status} onChange={(e) => setForm((f) => ({ ...f, status: e.target.value as Campaign["status"] }))}>
                    <option value="draft">Rascunho</option>
                    <option value="active">Ativa</option>
                    <option value="paused">Pausada</option>
                  </select>
                </div>
              </div>
              <div>
                <label className="mb-1 block text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">Budget (£)</label>
                <input type="number" min="0" className={inputCls} placeholder="Ex: 1000" value={form.budget} onChange={(e) => setForm((f) => ({ ...f, budget: e.target.value }))} />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="mb-1 block text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">Data início</label>
                  <input type="date" className={inputCls} value={form.startDate} onChange={(e) => setForm((f) => ({ ...f, startDate: e.target.value }))} />
                </div>
                <div>
                  <label className="mb-1 block text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">Data fim</label>
                  <input type="date" className={inputCls} value={form.endDate} onChange={(e) => setForm((f) => ({ ...f, endDate: e.target.value }))} />
                </div>
              </div>
            </div>
            <div className="mt-5 flex gap-2">
              <button onClick={handleAddCampaign} disabled={!form.name} className="flex-1 rounded-xl bg-gradient-to-r from-orange-500 to-amber-500 py-2.5 text-sm font-semibold text-white shadow-sm transition-all hover:scale-[1.02] disabled:opacity-50">Criar campanha</button>
              <button onClick={() => setShowModal(false)} className="rounded-xl border border-white/50 bg-white/40 px-4 py-2.5 text-sm font-semibold text-muted-foreground transition-all hover:bg-white/60">Cancelar</button>
            </div>
          </div>
        </div>
      )}

      <div className="flex-1 px-4 py-6 md:px-8 lg:px-12">
        <div className="mx-auto max-w-5xl space-y-6">

          <div>
            <h2 className="bg-gradient-to-r from-orange-500 to-amber-500 bg-clip-text text-2xl font-bold text-transparent">
              Campanhas
            </h2>
            <p className="text-sm text-muted-foreground">Gerencie e monitore suas campanhas de marketing</p>
          </div>

          {/* Summary cards */}
          <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
            {summaryCards.map((card) => (
              <GlassCard key={card.label} className={`bg-gradient-to-br ${card.gradient} p-4`}>
                <div className="flex items-start justify-between">
                  <div>
                    <p className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">{card.label}</p>
                    <p className="mt-1 text-2xl font-bold">{card.value}</p>
                    {"sub" in card && card.sub && (
                      <p className="mt-0.5 text-[11px] text-muted-foreground">{card.sub}</p>
                    )}
                  </div>
                  <div className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-2xl ${card.bg}`}>
                    <card.icon className={`size-4 ${card.color}`} />
                  </div>
                </div>
              </GlassCard>
            ))}
          </div>

          {/* Campaign grid */}
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
            {campaigns.map((camp) => {
              const spentPct = camp.budget > 0 ? Math.min((camp.spent / camp.budget) * 100, 100) : 0
              return (
                <GlassCard key={camp.id} className="p-4 transition-all hover:scale-[1.01]">
                  {/* Header */}
                  <div className="mb-3 flex items-start justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <div className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br ${camp.platformColor} shadow-sm`}>
                        <IconSpeakerphone className="size-4 text-white" />
                      </div>
                      <div>
                        <p className="text-sm font-semibold leading-tight">{camp.name}</p>
                        <p className="text-[11px] text-muted-foreground">{camp.platform}</p>
                      </div>
                    </div>
                    <span className={`shrink-0 rounded-full border px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide ${STATUS_CONFIG[camp.status].color}`}>
                      {STATUS_CONFIG[camp.status].label}
                    </span>
                  </div>

                  {/* Budget bar */}
                  {camp.budget > 0 && (
                    <div className="mb-3">
                      <div className="mb-1 flex justify-between text-[11px]">
                        <span className="text-muted-foreground">Budget</span>
                        <span className="font-medium">£{fmt(camp.spent)} / £{fmt(camp.budget)}</span>
                      </div>
                      <div className="h-1.5 w-full overflow-hidden rounded-full bg-black/5 dark:bg-white/10">
                        <div
                          className={`h-full rounded-full bg-gradient-to-r ${camp.platformColor} transition-all duration-700`}
                          style={{ width: `${spentPct}%` }}
                        />
                      </div>
                    </div>
                  )}

                  {/* Metrics */}
                  {camp.status !== "draft" && (
                    <div className="grid grid-cols-3 gap-2">
                      {[
                        { icon: IconEye, label: "Alcance", value: fmt(camp.reach), color: "text-blue-500" },
                        { icon: IconHeart, label: "Eng.", value: `${camp.engagement}%`, color: "text-pink-500" },
                        { icon: IconMessageCircle, label: "Clicks", value: fmt(camp.clicks), color: "text-violet-500" },
                      ].map((m) => (
                        <div key={m.label} className="flex flex-col items-center rounded-xl border border-white/40 bg-white/30 py-2 dark:bg-white/5">
                          <m.icon className={`size-3.5 ${m.color} mb-0.5`} />
                          <span className="text-[11px] font-bold">{m.value}</span>
                          <span className="text-[9px] text-muted-foreground">{m.label}</span>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Footer */}
                  <div className="mt-3 flex items-center justify-between border-t border-white/30 pt-2.5">
                    <div className="flex items-center gap-1 text-[11px] text-muted-foreground">
                      <IconClock className="size-3" />
                      {camp.startDate || "—"} → {camp.endDate || "—"}
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="flex items-center gap-1 text-[11px] text-muted-foreground">
                        <IconShare className="size-3" />
                        {fmt(camp.shares)}
                      </div>
                      {camp.trend === "up" && <IconTrendingUp className="size-3.5 text-emerald-500" />}
                      {camp.trend === "down" && <IconTrendingDown className="size-3.5 text-red-500" />}
                      {camp.trend === "stable" && <IconCircleCheck className="size-3.5 text-blue-500" />}
                      {(camp.status === "active" || camp.status === "paused") && (
                        <button
                          onClick={() => toggleCampaignStatus(camp.id)}
                          title={camp.status === "active" ? "Pausar campanha" : "Retomar campanha"}
                          className={`flex h-6 w-6 items-center justify-center rounded-lg border transition-all hover:scale-110 ${
                            camp.status === "active"
                              ? "border-amber-500/30 bg-amber-500/10 text-amber-600 hover:bg-amber-500/20"
                              : "border-emerald-500/30 bg-emerald-500/10 text-emerald-600 hover:bg-emerald-500/20"
                          }`}
                        >
                          {camp.status === "active"
                            ? <IconPlayerPause className="size-3" />
                            : <IconPlayerPlay className="size-3" />}
                        </button>
                      )}
                    </div>
                  </div>
                </GlassCard>
              )
            })}
          </div>
        </div>
      </div>
    </div>
  )
}
