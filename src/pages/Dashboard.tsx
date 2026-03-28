// Página principal do Dashboard
import { Users, Eye, Heart, TrendingUp } from 'lucide-react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar } from 'recharts';
import { StatCard } from '../components/ui';
import { mockChannelMetrics, mockDailyMetrics, mockInsights } from '../data/mockData';
import { InsightCard } from '../components/ui';

export function Dashboard() {
  const totalReach = mockChannelMetrics.reduce((acc, c) => acc + c.totalReach, 0);
  const avgEngagement = (mockChannelMetrics.reduce((acc, c) => acc + c.engagementRate, 0) / mockChannelMetrics.length).toFixed(1);
  const totalFollowers = mockChannelMetrics.reduce((acc, c) => acc + c.followers, 0);
  const totalPosts = mockChannelMetrics.reduce((acc, c) => acc + c.postsCount, 0);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
        <p className="text-gray-500">Visão geral das suas redes sociais</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Total de Seguidores"
          value={totalFollowers.toLocaleString()}
          change={12.5}
          icon={<Users size={24} />}
          trend="up"
        />
        <StatCard
          title="Alcance Total"
          value={totalReach.toLocaleString()}
          change={8.3}
          icon={<Eye size={24} />}
          trend="up"
        />
        <StatCard
          title="Taxa de Engajamento"
          value={`${avgEngagement}%`}
          change={-2.1}
          icon={<Heart size={24} />}
          trend="down"
        />
        <StatCard
          title="Posts Publicados"
          value={totalPosts}
          change={15}
          icon={<TrendingUp size={24} />}
          trend="up"
        />
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Reach Chart */}
        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Alcance (Últimos 30 dias)</h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={mockDailyMetrics}>
                <defs>
                  <linearGradient id="colorReach" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#6366f1" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#6366f1" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis 
                  dataKey="date" 
                  tickFormatter={(val) => new Date(val).getDate() + '/' + (new Date(val).getMonth() + 1)}
                  stroke="#9ca3af"
                  fontSize={12}
                />
                <YAxis stroke="#9ca3af" fontSize={12} />
                <Tooltip 
                  contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1)' }}
                />
                <Area 
                  type="monotone" 
                  dataKey="reach" 
                  stroke="#6366f1" 
                  strokeWidth={2}
                  fill="url(#colorReach)" 
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Engagement Chart */}
        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Engajamento (Últimos 30 dias)</h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={mockDailyMetrics}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis 
                  dataKey="date" 
                  tickFormatter={(val) => new Date(val).getDate() + '/' + (new Date(val).getMonth() + 1)}
                  stroke="#9ca3af"
                  fontSize={12}
                />
                <YAxis stroke="#9ca3af" fontSize={12} />
                <Tooltip 
                  contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1)' }}
                />
                <Bar dataKey="engagement" fill="#8b5cf6" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Channel Metrics */}
      <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Performance por Canal</h3>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="text-left text-gray-500 text-sm border-b">
                <th className="pb-3 font-medium">Canal</th>
                <th className="pb-3 font-medium">Seguidores</th>
                <th className="pb-3 font-medium">Posts</th>
                <th className="pb-3 font-medium">Alcance</th>
                <th className="pb-3 font-medium">Engajamento</th>
                <th className="pb-3 font-medium">Crescimento</th>
              </tr>
            </thead>
            <tbody>
              {mockChannelMetrics.map((channel) => (
                <tr key={channel.channel} className="border-b last:border-0">
                  <td className="py-4 font-medium text-gray-900">{channel.channel}</td>
                  <td className="py-4 text-gray-600">{channel.followers.toLocaleString()}</td>
                  <td className="py-4 text-gray-600">{channel.postsCount}</td>
                  <td className="py-4 text-gray-600">{channel.totalReach.toLocaleString()}</td>
                  <td className="py-4">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                      channel.engagementRate > 5 ? 'bg-green-100 text-green-600' : 
                      channel.engagementRate > 3 ? 'bg-yellow-100 text-yellow-600' : 
                      'bg-red-100 text-red-600'
                    }`}>
                      {channel.engagementRate}%
                    </span>
                  </td>
                  <td className="py-4">
                    <span className="text-green-600 font-medium">+{channel.growthRate}%</span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Insights */}
      <div>
        <h3 className="text-lg font-semibold text-gray-900 mb-4">💡 Insights e Sugestões</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {mockInsights.map((insight) => (
            <InsightCard key={insight.id} {...insight} />
          ))}
        </div>
      </div>
    </div>
  );
}
