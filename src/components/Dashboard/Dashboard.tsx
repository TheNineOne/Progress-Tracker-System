import {
  MessageSquare,
  Code2,
  FileText,
  BarChart3,
  TrendingUp,
  Award,
  Zap,
  Activity
} from 'lucide-react';
import { useAppStore } from '../../store/appStore';
import { cn } from '../../utils/cn';
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { Leaderboard } from './Leaderboard';

export function Dashboard() {
  const { isDarkMode, user, interviewSessions, resumeAnalyses, codeRooms, getUserDailyLogs, setActiveModule } = useAppStore();
  const dailyLogs = getUserDailyLogs();

  // Dynamic Weekly Data from DailyLogs (Last 7 Days)
  const getWeeklyData = () => {
    const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    const today = new Date();
    const weekData = [];

    for (let i = 6; i >= 0; i--) {
      const d = new Date(today);
      d.setDate(d.getDate() - i);
      const dateStr = d.toISOString().split('T')[0];
      const log = dailyLogs.find(l => l.date === dateStr);

      weekData.push({
        day: days[d.getDay()],
        coding: log ? Math.round(log.codingTime / 60) : 0, // Converting minutes to hours
        dsa: log ? log.dsaPractice : 0,
        study: log ? log.studyHours : 0
      });
    }
    return weekData;
  };

  // Dynamic Skill Distribution based on Interview Topics
  const getSkillDistribution = () => {
    const roleCounts: Record<string, number> = {};
    interviewSessions.forEach(session => {
      roleCounts[session.role] = (roleCounts[session.role] || 0) + 1;
    });

    const colors = ['#8b5cf6', '#06b6d4', '#10b981', '#f59e0b', '#ec4899', '#3b82f6'];
    const distribution = Object.keys(roleCounts).map((role, index) => ({
      name: role,
      value: roleCounts[role],
      color: colors[index % colors.length]
    }));

    return distribution.length > 0 ? distribution : [{ name: 'No Interviews Yet', value: 1, color: isDarkMode ? '#374151' : '#e5e7eb' }];
  };

  // Dynamic Achievements
  const getDynamicAchievements = () => {
    const achievements = [];
    if (interviewSessions.length > 0) {
      achievements.push({ title: 'First Interview', desc: `Completed ${interviewSessions.length} AI interviews`, icon: '🎯' });
    }
    if (codeRooms.length > 0) {
      achievements.push({ title: 'Code Collaborator', desc: `Participated in ${codeRooms.length} code rooms`, icon: '💻' });
    }
    if (resumeAnalyses.length > 0) {
      achievements.push({ title: 'Resume Evaluated', desc: `Checked ${resumeAnalyses.length} resumes`, icon: '📄' });
    }
    if (dailyLogs.length > 0) {
      achievements.push({ title: 'Activity Logger', desc: `Logged activity for ${dailyLogs.length} days`, icon: '🔥' });
    }
    return achievements;
  };

  const dynamicWeeklyData = getWeeklyData();
  const dynamicSkillDistribution = getSkillDistribution();
  const dynamicAchievements = getDynamicAchievements();

  // Checking if there is any engagement over last 7 days to calculate streak
  const activeDays = dynamicWeeklyData.filter(d => d.coding > 0 || d.dsa > 0 || d.study > 0).length;

  const stats = [
    {
      label: 'Interview Sessions',
      value: interviewSessions.length,
      icon: MessageSquare,
      color: 'from-violet-500 to-purple-600',
    },
    {
      label: 'Code Rooms Participated',
      value: codeRooms.length,
      icon: Code2,
      color: 'from-cyan-500 to-blue-600',
    },
    {
      label: 'Resumes Analyzed',
      value: resumeAnalyses.length,
      icon: FileText,
      color: 'from-emerald-500 to-green-600',
    },
    {
      label: 'Total Logs',
      value: dailyLogs.length,
      icon: BarChart3,
      color: 'from-amber-500 to-orange-600',
    },
  ];

  const quickActions = [
    { label: 'Start Interview', icon: MessageSquare, module: 'interview', color: 'bg-violet-600 hover:bg-violet-700' },
    { label: 'Join Code Room', icon: Code2, module: 'coderoom', color: 'bg-cyan-600 hover:bg-cyan-700' },
    { label: 'Analyze Resume', icon: FileText, module: 'resume', color: 'bg-emerald-600 hover:bg-emerald-700' },
    { label: 'Log Activity', icon: BarChart3, module: 'productivity', color: 'bg-amber-600 hover:bg-amber-700' },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className={cn(
            "text-3xl font-bold",
            isDarkMode ? "text-white" : "text-gray-900"
          )}>
            Welcome back,
            <button
              onClick={() => setActiveModule('profile')}
              className="ml-2 bg-gradient-to-r from-violet-400 to-indigo-400 bg-clip-text text-transparent hover:opacity-80 transition-all"
            >
              {user?.name || 'Guest'}!
            </button>
            👋
          </h1>
          <p className={cn(
            "mt-1",
            isDarkMode ? "text-gray-400" : "text-gray-600"
          )}>
            <span className="font-semibold text-violet-400">Progress Tracking System</span>
            <span className={isDarkMode ? " text-gray-500" : " text-gray-400"}> · Built by </span>
            <span className="font-semibold text-violet-400">Shrey Mishra</span>
          </p>
        </div>
        {activeDays > 0 && (
          <div className={cn(
            "flex items-center gap-2 px-4 py-2 rounded-xl",
            isDarkMode ? "bg-gray-800" : "bg-gray-100"
          )}>
            <Zap className="w-5 h-5 text-amber-500" />
            <span className={cn(
              "font-semibold",
              isDarkMode ? "text-white" : "text-gray-900"
            )}>{activeDays} Day Streak</span>
          </div>
        )}
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
                {stat.value > 0 && (
                  <span className="flex items-center gap-1 text-emerald-500 text-sm font-medium">
                    <TrendingUp className="w-4 h-4" /> Active
                  </span>
                )}
              </div>
              <div className="mt-4">
                <p className={cn(
                  "text-3xl font-bold",
                  isDarkMode ? "text-white" : "text-gray-900"
                )}>{stat.value}</p>
                <p className={cn(
                  "text-sm",
                  isDarkMode ? "text-gray-400" : "text-gray-600"
                )}>{stat.label}</p>
              </div>
            </div>
          );
        })}
      </div>

      {/* Quick Actions */}
      <div className={cn(
        "p-6 rounded-2xl border",
        isDarkMode
          ? "bg-gray-800/50 border-gray-700"
          : "bg-white border-gray-200 shadow-sm"
      )}>
        <h2 className={cn(
          "text-xl font-bold mb-4",
          isDarkMode ? "text-white" : "text-gray-900"
        )}>Quick Actions</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {quickActions.map((action) => {
            const Icon = action.icon;
            return (
              <button
                key={action.label}
                onClick={() => setActiveModule(action.module)}
                className={cn(
                  "flex items-center justify-center gap-2 p-4 rounded-xl text-white font-medium transition-all duration-200 hover:scale-105",
                  action.color
                )}
              >
                <Icon className="w-5 h-5" />
                {action.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Weekly Activity Chart */}
        <div className={cn(
          "col-span-2 p-6 rounded-2xl border",
          isDarkMode
            ? "bg-gray-800/50 border-gray-700"
            : "bg-white border-gray-200 shadow-sm"
        )}>
          <h2 className={cn(
            "text-xl font-bold mb-4",
            isDarkMode ? "text-white" : "text-gray-900"
          )}>Weekly Activity</h2>
          {dailyLogs.length === 0 ? (
            <div className="h-64 flex flex-col items-center justify-center opacity-50">
              <Activity className="w-12 h-12 mb-3 text-gray-400" />
              <p className={isDarkMode ? "text-gray-400" : "text-gray-500"}>No activity logged this week.</p>
            </div>
          ) : (
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={dynamicWeeklyData}>
                  <defs>
                    <linearGradient id="colorCoding" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0} />
                    </linearGradient>
                    <linearGradient id="colorDsa" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#10b981" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
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
                  />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: isDarkMode ? '#1f2937' : '#ffffff',
                      border: 'none',
                      borderRadius: '12px',
                      boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
                    }}
                    labelStyle={{ color: isDarkMode ? '#ffffff' : '#111827' }}
                  />
                  <Area
                    type="monotone"
                    dataKey="coding"
                    name="Coding (Hours)"
                    stroke="#8b5cf6"
                    fillOpacity={1}
                    fill="url(#colorCoding)"
                    strokeWidth={2}
                  />
                  <Area
                    type="monotone"
                    dataKey="dsa"
                    name="DSA (Problems)"
                    stroke="#10b981"
                    fillOpacity={1}
                    fill="url(#colorDsa)"
                    strokeWidth={2}
                  />
                  <Area
                    type="monotone"
                    dataKey="study"
                    name="Study (Hours)"
                    stroke="#f59e0b"
                    fillOpacity={0.5}
                    fill="#f59e0b"
                    strokeWidth={2}
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          )}
        </div>

        {/* Skill Distribution */}
        <div className={cn(
          "p-6 rounded-2xl border",
          isDarkMode
            ? "bg-gray-800/50 border-gray-700"
            : "bg-white border-gray-200 shadow-sm"
        )}>
          <h2 className={cn(
            "text-xl font-bold mb-4",
            isDarkMode ? "text-white" : "text-gray-900"
          )}>Interview Topics Focus</h2>
          {interviewSessions.length === 0 ? (
            <div className="h-48 flex flex-col items-center justify-center opacity-50 text-center">
              <PieChart className="w-12 h-12 mb-3 text-gray-400" />
              <p className={isDarkMode ? "text-gray-400" : "text-gray-500"}>Take interviews to see your skillset distribution.</p>
            </div>
          ) : (
            <>
              <div className="h-48">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={dynamicSkillDistribution}
                      cx="50%"
                      cy="50%"
                      innerRadius={50}
                      outerRadius={70}
                      paddingAngle={5}
                      dataKey="value"
                    >
                      {dynamicSkillDistribution.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip
                      contentStyle={{
                        backgroundColor: isDarkMode ? '#1f2937' : '#ffffff',
                        border: 'none',
                        borderRadius: '12px',
                      }}
                    />
                  </PieChart>
                </ResponsiveContainer>
              </div>
              <div className="grid grid-cols-2 gap-2 mt-4 max-h-32 overflow-y-auto pr-2">
                {dynamicSkillDistribution.map((skill) => (
                  <div key={skill.name} className="flex items-center gap-2">
                    <div
                      className="w-3 h-3 rounded-full flex-shrink-0"
                      style={{ backgroundColor: skill.color }}
                    />
                    <span className={cn(
                      "text-xs truncate",
                      isDarkMode ? "text-gray-400" : "text-gray-600"
                    )} title={skill.name}>{skill.name}</span>
                  </div>
                ))}
              </div>
            </>
          )}
        </div>
      </div>

      {/* Leaderboard and Achievements */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Leaderboard />

        {dynamicAchievements.length > 0 ? (
          <div className={cn(
            "p-6 rounded-2xl border",
            isDarkMode
              ? "bg-gray-800/50 border-gray-700"
              : "bg-white border-gray-200 shadow-sm"
          )}>
            <h2 className={cn(
              "text-xl font-bold mb-4 flex items-center gap-2",
              isDarkMode ? "text-white" : "text-gray-900"
            )}>
              <Award className="w-5 h-5 text-amber-500" />
              Your Achievements
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {dynamicAchievements.map((achievement) => (
                <div
                  key={achievement.title}
                  className={cn(
                    "flex items-center gap-3 p-4 rounded-xl",
                    isDarkMode ? "bg-gray-700/50" : "bg-gray-100"
                  )}
                >
                  <span className="text-3xl">{achievement.icon}</span>
                  <div>
                    <p className={cn(
                      "font-medium",
                      isDarkMode ? "text-white" : "text-gray-900"
                    )}>{achievement.title}</p>
                    <p className={cn(
                      "text-xs mt-1",
                      isDarkMode ? "text-gray-400" : "text-gray-600"
                    )}>{achievement.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ) : (
          <div className={cn(
            "p-6 rounded-2xl border flex flex-col items-center justify-center text-center opacity-60",
            isDarkMode ? "bg-gray-800/50 border-gray-700" : "bg-white border-gray-200"
          )}>
            <Award className="w-12 h-12 mb-4 text-gray-500" />
            <p className={isDarkMode ? "text-gray-400" : "text-gray-600 font-medium"}>
              Complete activities to earn achievements!
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
