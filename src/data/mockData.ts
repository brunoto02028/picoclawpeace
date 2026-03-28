// Dados mockados para demonstração do Dashboard
import type { Post, Campaign, ChannelMetrics, DailyMetrics, Insight } from '../types';

export const mockChannelMetrics: ChannelMetrics[] = [
  { channel: 'Instagram', followers: 12500, engagementRate: 4.8, postsCount: 156, totalReach: 89000, growthRate: 12.5 },
  { channel: 'Facebook', followers: 8200, engagementRate: 2.3, postsCount: 98, totalReach: 45000, growthRate: 5.2 },
  { channel: 'TikTok', followers: 7800, engagementRate: 8.1, postsCount: 45, totalReach: 120000, growthRate: 28.4 },
  { channel: 'LinkedIn', followers: 3400, engagementRate: 3.2, postsCount: 67, totalReach: 23000, growthRate: 8.7 },
];

export const mockDailyMetrics: DailyMetrics[] = Array.from({ length: 30 }, (_, i) => {
  const date = new Date();
  date.setDate(date.getDate() - (29 - i));
  return {
    date: date.toISOString().split('T')[0],
    reach: Math.floor(Math.random() * 5000) + 3000,
    engagement: Math.floor(Math.random() * 800) + 200,
    newFollowers: Math.floor(Math.random() * 50) + 10,
    clicks: Math.floor(Math.random() * 400) + 100,
  };
});

export const mockPosts: Post[] = [
  {
    id: '1',
    content: '🚀 Novo recurso lançado! Descubra como nossa plataforma pode transformar seu negócio. Link na bio! #inovação #tech #negócios',
    channel: 'instagram',
    publishedAt: new Date(Date.now() - 86400000),
    status: 'published',
    metrics: { likes: 342, comments: 28, shares: 15, reach: 4500, impressions: 8900 },
  },
  {
    id: '2',
    content: 'Dica rápida: 5 hábitos que vão aumentar sua produtividade em 2024. Você já pratica algum? ⏰',
    channel: 'instagram',
    scheduledAt: new Date(Date.now() + 86400000 * 2),
    status: 'scheduled',
  },
  {
    id: '3',
    content: 'Estamos contratando! Procuramos desenvolvedores apaixonados por tecnologia. Confira as vagas 👇',
    channel: 'linkedin',
    publishedAt: new Date(Date.now() - 86400000 * 3),
    status: 'published',
    metrics: { likes: 89, comments: 34, shares: 12, reach: 1200, impressions: 3400 },
  },
  {
    id: '4',
    content: 'POV: Quando o código funciona de primeira 😅💻 #programming #devhumor #coding',
    channel: 'tiktok',
    publishedAt: new Date(Date.now() - 86400000 * 5),
    status: 'published',
    metrics: { likes: 1250, comments: 89, shares: 234, reach: 15000, impressions: 45000 },
  },
];

export const mockCampaigns: Campaign[] = [
  {
    id: '1',
    name: 'Lançamento Produto X',
    description: 'Campanha de lançamento do novo produto com foco em conversão',
    startDate: new Date(Date.now() - 86400000 * 7),
    endDate: new Date(Date.now() + 86400000 * 7),
    channels: ['instagram', 'facebook'],
    status: 'active',
    posts: [],
    totalMetrics: { likes: 892, comments: 67, shares: 45, reach: 15000, impressions: 34000 },
  },
  {
    id: '2',
    name: ' Awareness Janeiro',
    description: 'Campanha de marca para Janeiro - foco em alcance e reconhecimento',
    startDate: new Date(Date.now() - 86400000 * 14),
    endDate: new Date(Date.now() + 86400000 * 14),
    channels: ['instagram', 'tiktok', 'linkedin'],
    status: 'active',
    posts: [],
    totalMetrics: { likes: 2340, comments: 156, shares: 89, reach: 45000, impressions: 89000 },
  },
];

export const mockInsights: Insight[] = [
  {
    id: '1',
    type: 'opportunity',
    title: 'Melhor horário para postar',
    description: 'Seus posts entre 18h-20h têm 40% mais engajamento. Considere agendar mais conteúdo nesse período.',
    priority: 'high',
    createdAt: new Date(Date.now() - 3600000),
    action: 'Agendar posts para 19h',
  },
  {
    id: '2',
    type: 'trend',
    title: 'Conteúdo educativo em alta',
    description: 'Posts do tipo tutorial estão com 65% mais alcance no seu nicho. Hora de criar uma série!',
    priority: 'high',
    createdAt: new Date(Date.now() - 7200000),
    action: 'Criar série de tutoriais',
  },
  {
    id: '3',
    type: 'suggestion',
    title: 'Hashtags subutilizadas',
    description: 'Você ainda não usa #inovação2024 e #tendências que estão em alta no seu nicho.',
    priority: 'medium',
    createdAt: new Date(Date.now() - 86400000),
  },
  {
    id: '4',
    type: 'alert',
    title: 'Engajamento do Facebook caiu',
    description: 'Taxa de engajamento do Facebook caiu 15% na última semana. Revise sua estratégia.',
    priority: 'high',
    createdAt: new Date(Date.now() - 86400000 * 2),
    action: 'Analisar publicações',
  },
];
