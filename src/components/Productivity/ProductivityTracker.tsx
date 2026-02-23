import { useState } from 'react';
import {
  BarChart3,
  Plus,
  Clock,
  Code,
  Book,
  GitCommit,
  TrendingUp,
  Flame,
  Calendar,
  Target,
  Award
} from 'lucide-react';
import { useAppStore } from '../../store/appStore';
import { cn } from '../../utils/cn';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
  Legend,
  LineChart,
  Line
} from 'recharts';
import { v4 as uuidv4 } from 'uuid';

export function ProductivityTracker() {
  const { isDarkMode, getUserDailyLogs, addDailyLog, getProductivityInsights } = useAppStore();
  const dailyLogs = getUserDailyLogs();
  const [showAddModal, setShowAddModal] = useState(false);
  const [newLog, setNewLog] = useState({
    codingTime: 0,
    dsaPractice: 0,
    studyHours: 0,
    githubCommits: 0,
    notes: '',
  });

  const insights = getProductivityInsights();

  // Generate chart data
  const last7Days = Array.from({ length: 7 }, (_, i) => {
    const date = new Date();
    date.setDate(date.getDate() - (6 - i));
    const dateStr = date.toISOString().split('T')[0];
    const log = dailyLogs.find((l) => l.date === dateStr);
    return {
      day: date.toLocaleDateString('en-US', { weekday: 'short' }),
      date: dateStr,
      coding: log?.codingTime || 0,
      dsa: log?.dsaPractice || 0,
      study: log?.studyHours || 0,
      commits: log?.githubCommits || 0,
    };
  });

  const monthlyData = [
    { week: 'Week 1', coding: 480, dsa: 15, study: 20 },
    { week: 'Week 2', coding: 540, dsa: 18, study: 22 },
    { week: 'Week 3', coding: 620, dsa: 22, study: 25 },
    { week: 'Week 4', coding: 580, dsa: 20, study: 24 },
  ];

  const handleAddLog = () => {
    const today = new Date().toISOString().split('T')[0];
    addDailyLog({
      id: uuidv4(),
      date: today,
      ...newLog,
    });
    setShowAddModal(false);
    setNewLog({
      codingTime: 0,
      dsaPractice: 0,
      studyHours: 0,
      githubCommits: 0,
      notes: '',
    });
  };

  const stats = [
    {
      label: 'Current Streak',
      value: `${insights.currentStreak} days`,
      icon: Flame,
      color: 'from-orange-500 to-red-600',
      subtext: `Longest: ${insights.longestStreak} days`,
    },
    {
      label: 'Avg Daily Coding',
      value: `${insights.averageDailyCoding || 90} min`,
      icon: Code,
      color: 'from-violet-500 to-purple-600',
      subtext: 'Last 7 days',
    },
    {
      label: 'Weekly Trend',
      value: insights.weeklyTrend === 'improving' ? '↑ Improving' :
        insights.weeklyTrend === 'declining' ? '↓ Declining' : '→ Stable',
      icon: TrendingUp,
      color: 'from-emerald-500 to-green-600',
      subtext: 'Based on activity',
    },
    {
      label: 'Most Productive',
      value: insights.mostProductiveDay,
      icon: Calendar,
      color: 'from-cyan-500 to-blue-600',
      subtext: 'Best day for coding',
    },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className={cn(
            "text-3xl font-bold flex items-center gap-3",
            isDarkMode ? "text-white" : "text-gray-900"
          )}>
            <BarChart3 className="w-8 h-8 text-amber-500" />
            Productivity Tracker
          </h1>
          <p className={cn(
            "mt-1",
            isDarkMode ? "text-gray-400" : "text-gray-600"
          )}>Track your coding progress and stay consistent</p>
        </div>
        <button
          onClick={() => setShowAddModal(true)}
          className="flex items-center gap-2 px-4 py-2 rounded-xl font-medium bg-gradient-to-r from-amber-600 to-orange-600 text-white hover:from-amber-700 hover:to-orange-700 transition-all"
        >
          <Plus className="w-5 h-5" />
          Log Today
        </button>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat) => {
          const Icon = stat.icon;
          return (
            <div
              key={stat.label}
              className={cn(
                "p-6 rounded-2xl border transition-all duration-300 hover:scale-[1.02]",
                isDarkMode
                  ? "bg-gray-800/50 border-gray-700 hover:border-gray-600"
                  : "bg-white border-gray-200 hover:border-gray-300 shadow-sm"
              )}
            >
              <div className="flex items-start justify-between">
                <div className={cn(
                  "w-12 h-12 rounded-xl bg-gradient-to-br flex items-center justify-center",
                  stat.color
                )}>
                  <Icon className="w-6 h-6 text-white" />
                </div>
              </div>
              <div className="mt-4">
                <p className={cn(
                  "text-2xl font-bold",
                  isDarkMode ? "text-white" : "text-gray-900"
                )}>{stat.value}</p>
                <p className={cn(
                  "text-sm",
                  isDarkMode ? "text-gray-400" : "text-gray-600"
                )}>{stat.label}</p>
                <p className={cn(
                  "text-xs mt-1",
                  isDarkMode ? "text-gray-500" : "text-gray-500"
                )}>{stat.subtext}</p>
              </div>
            </div>
          );
        })}
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Weekly Coding Time */}
        <div className={cn(
          "p-6 rounded-2xl border",
          isDarkMode ? "bg-gray-800/50 border-gray-700" : "bg-white border-gray-200 shadow-sm"
        )}>
          <h2 className={cn(
            "text-xl font-bold mb-4 flex items-center gap-2",
            isDarkMode ? "text-white" : "text-gray-900"
          )}>
            <Clock className="w-5 h-5 text-violet-500" />
            Weekly Coding Time
          </h2>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={last7Days}>
                <defs>
                  <linearGradient id="colorCodingTime" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <XAxis
                  dataKey="day"
                  stroke={isDarkMode ? "#6b7280" : "#9ca3af"}
                  fontSize={12}
                />
                <YAxis
                  stroke={isDarkMode ? "#6b7280" : "#9ca3af"}
                  fontSize={12}
                  tickFormatter={(value) => `${value}m`}
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: isDarkMode ? '#1f2937' : '#ffffff',
                    border: 'none',
                    borderRadius: '12px',
                    boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
                  }}
                  labelStyle={{ color: isDarkMode ? '#ffffff' : '#111827' }}
                  formatter={(value) => [`${value} minutes`, 'Coding Time']}
                />
                <Area
                  type="monotone"
                  dataKey="coding"
                  stroke="#8b5cf6"
                  fillOpacity={1}
                  fill="url(#colorCodingTime)"
                  strokeWidth={2}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* DSA Practice */}
        <div className={cn(
          "p-6 rounded-2xl border",
          isDarkMode ? "bg-gray-800/50 border-gray-700" : "bg-white border-gray-200 shadow-sm"
        )}>
          <h2 className={cn(
            "text-xl font-bold mb-4 flex items-center gap-2",
            isDarkMode ? "text-white" : "text-gray-900"
          )}>
            <Target className="w-5 h-5 text-emerald-500" />
            DSA Problems Solved
          </h2>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={last7Days}>
                <XAxis
                  dataKey="day"
                  stroke={isDarkMode ? "#6b7280" : "#9ca3af"}
                  fontSize={12}
                />
                <YAxis
                  stroke={isDarkMode ? "#6b7280" : "#9ca3af"}
                  fontSize={12}
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: isDarkMode ? '#1f2937' : '#ffffff',
                    border: 'none',
                    borderRadius: '12px',
                  }}
                  labelStyle={{ color: isDarkMode ? '#ffffff' : '#111827' }}
                />
                <Bar
                  dataKey="dsa"
                  fill="#10b981"
                  radius={[4, 4, 0, 0]}
                  name="Problems"
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Monthly Progress & Activity Log */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Monthly Progress */}
        <div className={cn(
          "lg:col-span-2 p-6 rounded-2xl border",
          isDarkMode ? "bg-gray-800/50 border-gray-700" : "bg-white border-gray-200 shadow-sm"
        )}>
          <h2 className={cn(
            "text-xl font-bold mb-4 flex items-center gap-2",
            isDarkMode ? "text-white" : "text-gray-900"
          )}>
            <TrendingUp className="w-5 h-5 text-cyan-500" />
            Monthly Progress
          </h2>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={monthlyData}>
                <XAxis
                  dataKey="week"
                  stroke={isDarkMode ? "#6b7280" : "#9ca3af"}
                  fontSize={12}
                />
                <YAxis
                  stroke={isDarkMode ? "#6b7280" : "#9ca3af"}
                  fontSize={12}
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: isDarkMode ? '#1f2937' : '#ffffff',
                    border: 'none',
                    borderRadius: '12px',
                  }}
                  labelStyle={{ color: isDarkMode ? '#ffffff' : '#111827' }}
                />
                <Legend />
                <Line
                  type="monotone"
                  dataKey="coding"
                  stroke="#8b5cf6"
                  strokeWidth={2}
                  dot={{ fill: '#8b5cf6' }}
                  name="Coding (min)"
                />
                <Line
                  type="monotone"
                  dataKey="dsa"
                  stroke="#10b981"
                  strokeWidth={2}
                  dot={{ fill: '#10b981' }}
                  name="DSA Problems"
                />
                <Line
                  type="monotone"
                  dataKey="study"
                  stroke="#06b6d4"
                  strokeWidth={2}
                  dot={{ fill: '#06b6d4' }}
                  name="Study (hrs)"
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Recent Activity */}
        <div className={cn(
          "p-6 rounded-2xl border",
          isDarkMode ? "bg-gray-800/50 border-gray-700" : "bg-white border-gray-200 shadow-sm"
        )}>
          <h2 className={cn(
            "text-xl font-bold mb-4 flex items-center gap-2",
            isDarkMode ? "text-white" : "text-gray-900"
          )}>
            <Calendar className="w-5 h-5 text-amber-500" />
            Recent Activity
          </h2>
          <div className="space-y-3">
            {dailyLogs.length === 0 ? (
              <div className={cn(
                "text-center py-8",
                isDarkMode ? "text-gray-400" : "text-gray-600"
              )}>
                <Calendar className="w-10 h-10 mx-auto mb-2 opacity-50" />
                <p className="text-sm">No activity logged yet</p>
                <button
                  onClick={() => setShowAddModal(true)}
                  className="mt-3 text-amber-500 text-sm font-medium hover:underline"
                >
                  Log your first day
                </button>
              </div>
            ) : (
              dailyLogs.slice(-5).reverse().map((log) => (
                <div
                  key={log.id}
                  className={cn(
                    "p-3 rounded-xl",
                    isDarkMode ? "bg-gray-700/50" : "bg-gray-100"
                  )}
                >
                  <div className="flex items-center justify-between mb-2">
                    <span className={cn(
                      "font-medium text-sm",
                      isDarkMode ? "text-white" : "text-gray-900"
                    )}>
                      {new Date(log.date).toLocaleDateString('en-US', {
                        weekday: 'short',
                        month: 'short',
                        day: 'numeric'
                      })}
                    </span>
                  </div>
                  <div className="grid grid-cols-2 gap-2 text-xs">
                    <div className="flex items-center gap-1">
                      <Clock className="w-3 h-3 text-violet-500" />
                      <span className={isDarkMode ? "text-gray-300" : "text-gray-700"}>
                        {log.codingTime}m coding
                      </span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Target className="w-3 h-3 text-emerald-500" />
                      <span className={isDarkMode ? "text-gray-300" : "text-gray-700"}>
                        {log.dsaPractice} DSA
                      </span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Book className="w-3 h-3 text-cyan-500" />
                      <span className={isDarkMode ? "text-gray-300" : "text-gray-700"}>
                        {log.studyHours}h study
                      </span>
                    </div>
                    <div className="flex items-center gap-1">
                      <GitCommit className="w-3 h-3 text-amber-500" />
                      <span className={isDarkMode ? "text-gray-300" : "text-gray-700"}>
                        {log.githubCommits} commits
                      </span>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* Achievements */}
      <div className={cn(
        "p-6 rounded-2xl border",
        isDarkMode ? "bg-gray-800/50 border-gray-700" : "bg-white border-gray-200 shadow-sm"
      )}>
        <h2 className={cn(
          "text-xl font-bold mb-4 flex items-center gap-2",
          isDarkMode ? "text-white" : "text-gray-900"
        )}>
          <Award className="w-5 h-5 text-amber-500" />
          Achievements
        </h2>
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
          {[
            { icon: '🔥', label: 'First Streak', desc: 'Code 3 days in a row', unlocked: true },
            { icon: '💻', label: 'Coder', desc: '100 minutes coding', unlocked: true },
            { icon: '🎯', label: 'DSA Warrior', desc: '10 problems solved', unlocked: true },
            { icon: '📚', label: 'Scholar', desc: '20 hours studying', unlocked: false },
            { icon: '🚀', label: 'Committed', desc: '50 GitHub commits', unlocked: false },
            { icon: '👑', label: 'Master', desc: '30-day streak', unlocked: false },
          ].map((achievement) => (
            <div
              key={achievement.label}
              className={cn(
                "p-4 rounded-xl text-center transition-all",
                achievement.unlocked
                  ? isDarkMode ? "bg-amber-500/10 border border-amber-500/30" : "bg-amber-50 border border-amber-200"
                  : isDarkMode ? "bg-gray-700/30 opacity-50" : "bg-gray-100 opacity-50"
              )}
            >
              <span className="text-3xl">{achievement.icon}</span>
              <p className={cn(
                "font-medium text-sm mt-2",
                isDarkMode ? "text-white" : "text-gray-900"
              )}>{achievement.label}</p>
              <p className={cn(
                "text-xs mt-1",
                isDarkMode ? "text-gray-400" : "text-gray-600"
              )}>{achievement.desc}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Add Log Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className={cn(
            "w-full max-w-md p-6 rounded-2xl",
            isDarkMode ? "bg-gray-800" : "bg-white"
          )}>
            <h2 className={cn(
              "text-xl font-bold mb-6",
              isDarkMode ? "text-white" : "text-gray-900"
            )}>Log Today's Activity</h2>

            <div className="space-y-4">
              {/* Coding Time */}
              <div>
                <label className={cn(
                  "block text-sm font-medium mb-2 flex items-center gap-2",
                  isDarkMode ? "text-gray-300" : "text-gray-700"
                )}>
                  <Clock className="w-4 h-4 text-violet-500" />
                  Coding Time (minutes)
                </label>
                <input
                  type="number"
                  value={newLog.codingTime}
                  onChange={(e) => setNewLog({ ...newLog, codingTime: parseInt(e.target.value) || 0 })}
                  className={cn(
                    "w-full px-4 py-2 rounded-xl border focus:outline-none focus:ring-2 focus:ring-amber-500",
                    isDarkMode
                      ? "bg-gray-700 border-gray-600 text-white"
                      : "bg-gray-50 border-gray-200 text-gray-900"
                  )}
                />
              </div>

              {/* DSA Practice */}
              <div>
                <label className={cn(
                  "block text-sm font-medium mb-2 flex items-center gap-2",
                  isDarkMode ? "text-gray-300" : "text-gray-700"
                )}>
                  <Target className="w-4 h-4 text-emerald-500" />
                  DSA Problems Solved
                </label>
                <input
                  type="number"
                  value={newLog.dsaPractice}
                  onChange={(e) => setNewLog({ ...newLog, dsaPractice: parseInt(e.target.value) || 0 })}
                  className={cn(
                    "w-full px-4 py-2 rounded-xl border focus:outline-none focus:ring-2 focus:ring-amber-500",
                    isDarkMode
                      ? "bg-gray-700 border-gray-600 text-white"
                      : "bg-gray-50 border-gray-200 text-gray-900"
                  )}
                />
              </div>

              {/* Study Hours */}
              <div>
                <label className={cn(
                  "block text-sm font-medium mb-2 flex items-center gap-2",
                  isDarkMode ? "text-gray-300" : "text-gray-700"
                )}>
                  <Book className="w-4 h-4 text-cyan-500" />
                  Study Hours
                </label>
                <input
                  type="number"
                  value={newLog.studyHours}
                  onChange={(e) => setNewLog({ ...newLog, studyHours: parseInt(e.target.value) || 0 })}
                  className={cn(
                    "w-full px-4 py-2 rounded-xl border focus:outline-none focus:ring-2 focus:ring-amber-500",
                    isDarkMode
                      ? "bg-gray-700 border-gray-600 text-white"
                      : "bg-gray-50 border-gray-200 text-gray-900"
                  )}
                />
              </div>

              {/* GitHub Commits */}
              <div>
                <label className={cn(
                  "block text-sm font-medium mb-2 flex items-center gap-2",
                  isDarkMode ? "text-gray-300" : "text-gray-700"
                )}>
                  <GitCommit className="w-4 h-4 text-amber-500" />
                  GitHub Commits
                </label>
                <input
                  type="number"
                  value={newLog.githubCommits}
                  onChange={(e) => setNewLog({ ...newLog, githubCommits: parseInt(e.target.value) || 0 })}
                  className={cn(
                    "w-full px-4 py-2 rounded-xl border focus:outline-none focus:ring-2 focus:ring-amber-500",
                    isDarkMode
                      ? "bg-gray-700 border-gray-600 text-white"
                      : "bg-gray-50 border-gray-200 text-gray-900"
                  )}
                />
              </div>

              {/* Notes */}
              <div>
                <label className={cn(
                  "block text-sm font-medium mb-2",
                  isDarkMode ? "text-gray-300" : "text-gray-700"
                )}>
                  Notes (optional)
                </label>
                <textarea
                  value={newLog.notes}
                  onChange={(e) => setNewLog({ ...newLog, notes: e.target.value })}
                  placeholder="What did you work on today?"
                  rows={3}
                  className={cn(
                    "w-full px-4 py-2 rounded-xl border focus:outline-none focus:ring-2 focus:ring-amber-500 resize-none",
                    isDarkMode
                      ? "bg-gray-700 border-gray-600 text-white placeholder-gray-400"
                      : "bg-gray-50 border-gray-200 text-gray-900 placeholder-gray-500"
                  )}
                />
              </div>
            </div>

            <div className="flex gap-3 mt-6">
              <button
                onClick={() => setShowAddModal(false)}
                className={cn(
                  "flex-1 py-3 rounded-xl font-medium",
                  isDarkMode
                    ? "bg-gray-700 text-gray-300 hover:bg-gray-600"
                    : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                )}
              >
                Cancel
              </button>
              <button
                onClick={handleAddLog}
                className="flex-1 py-3 rounded-xl font-medium bg-gradient-to-r from-amber-600 to-orange-600 text-white hover:from-amber-700 hover:to-orange-700"
              >
                Save Log
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
