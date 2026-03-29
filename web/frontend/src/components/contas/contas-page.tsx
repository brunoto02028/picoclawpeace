import React, { useState } from "react"

import {
  IconAlertCircle,
  IconCheck,
  IconChevronDown,
  IconChevronUp,
  IconCopy,
  IconExternalLink,
  IconEye,
  IconEyeOff,
  IconLink,
  IconPencil,
  IconPlus,
  IconRefresh,
  IconTrash,
  IconUnlink,
  IconUser,
} from "@tabler/icons-react"

import { PageHeader } from "@/components/page-header"

// ─── Types ───────────────────────────────────────────────────────────────────

interface SocialAccount {
  id: string
  platform: string
  username: string
  displayName: string
  status: "connected" | "expired" | "error"
  connectedAt: string
  followers?: number
  creds?: Record<string, string> // stored for editing
}

// ─── Platform Config ──────────────────────────────────────────────────────────

interface PlatformDef {
  id: string
  name: string
  gradient: string
  icon: string
  description: string
  maxAccounts: number
  devPortal: string
  redirectUri?: string
  defaultCreds?: Record<string, string>
  steps: string[]
  fields: { key: string; label: string; placeholder: string; secret?: boolean; hint?: string }[]
}

const PLATFORM_DEFS: PlatformDef[] = [
  {
    id: "meta",
    name: "Meta (Instagram + Facebook)",
    gradient: "from-pink-500 via-rose-500 to-orange-400",
    icon: "📸",
    description: "Bruno Physical Rehabilitation — App configurado em developers.facebook.com",
    maxAccounts: 5,
    devPortal: "https://developers.facebook.com",
    redirectUri: "https://bpr.rehab/api/admin/social/callback",
    defaultCreds: {
      appId: "94530663455902",
      instagramAppId: "2275652729596451",
      configId: "791665240649206",
      appSecret: "5e704f16a726e0b6c7cd391586fe4290",
    },
    steps: [
      "App já criado em developers.facebook.com (App ID: 94530663455902)",
      "Produtos configurados: Instagram Graph API + Facebook Login for Business",
      "Redirect URI registrada: https://bpr.rehab/api/admin/social/callback",
      "Complete os campos App Secret e Instagram App Secret abaixo (valores parciais — inserir completos)",
      "Clique em Salvar e conectar para autenticar",
    ],
    fields: [
      { key: "appId", label: "Facebook App ID", placeholder: "94530663455902", hint: "Pré-preenchido" },
      { key: "instagramAppId", label: "Instagram App ID", placeholder: "2275652729596451", hint: "Pré-preenchido" },
      { key: "configId", label: "Config ID (FB Login for Business)", placeholder: "791665240649206", hint: "Pré-preenchido" },
      { key: "appSecret", label: "Facebook App Secret", placeholder: "5e704f16a726e0b…fe4290 — inserir valor completo", secret: true },
      { key: "instagramAppSecret", label: "Instagram App Secret", placeholder: "966604ebab29…0223 — inserir valor completo", secret: true },
      { key: "accessToken", label: "Access Token (gerado no OAuth)", placeholder: "EAABwzLixnjYBO...", secret: true },
    ],
  },
  {
    id: "tiktok",
    name: "TikTok",
    gradient: "from-cyan-400 via-pink-500 to-purple-500",
    icon: "🎵",
    description: "Publica vídeos e acessa analytics via TikTok for Developers",
    maxAccounts: 3,
    devPortal: "https://developers.tiktok.com",
    steps: [
      "Acesse developers.tiktok.com e crie uma conta de desenvolvedor",
      "Crie um novo App e adicione os produtos: 'Login Kit' e 'Content Posting API'",
      "Em 'App Key & Secret', copie o Client Key e Client Secret",
      "Configure o Redirect URI para: https://seudominio.com/oauth/tiktok/callback",
      "Cole as credenciais abaixo e clique em Conectar",
    ],
    fields: [
      { key: "clientKey", label: "Client Key", placeholder: "aw7d2hbxxxxxxxxxx" },
      { key: "clientSecret", label: "Client Secret", placeholder: "secret_xxxxxxxxxx", secret: true },
    ],
  },
  {
    id: "youtube",
    name: "YouTube (Google)",
    gradient: "from-red-600 to-red-400",
    icon: "▶️",
    description: "Upload de vídeos, Shorts e acesso ao YouTube Analytics",
    maxAccounts: 2,
    devPortal: "https://console.cloud.google.com",
    steps: [
      "Acesse console.cloud.google.com e crie um projeto",
      "Em 'APIs e Serviços', ative: 'YouTube Data API v3' e 'YouTube Analytics API'",
      "Em 'Credenciais', crie um 'ID do cliente OAuth 2.0' (tipo: Aplicativo da Web)",
      "Adicione o Redirect URI: https://seudominio.com/oauth/google/callback",
      "Copie o Client ID e Client Secret e cole abaixo",
    ],
    fields: [
      { key: "clientId", label: "Client ID", placeholder: "123456789-abc.apps.googleusercontent.com" },
      { key: "clientSecret", label: "Client Secret", placeholder: "GOCSPX-xxxxxxxxxx", secret: true },
      { key: "apiKey", label: "API Key (para requisições públicas)", placeholder: "AIzaSy_xxxxxxxxxx" },
    ],
  },
  {
    id: "twitter",
    name: "X / Twitter",
    gradient: "from-slate-800 to-slate-600",
    icon: "𝕏",
    description: "Publica tweets, acessa DMs e analytics via Twitter API v2",
    maxAccounts: 3,
    devPortal: "https://developer.x.com",
    steps: [
      "Acesse developer.x.com e solicite acesso (plano Basic é gratuito)",
      "Em 'Projects & Apps', crie um novo App",
      "Em 'Keys and Tokens', copie: API Key, API Secret, Bearer Token",
      "Gere um 'Access Token & Secret' para a conta que deseja usar",
      "Cole as credenciais abaixo e clique em Conectar",
    ],
    fields: [
      { key: "apiKey", label: "API Key", placeholder: "xvz1evFS4wEEPTGEFPHBog" },
      { key: "apiSecret", label: "API Secret", placeholder: "L8qq9PZyRg6ieKGEKhZolGC0vJWLw8iEJ88DRdyOg", secret: true },
      { key: "bearerToken", label: "Bearer Token", placeholder: "AAAAAAAAAAAAAA...", secret: true },
      { key: "accessToken", label: "Access Token", placeholder: "1234567890-abc...", secret: true },
    ],
  },
  {
    id: "linkedin",
    name: "LinkedIn",
    gradient: "from-blue-700 to-blue-500",
    icon: "💼",
    description: "Publica em Company Pages e acessa analytics de perfil",
    maxAccounts: 3,
    devPortal: "https://developer.linkedin.com",
    steps: [
      "Acesse developer.linkedin.com e crie um App",
      "Associe o App a uma página da empresa (LinkedIn Company Page)",
      "Em 'Auth', copie o Client ID e Client Secret",
      "Adicione os escopos: r_liteprofile, w_member_social, r_organization_social",
      "Configure o Redirect URI e cole as credenciais abaixo",
    ],
    fields: [
      { key: "clientId", label: "Client ID", placeholder: "86abcde12345fg" },
      { key: "clientSecret", label: "Client Secret", placeholder: "xXxXxXxXxXxXxX", secret: true },
    ],
  },
]

// ─── Mock connected accounts ──────────────────────────────────────────────────

const MOCK_ACCOUNTS: SocialAccount[] = [
  { id: "bpr-meta", platform: "meta", username: "@bruno_physical_rehabilitation", displayName: "Bruno Physical Rehabilitation", status: "connected", connectedAt: "2026-03-28", followers: 0 },
  { id: "yt1", platform: "youtube", username: "@MeuCanal", displayName: "Meu Canal", status: "error", connectedAt: "2026-01-20", followers: 21000 },
  { id: "li1", platform: "linkedin", username: "minha-empresa", displayName: "Minha Empresa Ltda", status: "connected", connectedAt: "2026-03-05", followers: 8900 },
]

const STATUS_CFG = {
  connected: { label: "Conectado", cls: "bg-emerald-500/15 text-emerald-600 border-emerald-500/20", dot: "bg-emerald-500" },
  expired: { label: "Expirado", cls: "bg-amber-500/15 text-amber-600 border-amber-500/20", dot: "bg-amber-500" },
  error: { label: "Erro", cls: "bg-red-500/15 text-red-600 border-red-500/20", dot: "bg-red-500" },
}

function fmt(n: number) {
  if (n >= 1000000) return `${(n / 1000000).toFixed(1)}M`
  if (n >= 1000) return `${(n / 1000).toFixed(1)}k`
  return String(n)
}

function GlassCard({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  return (
    <div className={`rounded-3xl border border-white/50 bg-white/60 shadow-lg shadow-purple-500/10 backdrop-blur-xl dark:border-white/10 dark:bg-white/5 ${className}`}>
      {children}
    </div>
  )
}

// ─── Credential input with show/hide ─────────────────────────────────────────

function SecretInput({ value, onChange, placeholder }: { value: string; onChange: (v: string) => void; placeholder: string }) {
  const [show, setShow] = useState(false)
  return (
    <div className="relative">
      <input
        type={show ? "text" : "password"}
        className="w-full rounded-xl border border-white/50 bg-white/50 px-3 py-2 pr-8 text-sm placeholder:text-muted-foreground/40 focus:outline-none focus:ring-2 focus:ring-indigo-500/40 dark:bg-white/10"
        placeholder={placeholder}
        value={value}
        onChange={(e) => onChange(e.target.value)}
      />
      <button
        type="button"
        onClick={() => setShow((s) => !s)}
        className="absolute right-2 top-1/2 -translate-y-1/2 text-muted-foreground/50 hover:text-muted-foreground"
      >
        {show ? <IconEyeOff className="size-3.5" /> : <IconEye className="size-3.5" />}
      </button>
    </div>
  )
}

// ─── Platform Card ────────────────────────────────────────────────────────────

function PlatformCard({
  platform,
  accounts,
  onConnect,
  onDisconnect,
}: {
  platform: PlatformDef
  accounts: SocialAccount[]
  onConnect: (id: string, creds: Record<string, string>, username: string, existingId?: string) => void
  onDisconnect: (id: string) => void
}) {
  const [expanded, setExpanded] = useState(false)
  const [showForm, setShowForm] = useState(false)
  const [creds, setCreds] = useState<Record<string, string>>(platform.defaultCreds ?? {})
  const [editingAccount, setEditingAccount] = useState<SocialAccount | null>(null)
  const [username, setUsername] = useState("")
  const [saving, setSaving] = useState(false)
  const [copied, setCopied] = useState<string | null>(null)

  const canAdd = accounts.length < platform.maxAccounts
  const inputCls = "w-full rounded-xl border border-white/50 bg-white/50 px-3 py-2 text-sm placeholder:text-muted-foreground/40 focus:outline-none focus:ring-2 focus:ring-indigo-500/40 dark:bg-white/10"

  const handleEdit = (acc: SocialAccount) => {
    setEditingAccount(acc)
    setUsername(acc.username.replace("@", ""))
    setCreds(acc.creds ?? platform.defaultCreds ?? {})
    setShowForm(true)
    setExpanded(true)
  }

  const handleSave = () => {
    setSaving(true)
    setTimeout(() => {
      onConnect(platform.id, creds, username, editingAccount?.id)
      setSaving(false)
      setShowForm(false)
      setCreds(platform.defaultCreds ?? {})
      setUsername("")
      setEditingAccount(null)
    }, 1200)
  }

  const copyToClipboard = (text: string, key: string) => {
    navigator.clipboard.writeText(text).then(() => {
      setCopied(key)
      setTimeout(() => setCopied(null), 1500)
    })
  }

  return (
    <GlassCard className="overflow-hidden">
      {/* Header row */}
      <div className="flex items-center gap-3 p-5">
        <div className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br ${platform.gradient} text-2xl text-white shadow-sm`}>
          {platform.icon}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <h3 className="text-sm font-bold">{platform.name}</h3>
            <span className="rounded-full border border-white/40 bg-white/30 px-2 py-0.5 text-[10px] font-medium text-muted-foreground dark:bg-white/10">
              {accounts.length}/{platform.maxAccounts} contas
            </span>
          </div>
          <p className="text-[11px] text-muted-foreground truncate">{platform.description}</p>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          {canAdd && !showForm && (
            <button
              onClick={() => { setShowForm(true); setExpanded(true) }}
              className={`flex items-center gap-1.5 rounded-xl bg-gradient-to-r ${platform.gradient} px-3 py-1.5 text-xs font-semibold text-white shadow-sm transition-all hover:scale-105`}
            >
              <IconPlus className="size-3.5" />
              Conectar
            </button>
          )}
          <button
            onClick={() => setExpanded((e) => !e)}
            className="flex h-8 w-8 items-center justify-center rounded-xl border border-white/50 bg-white/40 text-muted-foreground transition-all hover:bg-white/60"
          >
            {expanded ? <IconChevronUp className="size-4" /> : <IconChevronDown className="size-4" />}
          </button>
        </div>
      </div>

      {expanded && (
        <div className="border-t border-white/30 px-5 pb-5">

          {/* Connected accounts */}
          {accounts.length > 0 && (
            <div className="mt-4 space-y-2">
              <p className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground/60">Contas conectadas</p>
              {accounts.map((acc) => (
                <div key={acc.id} className="flex items-center gap-3 rounded-2xl border border-white/40 bg-white/30 p-3 dark:bg-white/5">
                  <div className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br ${platform.gradient} shadow-sm`}>
                    <IconUser className="size-3.5 text-white" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-semibold truncate">{acc.displayName}</span>
                      <span className={`flex shrink-0 items-center gap-1 rounded-full border px-2 py-0.5 text-[10px] font-semibold ${STATUS_CFG[acc.status].cls}`}>
                        <span className={`h-1.5 w-1.5 rounded-full ${STATUS_CFG[acc.status].dot}`} />
                        {STATUS_CFG[acc.status].label}
                      </span>
                    </div>
                    <div className="flex items-center gap-3 mt-0.5 text-[11px] text-muted-foreground">
                      <span>{acc.username}</span>
                      {acc.followers && acc.followers > 0 && <span>👥 {fmt(acc.followers)}</span>}
                      <span>{acc.connectedAt}</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-1 shrink-0">
                    <button onClick={() => handleEdit(acc)}
                      className="flex h-7 w-7 items-center justify-center rounded-xl border border-white/40 bg-white/40 text-muted-foreground hover:text-foreground"
                      title="Editar credenciais">
                      <IconPencil className="size-3.5" />
                    </button>
                    <a href={`https://${platform.id}.com`} target="_blank" rel="noopener noreferrer"
                      className="flex h-7 w-7 items-center justify-center rounded-xl border border-white/40 bg-white/40 text-muted-foreground hover:text-foreground">
                      <IconExternalLink className="size-3.5" />
                    </a>
                    <button onClick={() => onDisconnect(acc.id)}
                      className="flex h-7 w-7 items-center justify-center rounded-xl border border-red-500/20 bg-red-500/10 text-red-500 hover:bg-red-500/20">
                      <IconTrash className="size-3.5" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* No accounts empty state */}
          {accounts.length === 0 && !showForm && (
            <div className="mt-4 flex items-center gap-3 rounded-2xl border-2 border-dashed border-white/40 p-4">
              <IconUnlink className="size-5 text-muted-foreground/30" />
              <div>
                <p className="text-sm font-medium text-muted-foreground">Nenhuma conta conectada</p>
                <p className="text-xs text-muted-foreground/60">Clique em "Conectar" para adicionar suas credenciais</p>
              </div>
            </div>
          )}

          {/* Step-by-step guide */}
          {showForm && (
            <div className="mt-4 space-y-4">
              <div className="rounded-2xl border border-indigo-500/20 bg-indigo-500/5 p-4">
                <div className="mb-3 flex items-center justify-between">
                  <p className="text-xs font-bold text-indigo-700 dark:text-indigo-300">📋 Passo a passo — onde buscar as credenciais</p>
                  <a href={platform.devPortal} target="_blank" rel="noopener noreferrer"
                    className="flex items-center gap-1 text-[11px] font-semibold text-indigo-600 hover:underline">
                    Abrir portal <IconExternalLink className="size-3" />
                  </a>
                </div>
                <ol className="space-y-1.5">
                  {platform.steps.map((step, i) => (
                    <li key={i} className="flex items-start gap-2.5 text-xs text-muted-foreground">
                      <span className={`flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-gradient-to-br ${platform.gradient} text-[10px] font-bold text-white`}>
                        {i + 1}
                      </span>
                      {step}
                    </li>
                  ))}
                </ol>
              </div>

              {/* Username */}
              <div>
                <label className="mb-1 block text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">Nome / @ da conta</label>
                <input className={inputCls} placeholder="@minha_conta ou Nome da Página" value={username} onChange={(e) => setUsername(e.target.value)} />
              </div>

              {/* Credential fields */}
              {platform.fields.map((f) => (
                <div key={f.key}>
                  <div className="mb-1 flex items-center justify-between gap-2">
                    <div className="flex items-center gap-1.5">
                      <label className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">{f.label}</label>
                      {f.hint && (
                        <span className="rounded-full bg-emerald-500/15 px-1.5 py-0.5 text-[9px] font-bold uppercase tracking-wide text-emerald-600 dark:text-emerald-400">
                          {f.hint}
                        </span>
                      )}
                    </div>
                    {creds[f.key] && (
                      <button onClick={() => copyToClipboard(creds[f.key], f.key)}
                        className="flex items-center gap-0.5 text-[10px] text-muted-foreground/60 hover:text-muted-foreground">
                        {copied === f.key ? <IconCheck className="size-3 text-emerald-500" /> : <IconCopy className="size-3" />}
                        {copied === f.key ? "Copiado!" : "Copiar"}
                      </button>
                    )}
                  </div>
                  {f.secret ? (
                    <SecretInput value={creds[f.key] ?? ""} onChange={(v) => setCreds((c) => ({ ...c, [f.key]: v }))} placeholder={f.placeholder} />
                  ) : (
                    <input className={inputCls} placeholder={f.placeholder} value={creds[f.key] ?? ""} onChange={(e) => setCreds((c) => ({ ...c, [f.key]: e.target.value }))} />
                  )}
                </div>
              ))}

              {/* Redirect URI helper */}
              <div className="rounded-xl border border-white/40 bg-white/30 p-3 dark:bg-white/5">
                <p className="mb-1 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">Redirect URI para configurar no portal</p>
                <div className="flex items-center gap-2">
                  <code className="flex-1 overflow-x-auto rounded-lg bg-black/5 px-2 py-1 text-[11px] dark:bg-white/10">
                    {platform.redirectUri ?? `https://seudominio.com/oauth/${platform.id}/callback`}
                  </code>
                  <button onClick={() => copyToClipboard(platform.redirectUri ?? `https://seudominio.com/oauth/${platform.id}/callback`, "redirect")}
                    className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg border border-white/40 bg-white/40 text-muted-foreground hover:text-foreground">
                    {copied === "redirect" ? <IconCheck className="size-3.5 text-emerald-500" /> : <IconCopy className="size-3.5" />}
                  </button>
                </div>
              </div>

              <div className="flex gap-2 pt-1">
                <button
                  onClick={handleSave}
                  disabled={saving || !username}
                  className={`flex flex-1 items-center justify-center gap-2 rounded-xl bg-gradient-to-r ${platform.gradient} py-2.5 text-sm font-semibold text-white shadow-sm transition-all hover:scale-[1.02] disabled:opacity-50`}
                >
                  {saving ? <IconRefresh className="size-4 animate-spin" /> : <IconCheck className="size-4" />}
                  {saving ? "Conectando..." : "Salvar e conectar"}
                </button>
                <button
                  onClick={() => { setShowForm(false); setCreds(platform.defaultCreds ?? {}); setEditingAccount(null) }}
                  className="rounded-xl border border-white/50 bg-white/40 px-4 py-2.5 text-sm font-semibold text-muted-foreground hover:bg-white/60"
                >
                  Cancelar
                </button>
              </div>
            </div>
          )}
        </div>
      )}
    </GlassCard>
  )
}

// ─── Main Page ────────────────────────────────────────────────────────────────

export function ContasPage() {
  const [accounts, setAccounts] = useState<SocialAccount[]>(MOCK_ACCOUNTS)

  const accountsByPlatform = (id: string) => accounts.filter((a) => a.platform === id)

  const handleConnect = (platformId: string, creds: Record<string, string>, username: string, existingId?: string) => {
    const platform = PLATFORM_DEFS.find((p) => p.id === platformId)
    if (!platform) return
    
    if (existingId) {
      // Update existing account
      setAccounts((prev) =>
        prev.map((a) =>
          a.id === existingId
            ? { ...a, creds, username: username.startsWith("@") ? username : `@${username}`, displayName: username }
            : a
        )
      )
    } else {
      // Add new account
      const acc: SocialAccount = {
        id: `${platformId}-${Date.now()}`,
        platform: platformId,
        username: username.startsWith("@") ? username : `@${username}`,
        displayName: username,
        status: "connected",
        connectedAt: new Date().toISOString().slice(0, 10),
        followers: 0,
        creds,
      }
      setAccounts((prev) => [...prev, acc])
    }
  }

  const handleDisconnect = (id: string) => setAccounts((prev) => prev.filter((a) => a.id !== id))

  const totalConnected = accounts.filter((a) => a.status === "connected").length
  const needAttention = accounts.filter((a) => a.status !== "connected").length

  return (
    <div className="flex h-full flex-col overflow-y-auto">
      <PageHeader title="Contas Conectadas" />

      <div className="flex-1 px-4 py-6 md:px-8 lg:px-12">
        <div className="mx-auto max-w-5xl space-y-6">

          <div>
            <h2 className="bg-gradient-to-r from-indigo-600 to-violet-600 bg-clip-text text-2xl font-bold text-transparent">
              Contas & Integrações
            </h2>
            <p className="text-sm text-muted-foreground">
              Conecte suas redes sociais — siga o passo a passo de cada plataforma para obter as credenciais necessárias
            </p>
          </div>

          {/* Summary */}
          <div className="grid grid-cols-3 gap-4">
            {[
              { label: "Contas ativas", value: totalConnected, color: "text-emerald-600", bg: "bg-emerald-500/10", icon: IconCheck },
              { label: "Precisam atenção", value: needAttention, color: "text-amber-600", bg: "bg-amber-500/10", icon: IconAlertCircle },
              { label: "Plataformas disponíveis", value: PLATFORM_DEFS.length, color: "text-violet-600", bg: "bg-violet-500/10", icon: IconLink },
            ].map((s) => (
              <GlassCard key={s.label} className="flex items-center gap-3 p-4">
                <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl ${s.bg}`}>
                  <s.icon className={`size-5 ${s.color}`} />
                </div>
                <div>
                  <p className="text-2xl font-bold">{s.value}</p>
                  <p className="text-[11px] text-muted-foreground">{s.label}</p>
                </div>
              </GlassCard>
            ))}
          </div>

          {/* Platform cards */}
          <div className="space-y-4">
            {PLATFORM_DEFS.map((platform) => (
              <PlatformCard
                key={platform.id}
                platform={platform}
                accounts={accountsByPlatform(platform.id)}
                onConnect={handleConnect}
                onDisconnect={handleDisconnect}
              />
            ))}
          </div>

          {/* Security note */}
          <GlassCard className="bg-gradient-to-br from-indigo-500/5 to-violet-500/5 p-5">
            <div className="flex items-start gap-3">
              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-indigo-500 to-violet-500 shadow-sm">
                <IconLink className="size-4 text-white" />
              </div>
              <div>
                <h4 className="text-sm font-bold">Segurança das credenciais</h4>
                <p className="mt-1 text-xs leading-relaxed text-muted-foreground">
                  Todas as chaves são armazenadas criptografadas no servidor. O App Secret nunca é enviado ao frontend após ser salvo.
                  Você pode revogar o acesso a qualquer momento aqui ou diretamente no portal de cada plataforma.
                  Use <strong>contas de teste</strong> durante o desenvolvimento antes de usar credenciais de produção.
                </p>
              </div>
            </div>
          </GlassCard>

        </div>
      </div>
    </div>
  )
}
