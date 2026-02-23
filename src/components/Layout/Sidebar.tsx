import {
  LayoutDashboard,
  MessageSquare,
  Code2,
  FileText,
  BarChart3,
  Sparkles,
  Moon,
  Sun,
  LogOut,
  ChevronRight,
  Settings,
  ShieldAlert
} from 'lucide-react';
import { useAppStore } from '../../store/appStore';
import { cn } from '../../utils/cn';

const navItems = [
  { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard, color: 'text-violet-400' },
  { id: 'interview', label: 'Interview Lab', icon: MessageSquare, color: 'text-violet-400' },
  { id: 'coderoom', label: 'Code Review', icon: Code2, color: 'text-cyan-400' },
  { id: 'resume', label: 'Resume Analyzer', icon: FileText, color: 'text-emerald-400' },
  { id: 'productivity', label: 'Productivity', icon: BarChart3, color: 'text-amber-400' },
];

interface SidebarProps {
  onLogout?: () => void;
}

export function Sidebar({ onLogout }: SidebarProps) {
  const { activeModule, setActiveModule, isDarkMode, toggleDarkMode, user } = useAppStore();

  const isAdmin = user?.email === 'mishrashrey.000@gmail.com' || user?.email === 'admin@example.com' || user?.name?.toLowerCase().includes('shrey');

  return (
    <aside className={cn(
      'fixed left-0 top-0 h-full w-64 flex flex-col z-50 transition-colors duration-200',
      isDarkMode
        ? 'bg-gray-900 border-r border-gray-800'
        : 'bg-white border-r border-gray-200 shadow-xl shadow-gray-200/50'
    )}>
      {/* Logo */}
      <div className={cn('p-5 border-b', isDarkMode ? 'border-gray-800' : 'border-gray-100')}>
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-violet-500 to-indigo-600 flex items-center justify-center shadow-lg shadow-violet-500/30">
            <Sparkles className="w-5 h-5 text-white" />
          </div>
          <div>
            <h1 className={cn('font-bold text-sm leading-tight', isDarkMode ? 'text-white' : 'text-gray-900')}>
              Progress Tracker
            </h1>
            <p className="text-xs text-violet-400 font-medium">by Shrey Mishra</p>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-3 space-y-1 overflow-y-auto">
        <p className={cn('text-xs font-semibold uppercase tracking-widest px-3 py-2', isDarkMode ? 'text-gray-600' : 'text-gray-400')}>
          Modules
        </p>
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeModule === item.id;

          return (
            <button
              key={item.id}
              onClick={() => setActiveModule(item.id)}
              className={cn(
                'w-full flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all duration-200 group',
                isActive
                  ? 'bg-gradient-to-r from-violet-600 to-indigo-600 text-white shadow-lg shadow-violet-500/20'
                  : isDarkMode
                    ? 'text-gray-400 hover:text-white hover:bg-gray-800'
                    : 'text-gray-500 hover:text-gray-900 hover:bg-gray-50'
              )}
            >
              <div className={cn(
                'w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 transition-colors',
                isActive
                  ? 'bg-white/20'
                  : isDarkMode ? 'bg-gray-800 group-hover:bg-gray-700' : 'bg-gray-100 group-hover:bg-gray-200'
              )}>
                <Icon className={cn('w-4 h-4', isActive ? 'text-white' : item.color)} />
              </div>
              <span className="font-medium text-sm">{item.label}</span>
              {isActive && <ChevronRight className="w-4 h-4 ml-auto opacity-70" />}
            </button>
          );
        })}
      </nav>

      {/* Bottom Section */}
      <div className={cn('p-3 border-t space-y-1', isDarkMode ? 'border-gray-800' : 'border-gray-100')}>
        {/* Theme Toggle */}
        <button
          onClick={toggleDarkMode}
          className={cn(
            'w-full flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all duration-200',
            isDarkMode
              ? 'text-gray-400 hover:text-white hover:bg-gray-800'
              : 'text-gray-500 hover:text-gray-900 hover:bg-gray-50'
          )}
        >
          <div className={cn('w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0',
            isDarkMode ? 'bg-gray-800' : 'bg-gray-100')}>
            {isDarkMode
              ? <Sun className="w-4 h-4 text-amber-400" />
              : <Moon className="w-4 h-4 text-indigo-500" />
            }
          </div>
          <span className="font-medium text-sm">{isDarkMode ? 'Light Mode' : 'Dark Mode'}</span>
        </button>

        {/* Settings Button (Shifted Profile here) */}
        <button
          onClick={() => setActiveModule('profile')}
          className={cn(
            'w-full flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all duration-200',
            activeModule === 'profile'
              ? 'bg-violet-600/10 text-violet-400'
              : isDarkMode
                ? 'text-gray-400 hover:text-white hover:bg-gray-800'
                : 'text-gray-500 hover:text-gray-900 hover:bg-gray-50'
          )}
        >
          <div className={cn('w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0',
            isDarkMode ? 'bg-gray-800' : 'bg-gray-100')}>
            <Settings className={cn("w-4 h-4", activeModule === 'profile' ? "text-violet-400" : "text-gray-400")} />
          </div>
          <span className="font-medium text-sm">Settings</span>
        </button>

        {/* Admin Console (Conditional) */}
        {isAdmin && (
          <button
            onClick={() => setActiveModule('admin')}
            className={cn(
              'w-full flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all duration-200',
              activeModule === 'admin'
                ? 'bg-red-500/10 text-red-400 border border-red-500/20'
                : isDarkMode
                  ? 'text-gray-400 hover:text-red-400 hover:bg-red-500/5'
                  : 'text-gray-500 hover:text-red-600 hover:bg-red-50'
            )}
          >
            <div className={cn('w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0',
              isDarkMode ? 'bg-gray-800' : 'bg-gray-100')}>
              <ShieldAlert className={cn("w-4 h-4", activeModule === 'admin' ? "text-red-400" : "text-gray-400")} />
            </div>
            <span className="font-medium text-sm">Admin Console</span>
          </button>
        )}


        {/* User Profile + Logout */}
        <div className={cn('mt-2 p-3 rounded-2xl', isDarkMode ? 'bg-gray-800' : 'bg-gray-50 border border-gray-200')}>
          <div className="flex items-center gap-3 mb-3">
            {/* Avatar */}
            {user?.avatar ? (
              <img
                src={user.avatar}
                alt={user.name}
                className="w-10 h-10 rounded-full object-cover ring-2 ring-violet-500/30 flex-shrink-0"
                onError={(e) => {
                  (e.target as HTMLImageElement).style.display = 'none';
                }}
              />
            ) : (
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-violet-500 to-indigo-600 flex items-center justify-center text-white font-bold text-sm flex-shrink-0">
                {user?.name?.charAt(0)?.toUpperCase() || 'D'}
              </div>
            )}
            <div className="flex-1 min-w-0">
              <p className={cn('font-semibold text-sm truncate', isDarkMode ? 'text-white' : 'text-gray-900')}>
                {user?.name || 'Developer'}
              </p>
              <p className={cn('text-xs truncate', isDarkMode ? 'text-gray-500' : 'text-gray-400')}>
                {user?.email || 'dev@example.com'}
              </p>
            </div>
          </div>

          {/* Logout Button */}
          <button
            onClick={onLogout}
            className={cn(
              'w-full flex items-center justify-center gap-2 py-2 rounded-xl text-xs font-semibold transition-all',
              'bg-red-500/10 text-red-400 hover:bg-red-500/20 border border-red-500/20 hover:border-red-500/40'
            )}
          >
            <LogOut className="w-3.5 h-3.5" />
            Sign Out
          </button>
        </div>
      </div>
    </aside>
  );
}
