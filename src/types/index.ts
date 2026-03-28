// Tipos para o Dashboard de Redes Sociais

export interface Post {
  id: string;
  content: string;
  image?: string;
  channel: 'instagram' | 'facebook' | 'tiktok' | 'linkedin' | 'twitter';
  scheduledAt?: Date;
  publishedAt?: Date;
  status: 'draft' | 'scheduled' | 'published' | 'failed';
  metrics?: PostMetrics;
}

export interface PostMetrics {
  likes: number;
  comments: number;
  shares: number;
  reach: number;
  impressions: number;
}

export interface Campaign {
  id: string;
  name: string;
  description: string;
  startDate: Date;
  endDate?: Date;
  channels: string[];
  status: 'active' | 'paused' | 'completed' | 'draft';
  posts: Post[];
  totalMetrics: PostMetrics;
}

export interface ChannelMetrics {
  channel: string;
  followers: number;
  engagementRate: number;
  postsCount: number;
  totalReach: number;
  growthRate: number;
}

export interface DailyMetrics {
  date: string;
  reach: number;
  engagement: number;
  newFollowers: number;
  clicks: number;
}

export interface Insight {
  id: string;
  type: 'suggestion' | 'alert' | 'opportunity' | 'trend';
  title: string;
  description: string;
  priority: 'high' | 'medium' | 'low';
  createdAt: Date;
  action?: string;
}
