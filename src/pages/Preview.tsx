import { useState } from 'react';
import {
  Eye, Heart, TrendingUp, Users, Calendar, Megaphone,
  Clock, CheckCircle, FileEdit, Sparkles, RefreshCw
} from 'lucide-react';

function fmt(n: number): string {
  if (n >= 1000000) return `${(n / 1000000).toFixed(1)}M`;
  if (n >= 1000) return `${(n / 1000).toFixed(1)}k`;
  return String(n);
}

const STATS = [
  { label: 'Posts Agendados', value: '12', icon: Calendar, color: 'text-emerald-600', bg: 'bg-emerald-50', delta: '+3 hoje' },
  { label: 'Alcance Total', value: fmt(113600), icon: Eye, color: 'text-blue-600', bg: 'bg-blue-50', delta: '+18%' },
  { label: 'Campanhas Ativas', value: '3', icon: Megaphone, color: 'text-orange-600', bg: 'bg-orange-50', delta: '£2.6k budget' },
  { label: 'Eng. Médio', value: '5.1%', icon: TrendingUp, color: 'text-fuchsia-600', bg: 'bg-fuchsia-50', delta: '+0.4pp' },
];

const PLATFORM_ICONS: Record<string, { label: string; color: string; bg: string }> = {
  Instagram: { label: '📷', color: 'text-pink-600', bg: 'bg-pink-50' },
  Facebook: { label: '📘', color: 'text-blue-600', bg: 'bg-blue-50' },
  LinkedIn: { label: '💼', color: 'text-blue-700', bg: 'bg-blue-100' },
  TikTok: { label: '▶️', color: 'text-slate-700', bg: 'bg-slate-100' },
};

const UPCOMING_POSTS = [
  {
    id: 1, platform: 'Instagram',
    time: 'Hoje, 18:00', status: 'scheduled',
    content: 'Nova campanha BPR Rehab — resultados incríveis! 💪 #fisioterapia',
    reach: 4200, img: 'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=80&q=80',
  },
  {
    id: 2, platform: 'Facebook',
    time: 'Hoje, 20:30', status: 'scheduled',
    content: 'Bruno Physical Rehabilitation — Consultas disponíveis esta semana. Agende já! 📅',
    reach: 1800, img: null,
  },
  {
    id: 3, platform: 'LinkedIn',
    time: 'Amanhã, 09:00', status: 'draft',
    content: 'Como a fisioterapia avançada está transformando a recuperação de atletas profissionais.',
    reach: 2900, img: null,
  },
  {
    id: 4, platform: 'TikTok',
    time: 'Amanhã, 19:00', status: 'draft',
    content: '3 exercícios que pode fazer em casa para aliviar a dor nas costas 🎯',
    reach: 12400, img: 'https://images.unsplash.com/photo-1518611012118-696072aa579a?w=80&q=80',
  },
];

const ACTIVE_CAMPAIGNS = [
  { name: 'BPR Summer Recovery', platform: 'Instagram', budget: '£1.200', spent: '£840', pct: 70, reach: '48.5k', eng: '6.2%' },
  { name: 'Rehab Awareness', platform: 'Facebook', budget: '£800', spent: '£320', pct: 40, reach: '18k', eng: '2.1%' },
  { name: 'Pro Athletes', platform: 'LinkedIn', budget: '£600', spent: '£180', pct: 30, reach: '32k', eng: '3.8%' },
];

const PLATFORM_SUMMARY = [
  { name: 'Instagram', emoji: '📷', color: 'text-pink-600', bg: 'bg-pink-50', followers: '12.4k', reach: '48.5k', eng: '6.2%' },
  { name: 'Facebook', emoji: '📘', color: 'text-blue-600', bg: 'bg-blue-50', followers: '6.7k', reach: '18k', eng: '2.1%' },
  { name: 'LinkedIn', emoji: '💼', color: 'text-blue-700', bg: 'bg-blue-100', followers: '3.2k', reach: '32k', eng: '3.8%' },
  { name: 'YouTube', emoji: '▶️', color: 'text-red-600', bg: 'bg-red-50', followers: '2.1k', reach: '15k', eng: '4.5%' },
  { name: 'Twitter/X', emoji: '𝕏', color: 'text-slate-700', bg: 'bg-slate-100', followers: '1.8k', reach: '9.2k', eng: '1.4%' },
];

const AGENDA_TODAY = [
  { time: '18:00', platform: 'Instagram', type: 'Post', title: 'BPR Summer — resultados', status: 'scheduled' },
  { time: '20:30', platform: 'Facebook', type: 'Post', title: 'Consultas disponíveis', status: 'scheduled' },
];
const AGENDA_TOMORROW = [
  { time: '09:00', platform: 'LinkedIn', type: 'Artigo', title: 'Fisioterapia e atletas', status: 'draft' },
  { time: '14:00', platform: 'Instagram', type: 'Story', title: 'Dicas de recuperação', status: 'scheduled' },
  { time: '19:00', platform: 'TikTok', type: 'Vídeo', title: '3 exercícios para costas', status: 'draft' },
];

export function Preview() {
  const [refreshed, setRefreshed] = useState(false);

  const handleRefresh = () => {
    setRefreshed(true);
    setTimeout(() => setRefreshed(false), 1500);
  };

  return (
    <div className="space-y-6">

      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Visão Geral</h1>
          <p className="text-sm text-gray-500 mt-0.5">Resumo completo — posts, campanhas, métricas e agenda</p>
        </div>
        <button
          onClick={handleRefresh}
          className="flex items-center gap-2 px-3 py-2 text-xs font-semibold text-gray-600 bg-white border border-gray-200 rounded-xl shadow-sm hover:bg-gray-50 transition-all"
        >
          <RefreshCw size={13} className={refreshed ? 'animate-spin' : ''} />
          {refreshed ? 'Atualizado!' : 'Atualizar'}
        </button>
      </div>

      {/* KPI cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {STATS.map((s) => {
          const Icon = s.icon;
          return (
            <div key={s.label} className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide">{s.label}</p>
                  <p className="text-2xl font-bold text-gray-900 mt-1">{s.value}</p>
                  <p className="text-xs font-semibold text-emerald-600 mt-0.5">↑ {s.delta}</p>
                </div>
                <div className={`w-9 h-9 rounded-xl ${s.bg} flex items-center justify-center`}>
                  <Icon size={16} className={s.color} />
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Main grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

        {/* Upcoming posts */}
        <div className="lg:col-span-2 bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-sm font-bold text-gray-800">Posts Próximos</h2>
            <span className="text-xs font-semibold text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded-lg">
              {UPCOMING_POSTS.length} agendados
            </span>
          </div>
          <div className="space-y-3">
            {UPCOMING_POSTS.map((post) => {
              const pi = PLATFORM_ICONS[post.platform] ?? { label: '🌐', color: 'text-gray-500', bg: 'bg-gray-100' };
              return (
                <div key={post.id} className="flex items-start gap-3 p-3 rounded-xl bg-gray-50 hover:bg-gray-100 transition-colors">
                  <div className={`w-9 h-9 rounded-xl ${pi.bg} flex items-center justify-center shrink-0 text-lg`}>
                    {pi.label}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-2 flex-wrap">
                      <span className="text-xs font-semibold text-gray-500">{post.platform}</span>
                      <div className="flex items-center gap-2">
                        <span className={`flex items-center gap-1 text-[10px] font-semibold px-2 py-0.5 rounded-lg ${
                          post.status === 'scheduled'
                            ? 'bg-emerald-100 text-emerald-700'
                            : 'bg-amber-100 text-amber-700'
                        }`}>
                          {post.status === 'scheduled'
                            ? <><CheckCircle size={10} /> Agendado</>
                            : <><FileEdit size={10} /> Rascunho</>}
                        </span>
                        <span className="flex items-center gap-1 text-[10px] text-gray-400">
                          <Clock size={10} />{post.time}
                        </span>
                      </div>
                    </div>
                    <p className="text-xs text-gray-700 mt-1 line-clamp-2">{post.content}</p>
                    <p className="text-[10px] text-gray-400 mt-1 flex items-center gap-1">
                      <Eye size={10} /> {fmt(post.reach)} alcance estimado
                    </p>
                  </div>
                  {post.img && (
                    <img src={post.img} alt="preview" className="w-12 h-12 rounded-xl object-cover shrink-0" />
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Agenda */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
          <div className="flex items-center gap-2 mb-4">
            <Calendar size={15} className="text-emerald-600" />
            <h2 className="text-sm font-bold text-gray-800">Agenda</h2>
          </div>
          <div className="space-y-4">
            <div>
              <p className="text-[10px] font-semibold uppercase tracking-wider text-gray-400 mb-2">Hoje</p>
              <div className="space-y-2">
                {AGENDA_TODAY.map((item, i) => (
                  <div key={i} className="flex items-center gap-2 p-2 rounded-xl bg-gray-50">
                    <span className="text-[11px] font-bold text-indigo-600 shrink-0">{item.time}</span>
                    <div className="flex-1 min-w-0">
                      <p className="text-[11px] font-semibold text-gray-800 truncate">{item.title}</p>
                      <p className="text-[10px] text-gray-400">{item.platform} · {item.type}</p>
                    </div>
                    <div className={`w-2 h-2 rounded-full shrink-0 ${item.status === 'scheduled' ? 'bg-emerald-500' : 'bg-amber-400'}`} />
                  </div>
                ))}
              </div>
            </div>
            <div>
              <p className="text-[10px] font-semibold uppercase tracking-wider text-gray-400 mb-2">Amanhã</p>
              <div className="space-y-2">
                {AGENDA_TOMORROW.map((item, i) => (
                  <div key={i} className="flex items-center gap-2 p-2 rounded-xl bg-gray-50">
                    <span className="text-[11px] font-bold text-indigo-600 shrink-0">{item.time}</span>
                    <div className="flex-1 min-w-0">
                      <p className="text-[11px] font-semibold text-gray-800 truncate">{item.title}</p>
                      <p className="text-[10px] text-gray-400">{item.platform} · {item.type}</p>
                    </div>
                    <div className={`w-2 h-2 rounded-full shrink-0 ${item.status === 'scheduled' ? 'bg-emerald-500' : 'bg-amber-400'}`} />
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

      </div>

      {/* Campaigns */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Megaphone size={15} className="text-orange-600" />
            <h2 className="text-sm font-bold text-gray-800">Campanhas Ativas</h2>
          </div>
          <span className="text-xs font-semibold text-orange-600 bg-orange-50 px-2 py-0.5 rounded-lg">
            {ACTIVE_CAMPAIGNS.length} ativas
          </span>
        </div>
        <div className="space-y-4">
          {ACTIVE_CAMPAIGNS.map((c) => (
            <div key={c.name} className="p-4 rounded-xl bg-gray-50">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="text-sm font-semibold text-gray-800">{c.name}</p>
                  <p className="text-xs text-gray-400">{c.platform}</p>
                </div>
                <div className="text-right shrink-0">
                  <p className="text-xs font-bold text-gray-800">{c.spent} <span className="font-normal text-gray-400">/ {c.budget}</span></p>
                  <p className="text-[10px] text-gray-400">{c.pct}% gasto</p>
                </div>
              </div>
              <div className="mt-3 h-1.5 w-full bg-gray-200 rounded-full overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-orange-500 to-amber-400 rounded-full transition-all duration-700"
                  style={{ width: `${c.pct}%` }}
                />
              </div>
              <div className="mt-2 flex items-center gap-4 text-[10px] text-gray-500">
                <span className="flex items-center gap-1"><Eye size={10} />{c.reach}</span>
                <span className="flex items-center gap-1"><Heart size={10} />{c.eng}</span>
                <span className="ml-auto flex items-center gap-1 text-emerald-600 font-semibold">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 inline-block" /> Ativa
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Platform summary */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
        <div className="flex items-center gap-2 mb-4">
          <Users size={15} className="text-fuchsia-600" />
          <h2 className="text-sm font-bold text-gray-800">Contas Conectadas</h2>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
          {PLATFORM_SUMMARY.map((p) => (
              <div key={p.name} className="flex flex-col items-center gap-2 p-3 rounded-2xl bg-gray-50 hover:bg-gray-100 transition-colors text-center">
                <div className={`w-10 h-10 rounded-xl ${p.bg} flex items-center justify-center text-xl`}>
                  {p.emoji}
                </div>
                <p className="text-[11px] font-semibold text-gray-700">{p.name}</p>
                <div className="space-y-0.5 w-full">
                  <p className="text-[10px] text-gray-400 flex items-center justify-center gap-1"><Users size={9} />{p.followers}</p>
                  <p className="text-[10px] text-gray-400 flex items-center justify-center gap-1"><Eye size={9} />{p.reach}</p>
                  <p className="text-[10px] text-gray-400 flex items-center justify-center gap-1"><Heart size={9} />{p.eng}</p>
                </div>
              </div>
          ))}
        </div>
      </div>

      {/* AI tip */}
      <div className="bg-gradient-to-r from-indigo-50 to-purple-50 border border-indigo-100 rounded-2xl p-5 flex items-center gap-4">
        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center shrink-0">
          <Sparkles size={18} className="text-white" />
        </div>
        <div className="flex-1">
          <p className="text-xs font-semibold text-gray-800">
            💡 O seu melhor horário para postar é entre 18h–20h. Hoje tens 2 posts agendados nessa janela — ótimo timing!
          </p>
          <p className="text-[11px] text-gray-500 mt-0.5">Análise baseada nos últimos 30 dias</p>
        </div>
        <span className="text-[11px] font-semibold text-indigo-600 bg-white border border-indigo-200 px-2 py-0.5 rounded-lg shrink-0 flex items-center gap-1">
          <Sparkles size={10} /> AI
        </span>
      </div>

    </div>
  );
}
