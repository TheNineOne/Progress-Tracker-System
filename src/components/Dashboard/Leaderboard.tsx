import { Trophy, Medal, TrendingUp } from 'lucide-react';
import { useAppStore } from '../../store/appStore';
import { cn } from '../../utils/cn';

const leaderboardData = [
  { rank: 1, name: 'Alex Chen', score: 2840, streak: 45, avatar: '👨‍💻', trend: '+12%' },
  { rank: 2, name: 'Sarah Johnson', score: 2650, streak: 38, avatar: '👩‍💻', trend: '+8%' },
  { rank: 3, name: 'Mike Williams', score: 2480, streak: 32, avatar: '🧑‍💻', trend: '+15%' },
  { rank: 4, name: 'Developer', score: 2100, streak: 7, avatar: '💻', trend: '+5%', isCurrentUser: true },
  { rank: 5, name: 'Emily Davis', score: 1950, streak: 21, avatar: '👩‍🎓', trend: '+3%' },
  { rank: 6, name: 'James Brown', score: 1820, streak: 18, avatar: '🎓', trend: '+7%' },
  { rank: 7, name: 'Lisa Miller', score: 1700, streak: 15, avatar: '🚀', trend: '+4%' },
  { rank: 8, name: 'Tom Wilson', score: 1580, streak: 12, avatar: '⚡', trend: '+2%' },
];

export function Leaderboard() {
  const { isDarkMode, setActiveModule } = useAppStore();

  const getRankIcon = (rank: number) => {
    switch (rank) {
      case 1:
        return <Trophy className="w-5 h-5 text-amber-400" />;
      case 2:
        return <Medal className="w-5 h-5 text-gray-400" />;
      case 3:
        return <Medal className="w-5 h-5 text-amber-600" />;
      default:
        return <span className={cn(
          "w-5 h-5 flex items-center justify-center text-sm font-bold",
          isDarkMode ? "text-gray-500" : "text-gray-400"
        )}>{rank}</span>;
    }
  };

  const getRankBg = (rank: number, isCurrentUser?: boolean) => {
    if (isCurrentUser) {
      return isDarkMode
        ? "bg-violet-500/20 border-violet-500/50"
        : "bg-violet-100 border-violet-300";
    }
    switch (rank) {
      case 1:
        return isDarkMode
          ? "bg-amber-500/10 border-amber-500/30"
          : "bg-amber-50 border-amber-200";
      case 2:
        return isDarkMode
          ? "bg-gray-500/10 border-gray-500/30"
          : "bg-gray-100 border-gray-200";
      case 3:
        return isDarkMode
          ? "bg-amber-600/10 border-amber-600/30"
          : "bg-amber-100/50 border-amber-200";
      default:
        return isDarkMode
          ? "bg-gray-800/50 border-gray-700"
          : "bg-white border-gray-200";
    }
  };

  return (
    <div className={cn(
      "p-6 rounded-2xl border",
      isDarkMode ? "bg-gray-800/50 border-gray-700" : "bg-white border-gray-200 shadow-sm"
    )}>
      <div className="flex items-center justify-between mb-6">
        <h2 className={cn(
          "text-xl font-bold flex items-center gap-2",
          isDarkMode ? "text-white" : "text-gray-900"
        )}>
          <Trophy className="w-6 h-6 text-amber-500" />
          Global Leaderboard
        </h2>
        <span className={cn(
          "px-3 py-1 rounded-full text-sm font-medium",
          isDarkMode ? "bg-violet-500/20 text-violet-400" : "bg-violet-100 text-violet-700"
        )}>This Week</span>
      </div>

      <div className="space-y-3">
        {leaderboardData.map((user) => (
          <div
            key={user.rank}
            className={cn(
              "flex items-center gap-4 p-4 rounded-xl border transition-all hover:scale-[1.01]",
              getRankBg(user.rank, user.isCurrentUser)
            )}
          >
            <div className="w-8 flex items-center justify-center">
              {getRankIcon(user.rank)}
            </div>
            <div className="text-2xl">{user.avatar}</div>
            <div className="flex-1 min-w-0">
              <p className={cn(
                "font-semibold truncate",
                user.isCurrentUser && "text-violet-400",
                isDarkMode ? "text-white" : "text-gray-900"
              )}>
                {user.isCurrentUser ? (
                  <button
                    onClick={() => setActiveModule('profile')}
                    className="hover:underline transition-all"
                  >
                    {user.name}
                  </button>
                ) : user.name}
                {user.isCurrentUser && (
                  <span className={cn(
                    "ml-2 px-2 py-0.5 rounded text-xs",
                    isDarkMode ? "bg-violet-500/30 text-violet-300" : "bg-violet-200 text-violet-700"
                  )}>You</span>
                )}
              </p>
              <div className="flex items-center gap-3 mt-1">
                <span className={cn(
                  "text-sm",
                  isDarkMode ? "text-gray-400" : "text-gray-600"
                )}>🔥 {user.streak} day streak</span>
              </div>
            </div>
            <div className="text-right">
              <p className={cn(
                "font-bold text-lg",
                isDarkMode ? "text-white" : "text-gray-900"
              )}>{user.score.toLocaleString()}</p>
              <div className="flex items-center justify-end gap-1 text-emerald-500 text-sm">
                <TrendingUp className="w-3 h-3" />
                {user.trend}
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="mt-6 pt-4 border-t border-gray-700 text-center">
        <p className={cn(
          "text-sm",
          isDarkMode ? "text-gray-400" : "text-gray-600"
        )}>
          Keep coding to climb the ranks! 🚀
        </p>
      </div>
    </div>
  );
}
