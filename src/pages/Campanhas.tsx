// Página de Campanhas
import { useState } from 'react';
import { Plus, Play, Pause, Flag, Calendar, Target, TrendingUp } from 'lucide-react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { mockCampaigns } from '../data/mockData';
import { ChannelBadge } from '../components/ui';

export function Campanhas() {
  const [campaigns] = useState(mockCampaigns);

  const totalCampaigns = campaigns.length;
  const activeCampaigns = campaigns.filter(c => c.status === 'active').length;
  const totalReach = campaigns.reduce((acc, c) => acc + c.totalMetrics.reach, 0);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Campanhas</h1>
          <p className="text-gray-500">Planeje e acompanhe suas campanhas de marketing</p>
        </div>
        <button className="flex items-center gap-2 bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 transition-colors">
          <Plus size={20} />
          Nova Campanha
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-gradient-to-r from-indigo-500 to-purple-600 rounded-xl p-6 text-white">
          <div className="text-3xl font-bold">{totalCampaigns}</div>
          <div className="text-indigo-100">Total de Campanhas</div>
        </div>
        <div className="bg-gradient-to-r from-green-500 to-emerald-600 rounded-xl p-6 text-white">
          <div className="text-3xl font-bold">{activeCampaigns}</div>
          <div className="text-green-100">Campanhas Ativas</div>
        </div>
        <div className="bg-gradient-to-r from-orange-500 to-red-500 rounded-xl p-6 text-white">
          <div className="text-3xl font-bold">{totalReach.toLocaleString()}</div>
          <div className="text-orange-100">Alcance Total</div>
        </div>
      </div>

      {/* Campaigns List */}
      <div className="space-y-4">
        {campaigns.map(campaign => (
          <div key={campaign.id} className="bg-white rounded-xl p-6 shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
            <div className="flex items-start justify-between mb-4">
              <div>
                <div className="flex items-center gap-3 mb-2">
                  <h3 className="text-xl font-semibold text-gray-900">{campaign.name}</h3>
                  <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                    campaign.status === 'active' ? 'bg-green-100 text-green-600' :
                    campaign.status === 'paused' ? 'bg-yellow-100 text-yellow-600' :
                    campaign.status === 'completed' ? 'bg-gray-100 text-gray-600' :
                    'bg-blue-100 text-blue-600'
                  }`}>
                    {campaign.status === 'active' && '🟢 '}
                    {campaign.status === 'paused' && '⏸️ '}
                    {campaign.status === 'completed' && '✅ '}
                    {campaign.status === 'draft' && '📝 '}
                    {campaign.status === 'active' ? 'Ativa' :
                     campaign.status === 'paused' ? 'Pausada' :
                     campaign.status === 'completed' ? 'Concluída' : 'Rascunho'}
                  </span>
                </div>
                <p className="text-gray-600">{campaign.description}</p>
              </div>
              <div className="flex items-center gap-2">
                <button className="p-2 hover:bg-gray-100 rounded-lg">
                  {campaign.status === 'active' ? (
                    <Pause size={20} className="text-gray-600" />
                  ) : (
                    <Play size={20} className="text-green-600" />
                  )}
                </button>
                <button className="p-2 hover:bg-gray-100 rounded-lg">
                  <Flag size={20} className="text-gray-400" />
                </button>
              </div>
            </div>

            {/* Channels */}
            <div className="flex items-center gap-2 mb-4">
              <span className="text-sm text-gray-500">Canais:</span>
              {campaign.channels.map(channel => (
                <ChannelBadge key={channel} channel={channel} />
              ))}
            </div>

            {/* Dates */}
            <div className="flex items-center gap-6 text-sm text-gray-500 mb-4">
              <span className="flex items-center gap-1">
                <Calendar size={16} />
                Início: {format(campaign.startDate, "d 'de' MMMM", { locale: ptBR })}
              </span>
              {campaign.endDate && (
                <span className="flex items-center gap-1">
                  <Calendar size={16} />
                  Fim: {format(campaign.endDate, "d 'de' MMMM", { locale: ptBR })}
                </span>
              )}
            </div>

            {/* Metrics */}
            <div className="grid grid-cols-2 md:grid-cols-5 gap-4 pt-4 border-t border-gray-100">
              <div>
                <div className="text-2xl font-bold text-gray-900">{campaign.totalMetrics.likes.toLocaleString()}</div>
                <div className="text-sm text-gray-500">Curtidas</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-gray-900">{campaign.totalMetrics.comments.toLocaleString()}</div>
                <div className="text-sm text-gray-500">Comentários</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-gray-900">{campaign.totalMetrics.shares.toLocaleString()}</div>
                <div className="text-sm text-gray-500">Compartilhamentos</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-gray-900">{campaign.totalMetrics.reach.toLocaleString()}</div>
                <div className="text-sm text-gray-500">Alcance</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-indigo-600 flex items-center gap-1">
                  <TrendingUp size={20} />
                  {((campaign.totalMetrics.reach / campaign.totalMetrics.impressions) * 100).toFixed(1)}%
                </div>
                <div className="text-sm text-gray-500">Taxa de Alcance</div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* AI Suggestions */}
      <div className="bg-gradient-to-r from-purple-50 to-indigo-50 rounded-xl p-6 border border-purple-100">
        <div className="flex items-start gap-4">
          <div className="p-3 bg-purple-100 rounded-xl">
            <Target size={28} className="text-purple-600" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">💡 Sugestão de IA</h3>
            <p className="text-gray-600 mb-3">
              Baseado na performance das suas campanhas ativas, considere:
            </p>
            <ul className="space-y-2 text-gray-700">
              <li>• Aumentar o investimento na campanha "Awareness Janeiro" - está tendo 40% mais ROAS</li>
              <li>• Adicionar LinkedIn à campanha "Lançamento Produto X" - seu público B2B está mais engajado</li>
              <li>• Criar uma sequência de posts para converter usuários que visualizaram mas não interagiram</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
