import React, { useState } from "react"

import {
  IconCalendarEvent,
  IconChevronLeft,
  IconChevronRight,
  IconClock,
  IconMapPin,
  IconPlus,
  IconUsers,
  IconX,
} from "@tabler/icons-react"

import { PageHeader } from "@/components/page-header"

const DAYS = ["Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sáb"]
const MONTHS = [
  "Janeiro","Fevereiro","Março","Abril","Maio","Junho",
  "Julho","Agosto","Setembro","Outubro","Novembro","Dezembro",
]

interface AgendaEvent {
  id: string
  title: string
  date: number
  month: number
  time: string
  type: "post" | "meeting" | "campaign" | "review"
  platform?: string
  location?: string
  attendees?: number
}

const MOCK_EVENTS: AgendaEvent[] = [
  { id: "1", title: "Post Instagram — Lançamento produto", date: 3, month: 3, time: "09:00", type: "post", platform: "Instagram" },
  { id: "2", title: "Reunião equipe de marketing", date: 5, month: 3, time: "14:00", type: "meeting", attendees: 6, location: "Sala virtual" },
  { id: "3", title: "Campanha LinkedIn — B2B", date: 8, month: 3, time: "10:30", type: "campaign", platform: "LinkedIn" },
  { id: "4", title: "Review mensal de métricas", date: 12, month: 3, time: "15:00", type: "review", attendees: 3 },
  { id: "5", title: "Stories TikTok — Tutorial", date: 15, month: 3, time: "11:00", type: "post", platform: "TikTok" },
  { id: "6", title: "Webinar: Social Media 2026", date: 18, month: 3, time: "19:00", type: "meeting", attendees: 120 },
  { id: "7", title: "Campanha Facebook Ads", date: 20, month: 3, time: "08:00", type: "campaign", platform: "Facebook" },
  { id: "8", title: "Post Twitter — Notícia do setor", date: 22, month: 3, time: "12:00", type: "post", platform: "Twitter" },
  { id: "9", title: "Review conteúdo Abril", date: 28, month: 3, time: "16:00", type: "review", attendees: 4 },
]

const TYPE_CONFIG = {
  post: { label: "Post", color: "bg-violet-500/15 text-violet-600 border-violet-500/20", dot: "bg-violet-500" },
  meeting: { label: "Reunião", color: "bg-blue-500/15 text-blue-600 border-blue-500/20", dot: "bg-blue-500" },
  campaign: { label: "Campanha", color: "bg-orange-500/15 text-orange-600 border-orange-500/20", dot: "bg-orange-500" },
  review: { label: "Review", color: "bg-emerald-500/15 text-emerald-600 border-emerald-500/20", dot: "bg-emerald-500" },
}

function GlassCard({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  return (
    <div className={`rounded-3xl border border-white/50 bg-white/60 shadow-lg shadow-purple-500/10 backdrop-blur-xl dark:border-white/10 dark:bg-white/5 ${className}`}>
      {children}
    </div>
  )
}

const EMPTY_FORM = { title: "", date: "", time: "09:00", type: "post" as AgendaEvent["type"], platform: "", location: "", attendees: "" }

export function AgendaPage() {
  const today = new Date()
  const [currentMonth, setCurrentMonth] = useState(today.getMonth())
  const [currentYear, setCurrentYear] = useState(today.getFullYear())
  const [selectedDate, setSelectedDate] = useState<number | null>(today.getDate())
  const [events, setEvents] = useState<AgendaEvent[]>(MOCK_EVENTS)
  const [showModal, setShowModal] = useState(false)
  const [form, setForm] = useState(EMPTY_FORM)

  const firstDay = new Date(currentYear, currentMonth, 1).getDay()
  const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate()

  const prevMonth = () => {
    if (currentMonth === 0) { setCurrentMonth(11); setCurrentYear((y) => y - 1) }
    else setCurrentMonth((m) => m - 1)
  }
  const nextMonth = () => {
    if (currentMonth === 11) { setCurrentMonth(0); setCurrentYear((y) => y + 1) }
    else setCurrentMonth((m) => m + 1)
  }

  const eventsForDay = (day: number) =>
    events.filter((e) => e.date === day && e.month === currentMonth)

  const selectedEvents = selectedDate ? eventsForDay(selectedDate) : []

  const upcomingEvents = [...events]
    .filter((e) => e.month >= currentMonth)
    .sort((a, b) => a.date - b.date)
    .slice(0, 5)

  const handleAddEvent = () => {
    if (!form.title || !form.date) return
    const d = new Date(form.date)
    const newEvent: AgendaEvent = {
      id: String(Date.now()),
      title: form.title,
      date: d.getDate(),
      month: d.getMonth(),
      time: form.time,
      type: form.type,
      platform: form.platform || undefined,
      location: form.location || undefined,
      attendees: form.attendees ? parseInt(form.attendees) : undefined,
    }
    setEvents((prev) => [...prev, newEvent])
    setCurrentMonth(d.getMonth())
    setCurrentYear(d.getFullYear())
    setSelectedDate(d.getDate())
    setForm(EMPTY_FORM)
    setShowModal(false)
  }

  const inputCls = "w-full rounded-xl border border-white/50 bg-white/50 px-3 py-2 text-sm placeholder:text-muted-foreground/50 focus:outline-none focus:ring-2 focus:ring-emerald-500/40 dark:bg-white/10"

  return (
    <div className="flex h-full flex-col overflow-y-auto">
      <PageHeader title="Agenda">
        <button
          onClick={() => setShowModal(true)}
          className="flex items-center gap-1.5 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 px-3 py-1.5 text-xs font-medium text-white shadow-sm shadow-emerald-500/30 transition-all hover:scale-105"
        >
          <IconPlus className="size-3.5" />
          Novo evento
        </button>
      </PageHeader>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/30 backdrop-blur-sm" onClick={() => setShowModal(false)} />
          <div className="relative w-full max-w-md rounded-3xl border border-white/50 bg-white/80 p-6 shadow-2xl shadow-emerald-500/10 backdrop-blur-2xl dark:bg-slate-900/80">
            <div className="mb-5 flex items-center justify-between">
              <h3 className="bg-gradient-to-r from-emerald-600 to-teal-600 bg-clip-text text-base font-bold text-transparent">
                Novo Evento
              </h3>
              <button onClick={() => setShowModal(false)} className="flex h-7 w-7 items-center justify-center rounded-xl border border-white/50 bg-white/40 text-muted-foreground hover:bg-red-500/10 hover:text-red-500">
                <IconX className="size-4" />
              </button>
            </div>

            <div className="space-y-3">
              <div>
                <label className="mb-1 block text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">Título *</label>
                <input className={inputCls} placeholder="Ex: Post Instagram — Lançamento..." value={form.title} onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))} />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="mb-1 block text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">Data *</label>
                  <input type="date" className={inputCls} value={form.date} onChange={(e) => setForm((f) => ({ ...f, date: e.target.value }))} />
                </div>
                <div>
                  <label className="mb-1 block text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">Horário</label>
                  <input type="time" className={inputCls} value={form.time} onChange={(e) => setForm((f) => ({ ...f, time: e.target.value }))} />
                </div>
              </div>
              <div>
                <label className="mb-1 block text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">Tipo</label>
                <select className={inputCls} value={form.type} onChange={(e) => setForm((f) => ({ ...f, type: e.target.value as AgendaEvent["type"] }))}>
                  <option value="post">📢 Post</option>
                  <option value="campaign">🎯 Campanha</option>
                  <option value="meeting">🤝 Reunião</option>
                  <option value="review">📊 Review</option>
                </select>
              </div>
              <div>
                <label className="mb-1 block text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">Plataforma</label>
                <select className={inputCls} value={form.platform} onChange={(e) => setForm((f) => ({ ...f, platform: e.target.value }))}>
                  <option value="">— Selecionar —</option>
                  <option>Instagram</option>
                  <option>Facebook</option>
                  <option>TikTok</option>
                  <option>LinkedIn</option>
                  <option>YouTube</option>
                  <option>X / Twitter</option>
                </select>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="mb-1 block text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">Local / Link</label>
                  <input className={inputCls} placeholder="Sala virtual, URL..." value={form.location} onChange={(e) => setForm((f) => ({ ...f, location: e.target.value }))} />
                </div>
                <div>
                  <label className="mb-1 block text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">Participantes</label>
                  <input type="number" min="1" className={inputCls} placeholder="0" value={form.attendees} onChange={(e) => setForm((f) => ({ ...f, attendees: e.target.value }))} />
                </div>
              </div>
            </div>

            <div className="mt-5 flex gap-2">
              <button
                onClick={handleAddEvent}
                disabled={!form.title || !form.date}
                className="flex-1 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 py-2.5 text-sm font-semibold text-white shadow-sm transition-all hover:scale-[1.02] disabled:opacity-50"
              >
                Adicionar evento
              </button>
              <button
                onClick={() => setShowModal(false)}
                className="rounded-xl border border-white/50 bg-white/40 px-4 py-2.5 text-sm font-semibold text-muted-foreground transition-all hover:bg-white/60"
              >
                Cancelar
              </button>
            </div>
          </div>
        </div>
      )}


      <div className="flex-1 px-4 py-6 md:px-8 lg:px-12">
        <div className="mx-auto max-w-5xl space-y-6">

          <div>
            <h2 className="bg-gradient-to-r from-emerald-600 to-teal-600 bg-clip-text text-2xl font-bold text-transparent">
              Agenda Social
            </h2>
            <p className="text-sm text-muted-foreground">Planejamento de conteúdo e eventos</p>
          </div>

          <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">

            {/* Calendar */}
            <GlassCard className="p-5 lg:col-span-2">
              <div className="mb-4 flex items-center justify-between">
                <h3 className="bg-gradient-to-r from-emerald-600 to-teal-600 bg-clip-text text-sm font-semibold text-transparent">
                  {MONTHS[currentMonth]} {currentYear}
                </h3>
                <div className="flex gap-1">
                  <button
                    onClick={prevMonth}
                    className="flex h-7 w-7 items-center justify-center rounded-xl border border-white/50 bg-white/40 text-muted-foreground transition-all hover:bg-emerald-500/10 hover:text-emerald-600 dark:bg-white/10"
                  >
                    <IconChevronLeft className="size-4" />
                  </button>
                  <button
                    onClick={nextMonth}
                    className="flex h-7 w-7 items-center justify-center rounded-xl border border-white/50 bg-white/40 text-muted-foreground transition-all hover:bg-emerald-500/10 hover:text-emerald-600 dark:bg-white/10"
                  >
                    <IconChevronRight className="size-4" />
                  </button>
                </div>
              </div>

              {/* Day labels */}
              <div className="mb-2 grid grid-cols-7 gap-1">
                {DAYS.map((d) => (
                  <div key={d} className="text-center text-[11px] font-semibold uppercase tracking-wide text-muted-foreground/60">
                    {d}
                  </div>
                ))}
              </div>

              {/* Calendar grid */}
              <div className="grid grid-cols-7 gap-1">
                {Array.from({ length: firstDay }).map((_, i) => (
                  <div key={`empty-${i}`} />
                ))}
                {Array.from({ length: daysInMonth }).map((_, i) => {
                  const day = i + 1
                  const dayEvents = eventsForDay(day)
                  const isToday = day === today.getDate() && currentMonth === today.getMonth() && currentYear === today.getFullYear()
                  const isSelected = day === selectedDate

                  return (
                    <button
                      key={day}
                      onClick={() => setSelectedDate(day)}
                      className={`relative flex h-9 flex-col items-center justify-center rounded-xl text-sm font-medium transition-all hover:scale-105 ${
                        isSelected
                          ? "bg-gradient-to-br from-emerald-500 to-teal-500 text-white shadow-sm shadow-emerald-500/30"
                          : isToday
                            ? "border border-emerald-500/40 bg-emerald-500/10 text-emerald-600"
                            : "hover:bg-white/40 dark:hover:bg-white/10"
                      }`}
                    >
                      {day}
                      {dayEvents.length > 0 && (
                        <div className="absolute bottom-1 flex gap-0.5">
                          {dayEvents.slice(0, 3).map((e) => (
                            <span key={e.id} className={`h-1 w-1 rounded-full ${TYPE_CONFIG[e.type].dot}`} />
                          ))}
                        </div>
                      )}
                    </button>
                  )
                })}
              </div>

              {/* Selected day events */}
              {selectedDate && (
                <div className="mt-5 border-t border-white/30 pt-4">
                  <h4 className="mb-3 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                    {selectedDate} de {MONTHS[currentMonth]}
                  </h4>
                  {selectedEvents.length === 0 ? (
                    <div className="flex items-center gap-2 rounded-2xl border border-dashed border-white/40 p-4">
                      <IconCalendarEvent className="size-4 text-muted-foreground/40" />
                      <span className="text-xs text-muted-foreground/60">Nenhum evento neste dia</span>
                    </div>
                  ) : (
                    <div className="space-y-2">
                      {selectedEvents.map((event) => (
                        <div key={event.id} className={`flex items-center gap-3 rounded-2xl border p-3 transition-all hover:scale-[1.01] ${TYPE_CONFIG[event.type].color}`}>
                          <span className={`h-2 w-2 shrink-0 rounded-full ${TYPE_CONFIG[event.type].dot}`} />
                          <div className="flex-1 min-w-0">
                            <p className="truncate text-sm font-semibold">{event.title}</p>
                            <div className="flex items-center gap-3 mt-0.5">
                              <span className="flex items-center gap-1 text-[11px] opacity-70">
                                <IconClock className="size-3" />
                                {event.time}
                              </span>
                              {event.platform && (
                                <span className="text-[11px] opacity-70">📱 {event.platform}</span>
                              )}
                              {event.attendees && (
                                <span className="flex items-center gap-1 text-[11px] opacity-70">
                                  <IconUsers className="size-3" />
                                  {event.attendees}
                                </span>
                              )}
                              {event.location && (
                                <span className="flex items-center gap-1 text-[11px] opacity-70">
                                  <IconMapPin className="size-3" />
                                  {event.location}
                                </span>
                              )}
                            </div>
                          </div>
                          <span className={`shrink-0 rounded-full px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide border ${TYPE_CONFIG[event.type].color}`}>
                            {TYPE_CONFIG[event.type].label}
                          </span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </GlassCard>

            {/* Upcoming events sidebar */}
            <GlassCard className="p-5">
              <h3 className="mb-4 bg-gradient-to-r from-emerald-600 to-teal-600 bg-clip-text text-sm font-semibold text-transparent">
                Próximos Eventos
              </h3>
              <div className="space-y-3">
                {upcomingEvents.map((event) => (
                  <div
                    key={event.id}
                    className="flex gap-3 rounded-2xl p-2.5 transition-all hover:bg-white/40 dark:hover:bg-white/10 cursor-pointer"
                    onClick={() => setSelectedDate(event.date)}
                  >
                    <div className={`flex h-9 w-9 shrink-0 flex-col items-center justify-center rounded-xl text-center ${TYPE_CONFIG[event.type].color} border`}>
                      <span className="text-[10px] font-bold leading-none">{String(event.date).padStart(2, "0")}</span>
                      <span className="text-[9px] leading-none opacity-70">{MONTHS[event.month].slice(0, 3)}</span>
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-xs font-semibold">{event.title}</p>
                      <div className="flex items-center gap-1.5 mt-0.5">
                        <span className="flex items-center gap-0.5 text-[10px] text-muted-foreground">
                          <IconClock className="size-2.5" />
                          {event.time}
                        </span>
                        <span className={`rounded-full px-1.5 py-0.5 text-[9px] font-semibold uppercase tracking-wide border ${TYPE_CONFIG[event.type].color}`}>
                          {TYPE_CONFIG[event.type].label}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Legend */}
              <div className="mt-5 border-t border-white/30 pt-4 space-y-2">
                <p className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">Legenda</p>
                {Object.entries(TYPE_CONFIG).map(([key, cfg]) => (
                  <div key={key} className="flex items-center gap-2">
                    <span className={`h-2 w-2 rounded-full ${cfg.dot}`} />
                    <span className="text-xs text-muted-foreground">{cfg.label}</span>
                  </div>
                ))}
              </div>
            </GlassCard>
          </div>
        </div>
      </div>
    </div>
  )
}
