// Página de Agenda de Posts
import { useState } from 'react';
import { Calendar, Plus, Clock, Image, MoreVertical } from 'lucide-react';
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isSameDay, addMonths, subMonths } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { mockPosts } from '../data/mockData';
import { StatusBadge, ChannelBadge } from '../components/ui';

export function Agenda() {
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);

  const monthStart = startOfMonth(currentMonth);
  const monthEnd = endOfMonth(currentMonth);
  const days = eachDayOfInterval({ start: monthStart, end: monthEnd });

  const getPostsForDate = (date: Date) => {
    return mockPosts.filter(post => {
      const postDate = post.scheduledAt || post.publishedAt;
      return postDate && isSameDay(postDate, date);
    });
  };

  const selectedPosts = selectedDate ? getPostsForDate(selectedDate) : [];

  const prevMonth = () => setCurrentMonth(subMonths(currentMonth, 1));
  const nextMonth = () => setCurrentMonth(addMonths(currentMonth, 1));

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Agenda de Posts</h1>
          <p className="text-gray-500">Gerencie sua programação de conteúdo</p>
        </div>
        <button className="flex items-center gap-2 bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 transition-colors">
          <Plus size={20} />
          Novo Post
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Calendar */}
        <div className="lg:col-span-2 bg-white rounded-xl p-6 shadow-sm border border-gray-100">
          <div className="flex items-center justify-between mb-6">
            <button onClick={prevMonth} className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
              ←
            </button>
            <h2 className="text-xl font-semibold text-gray-900 capitalize">
              {format(currentMonth, 'MMMM yyyy', { locale: ptBR })}
            </h2>
            <button onClick={nextMonth} className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
              →
            </button>
          </div>

          <div className="grid grid-cols-7 gap-1 mb-2">
            {['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'].map(day => (
              <div key={day} className="text-center text-sm font-medium text-gray-500 py-2">
                {day}
              </div>
            ))}
          </div>

          <div className="grid grid-cols-7 gap-1">
            {Array.from({ length: monthStart.getDay() }).map((_, i) => (
              <div key={`empty-${i}`} className="aspect-square" />
            ))}
            {days.map(day => {
              const dayPosts = getPostsForDate(day);
              const isSelected = selectedDate && isSameDay(day, selectedDate);
              const isToday = isSameDay(day, new Date());
              
              return (
                <button
                  key={day.toISOString()}
                  onClick={() => setSelectedDate(day)}
                  className={`aspect-square p-1 rounded-lg flex flex-col items-center justify-center transition-colors relative ${
                    isSelected ? 'bg-indigo-100 ring-2 ring-indigo-500' : 
                    isToday ? 'bg-indigo-50' : 
                    'hover:bg-gray-50'
                  }`}
                >
                  <span className={`text-sm ${isToday ? 'font-bold text-indigo-600' : 'text-gray-700'}`}>
                    {format(day, 'd')}
                  </span>
                  {dayPosts.length > 0 && (
                    <div className="flex gap-0.5 mt-0.5">
                      {dayPosts.slice(0, 3).map((post, i) => (
                        <div
                          key={i}
                          className={`w-1.5 h-1.5 rounded-full ${
                            post.channel === 'instagram' ? 'bg-pink-500' :
                            post.channel === 'facebook' ? 'bg-blue-600' :
                            post.channel === 'tiktok' ? 'bg-gray-800' :
                            post.channel === 'linkedin' ? 'bg-blue-700' :
                            'bg-sky-500'
                          }`}
                        />
                      ))}
                    </div>
                  )}
                </button>
              );
            })}
          </div>
        </div>

        {/* Selected Date Posts */}
        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            {selectedDate 
              ? format(selectedDate, "d 'de' MMMM", { locale: ptBR })
              : 'Selecione uma data'}
          </h3>

          {selectedDate && selectedPosts.length === 0 && (
            <div className="text-center py-8 text-gray-400">
              <Calendar size={48} className="mx-auto mb-3 opacity-50" />
              <p>Nenhum post agendado</p>
              <button className="mt-3 text-indigo-600 font-medium hover:text-indigo-700">
                + Criar post
              </button>
            </div>
          )}

          <div className="space-y-4">
            {selectedPosts.map(post => (
              <div key={post.id} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
                <div className="flex items-center justify-between mb-3">
                  <ChannelBadge channel={post.channel} />
                  <StatusBadge status={post.status} />
                </div>
                <p className="text-gray-700 text-sm mb-3 line-clamp-3">{post.content}</p>
                <div className="flex items-center gap-4 text-xs text-gray-500">
                  <span className="flex items-center gap-1">
                    <Clock size={12} />
                    {post.scheduledAt && format(post.scheduledAt, 'HH:mm')}
                    {post.publishedAt && format(post.publishedAt, 'HH:mm')}
                  </span>
                  {post.metrics && (
                    <span className="flex items-center gap-1">
                      ❤️ {post.metrics.likes}
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Posts List */}
      <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Posts Recentes</h3>
        <div className="space-y-4">
          {mockPosts.map(post => (
            <div key={post.id} className="flex items-start gap-4 p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
              {post.metrics && (
                <div className="w-16 h-16 bg-gray-100 rounded-lg flex-shrink-0 flex items-center justify-center">
                  <Image size={24} className="text-gray-400" />
                </div>
              )}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <ChannelBadge channel={post.channel} />
                  <StatusBadge status={post.status} />
                </div>
                <p className="text-gray-700 text-sm line-clamp-2">{post.content}</p>
                <div className="flex items-center gap-4 mt-2 text-xs text-gray-500">
                  <span>
                    {post.scheduledAt && `Agendado: ${format(post.scheduledAt, "d 'de' MMM, HH:mm", { locale: ptBR })}`}
                    {post.publishedAt && `Publicado: ${format(post.publishedAt, "d 'de' MMM, HH:mm", { locale: ptBR })}`}
                  </span>
                </div>
              </div>
              <div className="flex items-center gap-2">
                {post.metrics && (
                  <div className="text-right">
                    <div className="text-sm font-medium text-gray-900">{post.metrics.likes} curtidas</div>
                    <div className="text-xs text-gray-500">{post.metrics.comments} comentários</div>
                  </div>
                )}
                <button className="p-2 hover:bg-gray-100 rounded-lg">
                  <MoreVertical size={16} className="text-gray-400" />
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
