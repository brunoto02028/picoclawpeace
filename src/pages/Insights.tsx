// Página de Insights
import { Lightbulb, AlertTriangle, Target, TrendingUp, Clock, Hash, Sparkles, ArrowRight } from 'lucide-react';
import { mockInsights, mockDailyMetrics } from '../data/mockData';

export function Insights() {
  const insights = mockInsights;
  const highPriority = insights.filter(i => i.priority === 'high');
  const avgEngagement = (mockDailyMetrics.reduce((acc, d) => acc + d.engagement, 0) / mockDailyMetrics.length).toFixed(0);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Insights</h1>
        <p className="text-gray-500">Análises e sugestões para melhorar suas redes sociais</p>
      </div>

      {/* AI Summary */}
      <div className="bg-gradient-to-r from-indigo-600 to-purple-600 rounded-xl p-6 text-white">
        <div className="flex items-center gap-3 mb-4">
          <Sparkles size={28} />
          <h2 className="text-xl font-semibold">Resumo da Semana</h2>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="bg-white/10 rounded-lg p-4">
            <div className="text-2xl font-bold">+12.5%</div>
            <div className="text-indigo-100 text-sm">Crescimento de seguidores</div>
          </div>
          <div className="bg-white/10 rounded-lg p-4">
            <div className="text-2xl font-bold">{avgEngagement}</div>
            <div className="text-indigo-100 text-sm">Média de engajamento/dia</div>
          </div>
          <div className="bg-white/10 rounded-lg p-4">
            <div className="text-2xl font-bold">89k</div>
            <div className="text-indigo-100 text-sm">Alcance total</div>
          </div>
          <div className="bg-white/10 rounded-lg p-4">
            <div className="text-2xl font-bold">4.8%</div>
            <div className="text-indigo-100 text-sm">Taxa de engajamento</div>
          </div>
        </div>
      </div>

      {/* Priority Alerts */}
      {highPriority.length > 0 && (
        <div className="bg-red-50 border border-red-200 rounded-xl p-4">
          <div className="flex items-center gap-2 text-red-700 font-semibold mb-3">
            <AlertTriangle size={20} />
            {highPriority.length} Insight{highPriority.length > 1 ? 's' : ''} de Alta Prioridade
          </div>
          <div className="space-y-2">
            {highPriority.map(insight => (
              <div key={insight.id} className="flex items-center gap-3 text-red-600">
                <ArrowRight size={16} />
                <span className="font-medium">{insight.title}</span>
                <span className="text-red-500 text-sm">- {insight.description}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Insights Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {insights.map(insight => {
          const icons = {
            suggestion: <Lightbulb size={24} />,
            alert: <AlertTriangle size={24} />,
            opportunity: <Target size={24} />,
            trend: <TrendingUp size={24} />,
          };
          const colors = {
            suggestion: 'bg-blue-100 text-blue-600',
            alert: 'bg-red-100 text-red-600',
            opportunity: 'bg-green-100 text-green-600',
            trend: 'bg-purple-100 text-purple-600',
          };
          const priorityColors = {
            high: 'border-l-red-500',
            medium: 'border-l-yellow-500',
            low: 'border-l-gray-400',
          };

          return (
            <div 
              key={insight.id} 
              className={`bg-white rounded-xl p-6 shadow-sm border border-gray-100 border-l-4 ${priorityColors[insight.priority]} hover:shadow-md transition-shadow`}
            >
              <div className="flex items-start gap-4">
                <div className={`p-3 rounded-xl ${colors[insight.type]}`}>
                  {icons[insight.type]}
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <h3 className="font-semibold text-gray-900">{insight.title}</h3>
                    <span className={`px-2 py-0.5 rounded text-xs font-medium ${
                      insight.priority === 'high' ? 'bg-red-100 text-red-600' :
                      insight.priority === 'medium' ? 'bg-yellow-100 text-yellow-600' :
                      'bg-gray-100 text-gray-600'
                    }`}>
                      {insight.priority === 'high' ? 'Alta' : insight.priority === 'medium' ? 'Média' : 'Baixa'}
                    </span>
                  </div>
                  <p className="text-gray-600 mb-3">{insight.description}</p>
                  {insight.action && (
                    <button className="flex items-center gap-1 text-indigo-600 font-medium hover:text-indigo-700">
                      {insight.action}
                      <ArrowRight size={16} />
                    </button>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Best Times to Post */}
      <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
        <div className="flex items-center gap-3 mb-6">
          <Clock size={24} className="text-indigo-600" />
          <h2 className="text-xl font-semibold text-gray-900">Melhores Horários para Postar</h2>
        </div>
        <div className="grid grid-cols-7 gap-2">
          {['Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb', 'Dom'].map(day => (
            <div key={day} className="text-center text-sm font-medium text-gray-500 py-2">
              {day}
            </div>
          ))}
          {Array.from({ length: 7 }).map((_, dayIndex) => (
            <div key={dayIndex} className="space-y-1">
              {Array.from({ length: 5 }).map((_, hourIndex) => {
                const intensity = Math.random();
                return (
                  <div
                    key={hourIndex}
                    className={`h-6 rounded ${
                      intensity > 0.7 ? 'bg-green-500' :
                      intensity > 0.4 ? 'bg-green-300' :
                      intensity > 0.2 ? 'bg-green-100' :
                      'bg-gray-100'
                    }`}
                    title={`${9 + hourIndex * 2}h - ${intensity > 0.5 ? 'Bom' : 'Regular'}`}
                  />
                );
              })}
            </div>
          ))}
        </div>
        <div className="flex items-center justify-center gap-4 mt-4 text-sm">
          <div className="flex items-center gap-1">
            <div className="w-4 h-4 bg-green-100 rounded" />
            <span className="text-gray-500">Menor</span>
          </div>
          <div className="flex items-center gap-1">
            <div className="w-4 h-4 bg-green-300 rounded" />
            <span className="text-gray-500">Regular</span>
          </div>
          <div className="flex items-center gap-1">
            <div className="w-4 h-4 bg-green-500 rounded" />
            <span className="text-gray-500">Melhor</span>
          </div>
        </div>
      </div>

      {/* Trending Hashtags */}
      <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
        <div className="flex items-center gap-3 mb-6">
          <Hash size={24} className="text-indigo-600" />
          <h2 className="text-xl font-semibold text-gray-900">Hashtags em Alta</h2>
        </div>
        <div className="flex flex-wrap gap-2">
          {[
            { tag: '#inovação2024', growth: '+45%' },
            { tag: '#tendências', growth: '+38%' },
            { tag: '#marketingdigital', growth: '+32%' },
            { tag: '#tecnologia', growth: '+28%' },
            { tag: '#negócios', growth: '+25%' },
            { tag: '#startup', growth: '+22%' },
            { tag: '#produtividade', growth: '+18%' },
            { tag: '#ia', growth: '+55%' },
            { tag: '#automação', growth: '+35%' },
          ].map(({ tag, growth }) => (
            <div key={tag} className="flex items-center gap-2 bg-indigo-50 text-indigo-700 px-3 py-1.5 rounded-full">
              <span className="font-medium">{tag}</span>
              <span className="text-green-600 text-sm">{growth}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
