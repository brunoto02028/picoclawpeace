// Componentes base do Dashboard
import { TrendingUp, TrendingDown, Minus } from 'lucide-react';

interface StatCardProps {
  title: string;
  value: string | number;
  change?: number;
  icon: React.ReactNode;
  trend?: 'up' | 'down' | 'neutral';
}

export function StatCard({ title, value, change, icon, trend = 'neutral' }: StatCardProps) {
  const TrendIcon = trend === 'up' ? TrendingUp : trend === 'down' ? TrendingDown : Minus;
  const trendColor = trend === 'up' ? 'text-green-500' : trend === 'down' ? 'text-red-500' : 'text-gray-400';

  return (
    <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
      <div className="flex items-center justify-between mb-4">
        <div className="p-2 bg-indigo-50 rounded-lg text-indigo-600">
          {icon}
        </div>
        {change !== undefined && (
          <div className={`flex items-center gap-1 text-sm font-medium ${trendColor}`}>
            <TrendIcon size={16} />
            <span>{change > 0 ? '+' : ''}{change}%</span>
          </div>
        )}
      </div>
      <h3 className="text-2xl font-bold text-gray-900">{value}</h3>
      <p className="text-gray-500 text-sm mt-1">{title}</p>
    </div>
  );
}

interface ChannelBadgeProps {
  channel: string;
  size?: 'sm' | 'md';
}

export function ChannelBadge({ channel, size = 'sm' }: ChannelBadgeProps) {
  const colors: Record<string, string> = {
    instagram: 'bg-gradient-to-r from-purple-500 to-pink-500',
    facebook: 'bg-blue-600',
    tiktok: 'bg-black',
    linkedin: 'bg-blue-700',
    twitter: 'bg-sky-500',
  };

  const sizeClasses = size === 'sm' ? 'px-2 py-0.5 text-xs' : 'px-3 py-1 text-sm';

  return (
    <span className={`${colors[channel] || 'bg-gray-500'} ${sizeClasses} text-white rounded-full font-medium capitalize`}>
      {channel}
    </span>
  );
}

interface StatusBadgeProps {
  status: 'draft' | 'scheduled' | 'published' | 'failed';
}

export function StatusBadge({ status }: StatusBadgeProps) {
  const styles: Record<string, string> = {
    draft: 'bg-gray-100 text-gray-600',
    scheduled: 'bg-blue-100 text-blue-600',
    published: 'bg-green-100 text-green-600',
    failed: 'bg-red-100 text-red-600',
  };

  return (
    <span className={`${styles[status]} px-2 py-1 rounded-full text-xs font-medium capitalize`}>
      {status}
    </span>
  );
}

interface InsightCardProps {
  type: 'suggestion' | 'alert' | 'opportunity' | 'trend';
  title: string;
  description: string;
  action?: string;
  priority: 'high' | 'medium' | 'low';
}

export function InsightCard({ type, title, description, action, priority }: InsightCardProps) {
  const icons: Record<string, { bg: string; icon: string }> = {
    suggestion: { bg: 'bg-blue-100 text-blue-600', icon: '💡' },
    alert: { bg: 'bg-red-100 text-red-600', icon: '⚠️' },
    opportunity: { bg: 'bg-green-100 text-green-600', icon: '🎯' },
    trend: { bg: 'bg-purple-100 text-purple-600', icon: '📈' },
  };

  const priorityBadge: Record<string, string> = {
    high: 'bg-red-100 text-red-600',
    medium: 'bg-yellow-100 text-yellow-600',
    low: 'bg-gray-100 text-gray-600',
  };

  const { bg, icon } = icons[type];

  return (
    <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
      <div className="flex items-start gap-3">
        <div className={`w-10 h-10 ${bg} rounded-lg flex items-center justify-center text-lg`}>
          {icon}
        </div>
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-1">
            <h4 className="font-semibold text-gray-900">{title}</h4>
            <span className={`${priorityBadge[priority]} px-2 py-0.5 rounded text-xs font-medium capitalize`}>
              {priority}
            </span>
          </div>
          <p className="text-sm text-gray-600 mb-2">{description}</p>
          {action && (
            <button className="text-sm text-indigo-600 font-medium hover:text-indigo-700">
              → {action}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
