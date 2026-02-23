import {
  LogOut,
  Calendar,
  Award,
  TrendingUp,
  Sparkles
} from 'lucide-react';
import { useAppStore } from '../../store/appStore';
import { cn } from '../../utils/cn';

interface LogoutProps {
  onLogout: () => void;
}

export function Logout({ onLogout }: LogoutProps) {
  const { isDarkMode, user, interviewSessions, resumeAnalyses, getUserDailyLogs, setUser } = useAppStore();
  const dailyLogs = getUserDailyLogs();

  const handleLogout = () => {
    setUser(null);
    onLogout();
  };

  const stats = [
    { label: 'Interviews', value: interviewSessions.length, icon: Award },
    { label: 'Resumes Analyzed', value: resumeAnalyses.length, icon: TrendingUp },
    { label: 'Days Logged', value: dailyLogs.length, icon: Calendar },
  ];

  return (
    <div className={cn(
      "min-h-screen flex items-center justify-center p-4",
      isDarkMode ? "bg-gray-950" : "bg-gradient-to-br from-violet-50 to-indigo-100"
    )}>
      {/* Background Effects */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className={cn(
          "absolute -top-40 -right-40 w-80 h-80 rounded-full blur-3xl",
          isDarkMode ? "bg-violet-900/20" : "bg-violet-300/30"
        )} />
        <div className={cn(
          "absolute -bottom-40 -left-40 w-80 h-80 rounded-full blur-3xl",
          isDarkMode ? "bg-indigo-900/20" : "bg-indigo-300/30"
        )} />
      </div>

      <div className="relative w-full max-w-md">
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-violet-500 to-indigo-600 shadow-lg shadow-violet-500/25 mb-4">
            <Sparkles className="w-8 h-8 text-white" />
          </div>
          <h1 className={cn(
            "text-2xl font-bold",
            isDarkMode ? "text-white" : "text-gray-900"
          )}>Progress Tracking System</h1>
          <p className="text-violet-400 text-sm font-medium">by Shrey Mishra</p>
          <p className={cn(
            "mt-1 text-sm",
            isDarkMode ? "text-gray-400" : "text-gray-600"
          )}>See you soon! 👋</p>
        </div>

        {/* User Card */}
        <div className={cn(
          "rounded-3xl p-8 shadow-2xl mb-6",
          isDarkMode
            ? "bg-gray-900 border border-gray-800"
            : "bg-white border border-gray-200"
        )}>
          {/* User Avatar */}
          <div className="flex flex-col items-center mb-6">
            <div className="w-24 h-24 rounded-full bg-gradient-to-br from-violet-500 to-indigo-600 flex items-center justify-center text-white text-3xl font-bold mb-4 shadow-lg shadow-violet-500/25">
              {user?.name?.charAt(0) || 'D'}
            </div>
            <h2 className={cn(
              "text-2xl font-bold",
              isDarkMode ? "text-white" : "text-gray-900"
            )}>{user?.name || 'Developer'}</h2>
            <p className={cn(
              "text-sm mt-1",
              isDarkMode ? "text-gray-400" : "text-gray-600"
            )}>{user?.email || 'developer@example.com'}</p>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-3 gap-4 mb-6">
            {stats.map((stat) => {
              const Icon = stat.icon;
              return (
                <div
                  key={stat.label}
                  className={cn(
                    "p-4 rounded-xl text-center",
                    isDarkMode ? "bg-gray-800" : "bg-gray-50"
                  )}
                >
                  <Icon className={cn(
                    "w-6 h-6 mx-auto mb-2",
                    isDarkMode ? "text-violet-400" : "text-violet-600"
                  )} />
                  <p className={cn(
                    "text-2xl font-bold",
                    isDarkMode ? "text-white" : "text-gray-900"
                  )}>{stat.value}</p>
                  <p className={cn(
                    "text-xs mt-1",
                    isDarkMode ? "text-gray-400" : "text-gray-600"
                  )}>{stat.label}</p>
                </div>
              );
            })}
          </div>

          {/* Achievements Summary */}
          <div className={cn(
            "p-4 rounded-xl mb-6",
            isDarkMode ? "bg-gray-800" : "bg-gray-50"
          )}>
            <h3 className={cn(
              "font-bold mb-3 flex items-center gap-2",
              isDarkMode ? "text-white" : "text-gray-900"
            )}>
              <Award className="w-5 h-5 text-amber-500" />
              Your Achievements
            </h3>
            <div className="flex flex-wrap gap-2">
              {interviewSessions.length > 0 && (
                <span className={cn(
                  "px-3 py-1 rounded-full text-xs",
                  isDarkMode ? "bg-violet-500/20 text-violet-400" : "bg-violet-100 text-violet-700"
                )}>
                  🎯 Interview Pro
                </span>
              )}
              {resumeAnalyses.length > 0 && (
                <span className={cn(
                  "px-3 py-1 rounded-full text-xs",
                  isDarkMode ? "bg-emerald-500/20 text-emerald-400" : "bg-emerald-100 text-emerald-700"
                )}>
                  📄 Resume Expert
                </span>
              )}
              {dailyLogs.length >= 7 && (
                <span className={cn(
                  "px-3 py-1 rounded-full text-xs",
                  isDarkMode ? "bg-amber-500/20 text-amber-400" : "bg-amber-100 text-amber-700"
                )}>
                  🔥 Consistent Coder
                </span>
              )}
              {interviewSessions.length === 0 && resumeAnalyses.length === 0 && dailyLogs.length < 7 && (
                <span className={cn(
                  "text-sm",
                  isDarkMode ? "text-gray-500" : "text-gray-400"
                )}>
                  Keep exploring to unlock achievements!
                </span>
              )}
            </div>
          </div>

          {/* Logout Button */}
          <button
            onClick={handleLogout}
            className="w-full flex items-center justify-center gap-2 py-4 px-4 rounded-xl bg-gradient-to-r from-red-600 to-rose-600 text-white font-medium hover:from-red-700 hover:to-rose-700 transition-all shadow-lg shadow-red-500/25"
          >
            <LogOut className="w-5 h-5" />
            Sign Out
          </button>
        </div>

        {/* Footer */}
        <p className={cn(
          "text-center text-sm",
          isDarkMode ? "text-gray-500" : "text-gray-500"
        )}>
          Your data will be saved and available when you return! 🔒
        </p>
        <p className={cn(
          "text-center text-xs mt-2",
          isDarkMode ? "text-gray-700" : "text-gray-400"
        )}>
          ⚡ <span className={isDarkMode ? "text-violet-600" : "text-violet-500"}>Progress Tracking System</span> · by <span className={isDarkMode ? "text-violet-500" : "text-violet-600"}>Shrey Mishra</span>
        </p>
      </div>
    </div>
  );
}
