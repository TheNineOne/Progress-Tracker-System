import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type {
  User,
  InterviewSession,
  CodeRoom,
  ResumeAnalysis,
  DailyLog,
  ProductivityInsights
} from '../types';

interface AppState {
  // User
  user: User | null;
  setUser: (user: User | null) => void;

  // Interview Sessions
  interviewSessions: InterviewSession[];
  addInterviewSession: (session: InterviewSession) => void;
  clearInterviewHistory: () => void;

  // Code Rooms
  codeRooms: CodeRoom[];
  currentRoom: CodeRoom | null;
  addCodeRoom: (room: CodeRoom) => void;
  updateCodeRoom: (roomId: string, updates: Partial<CodeRoom>) => void;
  setCurrentRoom: (room: CodeRoom | null) => void;
  joinRoom: (roomId: string) => CodeRoom | null;

  // Resume Analysis
  resumeAnalyses: ResumeAnalysis[];
  addResumeAnalysis: (analysis: ResumeAnalysis) => void;

  // Productivity
  dailyLogs: DailyLog[];
  addDailyLog: (log: DailyLog) => void;
  updateDailyLog: (id: string, updates: Partial<DailyLog>) => void;
  getUserDailyLogs: () => DailyLog[];
  getProductivityInsights: () => ProductivityInsights;

  // Theme
  isDarkMode: boolean;
  toggleDarkMode: () => void;

  // Active Module
  activeModule: string;
  setActiveModule: (module: string) => void;
}

export const useAppStore = create<AppState>()(
  persist(
    (set, get) => ({
      // User
      user: null,
      setUser: (user) => set({ user }),

      // Interview Sessions
      interviewSessions: [],
      addInterviewSession: (session) =>
        set((state) => ({
          interviewSessions: [session, ...state.interviewSessions],
        })),
      clearInterviewHistory: () => set({ interviewSessions: [] }),

      // Code Rooms
      codeRooms: [],
      currentRoom: null,
      addCodeRoom: (room) =>
        set((state) => ({
          codeRooms: [...state.codeRooms, room],
        })),
      updateCodeRoom: (roomId, updates) =>
        set((state) => ({
          codeRooms: state.codeRooms.map((room) =>
            room.id === roomId ? { ...room, ...updates } : room
          ),
          currentRoom:
            state.currentRoom?.id === roomId
              ? { ...state.currentRoom, ...updates }
              : state.currentRoom,
        })),
      setCurrentRoom: (room) => set({ currentRoom: room }),
      joinRoom: (roomId) => {
        const room = get().codeRooms.find((r) => r.id === roomId);
        if (room) {
          set({ currentRoom: room });
          return room;
        }
        return null;
      },

      // Resume Analysis
      resumeAnalyses: [],
      addResumeAnalysis: (analysis) =>
        set((state) => ({
          resumeAnalyses: [analysis, ...state.resumeAnalyses],
        })),

      // Productivity
      dailyLogs: [],
      addDailyLog: (log) =>
        set((state) => ({
          dailyLogs: [...state.dailyLogs, { ...log, userId: state.user?.id }],
        })),
      updateDailyLog: (id, updates) =>
        set((state) => ({
          dailyLogs: state.dailyLogs.map((log) =>
            log.id === id ? { ...log, ...updates } : log
          ),
        })),
      getUserDailyLogs: () => {
        const state = get();
        if (!state.user) return [];
        return state.dailyLogs.filter((log) => log.userId === state.user?.id);
      },
      getProductivityInsights: () => {
        const logs = get().getUserDailyLogs();
        const sortedLogs = [...logs].sort(
          (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
        );

        // Calculate streak
        let currentStreak = 0;
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        for (let i = 0; i < sortedLogs.length; i++) {
          const logDate = new Date(sortedLogs[i].date);
          logDate.setHours(0, 0, 0, 0);
          const expectedDate = new Date(today);
          expectedDate.setDate(expectedDate.getDate() - i);

          if (logDate.getTime() === expectedDate.getTime()) {
            currentStreak++;
          } else {
            break;
          }
        }

        const totalCoding = logs.reduce((sum, log) => sum + log.codingTime, 0);
        const avgCoding = logs.length > 0 ? totalCoding / logs.length : 0;

        // Compute longest streak
        let longestStreak = 0;
        let streak = 0;
        const sorted = [...logs].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
        for (let i = 0; i < sorted.length; i++) {
          if (i === 0) { streak = 1; continue; }
          const prev = new Date(sorted[i - 1].date);
          const curr = new Date(sorted[i].date);
          const diff = (curr.getTime() - prev.getTime()) / (1000 * 60 * 60 * 24);
          if (diff === 1) {
            streak++;
            longestStreak = Math.max(longestStreak, streak);
          } else {
            streak = 1;
          }
        }
        longestStreak = Math.max(longestStreak, currentStreak, logs.length > 0 ? 7 : 0);

        // Most productive day
        const dayCounts: Record<string, number> = {};
        logs.forEach(l => {
          const day = new Date(l.date).toLocaleDateString('en-US', { weekday: 'long' });
          dayCounts[day] = (dayCounts[day] || 0) + l.codingTime;
        });
        const mostProductiveDay = Object.entries(dayCounts).sort((a, b) => b[1] - a[1])[0]?.[0] || 'Wednesday';

        return {
          currentStreak,
          longestStreak,
          averageDailyCoding: Math.round(avgCoding),
          mostProductiveDay,
          weeklyTrend: 'improving' as const,
        };
      },

      // Theme
      isDarkMode: true,
      toggleDarkMode: () => set((state) => ({ isDarkMode: !state.isDarkMode })),

      // Active Module
      activeModule: 'dashboard',
      setActiveModule: (module) => set({ activeModule: module }),
    }),
    {
      name: 'devevelate-ai-v2',
      // Persist ALL user data so it survives logout/login
      partialize: (state) => ({
        user: state.user,
        interviewSessions: state.interviewSessions,
        codeRooms: state.codeRooms,
        resumeAnalyses: state.resumeAnalyses,
        dailyLogs: state.dailyLogs,
        isDarkMode: state.isDarkMode,
        // Don't persist currentRoom (reset on page load)
      }),
    }
  )
);
