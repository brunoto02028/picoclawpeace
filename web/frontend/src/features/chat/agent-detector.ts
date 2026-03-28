export interface AgentProfile {
  name: string
  label: string
  keywords: string[]
}

export const AGENT_PROFILES: AgentProfile[] = [
  {
    name: "ceo",
    label: "CEO",
    keywords: [
      "estratégia", "estrategia", "planejamento", "meta", "metas", "objetivo",
      "objetivo", "visão", "visao", "decisão", "decisao", "prioridade",
      "prioridades", "agenda", "reunião", "reuniao", "negócio", "negocio",
      "empresa", "equipe", "time", "liderança", "lideranca", "organizar",
      "organização", "organizacao", "plan", "planning", "strategy", "goal",
      "goals", "business", "schedule", "meeting", "priority", "vision",
    ],
  },
  {
    name: "cto",
    label: "CTO",
    keywords: [
      "código", "codigo", "code", "bug", "erro", "error", "técnico", "tecnico",
      "technical", "api", "banco de dados", "database", "servidor", "server",
      "deploy", "deployment", "arquitetura", "architecture", "sistema", "system",
      "programa", "programar", "develop", "desenvolvimento", "git", "docker",
      "kubernetes", "infra", "infraestrutura", "infrastructure", "segurança",
      "seguranca", "security", "performance", "otimizar", "optimize", "backend",
      "frontend", "integração", "integracao", "integration", "automação",
      "automacao", "automation", "script", "função", "funcao", "function",
      "implementar", "implement", "refactor", "refatorar",
    ],
  },
  {
    name: "cmo",
    label: "CMO",
    keywords: [
      "marketing", "campanha", "campaign", "marca", "brand", "conteúdo",
      "conteudo", "content", "redes sociais", "social media", "instagram",
      "linkedin", "twitter", "tiktok", "facebook", "post", "publicação",
      "publicacao", "anúncio", "anuncio", "ads", "seo", "audiência",
      "audiencia", "audience", "engajamento", "engagement", "cliente",
      "clientes", "customer", "customers", "promoção", "promocao", "promotion",
      "vendas", "sales", "email marketing", "newsletter", "lead", "leads",
      "funil", "funnel", "conversão", "conversao", "conversion",
    ],
  },
]

export interface AgentSuggestion {
  agentName: string
  agentLabel: string
  score: number
}

/**
 * Analyzes a message and returns the best agent match.
 * Returns null if no agent is clearly better than the current one.
 */
export function detectBestAgent(
  message: string,
  currentAgentName: string,
): AgentSuggestion | null {
  const normalized = message.toLowerCase()

  const scores = AGENT_PROFILES.map((profile) => {
    const score = profile.keywords.filter((kw) =>
      normalized.includes(kw),
    ).length
    return { agentName: profile.name, agentLabel: profile.label, score }
  })

  const best = scores.reduce((a, b) => (b.score > a.score ? b : a))

  // Only suggest if there's a clear match (score >= 1) and it's a different agent
  if (best.score < 1 || best.agentName === currentAgentName) return null

  return best
}
