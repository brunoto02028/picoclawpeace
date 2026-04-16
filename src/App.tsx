// App Principal
import { useState } from 'react';
import { Sidebar } from './components/Sidebar';
import { Dashboard } from './pages/Dashboard';
import { Agenda } from './pages/Agenda';
import { Campanhas } from './pages/Campanhas';
import { Insights } from './pages/Insights';
import { Preview } from './pages/Preview';

type Page = 'dashboard' | 'agenda' | 'campanhas' | 'insights' | 'preview';

function App() {
  const [currentPage, setCurrentPage] = useState<Page>('dashboard');

  const renderPage = () => {
    switch (currentPage) {
      case 'dashboard':
        return <Dashboard />;
      case 'agenda':
        return <Agenda />;
      case 'campanhas':
        return <Campanhas />;
      case 'insights':
        return <Insights />;
      case 'preview':
        return <Preview />;
      default:
        return <Dashboard />;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex">
      <Sidebar currentPage={currentPage} onNavigate={(page) => setCurrentPage(page as Page)} />
      
      <main className="flex-1 p-6 lg:p-8 overflow-y-auto">
        <div className="max-w-7xl mx-auto">
          {renderPage()}
        </div>
      </main>
    </div>
  );
}

export default App;
