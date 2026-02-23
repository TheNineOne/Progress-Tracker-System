import { useState, useEffect } from 'react';
import { Sidebar } from './components/Layout/Sidebar';
import { Dashboard } from './components/Dashboard/Dashboard';
import { InterviewLab } from './components/Interview/InterviewLab';
import { CodeRoom } from './components/CodeRoom/CodeRoom';
import { ResumeAnalyzer } from './components/Resume/ResumeAnalyzer';
import { ProductivityTracker } from './components/Productivity/ProductivityTracker';
import { Login } from './components/Auth/Login';
import { Profile } from './components/Dashboard/Profile';
import { useAppStore } from './store/appStore';
import { cn } from './utils/cn';
import { wsService } from './services/websocketService';

export function App() {
  const { activeModule, isDarkMode, user, setUser } = useAppStore();
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  // Restore auth state from persisted user
  useEffect(() => {
    if (user) {
      setIsAuthenticated(true);
    }
  }, []);

  const handleLogin = () => {
    setIsAuthenticated(true);
  };

  const handleLogout = () => {
    // Disconnect WebSocket if connected
    wsService.disconnect();
    // Clear user from store (data stays persisted)
    setUser(null);
    setIsAuthenticated(false);
  };

  // Show login screen if not authenticated
  if (!isAuthenticated || !user) {
    return <Login onLogin={handleLogin} />;
  }

  const renderModule = () => {
    switch (activeModule) {
      case 'dashboard':
        return <Dashboard />;
      case 'interview':
        return <InterviewLab />;
      case 'coderoom':
        return <CodeRoom />;
      case 'resume':
        return <ResumeAnalyzer />;
      case 'productivity':
        return <ProductivityTracker />;
      case 'profile':
        return <Profile />;
      default:
        return <Dashboard />;
    }
  };

  return (
    <div className={cn(
      'min-h-screen',
      isDarkMode ? 'bg-gray-950' : 'bg-gray-50'
    )}>
      <Sidebar onLogout={handleLogout} />
      <main className="ml-64 p-6 lg:p-8 min-h-screen flex flex-col">
        <div className="max-w-7xl mx-auto w-full flex-1">
          {renderModule()}
        </div>
        {/* Footer watermark */}
        <div className="ml-0 mt-8 pb-4 max-w-7xl mx-auto w-full">
          <div className={cn(
            'flex items-center justify-center gap-2 py-3 rounded-2xl border text-xs',
            isDarkMode
              ? 'border-gray-800/60 bg-gray-900/40 text-gray-600'
              : 'border-gray-200 bg-white/60 text-gray-400'
          )}>
            <span>⚡</span>
            <span className={isDarkMode ? 'text-violet-500 font-semibold' : 'text-violet-600 font-semibold'}>
              Progress Tracking System
            </span>
            <span>·</span>
            <span>Developed by</span>
            <span className={isDarkMode ? 'text-violet-400 font-bold' : 'text-violet-700 font-bold'}>
              Shrey Mishra
            </span>
            <span>·</span>
            <span>AI-Powered Developer Platform</span>
          </div>
        </div>
      </main>
    </div>
  );
}
